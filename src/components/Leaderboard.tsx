import React, { useEffect, useState } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { LeaderboardEntry } from '../types';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const { getLeaderboard } = useGenLayer();

  useEffect(() => {
    const fetchLB = async () => {
      const data = await getLeaderboard();
      setEntries(data);
    };
    fetchLB();
    const interval = setInterval(fetchLB, 30000);
    return () => clearInterval(interval);
  }, [getLeaderboard]);

  return (
    <div className="w-full max-w-2xl glitch-border p-6 bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <h2 className="text-xl arcade-font">WORLD LEADERBOARD</h2>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-1 rounded flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-400" /> GenLayer Validator Verified
        </span>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-matrix/30 text-xs arcade-font">
            <th className="py-2">RANK</th>
            <th className="py-2">ADDRESS</th>
            <th className="py-2 text-right">SCORE</th>
            <th className="py-2 text-right">VERDICT</th>
            <th className="py-2 text-right">STYLE</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center font-mono text-xs text-matrix/50">
                No verified scores yet on Studio Next (61997). Be the first!
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.address} className="border-b border-matrix/10 hover:bg-matrix/5 transition-colors">
                <td className="py-3 font-mono">#{entry.rank}</td>
                <td className="py-3 font-mono text-matrix/80">
                  <div className="flex items-center gap-1">
                    {entry.verdict === 'INVALID' ? (
                      <ShieldAlert size={12} className="text-red-400" />
                    ) : (
                      <ShieldCheck size={12} className="text-emerald-400" />
                    )}
                    <span>{entry.address.slice(0, 8)}...{entry.address.slice(-4)}</span>
                  </div>
                </td>
                <td className="py-3 font-mono text-right font-bold text-matrix">{entry.score}</td>
                <td className="py-3 text-right">
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded uppercase border ${
                    entry.verdict === 'INVALID' 
                      ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {entry.verdict || 'VALID'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="px-2 py-1 text-[10px] bg-matrix/20 text-matrix border border-matrix/50 rounded uppercase">
                    {entry.play_style}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
