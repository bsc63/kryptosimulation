import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Send,
  BookOpen,
  Award,
  Cpu,
  Link2,
  Sparkles,
  Wifi,
  User,
} from 'lucide-react';
import { Participant } from '../types/blockchain';

interface NavbarProps {
  activeTab: 'labor' | 'mining' | 'tamper' | 'missions' | 'quiz';
  setActiveTab: (tab: 'labor' | 'mining' | 'tamper' | 'missions' | 'quiz') => void;
  onOpenTransfer: () => void;
  onOpenGlossary: () => void;
  onOpenHashLab: () => void;
  isChainValid: boolean;
  mempoolCount: number;
  lanStatus: 'connecting' | 'connected' | 'offline';
  humanCount: number;
  onOpenLanInfo: () => void;
  currentUser?: Participant;
  onOpenJoinModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenTransfer,
  onOpenGlossary,
  onOpenHashLab,
  isChainValid,
  mempoolCount,
  lanStatus,
  humanCount,
  onOpenLanInfo,
  currentUser,
  onOpenJoinModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark + Status Indicators */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('labor')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-sky-700 transition-colors">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors whitespace-nowrap">
                  KryptoKette
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline ml-2 font-normal">
                  Schullabor
                </span>
              </div>
            </button>

            {/* Chain Health indicator */}
            <div className="hidden xl:flex items-center pl-3 border-l border-slate-200 text-xs">
              {isChainValid ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Kette intakt
                </span>
              ) : (
                <span className="text-rose-700 font-medium flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded text-xs animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Fälschung erkannt!
                </span>
              )}
            </div>

            {/* LAN Network Status Button */}
            <button
              onClick={onOpenLanInfo}
              title="Klassenraum-Netzwerk anzeigen / einrichten"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                lanStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
                  : lanStatus === 'connecting'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Wifi
                className={`w-3.5 h-3.5 ${
                  lanStatus === 'connected'
                    ? 'text-emerald-600'
                    : lanStatus === 'connecting'
                    ? 'text-amber-500 animate-spin'
                    : 'text-slate-400'
                }`}
              />
              <span className="hidden sm:inline">
                {lanStatus === 'connected'
                  ? `LAN (${humanCount} Schüler)`
                  : lanStatus === 'connecting'
                  ? 'Verbinde LAN...'
                  : 'Einzelplatz (LAN starten)'}
              </span>
              <span className="sm:hidden">
                {lanStatus === 'connected' ? 'LAN' : 'Lokal'}
              </span>
            </button>
          </div>

          {/* Zone 2: Concise Nav Links (single line, no wrapping) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('labor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'labor'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Blockchain-Labor
            </button>
            <button
              onClick={() => setActiveTab('mining')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'mining'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              Mining-Labor
              {mempoolCount > 0 && (
                <span className="bg-sky-100 text-sky-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {mempoolCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tamper')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'tamper'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Fälschungs-Test
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'missions'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Lern-Missionen
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'quiz'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Schüler-Quiz
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Quick Utilities + Student Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenHashLab}
              title="Hash-Funktion selbst ausprobieren"
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              Hash-Sandkasten
            </button>
            <button
              onClick={onOpenGlossary}
              title="Krypto-Lexikon öffnen"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              Lexikon
            </button>

            {/* Student profile trigger */}
            <button
              onClick={onOpenJoinModal}
              title="Eigenes Schüler-Wallet anpassen"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
            >
              <span className="text-base leading-none">
                {currentUser?.avatar || '👤'}
              </span>
              <span className="font-semibold max-w-[80px] sm:max-w-[120px] truncate">
                {currentUser ? currentUser.name : 'Mein Wallet'}
              </span>
            </button>

            <button
              onClick={onOpenTransfer}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Überweisen</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
