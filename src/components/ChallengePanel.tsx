import React, { useState } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Swords, Send, Search, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface ChallengePanelProps {
  walletAddress: string;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ walletAddress }) => {
  const [opponent, setOpponent] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [challengeData, setChallengeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scoreInput, setScoreInput] = useState('');
  
  const { 
    createChallenge, 
    getChallenge, 
    submitChallengeScore, 
    resolveChallenge, 
    claimBadges,
    getFullProfile,
    isConnecting 
  } = useGenLayer();

  const handleSend = async () => {
    if (!opponent || !walletAddress) return;
    try {
      const tx = await createChallenge(walletAddress, opponent);
      alert('Challenge sent to chain!');
      setOpponent('');
    } catch (err: any) {
      console.error('Failed to create challenge', err);
      alert(`Failed: ${err.message}`);
    }
  };

  const handleSearch = async () => {
    if (!challengeId) return;
    setLoading(true);
    try {
      const data = await getChallenge(challengeId);
      setChallengeData(data);
    } catch (err) {
      console.error('Failed to fetch challenge', err);
      setChallengeData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitScore = async () => {
    if (!challengeId || !scoreInput || !walletAddress) return;
    try {
      await submitChallengeScore(challengeId, walletAddress, Number(scoreInput));
      alert('Score submitted!');
      handleSearch(); // refresh
    } catch (err: any) {
      alert(`Failed to submit score: ${err.message}`);
    }
  };

  const handleResolve = async () => {
    if (!challengeId || !walletAddress) return;
    try {
      const winner = await resolveChallenge(challengeId, walletAddress);
      
      // Eğer kazanan bu cüzdan ise Challenger rozetini aç
      if (winner && String(winner).toLowerCase() === walletAddress.toLowerCase()) {
        try {
          const profile = await getFullProfile(walletAddress);
          if (profile?.game_stats) {
            await claimBadges(
              walletAddress,
              profile.game_stats.best_score || 0,
              profile.game_stats.total_apples || 0,
              profile.game_stats.total_games || 1,
              profile.game_stats.play_style || "unknown",
              1   // ← Challenger rozeti
            );
            alert('🏆 You won! Challenger badge unlocked!');
          }
        } catch (badgeErr) {
          console.error('Badge claim failed', badgeErr);
        }
      } else {
        alert(`Challenge resolved. Winner: ${winner}`);
      }
      
      handleSearch(); // refresh
    } catch (err: any) {
      alert(`Failed to resolve: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-md glitch-border p-6 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Swords className="text-matrix" />
        <h2 className="text-lg arcade-font">PVP CHALLENGES</h2>
      </div>

      {/* Create Challenge */}
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
          disabled={isConnecting}
          className="bg-matrix text-black p-2 hover:bg-matrix-dark transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Search Challenge */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={challengeId}
          onChange={(e) => setChallengeId(e.target.value)}
          placeholder="CHALLENGE ID"
          className="flex-1 bg-black border border-matrix/50 p-2 text-xs font-mono focus:outline-none focus:border-matrix text-matrix"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-matrix text-black p-2 hover:bg-matrix-dark transition-colors"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Challenge Details */}
      <div className="space-y-4">
        <p className="text-[10px] arcade-font text-matrix/50">CHALLENGE DETAILS</p>
        
        {loading ? (
          <div className="text-xs font-mono text-center py-4 text-matrix animate-pulse">
            Loading...
          </div>
        ) : challengeData ? (
          <div className="border border-matrix/30 bg-matrix/5 p-4 rounded-sm space-y-3">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-matrix/70">Status:</span>
              <span className="text-matrix uppercase">{challengeData.status}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-matrix/70">Challenger:</span>
              <span className="text-matrix truncate max-w-[150px]">{challengeData.challenger}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-matrix/70">Opponent:</span>
              <span className="text-matrix truncate max-w-[150px]">{challengeData.opponent}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-matrix/70">Scores:</span>
              <span className="text-matrix">
                {challengeData.challenger_score} - {challengeData.opponent_score}
              </span>
            </div>

            {/* Submit Score (sadece pending ise) */}
            {challengeData.status === 'pending' && (
              <div className="pt-3 border-t border-matrix/20 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    placeholder="Your score"
                    className="flex-1 bg-black border border-matrix/50 p-2 text-xs font-mono text-matrix"
                  />
                  <button
                    onClick={handleSubmitScore}
                    disabled={isConnecting}
                    className="bg-matrix text-black px-3 py-2 text-xs arcade-font hover:bg-matrix-dark disabled:opacity-50"
                  >
                    SUBMIT
                  </button>
                </div>
                <button
                  onClick={handleResolve}
                  disabled={isConnecting}
                  className="w-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 py-2 text-xs arcade-font hover:bg-yellow-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trophy size={14} /> RESOLVE CHALLENGE
                </button>
              </div>
            )}

            {/* Winner */}
            {challengeData.status === 'resolved' && (
              <div className="mt-2 pt-3 border-t border-matrix/20 text-center">
                <span className="arcade-font text-sm text-matrix">🏆 WINNER</span>
                <p className="font-mono text-xs mt-1 truncate">{challengeData.winner}</p>
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
