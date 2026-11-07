import React from 'react';
import { Link2, Cpu, Coins, ShieldCheck, AlertTriangle, ArrowRight, Play } from 'lucide-react';

interface HeroBannerProps {
  blockCount: number;
  totalCoins: number;
  mempoolCount: number;
  isChainValid: boolean;
  onOpenMining: () => void;
  onOpenTransfer: () => void;
  onOpenHashLab: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  blockCount,
  totalCoins,
  mempoolCount,
  isChainValid,
  onOpenMining,
  onOpenTransfer,
  onOpenHashLab,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Editorial Presentation for Class 7-9 */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-2">
            <span className="w-2 h-2 rounded-full bg-sky-600 inline-block"></span>
            <span>Interaktive Schullabor-Simulation · Informatik & Wirtschaft (Kl. 7-9)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
            Wie funktioniert digitales Geld ohne Bank?
          </h1>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed text-pretty">
            In dieser Simulation bist du live dabei: Sende <strong>EduCoins</strong> an Mitschüler,
            schürfe neue Blöcke mit echter <strong>SHA-256 Rechenleistung</strong> und teste selbst im
            Fälschungs-Labor, warum Betrug in einer Blockchain unmöglich ist.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenTransfer}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
            >
              <span>EduCoins überweisen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenMining}
              disabled={mempoolCount === 0}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
                mempoolCount === 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'text-slate-800 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              <span>
                {mempoolCount > 0
                  ? `Block schürfen (${mempoolCount} ${mempoolCount === 1 ? 'Auftrag' : 'Aufträge'})`
                  : 'Warte auf Aufträge'}
              </span>
            </button>
            <button
              onClick={onOpenHashLab}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
            >
              <span>Hash-Sandkasten testen</span>
            </button>
          </div>
        </div>

        {/* Right Side: Key Metrics Strip */}
        <div className="grid grid-cols-2 gap-3 shrink-0 lg:w-80">
          {/* Blocks */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
              <Link2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Ketten-Länge</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {blockCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Bestätigte Blöcke</div>
          </div>

          {/* Total Supply */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Im Umlauf</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {totalCoins} <span className="text-xs font-sans text-amber-600">EDC</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Erzeugte Währung</div>
          </div>

          {/* Mempool Count */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>Mempool</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {mempoolCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Wartende Aufträge</div>
          </div>

          {/* Chain Integrity */}
          <div
            className={`p-3.5 border rounded-xl ${
              isChainValid
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="text-[11px] font-medium flex items-center gap-1 mb-1">
              {isChainValid ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-800">Sicherheit</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-rose-800">Alarm</span>
                </>
              )}
            </div>
            <div className="text-sm font-bold truncate">
              {isChainValid ? 'Intakt & Sicher' : 'Fälschung!'}
            </div>
            <div className="text-[10px] opacity-75 mt-0.5">
              {isChainValid ? 'SHA-256 verifiziert' : 'Kettenbruch aktiv'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
