import React, { useEffect, useState } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Badge as BadgeType } from '../types';
import { Shield, ShieldAlert } from 'lucide-react';

interface BadgeDisplayProps {
  walletAddress: string;
}

export function BadgeDisplay({ walletAddress }: BadgeDisplayProps) {
  const { getPlayerBadges, getAllBadgesInfo } = useGenLayer();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      setLoading(true);
      try {
        const [allBadgesInfo, unlockedBadgeIds] = await Promise.all([
          getAllBadgesInfo(),
          getPlayerBadges(walletAddress)
        ]);
        
        if (allBadgesInfo && Array.isArray(allBadgesInfo)) {
          const processedBadges = allBadgesInfo.map((b: any) => ({
            ...b,
            unlocked: unlockedBadgeIds.includes(b.id)
          }));
          setBadges(processedBadges);
        }
      } catch (err) {
        console.error("Failed to load badges:", err);
      } finally {
        setLoading(false);
      }
    }

    if (walletAddress) {
      fetchBadges();
    }
  }, [walletAddress, getPlayerBadges, getAllBadgesInfo]);

  if (loading) {
    return <div className="text-xs animate-pulse text-green-500">Syncing achievements...</div>;
  }

  if (badges.length === 0) {
    return <div className="text-xs text-gray-500">Badge contract not deployed or empty.</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-3 text-green-400 uppercase tracking-wider">
        <Shield className="w-4 h-4" /> Operator Achievements
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className={`p-3 rounded border flex items-center gap-3 transition-colors ${
              badge.unlocked 
                ? 'bg-green-900/30 border-green-500/50' 
                : 'bg-gray-900 border-gray-800 opacity-50 grayscale'
            }`}
          >
            <div className={`text-2xl ${badge.unlocked ? '' : 'opacity-50'}`}>
              {badge.icon || <ShieldAlert className="w-6 h-6 text-gray-500" />}
            </div>
            <div>
              <div className={`text-sm font-bold ${badge.unlocked ? 'text-green-400' : 'text-gray-400'}`}>
                {badge.name}
              </div>
              <div className="text-xs text-gray-500 mt-1 leading-tight">
                {badge.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
