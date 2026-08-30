/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Leaderboard } from './components/Leaderboard';
import { ChallengePanel } from './components/ChallengePanel';
import { useGenLayer } from './hooks/useGenLayer';
import { useSkills } from './hooks/useSkills';
import { Wallet, Trophy, Swords, Gamepad2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Helper to safely get the provider without triggering proxy conflicts
const getProvider = () => {
  if (typeof window === 'undefined') return null;
  // Use a direct read that doesn't trigger setter/getter errors if possible
  return (window as any).ethereum || null;
};

type Screen = 'home' | 'game' | 'leaderboard' | 'challenges';

let toastCounter = 0;

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const { submitScore } = useGenLayer();
  const { classifyPlayStyle, analyzeReplay } = useSkills();

  const connectWallet = async () => {
    const provider = getProvider();
    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0 && accounts[0]) {
          setWalletAddress(accounts[0]);
          addToast('WALLET CONNECTED: ' + accounts[0].slice(0, 6));
        } else {
          addToast('❌ NO ACCOUNTS FOUND');
        }
      } catch (err) {
        console.error('Wallet connection failed', err);
        addToast('❌ CONNECTION FAILED');
      }
    } else {
      alert('Please install Rabby or MetaMask wallet!');
    }
  };

  const addToast = (message: string) => {
    const id = `toast-${Date.now()}-${toastCounter++}`;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleGameOver = async (score: number, apples: number, survival: number, deathsNearWall: number, moves: string[]) => {
    addToast('GENERATING REPLAY HASH...');
    
    // Replay hash generation
    const moveString = moves.join(',');
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(moveString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const replayHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Call AI Skills in parallel
    addToast('🧠 ANALYZING GAMEPLAY...');
    const [styleData, replayData] = await Promise.all([
      classifyPlayStyle({ apples, survival_seconds: survival, deaths_near_wall: deathsNearWall }),
      analyzeReplay({ moves, score })
    ]);
    
    setAiInsight({
      style: styleData,
      replay: replayData
    });

    if (walletAddress && walletAddress !== 'undefined') {
      addToast('📡 TX SENT: SCORE COMMITTED');
      try {
        await submitScore(walletAddress, score, apples, survival, deathsNearWall, replayHash, replayData?.insight || 'No insight available');
        addToast('✅ SCORE RECORDED ON-CHAIN');
      } catch (err: any) {
        addToast(`❌ TX FAILED: ${err.message}`);
      }
    } else {
      addToast('❌ WALLET NOT CONNECTED');
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-matrix selection:bg-matrix selection:text-black scanlines relative overflow-hidden">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-matrix/20 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentScreen('home')}>
          <div className="w-10 h-10 bg-matrix text-black flex items-center justify-center rounded-sm glitch-border">
            <Gamepad2 size={24} />
          </div>
          <h1 className="text-lg arcade-font tracking-tighter hidden sm:block">SNAKECHAIN</h1>
        </div>

        <div className="flex items-center gap-4">
          {walletAddress ? (
            <div className="flex items-center gap-2 px-4 py-2 border border-matrix/50 bg-matrix/10 rounded-sm font-mono text-xs">
              <div className="w-2 h-2 rounded-full bg-matrix animate-pulse" />
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center gap-2 px-4 py-2 bg-matrix text-black arcade-font text-[10px] hover:bg-matrix-dark transition-all active:scale-95"
            >
              <Wallet size={14} />
              CONNECT WALLET
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl"
            >
              <h2 className="text-5xl mb-8 arcade-font crt-flicker leading-tight">PROOF OF PLAY</h2>
              <p className="mb-12 text-matrix/70 leading-relaxed font-mono">
                The first on-chain activity engine where every move is a transaction. 
                Eat apples, survive the void, and prove your skill on the GenLayer testnet.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <MenuButton 
                  icon={<Gamepad2 />} 
                  label="START GAME" 
                  onClick={() => {
                    if (walletAddress) {
                      setAiInsight(null);
                      setCurrentScreen('game');
                    } else {
                      connectWallet();
                    }
                  }} 
                />
                <MenuButton 
                  icon={<Trophy />} 
                  label="LEADERBOARD" 
                  onClick={() => setCurrentScreen('leaderboard')} 
                />
                <MenuButton 
                  icon={<Swords />} 
                  label="CHALLENGES" 
                  onClick={() => walletAddress ? setCurrentScreen('challenges') : connectWallet()} 
                />
              </div>

              <div className="mt-16 p-6 border border-matrix/20 bg-matrix/5 rounded-sm text-left">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={16} />
                  <h3 className="arcade-font text-xs">HOW IT WORKS</h3>
                </div>
                <ul className="space-y-2 text-xs font-mono text-matrix/60 list-disc pl-4">
                  <li>Connect your Rabby wallet to the GenLayer Studionet.</li>
                  <li>Every 5 apples eaten triggers an on-chain score update.</li>
                  <li>Death generates a cryptographically signed replay hash.</li>
                  <li>GenLayer AI classifies your play style based on performance.</li>
                </ul>
              </div>
            </motion.div>
          )}

          {currentScreen === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="mb-6 flex justify-between w-full max-w-[400px]">
                <button onClick={() => setCurrentScreen('home')} className="text-[10px] arcade-font hover:text-white">← BACK</button>
                <div className="text-[10px] arcade-font text-matrix/50">STUDIONET ACTIVE</div>
              </div>
              <GameCanvas walletAddress={walletAddress || ''} onGameOver={handleGameOver} aiInsight={aiInsight} />
            </motion.div>
          )}

          {currentScreen === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <button onClick={() => setCurrentScreen('home')} className="mb-6 text-[10px] arcade-font hover:text-white self-start max-w-2xl mx-auto w-full">← BACK</button>
              <Leaderboard />
            </motion.div>
          )}

          {currentScreen === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <button onClick={() => setCurrentScreen('home')} className="mb-6 text-[10px] arcade-font hover:text-white self-start max-w-md mx-auto w-full">← BACK</button>
              <ChallengePanel walletAddress={walletAddress || ''} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-black border border-matrix p-4 arcade-font text-[8px] shadow-[0_0_10px_rgba(0,255,65,0.3)] min-w-[200px]"
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 w-full p-2 text-[8px] font-mono text-matrix/30 flex justify-between pointer-events-none">
        <div>GENLAYER_STUDIONET_v0.4.2</div>
        <div>EST_BLOCK_TIME: 1.2s</div>
        <div>NODE_STATUS: OPTIMAL</div>
      </footer>
    </div>
  );
}

function MenuButton({ icon, label, onClick }: { icon: ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-4 p-8 border border-matrix/20 bg-matrix/5 hover:bg-matrix/10 hover:border-matrix transition-all group active:scale-95"
    >
      <div className="text-matrix group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="arcade-font text-[10px]">{label}</span>
    </button>
  );
}
