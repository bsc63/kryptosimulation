import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Block, Transaction, Participant } from '../types/blockchain';
import { calculateBlockHash } from '../utils/crypto';
import confetti from 'canvas-confetti';
import {
  Cpu,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Coins,
  CheckCircle2,
  Info,
  Sliders,
  Zap,
} from 'lucide-react';

interface MiningModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastBlock: Block;
  mempool: Transaction[];
  participants: Participant[];
  onBlockMined: (newBlock: Block) => void;
}

export const MiningModal: React.FC<MiningModalProps> = ({
  isOpen,
  onClose,
  lastBlock,
  mempool,
  participants,
  onBlockMined,
}) => {
  const [selectedMinerId, setSelectedMinerId] = useState<string>('user');
  const [difficulty, setDifficulty] = useState<number>(2); // 2 zeros ('00')
  const [nonce, setNonce] = useState<number>(0);
  const [currentHash, setCurrentHash] = useState<string>('');
  const [isMining, setIsMining] = useState<boolean>(false);
  const [hashRate, setHashRate] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [solvedBlock, setSolvedBlock] = useState<Block | null>(null);
  const [blockTimestamp, setBlockTimestamp] = useState<number>(() => Date.now());

  const blockIndex = lastBlock.index + 1;
  const previousHash = lastBlock.hash;

  // Selected miner info
  const selectedMiner = useMemo(
    () => participants.find((p) => p.id === selectedMinerId) || participants[0],
    [participants, selectedMinerId]
  );

  // Coinbase reward transaction (Creation of new crypto!)
  const coinbaseTx = useMemo<Transaction>(() => {
    return {
      id: `tx-coinbase-${blockIndex}-${blockTimestamp}`,
      senderId: 'SYSTEM',
      senderName: 'Blockchain-System (Belohnung)',
      recipientId: selectedMiner.id,
      recipientName: selectedMiner.name,
      amount: 10,
      purpose: 'Neu erschaffene EduCoins für das Lösen des Rätsels',
      timestamp: blockTimestamp,
      isCoinbase: true,
    };
  }, [blockIndex, blockTimestamp, selectedMiner.id, selectedMiner.name]);

  // Block payload contains Coinbase reward + mempool transactions
  const blockTransactions = useMemo(
    () => [coinbaseTx, ...mempool],
    [coinbaseTx, mempool]
  );

  const targetPrefix = '0'.repeat(difficulty);

  // Whenever modal opens or previous block changes, reset EVERYTHING for the new block!
  useEffect(() => {
    if (isOpen) {
      const now = Date.now();
      setBlockTimestamp(now);
      setNonce(0);
      setAttempts(0);
      setIsMining(false);
      setIsSolved(false);
      setSolvedBlock(null);
      setHashRate(0);

      // Compute initial hash for nonce = 0 with new timestamp & previousHash
      const freshCoinbaseTx: Transaction = {
        id: `tx-coinbase-${blockIndex}-${now}`,
        senderId: 'SYSTEM',
        senderName: 'Blockchain-System (Belohnung)',
        recipientId: selectedMiner.id,
        recipientName: selectedMiner.name,
        amount: 10,
        purpose: 'Neu erschaffene EduCoins für das Lösen des Rätsels',
        timestamp: now,
        isCoinbase: true,
      };
      const freshTxs = [freshCoinbaseTx, ...mempool];

      calculateBlockHash(blockIndex, previousHash, now, freshTxs, 0).then((h) => {
        setCurrentHash(h);
      });
    } else {
      setIsMining(false);
    }
  }, [isOpen, lastBlock.index, lastBlock.hash]);

  // Handle manual steps or difficulty/miner changes
  useEffect(() => {
    if (!isOpen || isMining) return;

    let isCancelled = false;
    calculateBlockHash(
      blockIndex,
      previousHash,
      blockTimestamp,
      blockTransactions,
      nonce
    ).then((h) => {
      if (!isCancelled) {
        setCurrentHash(h);
        if (h.startsWith(targetPrefix)) {
          setIsSolved(true);
          setSolvedBlock({
            index: blockIndex,
            timestamp: blockTimestamp,
            transactions: blockTransactions,
            previousHash,
            hash: h,
            nonce,
            difficulty,
            minerId: selectedMiner.id,
            minerName: selectedMiner.name,
            isValid: true,
          });
        } else {
          setIsSolved(false);
          setSolvedBlock(null);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [nonce, difficulty, selectedMinerId, blockIndex, previousHash, blockTimestamp, blockTransactions, targetPrefix, isOpen, isMining]);

  // Automated Mining Loop
  const miningRef = useRef<boolean>(false);
  miningRef.current = isMining;

  useEffect(() => {
    if (!isMining || !isOpen) return;

    let activeNonce = nonce;
    let localAttempts = 0;
    const startTime = performance.now();
    let animationFrameId: number;

    const mineBatch = async () => {
      if (!miningRef.current) return;

      const BATCH_SIZE = 50; // test 50 nonces per frame
      for (let i = 0; i < BATCH_SIZE; i++) {
        activeNonce++;
        localAttempts++;
        const h = await calculateBlockHash(
          blockIndex,
          previousHash,
          blockTimestamp,
          blockTransactions,
          activeNonce
        );

        if (h.startsWith(targetPrefix)) {
          // Valid solution found!
          setNonce(activeNonce);
          setCurrentHash(h);
          setIsMining(false);
          setIsSolved(true);
          setAttempts((prev) => prev + localAttempts);

          const newBlock: Block = {
            index: blockIndex,
            timestamp: blockTimestamp,
            transactions: blockTransactions,
            previousHash,
            hash: h,
            nonce: activeNonce,
            difficulty,
            minerId: selectedMiner.id,
            minerName: selectedMiner.name,
            isValid: true,
          };

          setSolvedBlock(newBlock);

          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });

          return;
        }
      }

      setNonce(activeNonce);
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed > 0) {
        setHashRate(Math.round(localAttempts / elapsed));
      }
      setAttempts((prev) => prev + BATCH_SIZE);

      if (miningRef.current) {
        animationFrameId = requestAnimationFrame(mineBatch);
      }
    };

    animationFrameId = requestAnimationFrame(mineBatch);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMining, isOpen, blockIndex, previousHash, blockTimestamp, blockTransactions, targetPrefix, difficulty, selectedMiner]);

  if (!isOpen) return null;

  const handleManualStep = () => {
    if (isSolved) return;
    setNonce((prev) => prev + 1);
    setAttempts((prev) => prev + 1);
  };

  const handleCommitBlock = async () => {
    let blockToCommit = solvedBlock;

    // Safety fallback: if solvedBlock not yet populated, create and verify
    if (!blockToCommit && isSolved) {
      blockToCommit = {
        index: blockIndex,
        timestamp: blockTimestamp,
        transactions: blockTransactions,
        previousHash,
        hash: currentHash,
        nonce,
        difficulty,
        minerId: selectedMiner.id,
        minerName: selectedMiner.name,
        isValid: true,
      };
    }

    if (blockToCommit) {
      onBlockMined(blockToCommit);
      // Cleanly reset state so consecutive mining starts fresh!
      setIsSolved(false);
      setSolvedBlock(null);
      setNonce(0);
      setIsMining(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Mining-Labor: Block #{blockIndex} schürfen
              </h2>
              <p className="text-xs text-slate-500">
                Löse das mathematische Rätsel für Block #{blockIndex}, um neue EduCoins zu erschaffen.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-sky-50/80 border border-sky-100 rounded-xl">
            <div className="flex items-start gap-2 text-sky-900 font-semibold mb-1">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Wie entstehen neue EduCoins?</span>
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              In einer Blockchain gibt es keine Notenbank! Neue Coins entstehen <strong>ausschließlich durch das Mining</strong>.
              Wer mit Rechenleistung eine passende <strong>Nonce</strong> (Glückszahl) findet,
              sodass der Block-Hash mit <span className="font-mono font-bold text-sky-950">"{targetPrefix}"</span> beginnt,
              erhält <strong>10 frische EduCoins als Block-Belohnung (Coinbase)</strong>!
            </p>
          </div>

          {/* Configuration: Miner & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Miner Selector */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Wer schürft diesen Block? (Belohnungs-Empfänger)
              </label>
              <select
                value={selectedMinerId}
                onChange={(e) => {
                  setSelectedMinerId(e.target.value);
                  setIsSolved(false);
                  setSolvedBlock(null);
                }}
                disabled={isMining || isSolved}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[11px] text-amber-700 font-medium flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Erhält bei Erfolg: +10 EduCoins (neu erschaffen)</span>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  Schwierigkeitsgrad
                </label>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {difficulty} führende {difficulty === 1 ? 'Null' : 'Nullen'}
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    type="button"
                    disabled={isMining || isSolved}
                    onClick={() => {
                      setDifficulty(level);
                      setIsSolved(false);
                      setSolvedBlock(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      difficulty === level
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {level === 1 ? '1 (Schnell)' : level === 2 ? '2 (Mittel)' : '3 (Schwer)'}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                Ziel: Hash muss mit <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">"{targetPrefix}"</code> beginnen.
              </p>
            </div>
          </div>

          {/* Block Data Summary */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 font-mono text-[11px]">
            <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 mb-2">
              Inhalt von Block #{blockIndex}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-500 font-sans block text-[10px]">Vorheriger Hash:</span>
                <span className="truncate block font-semibold text-slate-800" title={previousHash}>
                  {previousHash.slice(0, 16)}...{previousHash.slice(-8)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[10px]">Transaktionen:</span>
                <span className="font-sans font-semibold text-slate-800">
                  {blockTransactions.length} (1 Coinbase-Belohnung + {mempool.length} aus Mempool)
                </span>
              </div>
            </div>
          </div>

          {/* Mining Controls & Live Hash Area */}
          <div className={`p-4 rounded-xl border transition-all ${
            isSolved
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Live SHA-256 Hash-Berechnung für Block #{blockIndex}
              </span>
              <div className="text-slate-500 font-mono text-xs tabular-nums">
                Versuche: <strong>{attempts}</strong>
                {hashRate > 0 && isMining && ` · ${hashRate} H/s`}
              </div>
            </div>

            {/* Current Nonce */}
            <div className="flex items-center gap-3 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-600 font-sans">Nonce (Zähler):</span>
              <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                {nonce}
              </span>
              <span className="text-[10px] text-slate-400 font-sans ml-auto">
                (Wird solange probiert, bis der Hash passt)
              </span>
            </div>

            {/* Current Hash Output */}
            <div className="p-3 rounded-lg bg-slate-900 text-white font-mono text-xs break-all shadow-inner">
              <div className="text-[10px] text-slate-400 mb-1 font-sans">Erzeugter Hash:</div>
              <div className="text-xs sm:text-sm font-semibold tracking-wide">
                <span
                  className={
                    currentHash.startsWith(targetPrefix)
                      ? 'text-emerald-400 font-bold bg-emerald-950/80 px-1 rounded'
                      : 'text-amber-400'
                  }
                >
                  {currentHash.slice(0, difficulty)}
                </span>
                <span className="text-slate-200">{currentHash.slice(difficulty)}</span>
              </div>
            </div>

            {/* Target Status */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs">
                {isSolved ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Perfekt! Gültiger Block-Hash für Block #{blockIndex} gefunden! (Nonce: {nonce})
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Ziel: Der Hash muss mit <span className="font-mono font-bold text-slate-800">"{targetPrefix}"</span> beginnen.
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {!isSolved ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsMining(!isMining)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                      isMining
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                    }`}
                  >
                    {isMining ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Mining anhalten
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Automatisches Mining starten
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleManualStep}
                    disabled={isMining}
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
                    title="Probiere den nächsten Nonce-Schritt einzeln aus"
                  >
                    +1 Nonce (Manuell probieren)
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleCommitBlock}
                  className="w-full py-2.5 px-4 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Block #{blockIndex} in Blockchain einfügen & 10 EDC Belohnung gutschreiben
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
