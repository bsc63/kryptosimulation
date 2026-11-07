import React, { useState } from 'react';
import {
  Wifi,
  X,
  Server,
  Terminal,
  Users,
  CheckCircle2,
  Copy,
  Laptop,
  Smartphone,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Participant } from '../types/blockchain';

interface LanInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lanStatus: 'connecting' | 'connected' | 'offline';
  participants: Participant[];
  onOpenJoinModal: () => void;
  onRefreshConnection: () => void;
}

export const LanInfoModal: React.FC<LanInfoModalProps> = ({
  isOpen,
  onClose,
  lanStatus,
  participants,
  onOpenJoinModal,
  onRefreshConnection,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const humanPlayers = participants.filter((p) => p.isHumanPlayer || p.id === 'user');
  const botPlayers = participants.filter((p) => !p.isHumanPlayer && p.id !== 'user');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
                lanStatus === 'connected' ? 'bg-emerald-600' : 'bg-sky-600'
              }`}
            >
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Lokales Schul-Netzwerk (LAN Multiplayer)
                </h2>
                {lanStatus === 'connected' ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Online & Synchron
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
                    Lokaler Einzelplatz
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Spiele gemeinsam mit deiner ganzen Klasse im Computerraum oder über Schul-WLAN.
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Status banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              lanStatus === 'connected'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-sky-50/70 border-sky-200 text-sky-900'
            }`}
          >
            <Server className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm">
                {lanStatus === 'connected'
                  ? 'Zentraler Blockchain-Knoten ist aktiv!'
                  : 'Bereit für den Klassenraum-Server'}
              </h3>
              <p className="text-xs opacity-90 leading-relaxed">
                {lanStatus === 'connected'
                  ? 'Alle Teilnehmer in diesem Netzwerk teilen sich dieselbe Blockchain. Jeder neu geschürfte Block und jede Überweisung erscheint live bei allen Schülern auf dem Bildschirm.'
                  : 'Aktuell läuft die Simulation lokal auf diesem Computer. Um alle Computer im Raum zu verbinden, kann die Lehrkraft oder ein Schüler den Server mit einem Befehl starten.'}
              </p>
            </div>
          </div>

          {/* Active Participants in Network */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Angemeldete Wallets im Raum ({participants.length})</span>
              </h4>
              <button
                onClick={onOpenJoinModal}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md transition-colors"
              >
                + Eigenen Namen eintragen
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((p) => {
                const isYou = p.id === 'user' || p.isCurrentUser;
                const isHuman = p.isHumanPlayer || isYou;

                return (
                  <div
                    key={p.id}
                    className={`p-2 rounded-lg border flex items-center gap-2.5 ${
                      isYou
                        ? 'bg-sky-50/80 border-sky-300'
                        : isHuman
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-xl">{p.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-800 text-xs truncate flex items-center gap-1">
                        {p.name}
                        {isYou && (
                          <span className="text-[9px] bg-sky-600 text-white px-1 py-0.2 rounded font-normal">
                            Du
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {isHuman ? (
                          <span className="text-emerald-700 font-medium">Mitschüler</span>
                        ) : (
                          <span>Simulations-Bot</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Guide: How to host Python Server */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Anleitung für Lehrkräfte & Admins (Lokaler Server)</span>
              </h4>
              <button
                onClick={onRefreshConnection}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                title="Verbindung zum Server neu prüfen"
              >
                <RefreshCw className="w-3 h-3" />
                Neu prüfen
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Es stehen zwei Methoden zur Verfügung, um die Simulation im Raum bereitzustellen:
            </p>

            {/* Option 1: Python 3 Server */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-amber-100 text-amber-800 flex items-center justify-center text-[11px] font-mono">
                    Py
                  </span>
                  Methode 1: Lokaler Python 3 Server (Kein npm nötig!)
                </span>
                <button
                  onClick={() => copyToClipboard('python3 server.py 8000', 'py')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copiedCmd === 'py' ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Läuft auf jedem Rechner mit vorinstalliertem Python 3. Startet sofort mit integriertem LAN-Broadcast:
              </p>
              <div className="bg-slate-900 text-emerald-400 p-2 rounded font-mono text-[11px] flex items-center justify-between">
                <code>python3 server.py 8000</code>
              </div>
            </div>

            {/* Option 2: Node / npm */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-mono">
                    JS
                  </span>
                  Methode 2: Node.js Express Server
                </span>
                <button
                  onClick={() => copyToClipboard('npm run dev', 'node')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copiedCmd === 'node' ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>
              <div className="bg-slate-900 text-emerald-400 p-2 rounded font-mono text-[11px]">
                <code>npm run dev</code>
              </div>
            </div>

            {/* Student connection tip */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-sky-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                <span>Wie verbinden sich die Schüler?</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Der Host-Computer zeigt im Terminal seine lokale IP-Adresse an (z.B.{' '}
                <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">http://192.168.1.45:8000</code>).
                Alle Schüler geben diese Adresse im Browser ihres Laptops, Tablets oder Handys ein.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automatische Peer-Synchronisation via SSE (Server-Sent Events)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs transition-colors"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
};
