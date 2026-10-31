import React from 'react';
import { Participant } from '../types/blockchain';
import { Coins, Send, ArrowUpRight, ArrowDownLeft, UserCheck } from 'lucide-react';

interface ParticipantsBarProps {
  participants: Participant[];
  balances: Record<string, { confirmed: number; pendingChange: number }>;
  activeParticipantId: string;
  onSelectParticipant: (id: string) => void;
  onQuickSend: (senderId: string) => void;
}

export const ParticipantsBar: React.FC<ParticipantsBarProps> = ({
  participants,
  balances,
  activeParticipantId,
  onSelectParticipant,
  onQuickSend,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Teilnehmer im Blockchain-Netzwerk</span>
            <span className="text-xs font-normal text-slate-500">
              ({participants.length} Wallets aktiv)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jeder Schüler besitzt ein eigenes Wallet mit Adresse und Kontostand. Klicke auf ein Wallet, um dessen Transaktionen anzuzeigen.
          </p>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Währung: <strong>EduCoin (EDC)</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {participants.map((p) => {
          const balance = balances[p.id] || { confirmed: p.initialBalance, pendingChange: 0 };
          const isSelected = activeParticipantId === p.id;
          const isUser = p.id === 'user';

          return (
            <div
              key={p.id}
              onClick={() => onSelectParticipant(p.id)}
              className={`relative text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-400/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              {isUser && (
                <div className="absolute -top-2 right-2 bg-sky-600 text-white text-[10px] font-semibold px-2 py-0.2 rounded-full uppercase tracking-wider">
                  Du
                </div>
              )}

              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 shadow-xs"
                  style={{ backgroundColor: `${p.color}15`, border: `1.5px solid ${p.color}40` }}
                >
                  {p.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 truncate flex items-center gap-1">
                    {p.name}
                    {isSelected && <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{p.grade} · {p.role}</div>
                </div>
              </div>

              {/* Balance display */}
              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Guthaben</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                      {balance.confirmed}
                    </span>
                    <span className="text-xs font-semibold text-amber-600">EDC</span>
                  </div>
                </div>

                {balance.pendingChange !== 0 && (
                  <div
                    className={`text-xs font-mono tabular-nums flex items-center gap-0.5 ${
                      balance.pendingChange > 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                    title="Wartet auf Block-Bestätigung im Mempool"
                  >
                    {balance.pendingChange > 0 ? (
                      <>
                        <ArrowDownLeft className="w-3 h-3" />
                        +{balance.pendingChange}
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-3 h-3" />
                        {balance.pendingChange}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Quick action button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickSend(p.id);
                }}
                className="mt-2.5 w-full flex items-center justify-center gap-1 py-1 px-2 text-xs font-medium text-slate-700 hover:text-sky-700 bg-slate-100 hover:bg-sky-100/60 rounded transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Überweisen</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
