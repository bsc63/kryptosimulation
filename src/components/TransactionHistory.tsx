import React, { useState } from 'react';
import { Block, Transaction, Participant } from '../types/blockchain';
import { History, ArrowRight, CheckCircle2, Clock, Filter, Sparkles } from 'lucide-react';

interface TransactionHistoryProps {
  blocks: Block[];
  mempool: Transaction[];
  participants: Participant[];
  selectedParticipantId: string;
  onSelectParticipant: (id: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  blocks,
  mempool,
  participants,
  selectedParticipantId,
  onSelectParticipant,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'confirmed' | 'pending'>('all');

  // Collect all transactions with block metadata
  const allTransactions: Array<
    Transaction & { blockIndex?: number; status: 'confirmed' | 'pending' }
  > = [];

  // 1. Confirmed in blocks (newest blocks first)
  const minedIds = new Set<string>();
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    b.transactions.forEach((tx) => {
      minedIds.add(tx.id);
      allTransactions.push({
        ...tx,
        blockIndex: b.index,
        status: 'confirmed',
      });
    });
  }

  // 2. Pending Mempool (only those not already in confirmed blocks)
  mempool.forEach((tx) => {
    if (!minedIds.has(tx.id)) {
      allTransactions.unshift({
        ...tx,
        status: 'pending',
      });
    }
  });

  // Filter by participant
  const filtered = allTransactions.filter((tx) => {
    // Participant filter
    if (selectedParticipantId !== 'all') {
      const isParticipant =
        tx.senderId === selectedParticipantId || tx.recipientId === selectedParticipantId;
      if (!isParticipant) return false;
    }

    // Status filter
    if (filterType === 'confirmed' && tx.status !== 'confirmed') return false;
    if (filterType === 'pending' && tx.status !== 'pending') return false;

    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-sky-600" />
            <span>Transaktionshistorie (Das öffentliche Kassenbuch)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jede jemals getätigte Überweisung ist für alle Teilnehmer transparent und unlöschbar einsehbar.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Participant Filter */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedParticipantId}
              onChange={(e) => onSelectParticipant(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-md p-1 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">Alle Teilnehmer</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  Nur {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alle ({allTransactions.length})
            </button>
            <button
              onClick={() => setFilterType('confirmed')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                filterType === 'confirmed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bestätigt
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                filterType === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Im Mempool ({mempool.length})
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Table / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
          Keine Transaktionen für diesen Filter gefunden.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Absender</th>
                <th className="py-2.5 px-3">Empfänger</th>
                <th className="py-2.5 px-3">Verwendungszweck</th>
                <th className="py-2.5 px-3 text-right">Betrag</th>
                <th className="py-2.5 px-3 text-right">Zeitstempel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tx) => {
                const isCoinbase = tx.isCoinbase;
                const isPending = tx.status === 'pending';

                return (
                  <tr
                    key={`${tx.status}-${tx.blockIndex !== undefined ? `b${tx.blockIndex}` : 'mem'}-${tx.id}`}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCoinbase ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Status column */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Im Mempool
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Block #{tx.blockIndex}
                        </span>
                      )}
                    </td>

                    {/* Sender */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                      {isCoinbase ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          System (Mining)
                        </span>
                      ) : (
                        tx.senderName
                      )}
                    </td>

                    {/* Recipient */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                      {tx.recipientName}
                    </td>

                    {/* Purpose */}
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {tx.purpose}
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap tabular-nums text-slate-900">
                      <span className={isCoinbase ? 'text-amber-600' : 'text-slate-900'}>
                        +{tx.amount} EDC
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap tabular-nums">
                      {new Date(tx.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
