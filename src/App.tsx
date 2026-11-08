import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Block,
  Transaction,
  Participant,
  Mission,
} from './types/blockchain';
import {
  INITIAL_PARTICIPANTS,
  createGenesisBlock,
  createInitialBlock1,
  validateEntireChain,
  calculateBalances,
} from './utils/crypto';
import {
  generateRandomStudentTransaction,
  getNextIrregularIntervalMs,
} from './utils/autoGenerator';
import {
  checkServerHealth,
  registerPlayerOnServer,
  broadcastTransactionToServer,
  broadcastMinedBlockToServer,
} from './services/network';
import { INITIAL_MISSIONS } from './data/learningContent';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ParticipantsBar } from './components/ParticipantsBar';
import { BlockchainView } from './components/BlockchainView';
import { MempoolCard } from './components/MempoolCard';
import { TransactionHistory } from './components/TransactionHistory';
import { MissionsPanel } from './components/MissionsPanel';
import { TransferModal } from './components/TransferModal';
import { MiningModal } from './components/MiningModal';
import { TamperModal } from './components/TamperModal';
import { QuizModal } from './components/QuizModal';
import { GlossaryModal } from './components/GlossaryModal';
import { HashLabModal } from './components/HashLabModal';
import { JoinModal } from './components/JoinModal';
import { LanInfoModal } from './components/LanInfoModal';
import {
  RotateCcw,
  BookOpen,
  Layers,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [originalBlocks, setOriginalBlocks] = useState<Block[]>([]);
  const [mempool, setMempool] = useState<Transaction[]>([]);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active navigation view: 'labor' | 'mining' | 'tamper' | 'missions' | 'quiz'
  const [activeTab, setActiveTab] = useState<'labor' | 'mining' | 'tamper' | 'missions' | 'quiz'>('labor');

  // Selected participant for filtering/sending
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('all');
  const [transferSenderId, setTransferSenderId] = useState<string>('user');

  // Modals state
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [isMiningOpen, setIsMiningOpen] = useState<boolean>(false);
  const [isTamperOpen, setIsTamperOpen] = useState<boolean>(false);
  const [tamperTargetBlockIndex, setTamperTargetBlockIndex] = useState<number>(1);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isHashLabOpen, setIsHashLabOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isLanInfoOpen, setIsLanInfoOpen] = useState<boolean>(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState<boolean>(true);

  // LAN network multiplayer state
  const [lanStatus, setLanStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  // Chain validation state
  const [isChainValid, setIsChainValid] = useState<boolean>(true);
  const [brokenBlockIndex, setBrokenBlockIndex] = useState<number | null>(null);

  // Load saved player profile from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kryptokette_player');
      if (saved) {
        const parsed: Participant = JSON.parse(saved);
        if (parsed && parsed.name) {
          setCurrentUser(parsed);
          setTransferSenderId(parsed.id);
          setParticipants((prev) => {
            const idx = prev.findIndex((p) => p.id === parsed.id || p.id === 'user');
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = parsed;
              return copy;
            }
            return [parsed, ...prev];
          });
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Initialize blockchain locally first (Genesis + Block 1)
  useEffect(() => {
    async function initBlockchain() {
      try {
        setIsLoading(true);
        const genesis = await createGenesisBlock();
        const block1 = await createInitialBlock1(genesis);
        const initialBlocks = [genesis, block1];

        setBlocks(initialBlocks);
        setOriginalBlocks(JSON.parse(JSON.stringify(initialBlocks)));

        // Initial pending transactions in Mempool
        const initialMempool: Transaction[] = [
          {
            id: 'tx-seed-pending-1',
            senderId: 'sophie',
            senderName: 'Sophie',
            recipientId: 'jonas',
            recipientName: 'Jonas',
            amount: 3,
            purpose: 'Hausaufgaben-Zusammenfassung Physik',
            timestamp: Date.now() - 300000,
          },
          {
            id: 'tx-seed-pending-2',
            senderId: 'lukas',
            senderName: 'Lukas',
            recipientId: 'mia',
            recipientName: 'Mia',
            amount: 4,
            purpose: 'Gaming-Mauspad ausgeliehen',
            timestamp: Date.now() - 120000,
          },
        ];
        setMempool(initialMempool);
      } catch (err) {
        console.error('Blockchain initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initBlockchain();
  }, []);

  // Connect to LAN Server (SSE Stream) for real-time classroom multiplayer
  const connectToLanServer = useCallback(async () => {
    setLanStatus('connecting');
    const isReachable = await checkServerHealth();
    if (!isReachable) {
      setLanStatus('offline');
      return null;
    }

    try {
      const eventSource = new EventSource('/api/events');

      eventSource.addEventListener('init', async (e: MessageEvent) => {
        setLanStatus('connected');
        try {
          const data = JSON.parse(e.data);
          if (data.chain && data.chain.length > 0) {
            const validation = await validateEntireChain(data.chain);
            setBlocks(validation.validatedBlocks);
            setOriginalBlocks(JSON.parse(JSON.stringify(validation.validatedBlocks)));
            setIsChainValid(validation.isValid);
            setBrokenBlockIndex(validation.brokenIndex);
          }
          if (Array.isArray(data.mempool)) {
            setMempool(data.mempool);
          }
          if (Array.isArray(data.participants) && data.participants.length > 0) {
            setParticipants((prev) => {
              // Merge server participants with current local user if present
              const serverList: Participant[] = data.participants;
              if (currentUser && !serverList.some((p) => p.id === currentUser.id)) {
                return [...serverList, currentUser];
              }
              return serverList;
            });
          }
        } catch (err) {
          console.error('SSE init error:', err);
        }
      });

      eventSource.addEventListener('participant_joined', (e: MessageEvent) => {
        try {
          const { player, participants: serverList } = JSON.parse(e.data);
          if (Array.isArray(serverList)) {
            setParticipants(serverList);
          } else if (player) {
            setParticipants((prev) => {
              const idx = prev.findIndex((p) => p.id === player.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = player;
                return copy;
              }
              return [...prev, player];
            });
          }
        } catch (err) {
          console.error('participant_joined error:', err);
        }
      });

      eventSource.addEventListener('transaction_added', (e: MessageEvent) => {
        try {
          const { transaction, mempool: serverMempool } = JSON.parse(e.data);
          if (Array.isArray(serverMempool)) {
            setMempool(serverMempool);
          } else if (transaction) {
            setMempool((prev) =>
              prev.some((t) => t.id === transaction.id) ? prev : [transaction, ...prev]
            );
          }
        } catch (err) {
          console.error('transaction_added error:', err);
        }
      });

      eventSource.addEventListener('block_mined', async (e: MessageEvent) => {
        try {
          const { chain: serverChain, mempool: serverMempool } = JSON.parse(e.data);
          if (Array.isArray(serverChain)) {
            const validation = await validateEntireChain(serverChain);
            setBlocks(validation.validatedBlocks);
            setOriginalBlocks(JSON.parse(JSON.stringify(validation.validatedBlocks)));
            setIsChainValid(validation.isValid);
            setBrokenBlockIndex(validation.brokenIndex);
          }
          if (Array.isArray(serverMempool)) {
            setMempool(serverMempool);
          }
        } catch (err) {
          console.error('block_mined error:', err);
        }
      });

      eventSource.addEventListener('chain_reset', async (e: MessageEvent) => {
        try {
          const { chain: serverChain, mempool: serverMempool, participants: serverList } = JSON.parse(e.data);
          if (Array.isArray(serverChain)) {
            const validation = await validateEntireChain(serverChain);
            setBlocks(validation.validatedBlocks);
            setOriginalBlocks(JSON.parse(JSON.stringify(validation.validatedBlocks)));
            setIsChainValid(true);
            setBrokenBlockIndex(null);
          }
          if (Array.isArray(serverMempool)) setMempool(serverMempool);
          if (Array.isArray(serverList)) setParticipants(serverList);
        } catch (err) {
          console.error('chain_reset error:', err);
        }
      });

      eventSource.onopen = () => {
        setLanStatus('connected');
      };

      eventSource.onerror = () => {
        setLanStatus('offline');
      };

      return eventSource;
    } catch {
      setLanStatus('offline');
      return null;
    }
  }, [currentUser]);

  useEffect(() => {
    let sseInstance: EventSource | null = null;
    connectToLanServer().then((res) => {
      sseInstance = res;
    });

    return () => {
      if (sseInstance) {
        sseInstance.close();
      }
    };
  }, [connectToLanServer]);

  // If local user is known and LAN is active, register player on server
  useEffect(() => {
    if (lanStatus === 'connected' && currentUser) {
      registerPlayerOnServer(currentUser);
    }
  }, [lanStatus, currentUser]);

  // Compute live balances across participants
  const balances = useMemo(() => {
    return calculateBalances(participants, blocks, mempool);
  }, [participants, blocks, mempool]);

  // Total coins in circulation
  const totalCoinsInCirculation = useMemo(() => {
    return Object.values(balances).reduce((sum, b) => sum + b.confirmed, 0);
  }, [balances]);

  // Count human players
  const humanPlayerCount = useMemo(() => {
    return participants.filter((p) => p.isHumanPlayer || p.id === 'user' || p.isCurrentUser).length;
  }, [participants]);

  // Irregular automatic transaction generation in offline mode
  // (In online LAN mode, the central server broadcasts shared bot transactions)
  useEffect(() => {
    if (!isAutoGenerating || lanStatus === 'connected') return;

    let timeoutId: number;

    const scheduleNext = () => {
      const delay = getNextIrregularIntervalMs();
      timeoutId = window.setTimeout(() => {
        const newTx = generateRandomStudentTransaction(participants, balances);
        if (newTx) {
          setMempool((prev) => [newTx, ...prev]);
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isAutoGenerating, lanStatus, participants, balances]);

  // Complete mission helper
  const markMissionCompleted = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
    );
  };

  // Handlers
  const handleSendTransaction = async (newTx: Transaction) => {
    setMempool((prev) => [newTx, ...prev]);
    markMissionCompleted('m1_tx');

    if (lanStatus === 'connected') {
      await broadcastTransactionToServer(newTx);
    }
  };

  const handleBlockMined = async (newBlock: Block) => {
    // Add block to chain and validate atomically
    const updatedBlocks = [...blocks, newBlock];
    const validation = await validateEntireChain(updatedBlocks);
    setBlocks(validation.validatedBlocks);
    setOriginalBlocks(JSON.parse(JSON.stringify(validation.validatedBlocks)));
    setIsChainValid(validation.isValid);
    setBrokenBlockIndex(validation.brokenIndex);

    // Clear mined transactions from mempool (except the coinbase tx)
    const minedTxIds = new Set(newBlock.transactions.map((t) => t.id));
    setMempool((prev) => prev.filter((t) => !minedTxIds.has(t.id)));

    markMissionCompleted('m2_mine');

    if (lanStatus === 'connected') {
      await broadcastMinedBlockToServer(newBlock);
    }
  };

  const handleTamperBlock = async (blockIndex: number, updatedTransactions: Transaction[]) => {
    const updatedBlocks = blocks.map((b) => {
      if (b.index === blockIndex) {
        return {
          ...b,
          transactions: updatedTransactions,
          tampered: true,
        };
      }
      return b;
    });

    const validation = await validateEntireChain(updatedBlocks);
    setBlocks(validation.validatedBlocks);
    setIsChainValid(validation.isValid);
    setBrokenBlockIndex(validation.brokenIndex);

    markMissionCompleted('m3_tamper');
  };

  const handleRestoreChain = async () => {
    const restored = JSON.parse(JSON.stringify(originalBlocks));
    const validation = await validateEntireChain(restored);
    setBlocks(validation.validatedBlocks);
    setIsChainValid(true);
    setBrokenBlockIndex(null);
  };

  const handleAddQuickTransaction = async () => {
    const newTx = generateRandomStudentTransaction(participants, balances);
    if (newTx) {
      setMempool((prev) => [newTx, ...prev]);
      if (lanStatus === 'connected') {
        await broadcastTransactionToServer(newTx);
      }
    }
  };

  const handleTriggerMissionAction = (missionId: string) => {
    switch (missionId) {
      case 'm1_tx':
        setTransferSenderId(currentUser?.id || 'user');
        setIsTransferOpen(true);
        break;
      case 'm2_mine':
        setIsMiningOpen(true);
        break;
      case 'm3_tamper':
        setTamperTargetBlockIndex(1);
        setIsTamperOpen(true);
        break;
      case 'm4_quiz':
        setIsQuizOpen(true);
        break;
      default:
        break;
    }
  };

  const handleJoinPlayer = async (player: Participant) => {
    setCurrentUser(player);
    setTransferSenderId(player.id);
    localStorage.setItem('kryptokette_player', JSON.stringify(player));

    setParticipants((prev) => {
      const idx = prev.findIndex((p) => p.id === player.id || (player.isCurrentUser && p.id === 'user'));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = player;
        return copy;
      }
      return [...prev, player];
    });

    if (lanStatus === 'connected') {
      await registerPlayerOnServer(player);
    }
  };

  const handleResetSimulation = async () => {
    if (confirm('Möchtest du die gesamte Blockchain-Simulation auf den Anfangszustand zurücksetzen?')) {
      const genesis = await createGenesisBlock();
      const block1 = await createInitialBlock1(genesis);
      const initialBlocks = [genesis, block1];

      setBlocks(initialBlocks);
      setOriginalBlocks(JSON.parse(JSON.stringify(initialBlocks)));
      setMempool([
        {
          id: 'tx-seed-pending-1',
          senderId: 'sophie',
          senderName: 'Sophie',
          recipientId: 'jonas',
          recipientName: 'Jonas',
          amount: 3,
          purpose: 'Hausaufgaben-Zusammenfassung Physik',
          timestamp: Date.now() - 300000,
        },
      ]);
      setIsChainValid(true);
      setBrokenBlockIndex(null);

      if (lanStatus === 'connected') {
        try {
          await fetch('/api/reset', { method: 'POST' });
        } catch {
          // ignore
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white animate-spin">
          <Layers className="w-6 h-6" />
        </div>
        <div className="mt-4 text-sm font-bold text-slate-800">
          Blockchain-Knoten wird gestartet...
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Genesis-Block wird berechnet und verifiziert
        </div>
      </div>
    );
  }

  const lastBlock = blocks[blocks.length - 1] || blocks[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Navbar with 3-Zone contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'mining') setIsMiningOpen(true);
          if (tab === 'tamper') setIsTamperOpen(true);
          if (tab === 'quiz') setIsQuizOpen(true);
        }}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        mempoolCount={mempool.length}
        currentUser={currentUser || undefined}
        userBalance={balances[currentUser?.id || 'user']?.confirmed ?? 25}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tamper Warning Banner if chain is broken */}
        {!isChainValid && (
          <div className="p-4 bg-rose-500 text-white rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  Kettenbruch erkannt! Block #{brokenBlockIndex} wurde manipuliert.
                </h3>
                <p className="text-xs text-rose-100">
                  Die mathematische Verkettung stimmt nicht mehr überein. Das Krypto-Netzwerk lehnt diese Version ab.
                </p>
              </div>
            </div>
            <button
              onClick={handleRestoreChain}
              className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Kette reparieren
            </button>
          </div>
        )}

        {/* Hero Section */}
        <HeroBanner
          blockCount={blocks.length}
          totalCoins={totalCoinsInCirculation}
          mempoolCount={mempool.length}
          isChainValid={isChainValid}
          onOpenMining={() => setIsMiningOpen(true)}
          onOpenTransfer={() => {
            setTransferSenderId(currentUser?.id || 'user');
            setIsTransferOpen(true);
          }}
          onOpenHashLab={() => setIsHashLabOpen(true)}
          onOpenLanInfo={() => setIsLanInfoOpen(true)}
          lanStatus={lanStatus}
          humanCount={humanPlayerCount}
        />

        {/* Tab-Specific Content or Main Labor */}
        {activeTab === 'missions' ? (
          <MissionsPanel
            missions={missions}
            onTriggerMissionAction={handleTriggerMissionAction}
          />
        ) : null}

        {/* Wallets & Participants */}
        <ParticipantsBar
          participants={participants}
          balances={balances}
          activeParticipantId={selectedParticipantId}
          onSelectParticipant={(id) => {
            setSelectedParticipantId(id === selectedParticipantId ? 'all' : id);
          }}
          onQuickSend={(senderId) => {
            setTransferSenderId(senderId);
            setIsTransferOpen(true);
          }}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
          currentUser={currentUser || undefined}
        />

        {/* Blockchain Horizontal View */}
        <BlockchainView
          blocks={blocks}
          onOpenMining={() => setIsMiningOpen(true)}
          onOpenTamper={(idx) => {
            setTamperTargetBlockIndex(idx);
            setIsTamperOpen(true);
          }}
          mempoolCount={mempool.length}
        />

        {/* Split Grid: Mempool on Left, Classroom Missions on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <MempoolCard
              mempool={mempool}
              onOpenMining={() => setIsMiningOpen(true)}
              onOpenTransfer={() => {
                setTransferSenderId(currentUser?.id || 'user');
                setIsTransferOpen(true);
              }}
              onAddQuickTransaction={handleAddQuickTransaction}
              isAutoGenerating={isAutoGenerating}
              onToggleAutoGenerating={() => setIsAutoGenerating((prev) => !prev)}
            />
          </div>

          <div className="lg:col-span-7">
            {activeTab !== 'missions' ? (
              <MissionsPanel
                missions={missions}
                onTriggerMissionAction={handleTriggerMissionAction}
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Didaktischer Leitfaden für die Lehrkraft & Schüler</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                  <li>
                    <strong>Phase 1: Das Problem der Bank</strong>: Warum brauchen wir normalerweise eine Bank? Weil sonst jeder behaupten könnte, er hätte 1.000.000 Euro.
                  </li>
                  <li>
                    <strong>Phase 2: Das Kassenbuch (Blockchain)</strong>: Jeder hat die gleiche Liste aller Überweisungen.
                  </li>
                  <li>
                    <strong>Phase 3: Das Rätsel (Mining)</strong>: Nur wer echte Rechenzeit investiert (Proof of Work), darf die nächste Seite beschreiben und bekommt als Belohnung frisch erschaffene EduCoins.
                  </li>
                  <li>
                    <strong>Phase 4: Der Betrugstest</strong>: Zeige deinen Mitschülern im Fälschungs-Test, wie sofort alle Lichter auf Rot springen, wenn jemand heimlich schummeln will.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Public Ledger: Transaction History */}
        <TransactionHistory
          blocks={blocks}
          mempool={mempool}
          participants={participants}
          selectedParticipantId={selectedParticipantId}
          onSelectParticipant={setSelectedParticipantId}
        />
      </main>

      {/* Footer conforming to Anti-Slop (clean, quiet, no fake telemetry) */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-800">KryptoKette</span> · Interaktive Blockchain-Lernumgebung für Klassen 7 bis 9
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLanInfoOpen(true)}
              className="hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              LAN Netzwerk
            </button>
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Lexikon
            </button>
            <button
              onClick={() => setIsHashLabOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Hash-Sandkasten
            </button>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Schüler-Quiz
            </button>
            <button
              onClick={handleResetSimulation}
              className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Simulation zurücksetzen
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        participants={participants}
        balances={balances}
        defaultSenderId={transferSenderId}
        onSendTransaction={handleSendTransaction}
      />

      <MiningModal
        isOpen={isMiningOpen}
        onClose={() => {
          setIsMiningOpen(false);
          if (activeTab === 'mining') setActiveTab('labor');
        }}
        lastBlock={lastBlock}
        mempool={mempool}
        participants={participants}
        onBlockMined={handleBlockMined}
        onOpenTransfer={() => {
          setTransferSenderId(currentUser?.id || 'user');
          setIsTransferOpen(true);
        }}
      />

      <TamperModal
        isOpen={isTamperOpen}
        onClose={() => {
          setIsTamperOpen(false);
          if (activeTab === 'tamper') setActiveTab('labor');
        }}
        blocks={blocks}
        selectedBlockIndex={tamperTargetBlockIndex}
        onTamperBlock={handleTamperBlock}
        onRestoreChain={handleRestoreChain}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => {
          setIsQuizOpen(false);
          if (activeTab === 'quiz') setActiveTab('labor');
        }}
        onQuizCompleted={() => markMissionCompleted('m4_quiz')}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <HashLabModal
        isOpen={isHashLabOpen}
        onClose={() => setIsHashLabOpen(false)}
      />

      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinPlayer}
        currentPlayer={currentUser || undefined}
      />

      <LanInfoModal
        isOpen={isLanInfoOpen}
        onClose={() => setIsLanInfoOpen(false)}
        lanStatus={lanStatus}
        participants={participants}
        onOpenJoinModal={() => {
          setIsLanInfoOpen(false);
          setIsJoinModalOpen(true);
        }}
        onRefreshConnection={connectToLanServer}
      />
    </div>
  );
}
