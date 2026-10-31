import React, { useState } from 'react';
import { Block, Transaction } from '../types/blockchain';
import { calculateBlockHash } from '../utils/crypto';
import {
  AlertTriangle,
  X,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  FileEdit,
  ArrowRight,
  ShieldCheck,
  Link2Off,
  Cpu,
} from 'lucide-react';

interface TamperModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: Block[];
  selectedBlockIndex: number;
  onTamperBlock: (blockIndex: number, updatedTransactions: Transaction[]) => void;
  onRestoreChain: () => void;
}

export const TamperModal: React.FC<TamperModalProps> = ({
  isOpen,
  onClose,
  blocks,
  selectedBlockIndex,
  onTamperBlock,
  onRestoreChain,
}) => {
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(
    selectedBlockIndex > 0 ? selectedBlockIndex : 1
  );

  const blockToTamper = blocks.find((b) => b.index === activeBlockIndex) || blocks[1] || blocks[0];
  const [modifiedTxs, setModifiedTxs] = useState<Transaction[]>(
    blockToTamper ? JSON.parse(JSON.stringify(blockToTamper.transactions)) : []
  );

  if (!isOpen || !blockToTamper) return null;

  const handleAmountChange = (txId: string, newAmount: number) => {
    setModifiedTxs((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, amount: Math.max(1, newAmount) } : tx))
    );
  };

  const handleApplyTamper = () => {
    onTamperBlock(blockToTamper.index, modifiedTxs);
  };

  const isCurrentBlockTampered = blockToTamper.tampered || blockToTamper.isValid === false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Fälschungs-Labor (Manipulations-Test)
              </h2>
              <p className="text-xs text-slate-500">
                Teste selbst, warum man in einer Blockchain nicht schummeln kann!
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
            <h3 className="font-bold text-amber-900 text-xs mb-1 flex items-center gap-1.5">
              <Link2Off className="w-4 h-4 text-amber-600" />
              Das Gedankenexperiment: Was passiert beim Fälschen?
            </h3>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Stell dir vor, Schüler Max möchte heimlich nachträglich einen Betrag in einem alten Block ändern,
              um sich mehr EduCoins gutzuschreiben. Ändere unten einen Wert und klicke auf "Block manipulieren".
              Du wirst sehen, wie die mathematische Kette sofort zerreißt!
            </p>
          </div>

          {/* Block Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Wähle den Block, den du manipulieren möchtest:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {blocks.map((b) => (
                <button
                  key={b.index}
                  type="button"
                  onClick={() => {
                    setActiveBlockIndex(b.index);
                    setModifiedTxs(JSON.parse(JSON.stringify(b.transactions)));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeBlockIndex === b.index
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Block #{b.index} {b.isGenesis ? '(Genesis)' : ''}
                  {b.isValid === false && ' ⚠️'}
                </button>
              ))}
            </div>
          </div>

          {/* Edit Transactions inside block */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                Transaktionen in Block #{blockToTamper.index} bearbeiten
              </div>
              <span className="text-[10px] text-slate-500">
                (Ändere hier zum Testen die Beträge)
              </span>
            </div>

            <div className="space-y-2.5">
              {modifiedTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                      <span>{tx.senderName}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{tx.recipientName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {tx.purpose}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-[11px] text-slate-500">Betrag:</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={tx.amount}
                        onChange={(e) => handleAmountChange(tx.id, parseInt(e.target.value) || 1)}
                        className="w-16 p-1 border border-slate-300 rounded font-mono font-bold text-slate-900 text-xs text-right"
                      />
                      <span className="text-xs font-semibold text-amber-700">EDC</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Status after Tamper */}
          {isCurrentBlockTampered ? (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>ALARM: Kette ist gebrochen und ungültig!</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                Weil du die Daten geändert hast, stimmt der Hash von Block #{blockToTamper.index} nicht mehr!
                Alle folgenden Blöcke verweisen ins Leere. In der echten Welt würden tausende Computer weltweit diese
                Kopie einfach <strong>löschen und ignorieren</strong>.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRestoreChain}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Kette wiederherstellen (Original-Zustand)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dieser Block ist aktuell unberührt und kryptografisch gültig.</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleApplyTamper}
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Manipulation jetzt ausführen (Kettenbruch testen)
            </button>
            <button
              type="button"
              onClick={onRestoreChain}
              className="py-2.5 px-4 rounded-lg font-semibold text-xs border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
