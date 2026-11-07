import { Block, Transaction, Participant } from '../types/blockchain';

export interface NetworkState {
  chain: Block[];
  mempool: Transaction[];
  participants: Participant[];
}

export type NetworkEventType =
  | 'init'
  | 'participant_joined'
  | 'transaction_added'
  | 'block_mined'
  | 'chain_reset';

export interface NetworkEvent {
  type: NetworkEventType;
  data: any;
}

/**
 * Checks if the backend API is reachable.
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/state', { method: 'GET', headers: { Accept: 'application/json' } });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches the complete blockchain state from the server.
 */
export async function fetchServerState(): Promise<NetworkState | null> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Registers a new human student player on the server.
 */
export async function registerPlayerOnServer(player: Participant): Promise<Participant | null> {
  try {
    const res = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.participant;
  } catch {
    return null;
  }
}

/**
 * Broadcasts a new transaction to the server mempool.
 */
export async function broadcastTransactionToServer(tx: Transaction): Promise<boolean> {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Submits a newly mined block to the server.
 */
export async function broadcastMinedBlockToServer(block: Block): Promise<boolean> {
  try {
    const res = await fetch('/api/mine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(block),
    });
    return res.ok;
  } catch {
    return false;
  }
}
