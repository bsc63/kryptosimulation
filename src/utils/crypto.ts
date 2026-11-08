import { Block, Transaction, Participant } from '../types/blockchain';

/**
 * Pure JavaScript synchronous SHA-256 implementation.
 * Used as a 100% reliable fallback when running on local LAN HTTP (e.g. http://192.168.x.x:8000),
 * where browsers disable window.crypto.subtle due to insecure origin restrictions.
 */
function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

export function sha256Sync(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number;
  let result = '';

  const words: number[] = [];
  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  hash = hash.slice(0, 8);

  const utf8: number[] = [];
  for (let m = 0; m < ascii.length; m++) {
    let charcode = ascii.charCodeAt(m);
    if (charcode < 0x80) {
      utf8.push(charcode);
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      m++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (ascii.charCodeAt(m) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }

  const bitLength = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) {
    utf8.push(0);
  }

  for (let b = 0; b < 4; b++) {
    utf8.push(0);
  }
  utf8.push((bitLength >>> 24) & 0xff);
  utf8.push((bitLength >>> 16) & 0xff);
  utf8.push((bitLength >>> 8) & 0xff);
  utf8.push(bitLength & 0xff);

  for (let w = 0; w < utf8.length; w += 4) {
    words.push((utf8[w] << 24) | (utf8[w + 1] << 16) | (utf8[w + 2] << 8) | utf8[w + 3]);
  }

  for (let chunk = 0; chunk < words.length; chunk += 16) {
    const w: number[] = [];
    for (i = 0; i < 16; i++) w[i] = words[chunk + i];
    for (i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (i = 0; i < 64; i++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[i] + w[i]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (let byte = 3; byte >= 0; byte--) {
      const b = (hash[i] >> (byte * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Calculates SHA-256 hash using native Web Crypto API when available,
 * and seamlessly falls back to pure JavaScript in non-secure HTTP contexts.
 */
export async function sha256(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Insecure context or restricted environment fallback
    }
  }
  return sha256Sync(message);
}

/**
 * Creates canonical string representation of block data for hashing.
 */
export function getBlockDataString(
  index: number,
  previousHash: string,
  timestamp: number,
  transactions: Transaction[],
  nonce: number
): string {
  const txSummary = transactions
    .map(t => `${t.id}:${t.senderId}->${t.recipientId}:${t.amount}:${t.purpose}`)
    .join('|');
  return `${index}|${previousHash}|${timestamp}|${txSummary}|${nonce}`;
}

/**
 * Calculates the hash of a block given its parameters.
 */
export async function calculateBlockHash(
  index: number,
  previousHash: string,
  timestamp: number,
  transactions: Transaction[],
  nonce: number
): Promise<string> {
  const dataString = getBlockDataString(index, previousHash, timestamp, transactions, nonce);
  return await sha256(dataString);
}

/**
 * Initial participants suited for 7th-9th grade class setting.
 */
export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'user',
    name: 'Du (Schüler/in)',
    avatar: '🎒',
    color: '#0284c7', // Sky Blue
    grade: 'Klasse 8b',
    role: 'Dein persönliches Wallet',
    description: 'Dein Hauptkonto. Du kannst überweisen, Blöcke minen und Belohnungen einsammeln.',
    initialBalance: 25,
  },
  {
    id: 'mia',
    name: 'Mia',
    avatar: '👩‍💻',
    color: '#7c3aed', // Purple
    grade: 'Klasse 8b',
    role: 'Klassensprecherin',
    description: 'Organisiert die Klassenkasse und digitale Schulfest-Tickets.',
    initialBalance: 30,
  },
  {
    id: 'lukas',
    name: 'Lukas',
    avatar: '🎮',
    color: '#059669', // Emerald
    grade: 'Klasse 9a',
    role: 'Schul-Miner',
    description: 'Nutzt den Computerraum-Server in der Pause, um neue Blöcke zu schürfen.',
    initialBalance: 40,
  },
  {
    id: 'sophie',
    name: 'Sophie',
    avatar: '🎨',
    color: '#d97706', // Amber
    grade: 'Klasse 7c',
    role: 'Künstlerin',
    description: 'Gestaltet digitale Avatar-Sticker und verkauft sie gegen EduCoins.',
    initialBalance: 15,
  },
  {
    id: 'jonas',
    name: 'Jonas',
    avatar: '🛹',
    color: '#e11d48', // Rose
    grade: 'Klasse 8a',
    role: 'Sportler',
    description: 'Spart EduCoins für neue Skateboard-Rollen und leiht Pausenspiele aus.',
    initialBalance: 20,
  },
];

/**
 * Generates the Genesis Block (#0) with a known valid hash.
 */
export async function createGenesisBlock(): Promise<Block> {
  const timestamp = 1714500000000; // Fixed timestamp for reproducible genesis block
  const transactions: Transaction[] = [
    {
      id: 'tx-genesis-0',
      senderId: 'SYSTEM',
      senderName: 'Blockchain-Urknall',
      recipientId: 'mia',
      recipientName: 'Mia',
      amount: 10,
      purpose: 'Start-Guthaben für Klassenkasse',
      timestamp: timestamp,
      isCoinbase: true,
    },
    {
      id: 'tx-genesis-1',
      senderId: 'SYSTEM',
      senderName: 'Blockchain-Urknall',
      recipientId: 'lukas',
      recipientName: 'Lukas',
      amount: 10,
      purpose: 'Start-Guthaben für Hardwareshop',
      timestamp: timestamp,
      isCoinbase: true,
    },
  ];

  const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
  let nonce = 0;
  let hash = '';
  const difficulty = 2; // Starts with '00'
  const prefix = '0'.repeat(difficulty);

  // Find a valid nonce for the Genesis block
  while (true) {
    hash = await calculateBlockHash(0, previousHash, timestamp, transactions, nonce);
    if (hash.startsWith(prefix)) {
      break;
    }
    nonce++;
  }

  return {
    index: 0,
    timestamp,
    transactions,
    previousHash,
    hash,
    nonce,
    difficulty,
    minerId: 'SYSTEM',
    minerName: 'EduChain System',
    isGenesis: true,
    isValid: true,
  };
}

/**
 * Initial historical block #1 so the chain starts with history.
 */
export async function createInitialBlock1(genesisBlock: Block): Promise<Block> {
  const timestamp = 1714503600000;
  const transactions: Transaction[] = [
    {
      id: 'tx-seed-1',
      senderId: 'lukas',
      senderName: 'Lukas',
      recipientId: 'sophie',
      recipientName: 'Sophie',
      amount: 4,
      purpose: 'Digitaler Pixel-Sticker für Gaming-Profil',
      timestamp: timestamp - 1200000,
    },
    {
      id: 'tx-seed-2',
      senderId: 'jonas',
      senderName: 'Jonas',
      recipientId: 'mia',
      recipientName: 'Mia',
      amount: 5,
      purpose: 'Beitrag für den Klassen-Wandertag',
      timestamp: timestamp - 600000,
    },
    {
      id: 'tx-cb-1',
      senderId: 'SYSTEM',
      senderName: 'Netzwerk-Belohnung',
      recipientId: 'lukas',
      recipientName: 'Lukas',
      amount: 10,
      purpose: 'Block-Belohnung für das Lösen des Rätsels',
      timestamp: timestamp,
      isCoinbase: true,
    },
  ];

  const previousHash = genesisBlock.hash;
  const difficulty = 2;
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  let hash = '';

  while (true) {
    hash = await calculateBlockHash(1, previousHash, timestamp, transactions, nonce);
    if (hash.startsWith(prefix)) {
      break;
    }
    nonce++;
  }

  return {
    index: 1,
    timestamp,
    transactions,
    previousHash,
    hash,
    nonce,
    difficulty,
    minerId: 'lukas',
    minerName: 'Lukas',
    isValid: true,
  };
}

/**
 * Validates the entire chain and flags invalid blocks (e.g. if tampered).
 */
export async function validateEntireChain(chain: Block[]): Promise<{
  isValid: boolean;
  brokenIndex: number | null;
  validatedBlocks: Block[];
}> {
  let isOverallValid = true;
  let firstBrokenIndex: number | null = null;
  const updatedBlocks: Block[] = [];

  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];
    const prefix = '0'.repeat(current.difficulty);

    // Calculate actual hash based on current content
    const recalculatedHash = await calculateBlockHash(
      current.index,
      current.previousHash,
      current.timestamp,
      current.transactions,
      current.nonce
    );

    let isCurrentValid = true;

    // Check 1: Does the stored hash match recalculated content hash?
    if (recalculatedHash !== current.hash) {
      isCurrentValid = false;
    }

    // Check 2: Does the hash satisfy the difficulty condition?
    if (!recalculatedHash.startsWith(prefix)) {
      isCurrentValid = false;
    }

    // Check 3: Does it correctly link to previous block (for i > 0)?
    if (i > 0) {
      const prevBlock = updatedBlocks[i - 1];
      if (current.previousHash !== prevBlock.hash || !prevBlock.isValid) {
        isCurrentValid = false;
      }
    }

    if (!isCurrentValid && firstBrokenIndex === null) {
      firstBrokenIndex = i;
      isOverallValid = false;
    }

    updatedBlocks.push({
      ...current,
      isValid: isCurrentValid,
      tampered: current.tampered || !isCurrentValid,
    });
  }

  return {
    isValid: isOverallValid,
    brokenIndex: firstBrokenIndex,
    validatedBlocks: updatedBlocks,
  };
}

/**
 * Calculates current wallet balance for each participant.
 */
export function calculateBalances(
  participants: Participant[],
  chain: Block[],
  mempool: Transaction[] = []
): Record<string, { confirmed: number; pendingChange: number }> {
  const result: Record<string, { confirmed: number; pendingChange: number }> = {};

  participants.forEach(p => {
    result[p.id] = { confirmed: p.initialBalance, pendingChange: 0 };
  });

  // Calculate from confirmed blocks
  for (const block of chain) {
    // Only count transactions from valid blocks
    if (block.isValid !== false) {
      for (const tx of block.transactions) {
        if (!tx.isCoinbase && result[tx.senderId]) {
          result[tx.senderId].confirmed -= tx.amount;
        }
        if (result[tx.recipientId]) {
          result[tx.recipientId].confirmed += tx.amount;
        }
      }
    }
  }

  // Account for pending mempool transactions (reserved funds)
  for (const tx of mempool) {
    if (result[tx.senderId]) {
      result[tx.senderId].pendingChange -= tx.amount;
    }
    if (result[tx.recipientId]) {
      result[tx.recipientId].pendingChange += tx.amount;
    }
  }

  return result;
}
