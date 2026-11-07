import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Award,
  Cpu,
  Link2,
  Sparkles,
  Wifi,
  User,
  Download,
} from 'lucide-react';
import { Participant } from '../types/blockchain';
import { downloadServerPy } from '../utils/serverScript';

interface NavbarProps {
  activeTab: 'labor' | 'mining' | 'tamper' | 'missions' | 'quiz';
  setActiveTab: (tab: 'labor' | 'mining' | 'tamper' | 'missions' | 'quiz') => void;
  onOpenGlossary: () => void;
  onOpenHashLab: () => void;
  isChainValid: boolean;
  mempoolCount: number;
  lanStatus: 'connecting' | 'connected' | 'offline';
  humanCount: number;
  onOpenLanInfo: () => void;
  currentUser?: Participant;
  userBalance?: number;
  onOpenJoinModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGlossary,
  onOpenHashLab,
  isChainValid,
  mempoolCount,
  lanStatus,
  humanCount,
  onOpenLanInfo,
  currentUser,
  userBalance = 25,
  onOpenJoinModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Zone 1 (Left): Brand + Student's Personal Wallet */}
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

            {/* Student's Personal Wallet - Moved to Zone 1 so it NEVER clips on the right! */}
            <button
              onClick={onOpenJoinModal}
              title="Klicke hier, um dein Schüler-Wallet oder deinen Namen anzupassen"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-900 border border-sky-200/90 hover:bg-sky-100 hover:border-sky-300 transition-colors shadow-2xs"
            >
              <span className="text-base leading-none">
                {currentUser?.avatar || '🎒'}
              </span>
              <div className="text-left leading-tight">
                <span className="font-bold block max-w-[85px] sm:max-w-[110px] truncate">
                  {currentUser ? currentUser.name : 'Mein Wallet'}
                </span>
                <span className="text-[10px] font-mono text-sky-700 font-bold block">
                  {userBalance} <span className="font-sans font-normal text-slate-500">EDC</span>
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2 (Center): Primary Navigation Tabs - Including Lexikon right here! */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
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

            {/* Lexikon integrated directly in navigation bar! */}
            <button
              onClick={onOpenGlossary}
              className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              title="Krypto-Lexikon öffnen"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              Krypto-Lexikon
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

          {/* Zone 3 (Right): Quick Lab, LAN status, and direct Python Server download */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Direct 1-Click Python Server Download */}
            <button
              onClick={downloadServerPy}
              title="server.py direkt auf deinen Computer herunterladen (für den Lehrer-PC oder Schul-Server)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">server.py</span>
            </button>

            {/* LAN Network Status Button */}
            <button
              onClick={onOpenLanInfo}
              title="Klassenraum-Netzwerk anzeigen / einrichten"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
              <span className="hidden sm:inline font-semibold">
                {lanStatus === 'connected'
                  ? `LAN (${humanCount})`
                  : lanStatus === 'connecting'
                  ? 'Verbinde...'
                  : 'LAN-Server'}
              </span>
            </button>

            {/* Compact Hash-Sandkasten */}
            <button
              onClick={onOpenHashLab}
              title="Hash-Funktion selbst ausprobieren"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              Hash-Sandkasten
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
