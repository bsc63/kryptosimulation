import React, { useState } from 'react';
import { Block, Transaction } from '../types/blockchain';
import {
  Link2,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  FileText,
} from 'lucide-react';

interface BlockchainViewProps {
  blocks: Block[];
  onOpenMining: () => void;
  onOpenTamper: (blockIndex: number) => void;
}

export const BlockchainView: React.FC<BlockchainViewProps> = ({
  blocks,
  onOpenMining,
  onOpenTamper,
}) => {
  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(
    blocks.length > 0 ? blocks[blocks.length - 1].index : 0
  );

  const toggleExpand = (index: number) => {
    setExpandedBlockIndex(expandedBlockIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Die Blockchain (Die unveränderbare Kette)</span>
            <span className="text-xs font-normal text-slate-500">
              ({blocks.length} {blocks.length === 1 ? 'Block' : 'Blöcke'} bestätigt)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jeder Block speichert Transaktionen, eine Nonce (Rätselzahl) und den Hash des vorherigen Blocks.
            Dadurch entsteht eine unzerstörbare mathematische Kette.
          </p>
        </div>

        <button
          onClick={onOpenMining}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Nächsten Block schürfen</span>
        </button>
      </div>

      {/* Horizontal Chain View */}
      <div className="overflow-x-auto pb-4 pt-1 custom-scrollbar">
        <div className="flex items-start gap-4 min-w-max px-1">
          {blocks.map((block, idx) => {
            const isGenesis = block.isGenesis;
            const isInvalid = block.isValid === false;
            const isExpanded = expandedBlockIndex === block.index;
            const hasNext = idx < blocks.length - 1;

            return (
              <div key={block.index} className="flex items-center">
                {/* Block Card */}
                <div
                  className={`w-80 rounded-xl border transition-all text-left overflow-hidden ${
                    isInvalid
                      ? 'border-rose-400 bg-rose-50/40 shadow-sm ring-2 ring-rose-500/20'
                      : isGenesis
                      ? 'border-indigo-200 bg-indigo-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Block Header */}
                  <div
                    className={`px-4 py-3 border-b flex items-center justify-between cursor-pointer ${
                      isInvalid
                        ? 'bg-rose-100/60 border-rose-200 text-rose-900'
                        : isGenesis
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-900'
                        : 'bg-slate-50/80 border-slate-100 text-slate-800'
                    }`}
                    onClick={() => toggleExpand(block.index)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                          isInvalid
                            ? 'bg-rose-600 text-white'
                            : isGenesis
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        #{block.index}
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {isGenesis ? 'Genesis-Block' : `Block #${block.index}`}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(block.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isInvalid ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3" />
                          Ungültig!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Gültig
                        </span>
                      )}

                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        aria-label="Details umschalten"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Block Body */}
                  <div className="p-4 space-y-3 text-xs">
                    {/* Tamper Warning if broken */}
                    {isInvalid && (
                      <div className="bg-rose-100 border border-rose-300 rounded p-2.5 text-rose-800">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          Kettenbruch erkannt!
                        </div>
                        <p className="text-[11px] leading-snug">
                          Die Daten dieses Blocks stimmen nicht mehr mit dem Hash oder dem Folgeblock überein.
                          Das Netzwerk akzeptiert diesen Block nicht!
                        </p>
                      </div>
                    )}

                    {/* Hashes & Nonce */}
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
                          Vorheriger Hash (Prev Hash)
                        </div>
                        <div
                          className="truncate text-slate-600"
                          title={block.previousHash}
                        >
                          {block.previousHash.slice(0, 16)}...{block.previousHash.slice(-8)}
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-200/60">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-semibold flex items-center justify-between">
                          <span>Block-Hash</span>
                          <span className="text-[10px] font-normal text-sky-600 font-sans">
                            (Erfordert: {block.difficulty} führende Nullen)
                          </span>
                        </div>
                        <div className="truncate font-semibold text-slate-900" title={block.hash}>
                          <span className="text-emerald-600 font-bold">
                            {block.hash.slice(0, block.difficulty)}
                          </span>
                          <span>{block.hash.slice(block.difficulty, 16)}...{block.hash.slice(-8)}</span>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-slate-700">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-semibold flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-500" />
                          Gefundene Nonce:
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {block.nonce}
                        </span>
                      </div>
                    </div>

                    {/* Miner attribution */}
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Miner:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {block.minerName}
                      </span>
                    </div>

                    {/* Transactions Summary */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          Transaktionen ({block.transactions.length})
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {block.transactions.reduce((sum, t) => sum + t.amount, 0)} EDC Gesamt
                        </span>
                      </div>

                      {/* Transaction list (expanded or compact) */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {block.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className={`p-2 rounded border text-[11px] ${
                              tx.isCoinbase
                                ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <span className="truncate max-w-[150px]">
                                {tx.isCoinbase ? '🪙 Belohnung (Coinbase)' : `${tx.senderName} → ${tx.recipientName}`}
                              </span>
                              <span className="font-mono tabular-nums text-slate-900 font-bold shrink-0">
                                +{tx.amount} EDC
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              {tx.purpose}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tamper Button on block */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onOpenTamper(block.index)}
                        className="w-full py-1 px-2 text-[11px] font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 rounded transition-colors text-center"
                      >
                        Diesen Block manipulieren (Fälschungs-Test)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chain Link between blocks */}
                {hasNext && (
                  <div className="px-2 flex flex-col items-center justify-center shrink-0">
                    <div className="w-8 h-0.5 bg-slate-300 relative flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white border-2 border-sky-500 flex items-center justify-center shadow-xs">
                        <Link2 className="w-2.5 h-2.5 text-sky-600" />
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">prevHash</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
