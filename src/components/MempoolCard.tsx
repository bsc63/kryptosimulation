import React from 'react';
import { Transaction } from '../types/blockchain';
import { Inbox, Cpu, Send, Sparkles, ArrowRight, Clock, PlusCircle } from 'lucide-react';

interface MempoolCardProps {
  mempool: Transaction[];
  onOpenMining: () => void;
  onOpenTransfer: () => void;
  onAddQuickTransaction: () => void;
}

export const MempoolCard: React.FC<MempoolCardProps> = ({
  mempool,
  onOpenMining,
  onOpenTransfer,
  onAddQuickTransaction,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Mempool (Der Warteraum)</span>
                <span className="bg-sky-50 text-sky-700 font-mono text-xs px-2 py-0.5 rounded-full font-semibold">
                  {mempool.length} wartend
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onAddQuickTransaction}
            title="Schnell eine Test-Transaktion einfügen"
            className="text-xs text-sky-700 hover:text-sky-800 font-medium flex items-center gap-1 hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Beispiel-Überweisung</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Neu gesendete Aufträge warten hier. Sie sind noch <strong>nicht bestätigt</strong> und können noch abgebrochen werden. Ein Miner muss sie erst in den nächsten Block einpacken!
        </p>

        {/* Transaction list */}
        {mempool.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-lg p-5 text-center text-xs text-slate-500 bg-slate-50/50">
            <Inbox className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="font-medium text-slate-700">Der Warteraum ist aktuell leer</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sende eine Überweisung zwischen Schülern ab, um den Mempool zu füllen.
            </p>
            <button
              onClick={onOpenTransfer}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors"
            >
              <Send className="w-3 h-3" />
              Jetzt Überweisung erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {mempool.map((tx) => (
              <div
                key={tx.id}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white text-xs transition-colors"
              >
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-800 truncate">
                    <span>{tx.senderName}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{tx.recipientName}</span>
                  </div>
                  <span className="font-mono tabular-nums text-slate-900 font-bold shrink-0">
                    {tx.amount} EDC
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                  <span className="truncate italic">"{tx.purpose}"</span>
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium shrink-0 ml-2">
                    <Clock className="w-3 h-3" />
                    unbestätigt
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={onOpenMining}
          disabled={mempool.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            mempool.length > 0
              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Diese {mempool.length} {mempool.length === 1 ? 'Transaktion' : 'Transaktionen'} schürfen</span>
        </button>
      </div>
    </div>
  );
};
