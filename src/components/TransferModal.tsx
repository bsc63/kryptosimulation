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
  currentUser?: Participant;
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
  defaultSenderId,
  onSendTransaction,
  currentUser,
}) => {
  // Determine allowed senders based on rule:
  // If a student wallet is created, transfers can only be made from that wallet, OR between bots.
  const allowedSenders = React.useMemo(() => {
    if (currentUser) {
      return participants.filter(
        (p) => p.id === currentUser.id || (!p.isHumanPlayer && p.id !== 'user')
      );
    }
    return participants;
  }, [participants, currentUser]);

  const initialSenderId = React.useMemo(() => {
    if (currentUser) {
      if (defaultSenderId && allowedSenders.some((p) => p.id === defaultSenderId)) {
        return defaultSenderId;
      }
      return currentUser.id;
    }
    return defaultSenderId || participants[0]?.id || 'mia';
  }, [currentUser, defaultSenderId, allowedSenders, participants]);

  const [senderId, setSenderId] = useState<string>(initialSenderId);

  // Sync senderId when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        if (defaultSenderId && allowedSenders.some((p) => p.id === defaultSenderId)) {
          setSenderId(defaultSenderId);
        } else {
          setSenderId(currentUser.id);
        }
      } else if (defaultSenderId) {
        setSenderId(defaultSenderId);
      }
    }
  }, [isOpen, currentUser, defaultSenderId, allowedSenders]);

  const sender = participants.find((p) => p.id === senderId) || allowedSenders[0] || participants[0];

  // Allowed recipients:
  // - If sender is currentUser: can send to anyone except themselves
  // - If sender is a bot: can only send to other bots ("oder zwischen Bots")
  const isSenderCurrentUser = Boolean(currentUser && sender.id === currentUser.id);
  const isSenderBot = Boolean(!sender.isHumanPlayer && (!currentUser || sender.id !== currentUser.id));

  const allowedRecipients = React.useMemo(() => {
    if (isSenderBot) {
      // Bot to bot only
      return participants.filter((p) => p.id !== sender.id && !p.isHumanPlayer && p.id !== 'user');
    }
    // Student can send to anyone except themselves
    return participants.filter((p) => p.id !== sender.id);
  }, [participants, sender.id, isSenderBot]);

  const [recipientId, setRecipientId] = useState<string>(() => {
    return allowedRecipients[0]?.id || (sender.id === 'mia' ? 'lukas' : 'mia');
  });

  // Re-adjust recipient if no longer in allowed list
  React.useEffect(() => {
    if (!allowedRecipients.some((p) => p.id === recipientId)) {
      if (allowedRecipients.length > 0) {
        setRecipientId(allowedRecipients[0].id);
      }
    }
  }, [senderId, allowedRecipients, recipientId]);

  const [amount, setAmount] = useState<number>(3);
  const [purpose, setPurpose] = useState<string>('Pausensnack in der 2. Pause');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const recipient = participants.find((p) => p.id === recipientId) || allowedRecipients[0] || participants[1];

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
                {allowedSenders.map((p) => {
                  const isYou = currentUser && p.id === currentUser.id;
                  const bal = balances[p.id]?.confirmed ?? p.initialBalance;
                  return (
                    <option key={p.id} value={p.id}>
                      {isYou ? `🎒 ${p.name} (Dein Wallet)` : `🤖 ${p.name} (Bot)`} – {bal} EDC
                    </option>
                  );
                })}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {isSenderCurrentUser ? (
                  <span className="text-emerald-700 font-medium">✓ Dein persönliches Wallet</span>
                ) : (
                  <span className="text-amber-700 font-medium">🤖 Bot-zu-Bot Simulation</span>
                )}
                {' · '}Verfügbar: <strong>{availableBalance} EDC</strong>
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
                {allowedRecipients.map((p) => {
                  const isYou = currentUser && p.id === currentUser.id;
                  const isHuman = p.isHumanPlayer || isYou;
                  return (
                    <option key={p.id} value={p.id}>
                      {isYou ? `🎒 ${p.name} (Du)` : isHuman ? `👤 ${p.name} (Mitschüler)` : `🤖 ${p.name} (Bot)`}
                    </option>
                  );
                })}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {isSenderBot ? (
                  <span className="text-amber-700">Bots zahlen nur an andere Bots</span>
                ) : (
                  <span>Empfängt den Betrag</span>
                )}
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
