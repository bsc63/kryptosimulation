import React, { useState, useEffect } from 'react';
import { sha256 } from '../utils/crypto';
import { X, Fingerprint, Sparkles, Copy, Check, Info } from 'lucide-react';

interface HashLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HashLabModal: React.FC<HashLabModalProps> = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = useState<string>('Hallo Klasse 8b');
  const [hashResult, setHashResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    sha256(inputText).then((res) => {
      if (!cancelled) setHashResult(res);
    });
    return () => {
      cancelled = true;
    };
  }, [inputText]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(hashResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                SHA-256 Hash-Sandkasten
              </h2>
              <p className="text-xs text-slate-500">
                Sieh live, wie aus Text ein mathematischer Fingerabdruck entsteht.
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-sky-50/80 border border-sky-100 rounded-xl text-sky-900 text-[11px] leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              Tippe beliebigen Text ein. Beobachte den <strong>Lawineneffekt</strong>: Sobald du nur einen einzigen
              Buchstaben änderst oder ein Leerzeichen hinzufügst, wird der gesamte 64-stellige Code komplett neu ausgewürfelt!
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Beliebigen Text eintippen:
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Schreibe hier etwas hinein..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs font-mono"
            />

            {/* Quick Test Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 self-center">Vergleiche:</span>
              <button
                type="button"
                onClick={() => setInputText('Hallo')}
                className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                "Hallo" (mit großem H)
              </button>
              <button
                type="button"
                onClick={() => setInputText('hallo')}
                className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                "hallo" (mit kleinem h)
              </button>
              <button
                type="button"
                onClick={() => setInputText('hallo!')}
                className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                "hallo!" (mit Ausrufezeichen)
              </button>
            </div>
          </div>

          {/* Hash Output */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-900">
                Ergebnis: SHA-256 Hash (64 Hexadezimal-Zeichen)
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs break-all rounded-xl shadow-inner font-bold tracking-wide">
              {hashResult}
            </div>
          </div>

          {/* 3 Core Rules of Hashing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
              <div className="font-bold text-slate-900 text-[11px] mb-0.5">1. Einwegfunktion</div>
              <p className="text-[10px] text-slate-500">
                Man kann leicht den Hash berechnen, aber aus dem Hash niemals den originalen Text erraten.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
              <div className="font-bold text-slate-900 text-[11px] mb-0.5">2. Lawineneffekt</div>
              <p className="text-[10px] text-slate-500">
                Jede winzige Änderung führt zu einem völlig anderen Ergebnis. Nichts bleibt gleich.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
              <div className="font-bold text-slate-900 text-[11px] mb-0.5">3. Feste Länge</div>
              <p className="text-[10px] text-slate-500">
                Egal ob 1 Buchstabe oder ein ganzes Wikipedia-Buch: Der Hash hat immer genau 256 Bits (64 Zeichen).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
