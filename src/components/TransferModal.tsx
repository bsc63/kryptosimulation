import React, { useState } from 'react';
import { Participant, Transaction } from '../types/blockchain';
import { Send, X, ArrowRight, ShieldCheck, Coins, Sparkles } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  balances: Record<string, { confirmed: number; pendingChange: number }>;
  defaultSenderId?: string;
  onSendTransaction: (newTx: Transaction) => void;
}

const PRESET_PURPOSES = [
  { text: 'Pausenbrot & Apfelsaft', amount: 2 },
  { text: 'Mathe-Nachhilfe & Spickzettel', amount: 5 },
  { text: 'Pixel-Sticker fürs Profil', amount: 3 },
  { text: 'Klassenfahrt-Zuschuss', amount: 8 },
  { text: 'Skateboard-Rollen ausgeliehen', amount: 4 },
];

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  participants,
  balances,
  defaultSenderId = 'user',
  onSendTransaction,
}) => {
  const [senderId, setSenderId] = useState<string>(defaultSenderId);
  const [recipientId, setRecipientId] = useState<string>(
    defaultSenderId === 'mia' ? 'lukas' : 'mia'
  );
  const [amount, setAmount] = useState<number>(3);
  const [purpose, setPurpose] = useState<string>('Pausensnack in der 2. Pause');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sender = participants.find((p) => p.id === senderId) || participants[0];
  const recipient = participants.find((p) => p.id === recipientId) || participants[1];

  const senderBalance = balances[sender.id]?.confirmed ?? sender.initialBalance;
  const pendingChange = balances[sender.id]?.pendingChange ?? 0;
  const availableBalance = senderBalance + pendingChange;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (senderId === recipientId) {
      setError('Absender und Empfänger dürfen nicht identisch sein!');
      return;
    }

    if (amount <= 0) {
      setError('Der Betrag muss mindestens 1 EduCoin betragen.');
      return;
    }

    if (amount > availableBalance) {
      setError(
        `Nicht genügend Guthaben! ${sender.name} hat nur ${availableBalance} verfügbare EDC (inkl. Mempool).`
      );
      return;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: sender.id,
      senderName: sender.name,
      recipientId: recipient.id,
      recipientName: recipient.name,
      amount,
      purpose: purpose.trim() || 'Überweisung',
      timestamp: Date.now(),
      isCoinbase: false,
    };

    onSendTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                EduCoins überweisen
              </h2>
              <p className="text-xs text-slate-500">
                Erstelle eine neue Transaktion für das Krypto-Netzwerk.
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Sender & Recipient Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Absender (Von)
              </label>
              <select
                value={senderId}
                onChange={(e) => {
                  setSenderId(e.target.value);
                  setError(null);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({balances[p.id]?.confirmed ?? p.initialBalance} EDC)
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Verfügbar: <strong>{availableBalance} EDC</strong>
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Empfänger (An)
              </label>
              <select
                value={recipientId}
                onChange={(e) => {
                  setRecipientId(e.target.value);
                  setError(null);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
              >
                {participants
                  .filter((p) => p.id !== senderId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Empfängt den Betrag
              </span>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Betrag in EduCoins (EDC)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 pl-3 pr-16 border border-slate-300 rounded-lg font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3 top-3 font-semibold text-amber-700 text-xs">
                EDC
              </span>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Verwendungszweck (Grund der Zahlung)
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="z.B. Fürs Pausenbrot"
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 self-center mr-1">Vorschläge:</span>
              {PRESET_PURPOSES.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPurpose(preset.text);
                    setAmount(preset.amount);
                  }}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  {preset.text} ({preset.amount} EDC)
                </button>
              ))}
            </div>
          </div>

          {/* Cryptographic Signature Note */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center gap-2 text-slate-600 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Wird digital mit dem privaten Schlüssel von <strong>{sender.name}</strong> signiert und wandert zunächst in den <strong>Mempool (Warteraum)</strong>.
            </span>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Transaktion signieren & in Mempool senden</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
