import React, { useState } from 'react';
import { GLOSSARY_ITEMS } from '../data/learningContent';
import {
  BookOpen,
  X,
  Search,
  Link,
  Pickaxe,
  Fingerprint,
  Dices,
  Inbox,
  Wallet,
  ShieldCheck,
  Coins,
} from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredItems = GLOSSARY_ITEMS.filter(
    (item) =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simpleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Link':
        return <Link className="w-5 h-5 text-sky-600" />;
      case 'Pickaxe':
        return <Pickaxe className="w-5 h-5 text-amber-600" />;
      case 'Fingerprint':
        return <Fingerprint className="w-5 h-5 text-indigo-600" />;
      case 'Dices':
        return <Dices className="w-5 h-5 text-emerald-600" />;
      case 'Inbox':
        return <Inbox className="w-5 h-5 text-rose-600" />;
      case 'Wallet':
        return <Wallet className="w-5 h-5 text-sky-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Krypto-Lexikon für die Schule
              </h2>
              <p className="text-xs text-slate-500">
                Wichtige Fachbegriffe einfach erklärt mit Vergleichen aus dem Alltag.
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

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Begriff suchen (z.B. Nonce, Mining, Hash, Mempool)..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Terms list */}
        <div className="p-6 overflow-y-auto space-y-3.5 text-xs">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Kein passender Begriff gefunden.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.term}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-left space-y-2"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                    {getIcon(item.iconName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        {item.term}
                      </h3>
                      <span className="text-xs font-semibold text-sky-600">
                        · {item.simpleName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                </div>

                {/* Everyday Analogy Callout */}
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] text-amber-900">
                  <span className="font-bold mr-1">Alltags-Vergleich:</span>
                  <span>{item.everydayAnalogy}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
