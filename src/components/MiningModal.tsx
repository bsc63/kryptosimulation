import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Block, Transaction, Participant, MiningReceipt } from '../types/blockchain';
import { calculateBlockHash } from '../utils/crypto';
import confetti from 'canvas-confetti';
import {
  Cpu,
  X,
  Play,
  Pause,
  Sparkles,
  Coins,
  CheckCircle2,
  Sliders,
  Zap,
  Clock,
  Flame,
  AlertCircle,
  Activity,
  Send,
  Radio,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Dices,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Thermometer,
  Wind,
  Gauge,
  Fan,
  AlertTriangle,
  Trophy,
} from 'lucide-react';

interface MiningModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastBlock: Block;
  mempool: Transaction[];
  participants: Participant[];
  currentUser?: Participant;
  onBlockMined: (newBlock: Block) => void;
  onOpenTransfer: () => void;
}

export const MiningModal: React.FC<MiningModalProps> = ({
  isOpen,
  onClose,
  lastBlock,
  mempool,
  participants,
  currentUser,
  onBlockMined,
  onOpenTransfer,
}) => {
  // Always prioritize the active student wallet as the miner!
  const defaultMinerId = currentUser ? currentUser.id : 'user';
  const [selectedMinerId, setSelectedMinerId] = useState<string>(defaultMinerId);

  // Mining mode: 'manual' (hands-on puzzle solving) vs 'auto' (CPU miner race)
  const [miningMode, setMiningMode] = useState<'manual' | 'auto'>('auto');
  const [nonce, setNonce] = useState<number>(0);
  const [manualNonceInput, setManualNonceInput] = useState<string>('0');
  const [currentHash, setCurrentHash] = useState<string>('');
  const [isMining, setIsMining] = useState<boolean>(false);
  const [hashRate, setHashRate] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [nearMisses, setNearMisses] = useState<Array<{ nonce: number; hash: string; zeros: number }>>([]);

  // Hardware Tuning Sliders (Anti-"All-to-the-right" engineering mechanics)
  const [cpuClock, setCpuClock] = useState<number>(72); // 20% to 100%
  const [fanSpeed, setFanSpeed] = useState<number>(80); // 10% to 100%
  const [nonceStride, setNonceStride] = useState<number>(2); // 1 to 5 threads

  // Permanent receipt state that NEVER disappears until explicitly dismissed by user
  const [receipt, setReceipt] = useState<MiningReceipt | null>(null);

  // Freeze candidate transactions and timestamp when mining starts
  const [frozenTxs, setFrozenTxs] = useState<Transaction[]>([]);
  const [blockTimestamp, setBlockTimestamp] = useState<number>(() => Date.now());

  // Fixed candidate block index when modal was opened
  const [candidateBlockIndex, setCandidateBlockIndex] = useState<number>(lastBlock.index + 1);
  const previousHash = lastBlock.hash;

  // Selected miner is always the active student wallet when logged in
  const selectedMiner = useMemo(() => {
    if (currentUser) return currentUser;
    return participants.find((p) => p.id === selectedMinerId) || participants[0];
  }, [currentUser, participants, selectedMinerId]);

  // Keep selectedMinerId strictly in sync with currentUser
  useEffect(() => {
    if (currentUser) {
      setSelectedMinerId(currentUser.id);
    }
  }, [currentUser]);

  // Detect if another student in the LAN was faster and mined this candidate block first!
  const isOutmined = lastBlock.index >= candidateBlockIndex && !receipt;

  // Difficulty: 2 leading zeros ('00')
  const difficulty = 2;
  const targetPrefix = '0'.repeat(difficulty);

  // Physical Rig Simulation (Temperature, Throttling & Effective Hashrate)
  const rigPhysics = useMemo(() => {
    const baseTemp = 42;
    const clockHeat = cpuClock * 0.48;
    // Overclocking above 72% creates exponential heat dissipation requirements
    const overclockPenalty = cpuClock > 72 ? Math.pow((cpuClock - 72) / 28, 2) * 38 : 0;
    const strideHeat = (nonceStride - 1) * 3.5;
    const fanCooling = fanSpeed * 0.40;
    // Pushing fan above 82% draws heavy power and adds motor resistance
    const fanResistance = fanSpeed > 82 ? (fanSpeed - 82) * 0.35 : 0;

    const rawTemp = Math.round(baseTemp + clockHeat + overclockPenalty + strideHeat - fanCooling + fanResistance);
    const temperature = Math.max(38, Math.min(108, rawTemp));

    // Thermal Throttling triggers when temperature hits 85°C!
    const isThrottled = temperature >= 85;

    // Base processing speed (hashes per batch)
    const rawSpeed = Math.round(18 + (cpuClock / 100) * 24 + (nonceStride - 1) * 2);

    // If throttled, CPU downclocks violently to 25% to prevent thermal death!
    const effectiveSpeed = isThrottled ? Math.max(6, Math.round(rawSpeed * 0.25)) : rawSpeed;

    return {
      temperature,
      isThrottled,
      effectiveSpeed,
    };
  }, [cpuClock, fanSpeed, nonceStride]);

  // Target duration for realistic classroom race: 12 to 24 seconds at optimal speed,
  // stretching to 30-45 seconds if the student throttles the CPU!
  const targetMinDurationSeconds = useMemo(() => {
    // Base corridor: ~14 to 20 seconds
    const corridorBase = 14 + ((candidateBlockIndex * 3) % 6);
    if (rigPhysics.isThrottled) {
      // Overheated CPU takes much longer!
      return corridorBase + 12;
    }
    // High performance rigs finish in ~12-16 seconds
    if (rigPhysics.effectiveSpeed >= 38) {
      return Math.max(10, corridorBase - 3);
    }
    return corridorBase;
  }, [candidateBlockIndex, rigPhysics.isThrottled, rigPhysics.effectiveSpeed]);

  // Coinbase reward transaction (Creation of new crypto for the active miner!)
  const coinbaseTx = useMemo<Transaction>(() => {
    return {
      id: `tx-coinbase-${candidateBlockIndex}-${blockTimestamp}`,
      senderId: 'SYSTEM',
      senderName: 'Blockchain-System (Belohnung)',
      recipientId: selectedMiner.id,
      recipientName: selectedMiner.name,
      amount: 10,
      purpose: 'Neu erschaffene EduCoins für das Lösen des Rätsels',
      timestamp: blockTimestamp,
      isCoinbase: true,
    };
  }, [candidateBlockIndex, blockTimestamp, selectedMiner.id, selectedMiner.name]);

  // Combined block transactions: 1 Coinbase + frozen mempool transactions
  const blockTransactions = useMemo(
    () => [coinbaseTx, ...frozenTxs],
    [coinbaseTx, frozenTxs]
  );

  // Initialize or reset candidate block
  const initializeBlockCandidate = (customIndex?: number) => {
    const nextIdx = customIndex ?? (lastBlock.index + 1);
    const now = Date.now();
    setCandidateBlockIndex(nextIdx);
    setBlockTimestamp(now);
    const snapshot = [...mempool];
    setFrozenTxs(snapshot);
    setNonce(0);
    setManualNonceInput('0');
    setAttempts(0);
    setIsMining(false);
    setHashRate(0);
    setElapsedSeconds(0);
    setNearMisses([]);

    if (currentUser) {
      setSelectedMinerId(currentUser.id);
    }

    if (snapshot.length > 0) {
      const freshCoinbaseTx: Transaction = {
        id: `tx-coinbase-${nextIdx}-${now}`,
        senderId: 'SYSTEM',
        senderName: 'Blockchain-System (Belohnung)',
        recipientId: selectedMiner.id,
        recipientName: selectedMiner.name,
        amount: 10,
        purpose: 'Neu erschaffene EduCoins für das Lösen des Rätsels',
        timestamp: now,
        isCoinbase: true,
      };
      const freshTxs = [freshCoinbaseTx, ...snapshot];

      calculateBlockHash(nextIdx, previousHash, now, freshTxs, 0).then((h) => {
        setCurrentHash(h);
      });
    }
  };

  // Reset state on open, BUT DO NOT RESET if receipt is currently showing!
  useEffect(() => {
    if (receipt) return;
    if (isOpen) {
      initializeBlockCandidate(lastBlock.index + 1);
    } else {
      setIsMining(false);
    }
  }, [isOpen, lastBlock.index, lastBlock.hash, receipt]);

  // Live Timer during mining
  useEffect(() => {
    if (!isMining || receipt !== null || isOutmined) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isMining, receipt, isOutmined]);

  // Manual Nonce Calculation Handler
  const handleManualNonceUpdate = async (newNonce: number) => {
    if (receipt !== null || isMining || frozenTxs.length === 0 || isOutmined) return;
    const clamped = Math.max(0, Math.floor(newNonce));
    setNonce(clamped);
    setManualNonceInput(String(clamped));
    setAttempts((prev) => prev + 1);

    const h = await calculateBlockHash(
      candidateBlockIndex,
      previousHash,
      blockTimestamp,
      blockTransactions,
      clamped
    );
    setCurrentHash(h);
  };

  // Automated Mining Loop (Controlled by Physical Rig Speed & Race Timer)
  const miningRef = useRef<boolean>(false);
  miningRef.current = isMining && !isOutmined;

  useEffect(() => {
    if (!isMining || !isOpen || frozenTxs.length === 0 || receipt !== null || isOutmined) return;

    let activeNonce = nonce;
    let localAttempts = 0;
    const startTime = performance.now();
    let animationFrameId: number;
    let lastFrameTime = performance.now();

    const mineBatch = async () => {
      if (!miningRef.current) return;

      const now = performance.now();
      const deltaSec = (now - lastFrameTime) / 1000;
      lastFrameTime = now;
      const elapsedSec = (now - startTime) / 1000;

      // Batch size dynamically governed by effective rig speed
      const batchToProcess = Math.max(1, Math.round(rigPhysics.effectiveSpeed * Math.min(0.2, Math.max(0.016, deltaSec))));

      for (let i = 0; i < batchToProcess; i++) {
        activeNonce += nonceStride;
        localAttempts++;

        const h = await calculateBlockHash(
          candidateBlockIndex,
          previousHash,
          blockTimestamp,
          blockTransactions,
          activeNonce
        );

        if (h.startsWith('0') && !h.startsWith(targetPrefix)) {
          setNearMisses((prev) => [{ nonce: activeNonce, hash: h, zeros: 1 }, ...prev.slice(0, 1)]);
        }

        // Realistic Proof-of-Work: must hit target prefix AND pass the race target duration corridor
        const meetsProofOfWork = h.startsWith(targetPrefix) && elapsedSec >= targetMinDurationSeconds;

        if (meetsProofOfWork) {
          setNonce(activeNonce);
          setManualNonceInput(String(activeNonce));
          setCurrentHash(h);
          setIsMining(false);
          setAttempts((prev) => prev + localAttempts);

          const finalDuration = Math.max(10, Math.round(elapsedSec));
          handleCompleteSuccess(activeNonce, h, finalDuration);
          return;
        }
      }

      setNonce(activeNonce);
      setManualNonceInput(String(activeNonce));
      if (elapsedSec > 0) {
        setHashRate(Math.round(localAttempts / elapsedSec));
      }
      setAttempts((prev) => prev + batchToProcess);

      if (miningRef.current) {
        animationFrameId = requestAnimationFrame(mineBatch);
      }
    };

    animationFrameId = requestAnimationFrame(mineBatch);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMining, isOpen, candidateBlockIndex, previousHash, blockTimestamp, blockTransactions, targetPrefix, frozenTxs.length, receipt, isOutmined, rigPhysics.effectiveSpeed, nonceStride, targetMinDurationSeconds]);

  // Central success completion function
  const handleCompleteSuccess = (validNonce: number, validHash: string, durationSec: number) => {
    setIsMining(false);

    const newBlock: Block = {
      index: candidateBlockIndex,
      timestamp: blockTimestamp,
      transactions: blockTransactions,
      previousHash: previousHash,
      hash: validHash,
      nonce: validNonce,
      difficulty: difficulty,
      minerId: selectedMiner.id,
      minerName: selectedMiner.name,
      isValid: true,
      miningDurationSeconds: durationSec,
      hashesCalculated: validNonce,
      blockType: miningMode === 'manual' ? 'manual' : 'network',
    };

    const newReceipt: MiningReceipt = {
      blockIndex: candidateBlockIndex,
      minerName: selectedMiner.name,
      minerId: selectedMiner.id,
      minerAvatar: selectedMiner.avatar,
      rewardAmount: 10,
      nonce: validNonce,
      hash: validHash,
      difficulty: difficulty,
      durationSeconds: durationSec,
      attempts: Math.max(attempts, validNonce),
      timestamp: blockTimestamp,
      transactionCount: frozenTxs.length,
      transactions: frozenTxs,
    };

    setReceipt(newReceipt);
    onBlockMined(newBlock);

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleDismissReceipt = () => {
    setReceipt(null);
    onClose();
  };

  if (!isOpen) return null;

  const isMempoolEmpty = mempool.length === 0 && frozenTxs.length === 0;
  const isHashValid = currentHash.startsWith(targetPrefix);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
              receipt ? 'bg-emerald-600' : isOutmined ? 'bg-amber-600' : 'bg-sky-600'
            }`}>
              {receipt ? <FileCheck className="w-5 h-5" /> : isOutmined ? <Trophy className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {receipt
                    ? `Schürf-Quittung: Block #${receipt.blockIndex}`
                    : `Mining-Wettkampf: Block #${candidateBlockIndex}`}
                </h2>
                {!isMempoolEmpty && !receipt && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Belohnung: +10 EDC
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {receipt
                  ? 'Offizieller Auszahlungsbeleg & Block-Bestätigung'
                  : 'Tritt live gegen deine Mitschüler an: Wer den Block zuerst signiert, gewinnt 10 EDC!'}
              </p>
            </div>
          </div>
          <button
            onClick={receipt ? handleDismissReceipt : onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* SCREEN 1: PERMANENT RECEIPT SCREEN */}
          {receipt ? (
            <div className="space-y-4">
              <div className="p-4 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl backdrop-blur-xs">
                  {receipt.minerAvatar}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
                  Wettkampf gewonnen & Blockchain erweitert!
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight mt-0.5">
                  +{receipt.rewardAmount} EduCoins Lohn
                </h3>
                <p className="text-xs text-emerald-100 mt-1">
                  Der Lohn wurde sofort dem Wallet von <strong>{receipt.minerName}</strong> gutgeschrieben!
                </p>
              </div>

              {/* Official Receipt Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-sans">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Kassenbeleg & Block-Eintrag
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(receipt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-sans block text-[10px]">Block-Nummer:</span>
                    <span className="font-bold text-slate-900">Block #{receipt.blockIndex}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-sans block text-[10px]">Gefundene Nonce:</span>
                    <span className="font-bold text-slate-900">#{receipt.nonce}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-sans block text-[10px]">Wettkampf-Dauer:</span>
                    <span className="font-bold text-slate-900">{receipt.durationSeconds}s</span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-sans block text-[10px]">Schwierigkeitsgrad:</span>
                    <span className="font-bold text-emerald-700">{receipt.difficulty} Nullen ("{targetPrefix}")</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-sans block text-[10px] mb-0.5">Gültiger Block-Hash:</span>
                  <div className="p-2 bg-slate-900 text-emerald-400 rounded-lg text-[11px] break-all font-bold">
                    {receipt.hash}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 font-sans">
                  <span className="text-slate-500 text-[10px] block mb-1">
                    Bestätigte Aufträge in diesem Block ({receipt.transactionCount}):
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {receipt.transactions.map((tx) => (
                      <div key={`rcpt-${tx.id}`} className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded text-[10px]">
                        <span className="truncate max-w-[200px] text-slate-700">
                          {tx.senderName} → {tx.recipientName}: <em>"{tx.purpose}"</em>
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          +{tx.amount} EDC
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismissReceipt}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Quittung schließen & Blockchain ansehen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isOutmined ? (
            /* OUTMINED SCREEN: ANOTHER STUDENT IN THE NETWORK WAS FASTER! */
            <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  🏁
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Mitschüler {lastBlock.minerName} war schneller!
                  </h3>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    Block <strong>#{lastBlock.index}</strong> wurde gerade im Schul-Netzwerk von <strong>{lastBlock.minerName}</strong> signiert.
                    Er/Sie erhält dafür die <strong>+10 EduCoins</strong> Belohnung!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white/80 border border-amber-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <strong>So funktioniert echter Proof-of-Work:</strong>
                <p>
                  Alle Computer im Netzwerk rechnen gleichzeitig um die Wette. Wer das Rätsel zuerst löst, gewinnt den Block.
                  Keine Sorge: Die nächste Runde wartet schon!
                </p>
              </div>

              <button
                type="button"
                onClick={() => initializeBlockCandidate(lastBlock.index + 1)}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nächsten Block #{lastBlock.index + 1} schürfen & Revanche nehmen!</span>
              </button>
            </div>
          ) : isMempoolEmpty ? (
            /* SCREEN 3: EMPTY MEMPOOL SCREEN */
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  Keine Aufträge zum Schürfen vorhanden!
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  In einer Blockchain werden Blöcke nur geschnürt, wenn <strong>echte Transaktionen von Teilnehmern</strong> vorliegen.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTransfer();
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Jetzt Überweisung erstellen</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Abwarten
                </button>
              </div>
            </div>
          ) : (
            /* SCREEN 4: ACTIVE MINING COMPETITION STAGE */
            <>
              {/* Miner Identification: Always the active student wallet */}
              <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center text-xl shadow-xs">
                    {selectedMiner.avatar || '🎒'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {selectedMiner.name}
                      </span>
                      <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
                        {currentUser ? 'Dein Schüler-Wallet (Miner)' : 'Aktiver Miner'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Guthaben vor dem Block: <strong>{selectedMiner.initialBalance} EDC</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    +10 EDC Belohnung
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">wird dir gutgeschrieben</span>
                </div>
              </div>

              {/* Mode Toggle: Manual Nonce Guessing vs. Automated CPU Miner */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setIsMining(false);
                    setMiningMode('auto');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    miningMode === 'auto'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-sky-600" />
                  <span>⚡ 1. Automatischer CPU-Wettkampf (10–30s)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMining(false);
                    setMiningMode('manual');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    miningMode === 'manual'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>✋ 2. Händisch probieren (Zahlenrätsel)</span>
                </button>
              </div>

              {/* MODE 1: AUTOMATIC MINING WITH HARDWARE RIG TUNING */}
              {miningMode === 'auto' ? (
                <div className="space-y-4">
                  {/* HARDWARE CONFIGURATION / SLIDERS PANEL */}
                  <div className="border border-slate-200 bg-slate-50/80 rounded-xl p-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-indigo-600" />
                        <span>Mining-Rig Hardware-Tuning:</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-slate-500">Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCpuClock(74);
                            setFanSpeed(80);
                            setNonceStride(2);
                          }}
                          className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-semibold cursor-pointer"
                          title="Optimale Balance aus Takt und Kühlung"
                        >
                          🎯 Balance (Empfohlen)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCpuClock(100);
                            setFanSpeed(100);
                            setNonceStride(5);
                          }}
                          className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded font-semibold cursor-pointer"
                          title="Alles auf Rechts: Vorsicht vor Überhitzung!"
                        >
                          🔥 Alles auf Rechts (Gefahr)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCpuClock(40);
                            setFanSpeed(50);
                            setNonceStride(1);
                          }}
                          className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-semibold cursor-pointer"
                        >
                          🌱 Eco
                        </button>
                      </div>
                    </div>

                    {/* Sliders Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white p-3.5 rounded-xl border border-slate-200">
                      {/* Slider 1: CPU Clock */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            CPU-Taktfrequenz (Overclocking)
                          </span>
                          <span className="font-mono text-amber-700">{cpuClock}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={cpuClock}
                          onChange={(e) => setCpuClock(Number(e.target.value))}
                          disabled={isMining}
                          className="w-full accent-amber-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>20% (Eco)</span>
                          <span className="font-semibold text-emerald-700">~72% (Ideal)</span>
                          <span>100% (Hitze!)</span>
                        </div>
                      </div>

                      {/* Slider 2: Fan Speed */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                          <span className="flex items-center gap-1">
                            <Fan className={`w-3.5 h-3.5 text-sky-500 ${isMining ? 'animate-spin' : ''}`} />
                            Lüfterdrehzahl (Kühlleistung)
                          </span>
                          <span className="font-mono text-sky-700">{fanSpeed}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={fanSpeed}
                          onChange={(e) => setFanSpeed(Number(e.target.value))}
                          disabled={isMining}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>10% (Leise/Heiß)</span>
                          <span className="font-semibold text-emerald-700">~80% (Kühl)</span>
                          <span>100% (Turbine)</span>
                        </div>
                      </div>
                    </div>

                    {/* LIVE HARDWARE TELEMETRY DASHBOARD */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {/* Temperature Meter */}
                      <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${
                        rigPhysics.isThrottled
                          ? 'bg-rose-50 border-rose-300 text-rose-900 animate-pulse'
                          : rigPhysics.temperature > 72
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}>
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-75">
                          <Thermometer className="w-3.5 h-3.5" />
                          <span>CPU-Temperatur</span>
                        </div>
                        <span className="text-base font-extrabold font-mono mt-0.5">
                          {rigPhysics.temperature}°C
                        </span>
                        <span className="text-[9px] font-bold mt-0.5">
                          {rigPhysics.isThrottled ? '🔥 Überhitzt!' : rigPhysics.temperature > 72 ? '⚠️ Warm' : '🟢 Optimal'}
                        </span>
                      </div>

                      {/* Effective Hashrate */}
                      <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${
                        rigPhysics.isThrottled
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'bg-sky-50 border-sky-200 text-sky-900'
                      }`}>
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-75">
                          <Activity className="w-3.5 h-3.5" />
                          <span>Effektive Hashrate</span>
                        </div>
                        <span className="text-base font-extrabold font-mono mt-0.5">
                          {rigPhysics.effectiveSpeed} H/s
                        </span>
                        <span className="text-[9px] font-medium mt-0.5">
                          {rigPhysics.isThrottled ? 'Drosselung: -75%' : 'Volle Dauerleistung'}
                        </span>
                      </div>

                      {/* Race Target Duration */}
                      <div className="p-2.5 rounded-xl border bg-slate-100 border-slate-200 text-slate-800 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-75">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Wettkampf-Zeit</span>
                        </div>
                        <span className="text-base font-extrabold font-mono mt-0.5">
                          ~{targetMinDurationSeconds}s
                        </span>
                        <span className="text-[9px] text-slate-500 mt-0.5">
                          {rigPhysics.isThrottled ? 'Zeitverlust durch Hitze!' : 'Gute Siegchance!'}
                        </span>
                      </div>
                    </div>

                    {/* Thermal Warning Banner if Throttling occurs */}
                    {rigPhysics.isThrottled && (
                      <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-lg text-rose-900 text-[11px] flex items-start gap-2">
                        <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>🔥 THERMAL THROTTLING AKTIV:</strong>
                          <p className="text-[10px] text-rose-800 leading-tight mt-0.5">
                            Weil alle Regler zu hoch stehen, überhitzt die CPU ({rigPhysics.temperature}°C). Der integrierte Hitzeschutz bremst die Rechenleistung drastisch aus!
                            <strong> Drehe den CPU-Takt auf ca. 72% herunter</strong>, um wieder volle Geschwindigkeit zu erreichen!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTIVE MINING CONTROL & LIVE OUTPUT */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    isMining
                      ? 'bg-slate-900 text-white border-slate-700 shadow-lg'
                      : 'bg-white border-slate-200'
                  }`}>
                    {/* Status Bar */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/20">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isMining ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
                        <span className="font-mono text-xs font-bold tabular-nums">
                          Wettkampf-Laufzeit: {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] text-amber-400/90 hidden sm:inline">
                          (Ziel: ~{targetMinDurationSeconds}s Rechenzeit)
                        </span>
                      </div>
                      <div className="font-mono text-xs tabular-nums text-right">
                        <span>{attempts.toLocaleString('de-DE')} Hashes</span>
                        {hashRate > 0 && isMining && (
                          <span className="text-emerald-400 ml-1.5 font-bold">
                            · {hashRate} H/s
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nonce Counter & Status */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className={`p-2.5 rounded-lg border ${
                        isMining ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block font-sans">
                          Aktuelle Nonce
                        </span>
                        <span className="font-mono text-base font-bold tabular-nums">
                          #{nonce}
                        </span>
                      </div>

                      <div className={`p-2.5 rounded-lg border ${
                        isMining ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block font-sans flex items-center gap-1">
                          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                          Netzwerk-Status
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400 block mt-1">
                          {isMining ? 'Im Wettkampf aktiv' : 'Bereit zum Start'}
                        </span>
                      </div>
                    </div>

                    {/* Live Hash Output */}
                    <div className="p-3 rounded-lg bg-black/40 font-mono text-xs break-all shadow-inner border border-white/5 mb-3">
                      <div className="text-[10px] opacity-60 mb-1 font-sans flex items-center justify-between">
                        <span>Erzeugter Block-Hash (SHA-256):</span>
                        <span>Ziel: Beginnt mit "{targetPrefix}"</span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold tracking-wide">
                        <span
                          className={
                            currentHash.startsWith(targetPrefix)
                              ? 'text-emerald-400 font-bold bg-emerald-950 px-1 rounded'
                              : 'text-amber-400'
                          }
                        >
                          {currentHash.slice(0, difficulty)}
                        </span>
                        <span className={isMining ? 'text-slate-300' : 'text-slate-700'}>
                          {currentHash.slice(difficulty)}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <button
                      type="button"
                      onClick={() => setIsMining(!isMining)}
                      className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isMining
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                      }`}
                    >
                      {isMining ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Mining pausieren</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Wettkampf starten & Block schürfen!</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* MODE 2: MANUAL NONCE GUESSING PUZZLE */
                <div className="space-y-4 border border-amber-200 bg-amber-50/40 rounded-xl p-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-amber-600" />
                        <span>Händisches Nonce-Rätsel:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Bisherige Versuche: <strong>{attempts}</strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Gib eine Zahl ein oder nutze die Buttons. Beobachte den <strong>SHA-256 Hash</strong>: Jede Zahl erzeugt ein völlig anderes Muster! Sobald der Hash mit <strong>"{targetPrefix}"</strong> beginnt, hast du den Block gelöst!
                    </p>
                  </div>

                  {/* Manual Nonce Input with Quick Buttons */}
                  <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                      <label className="text-xs font-bold text-slate-800 font-sans">
                        Nonce (Deine Test-Zahl):
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleManualNonceUpdate(nonce - 1)}
                          disabled={nonce <= 0}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" /> 1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManualNonceUpdate(nonce + 1)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> 1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManualNonceUpdate(nonce + 10)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManualNonceUpdate(Math.floor(Math.random() * 2000))}
                          className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Dices className="w-3.5 h-3.5 text-sky-600" /> Zufallszahl
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManualNonceUpdate(0)}
                          className="px-2 py-1 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                          title="Auf 0 zurücksetzen"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="number"
                      min="0"
                      value={manualNonceInput}
                      onChange={(e) => {
                        setManualNonceInput(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          handleManualNonceUpdate(val);
                        }
                      }}
                      placeholder="Zahl z.B. 42"
                      className="w-full text-base font-bold font-mono p-2.5 pl-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Hash Evaluation Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2 shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                      <span>Errechneter SHA-256 Hash für Nonce #{nonce}:</span>
                      <span className="text-amber-300 font-bold">
                        Bedingung: Beginnt mit "{targetPrefix}"
                      </span>
                    </div>

                    <div className="p-2.5 bg-black/50 rounded-lg break-all text-xs sm:text-sm font-semibold tracking-wide">
                      <span
                        className={
                          isHashValid
                            ? 'text-emerald-400 font-extrabold bg-emerald-950 px-1 py-0.5 rounded'
                            : 'text-rose-400 font-bold bg-rose-950/60 px-1 py-0.5 rounded'
                        }
                      >
                        {currentHash.slice(0, difficulty)}
                      </span>
                      <span className="text-slate-300">
                        {currentHash.slice(difficulty)}
                      </span>
                    </div>

                    {/* Feedback Status */}
                    {isHashValid ? (
                      <div className="p-3 bg-emerald-900/60 border border-emerald-500 rounded-lg text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-bold text-sm text-emerald-300 block">
                              🎉 Rätsel gelöst! Nonce #{nonce} ist gültig!
                            </span>
                            <span className="text-[11px] text-emerald-200">
                              Der Hash beginnt mit "{targetPrefix}". Du darfst den Block anfügen!
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCompleteSuccess(nonce, currentHash, Math.max(1, elapsedSeconds))}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                        >
                          <Check className="w-4 h-4" />
                          <span>Block einreichen (+10 EDC)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-300/90 font-sans flex items-center gap-1.5 pt-1">
                        <span>❌ Noch nicht gültig (beginnt mit "{currentHash.slice(0, difficulty)}").</span>
                        <span className="text-slate-400">Probiere eine andere Zahl aus!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transactions in Candidate Block */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 font-mono text-[11px]">
                <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                  <span>Im Block enthaltene Transaktionen ({frozenTxs.length})</span>
                  <span className="text-indigo-600 font-semibold font-sans">
                    Ziel: Hash beginnt mit "{targetPrefix}"
                  </span>
                </div>
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                  {frozenTxs.map((tx) => (
                    <div key={`mine-${tx.id}`} className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200 text-[10px]">
                      <span className="truncate max-w-[200px] text-slate-700 font-sans">
                        {tx.senderName} → {tx.recipientName}: <em>"{tx.purpose}"</em>
                      </span>
                      <span className="font-bold text-slate-900 shrink-0 font-mono">
                        {tx.amount} EDC
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
