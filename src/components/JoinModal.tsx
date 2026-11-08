import React, { useState } from 'react';
import { Participant } from '../types/blockchain';
import { UserPlus, X, Wallet, Sparkles, Check, Users } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (player: Participant) => void;
  onLeave?: () => void;
  currentPlayer?: Participant;
}

const AVATAR_OPTIONS = ['🎒', '🚀', '🦊', '⚡', '🎧', '🛹', '💎', '🐉', '🎯', '🤖', '🎮', '🎨', '🦁', '⭐'];

const COLOR_OPTIONS = [
  '#0284c7', // Sky
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#d97706', // Amber
  '#e11d48', // Rose
  '#4f46e5', // Indigo
  '#0891b2', // Cyan
  '#ca8a04', // Yellow
];

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  onLeave,
  currentPlayer,
}) => {
  const [name, setName] = useState<string>(currentPlayer?.name || '');
  const [grade, setGrade] = useState<string>(currentPlayer?.grade || 'Klasse 8b');
  const [avatar, setAvatar] = useState<string>(currentPlayer?.avatar || '🚀');
  const [color, setColor] = useState<string>(currentPlayer?.color || '#0284c7');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Bitte gib deinen Vornamen oder Spitznamen ein.');
      return;
    }

    const playerId = currentPlayer?.id || `p-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36).slice(-4)}`;

    const newPlayer: Participant = {
      id: playerId,
      name: name.trim(),
      avatar,
      color,
      grade: grade.trim() || 'Schüler/in',
      role: 'Schüler-Wallet',
      description: `Persönliches Wallet von ${name.trim()}.`,
      initialBalance: currentPlayer ? currentPlayer.initialBalance : 25,
      isHumanPlayer: true,
      isCurrentUser: true,
      joinedAt: currentPlayer?.joinedAt || Date.now(),
    };

    onJoin(newPlayer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {currentPlayer ? 'Mein Schüler-Wallet anpassen' : 'Eigenem Wallet beitreten'}
              </h2>
              <p className="text-xs text-slate-500">
                Spiele mit deinen Mitschülern im lokalen Schul-Netzwerk.
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Name & Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Dein Name / Spitzname:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="z.B. Felix"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
                autoFocus
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Klasse / Gruppe:
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="z.B. Klasse 8b"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Wähle dein Avatar-Symbol:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition-all ${
                    avatar === emoji
                      ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-400/40 shadow-xs scale-105'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Accent Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Wähle deine Wallet-Farbe:
            </label>
            <div className="flex gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Starter Pack Info */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Start-Guthaben: <strong>25 EduCoins</strong> werden dir gutgeschrieben. Du kannst sofort mit Mitschülern handeln!
            </span>
          </div>

          {/* Submit & Reset Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>{currentPlayer ? 'Profil aktualisieren' : 'Wallet erstellen & Beitreten'}</span>
            </button>

            {currentPlayer && onLeave && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Möchtest du dein Schüler-Wallet auf diesem Gerät abmelden / löschen?')) {
                    onLeave();
                    onClose();
                  }
                }}
                className="w-full py-2 px-3 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                Wallet auf diesem Gerät abmelden / löschen
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
