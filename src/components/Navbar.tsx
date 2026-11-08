import React from 'react';
import {
  BookOpen,
  Award,
  Cpu,
  Link2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Participant } from '../types/blockchain';

interface NavbarProps {
  activeTab: 'labor' | 'mining' | 'tamper' | 'missions' | 'quiz';
  setActiveTab: (tab: 'labor' | 'mining' | 'tamper' | 'missions' | 'quiz') => void;
  onOpenGlossary: () => void;
  currentUser?: Participant;
  userBalance?: number;
  onOpenJoinModal: () => void;
  mempoolCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGlossary,
  currentUser,
  userBalance = 25,
  onOpenJoinModal,
  mempoolCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
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

            {/* Student's Personal Wallet */}
            <button
              onClick={onOpenJoinModal}
              title="Klicke hier, um dein Schüler-Wallet oder deinen Namen anzupassen"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-900 border border-sky-200/90 hover:bg-sky-100 hover:border-sky-300 transition-colors shadow-2xs"
            >
              <span className="text-base leading-none">
                {currentUser?.avatar || '🎒'}
              </span>
              <div className="text-left leading-tight">
                <span className="font-bold block max-w-[85px] sm:max-w-[120px] truncate">
                  {currentUser ? currentUser.name : 'Mein Wallet'}
                </span>
                <span className="text-[10px] font-mono text-sky-700 font-bold block">
                  {userBalance} <span className="font-sans font-normal text-slate-500">EDC</span>
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2 (Center / Right): Primary Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
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

            {/* Krypto-Lexikon button */}
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
        </div>
      </div>
    </header>
  );
};
