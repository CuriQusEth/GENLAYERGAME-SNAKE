import React, { useState } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Swords, Send, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ChallengePanelProps {
  walletAddress: string;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ walletAddress }) => {
  const [opponent, setOpponent] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [challengeData, setChallengeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { createChallenge, getClient } = useGenLayer();

  const handleSend = async () => {
    if (!opponent || !walletAddress) return;
    try {
      await createChallenge(walletAddress, opponent);
      setOpponent('');
      alert('Challenge sent to chain!');
    } catch (err: any) {
      console.error('Failed to create challenge', err);
      alert(`Failed to create challenge: ${err.message}`);
    }
  };

  const handleSearch = async () => {
    if (!challengeId) return;
    setLoading(true);
    try {
      const client = getClient();
      const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      const CONTRACT_ADDRESS = (envAddress && envAddress !== 'undefined') ? envAddress : '0x25067c997C3973f80a233fC9F3e1833486CaF1d5';
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_challenge',
        args: [challengeId],
      });
      if (result) {
        setChallengeData(JSON.parse(result as string));
      }
    } catch (err) {
      console.error('Failed to fetch challenge', err);
      setChallengeData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glitch-border p-6 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Swords className="text-matrix" />
        <h2 className="text-lg arcade-font">PVP CHALLENGES</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="OPPONENT WALLET ADDR"
          className="flex-1 bg-black border border-matrix/50 p-2 text-xs font-mono focus:outline-none focus:border-matrix text-matrix"
        />
        <button
          onClick={handleSend}
          className="bg-matrix text-black p-2 hover:bg-matrix-dark transition-colors"
        >
          <Send size={18} />
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={challengeId}
          onChange={(e) => setChallengeId(e.target.value)}
          placeholder="CHALLENGE ID"
          className="flex-1 bg-black border border-matrix/50 p-2 text-xs font-mono focus:outline-none focus:border-matrix text-matrix"
        />
        <button
          onClick={handleSearch}
          className="bg-matrix text-black p-2 hover:bg-matrix-dark transition-colors"
          disabled={loading}
        >
          <Search size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] arcade-font text-matrix/50">CHALLENGE DETAILS</p>
        
        {loading ? (
          <div className="text-xs font-mono text-center py-4 text-matrix animate-pulse">
            Loading...
          </div>
        ) : challengeData ? (
          <div className="border border-matrix/30 bg-matrix/5 p-4 rounded-sm">
            <div className="flex justify-between mb-2 text-xs font-mono">
              <span className="text-matrix/70">Status:</span>
              <span className="text-matrix uppercase">{challengeData.status}</span>
            </div>
            <div className="flex justify-between mb-2 text-xs font-mono">
              <span className="text-matrix/70">Challenger:</span>
              <span className="text-matrix truncate max-w-[150px]">{challengeData.challenger}</span>
            </div>
            <div className="flex justify-between mb-2 text-xs font-mono">
              <span className="text-matrix/70">Opponent:</span>
              <span className="text-matrix truncate max-w-[150px]">{challengeData.opponent}</span>
            </div>
            
            {challengeData.status === 'resolved' && (
              <div className="mt-4 pt-4 border-t border-matrix/20">
                <div className="text-center mb-4">
                  <span className="arcade-font text-sm text-matrix">🏆 WINNER:</span>
                  <p className="font-mono text-xs mt-1 truncate">{challengeData.winner}</p>
                </div>
                
                {challengeData.commentary && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="bg-black/50 p-3 border-l-2 border-matrix"
                  >
                    <p className="font-mono text-xs italic text-matrix/90 leading-relaxed">
                      💬 "{challengeData.commentary}"
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs font-mono text-center py-4 border border-matrix/10 italic text-matrix/50">
            Enter a Challenge ID to view details.
          </div>
        )}
      </div>
    </div>
  );
};
