import React, { useEffect, useState, useMemo } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Badge as BadgeType } from '../types';
import { 
  Shield, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Trophy, 
  Info, 
  X, 
  Cpu, 
  Flame, 
  Crosshair, 
  Swords, 
  Apple,
  Award
} from 'lucide-react';

interface BadgeDisplayProps {
  walletAddress: string;
}

interface BadgeMetadata {
  tier: 'INITIATE' | 'OPERATIVE' | 'TACTICIAN' | 'LEGENDARY' | 'MYTHIC';
  serial: string;
  glowColor: string;
  borderColorClass: string;
  bgGradient: string;
  accentHex: string;
  contractGate: string;
  flavor: string;
}

const BADGE_META: Record<string, BadgeMetadata> = {
  first_blood: {
    tier: 'INITIATE',
    serial: 'MK-01 // INIT-BLOOD',
    glowColor: 'rgba(255, 107, 0, 0.4)',
    borderColorClass: 'holo-gradient-border',
    bgGradient: 'from-amber-950/40 via-gray-900 to-black',
    accentHex: '#ff8800',
    contractGate: 'SnakeGame.player_verdict == "VALID" && player_total_games >= 1',
    flavor: 'Baptized in the GenLayer matrix. Authenticated by consensus validators on your maiden run.'
  },
  century_club: {
    tier: 'LEGENDARY',
    serial: 'MK-03 // CENTURY-100',
    glowColor: 'rgba(255, 215, 0, 0.5)',
    borderColorClass: 'gold-gradient-border',
    bgGradient: 'from-yellow-950/50 via-gray-900 to-black',
    accentHex: '#ffd700',
    contractGate: 'SnakeGame.player_verdict == "VALID" && player_best_score >= 100',
    flavor: 'Surpassed the triple-digit threshold under immutable physics inspection. Elite tier reflexes.'
  },
  apple_hoarder: {
    tier: 'OPERATIVE',
    serial: 'MK-02 // BIO-REAP',
    glowColor: 'rgba(0, 255, 65, 0.45)',
    borderColorClass: 'emerald-gradient-border',
    bgGradient: 'from-emerald-950/40 via-gray-900 to-black',
    accentHex: '#00ff41',
    contractGate: 'SnakeGame.player_verdict == "VALID" && player_total_apples >= 50',
    flavor: 'Extracted 50+ quantum apples across verified neural simulations. Relentless harvesting efficiency.'
  },
  style_master: {
    tier: 'TACTICIAN',
    serial: 'MK-04 // NEURAL-SYNC',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    borderColorClass: 'purple-gradient-border',
    bgGradient: 'from-purple-950/40 via-gray-900 to-black',
    accentHex: '#b366ff',
    contractGate: 'SnakeGame.player_play_style != "" && style != "unknown"',
    flavor: 'Signature tactical movements identified and certified by GenLayer validator heuristics.'
  },
  challenger: {
    tier: 'MYTHIC',
    serial: 'MK-05 // DUEL-OVERDRIVE',
    glowColor: 'rgba(255, 0, 68, 0.55)',
    borderColorClass: 'crimson-gradient-border',
    bgGradient: 'from-red-950/40 via-gray-900 to-black',
    accentHex: '#ff0044',
    contractGate: 'SnakeGame.player_challenge_wins >= 1 (resolve_challenge only)',
    flavor: 'Emerged victorious from high-stakes on-chain PvP combat. Sealed in smart contract state.'
  }
};

const DEFAULT_META: BadgeMetadata = {
  tier: 'OPERATIVE',
  serial: 'MK-XX // UNKNOWN',
  glowColor: 'rgba(0, 255, 65, 0.3)',
  borderColorClass: 'holo-gradient-border',
  bgGradient: 'from-gray-900 via-black to-gray-950',
  accentHex: '#00ff41',
  contractGate: 'SnakeGame.player_verdict == "VALID"',
  flavor: 'Cryptographically authenticated arcade achievement.'
};

/** Custom SVG Medallion Icons for high-fidelity retro-cyberpunk sheen */
function BadgeEmblem({ id, unlocked, size = 'md' }: { id: string; unlocked: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-24 h-24' : 'w-14 h-14';

  const renderInner = () => {
    switch (id) {
      case 'first_blood':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="fb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff9900" />
                <stop offset="50%" stopColor="#ff3300" />
                <stop offset="100%" stopColor="#990000" />
              </linearGradient>
              <linearGradient id="fb-blade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#ffd280" />
                <stop offset="100%" stopColor="#ff4400" />
              </linearGradient>
            </defs>
            {/* Outer Hexagon Shield */}
            <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" 
              fill="rgba(20, 10, 10, 0.85)" 
              stroke={unlocked ? "#ff6600" : "#443333"} 
              strokeWidth="2.5" 
            />
            {/* Inner Cyber Rune Ring */}
            <circle cx="50" cy="50" r="30" fill="none" stroke={unlocked ? "rgba(255, 102, 0, 0.4)" : "#333"} strokeWidth="1" strokeDasharray="4 3" />
            {/* Cyber Dagger */}
            <path d="M50 16 L56 46 L62 52 L50 82 L38 52 L44 46 Z" fill="url(#fb-blade)" opacity={unlocked ? "1" : "0.35"} />
            {/* Blood Drop Core */}
            <path d="M50 40 C56 50 60 56 60 62 C60 68 55 72 50 72 C45 72 40 68 40 62 C40 56 44 50 50 40 Z" 
              fill="url(#fb-grad)" 
              opacity={unlocked ? "0.95" : "0.3"} 
            />
            {/* Center spark */}
            {unlocked && <circle cx="50" cy="62" r="3" fill="#ffffff" />}
          </svg>
        );

      case 'century_club':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff2a3" />
                <stop offset="40%" stopColor="#ffd700" />
                <stop offset="80%" stopColor="#d48800" />
                <stop offset="100%" stopColor="#805000" />
              </linearGradient>
            </defs>
            {/* Diamond Shield with cut corners */}
            <polygon points="50,4 94,50 50,96 6,50" 
              fill="rgba(25, 20, 5, 0.9)" 
              stroke={unlocked ? "url(#gold-grad)" : "#444"} 
              strokeWidth="3" 
            />
            {/* Radiant Starburst Rays */}
            <g stroke={unlocked ? "rgba(255, 215, 0, 0.4)" : "#222"} strokeWidth="1.5">
              <line x1="50" y1="12" x2="50" y2="24" />
              <line x1="50" y1="76" x2="50" y2="88" />
              <line x1="12" y1="50" x2="24" y2="50" />
              <line x1="76" y1="50" x2="88" y2="50" />
            </g>
            {/* Crown Arch */}
            <path d="M35 34 L42 42 L50 30 L58 42 L65 34 L62 48 L38 48 Z" 
              fill="url(#gold-grad)" 
              opacity={unlocked ? "1" : "0.3"} 
            />
            {/* Arcade '100' Text */}
            <text x="50" y="68" 
              fontFamily="'Press Start 2P', monospace, sans-serif" 
              fontSize="16" 
              fontWeight="bold" 
              textAnchor="middle" 
              fill={unlocked ? "#ffffff" : "#666"}
              stroke={unlocked ? "#d48800" : "none"}
              strokeWidth="0.8"
            >
              100
            </text>
          </svg>
        );

      case 'apple_hoarder':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="apple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b3ffcc" />
                <stop offset="35%" stopColor="#00ff66" />
                <stop offset="75%" stopColor="#009933" />
                <stop offset="100%" stopColor="#003311" />
              </linearGradient>
            </defs>
            {/* Octagonal Cyber Frame */}
            <polygon points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30" 
              fill="rgba(5, 20, 10, 0.9)" 
              stroke={unlocked ? "#00ff66" : "#224422"} 
              strokeWidth="2.5" 
            />
            {/* Circuit Grid Lines */}
            <path d="M20 50 L35 50 L45 60 L65 60 M55 35 L55 50 L75 50" 
              fill="none" 
              stroke={unlocked ? "rgba(0, 255, 102, 0.4)" : "#223322"} 
              strokeWidth="1.5" 
            />
            {/* Cyber Apple */}
            <path d="M50 32 C42 22 28 26 28 42 C28 62 42 76 50 78 C58 76 72 62 72 42 C72 26 58 22 50 32 Z" 
              fill="url(#apple-grad)" 
              opacity={unlocked ? "1" : "0.35"} 
            />
            {/* Cyber Leaf Antenna */}
            <path d="M50 30 C50 18 64 16 66 18 C66 28 54 28 50 30 Z" 
              fill={unlocked ? "#00ffcc" : "#335544"} 
            />
            {/* Microchip Core Node */}
            <rect x="46" y="48" width="8" height="8" 
              fill={unlocked ? "#ffffff" : "#444"} 
              stroke={unlocked ? "#00ff66" : "none"} 
              strokeWidth="1" 
            />
          </svg>
        );

      case 'style_master':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="neural-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e6b8ff" />
                <stop offset="50%" stopColor="#b366ff" />
                <stop offset="100%" stopColor="#4d0099" />
              </linearGradient>
            </defs>
            {/* Circular HUD Reticle */}
            <circle cx="50" cy="50" r="42" 
              fill="rgba(20, 10, 30, 0.9)" 
              stroke={unlocked ? "url(#neural-grad)" : "#332244"} 
              strokeWidth="2.5" 
            />
            {/* Segmented Radar Ring */}
            <circle cx="50" cy="50" r="32" 
              fill="none" 
              stroke={unlocked ? "rgba(179, 102, 255, 0.5)" : "#332233"} 
              strokeWidth="1.5" 
              strokeDasharray="16 8" 
            />
            {/* Crosshair Vectors */}
            <g stroke={unlocked ? "#b366ff" : "#554466"} strokeWidth="2">
              <line x1="50" y1="12" x2="50" y2="28" />
              <line x1="50" y1="72" x2="50" y2="88" />
              <line x1="12" y1="50" x2="28" y2="50" />
              <line x1="72" y1="50" x2="88" y2="50" />
            </g>
            {/* Neural Brain / AI Core nodes */}
            <polygon points="50,36 62,56 38,56" fill="url(#neural-grad)" opacity={unlocked ? "0.9" : "0.3"} />
            <polygon points="50,64 62,44 38,44" fill="url(#neural-grad)" opacity={unlocked ? "0.7" : "0.2"} />
            {unlocked && <circle cx="50" cy="50" r="4" fill="#ffffff" />}
          </svg>
        );

      case 'challenger':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="blade-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#ff4d79" />
                <stop offset="70%" stopColor="#ff0044" />
                <stop offset="100%" stopColor="#66001a" />
              </linearGradient>
            </defs>
            {/* Cyber Shield with sharp horns */}
            <polygon points="50,6 88,22 82,74 50,94 18,74 12,22" 
              fill="rgba(30, 5, 10, 0.9)" 
              stroke={unlocked ? "#ff0044" : "#442222"} 
              strokeWidth="2.5" 
            />
            {/* Crossed Laser Katanas */}
            <line x1="24" y1="24" x2="76" y2="76" 
              stroke="url(#blade-grad)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              opacity={unlocked ? "1" : "0.35"} 
            />
            <line x1="76" y1="24" x2="24" y2="76" 
              stroke="url(#blade-grad)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              opacity={unlocked ? "1" : "0.35"} 
            />
            {/* Duel Clashing Energy Burst in Center */}
            {unlocked ? (
              <circle cx="50" cy="50" r="8" fill="#ffffff" filter="drop-shadow(0 0 6px #ff0044)" />
            ) : (
              <circle cx="50" cy="50" r="5" fill="#442222" />
            )}
            {/* Crossguard grips */}
            <rect x="22" y="22" width="6" height="6" fill={unlocked ? "#ffe6eb" : "#444"} />
            <rect x="72" y="22" width="6" height="6" fill={unlocked ? "#ffe6eb" : "#444"} />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 border border-green-500/40 rounded">
            <Trophy className={`w-8 h-8 ${unlocked ? 'text-green-400' : 'text-gray-600'}`} />
          </div>
        );
    }
  };

  return (
    <div className={`relative ${dim} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
      {renderInner()}
      {/* Glossy reflective glint badge highlight */}
      {unlocked && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)'
          }}
        />
      )}
    </div>
  );
}

export function BadgeDisplay({ walletAddress }: BadgeDisplayProps) {
  const { getPlayerBadges, getAllBadgesInfo, claimBadges, isConnecting } = useGenLayer();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [claimNotice, setClaimNotice] = useState<string | null>(null);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const [allBadgesInfo, unlockedBadgeIds] = await Promise.all([
        getAllBadgesInfo(),
        getPlayerBadges(walletAddress)
      ]);
      
      if (allBadgesInfo && Array.isArray(allBadgesInfo)) {
        const processedBadges: BadgeType[] = allBadgesInfo.map((b: any) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          icon: b.icon,
          unlocked: unlockedBadgeIds.includes(b.id)
        }));
        setBadges(processedBadges);
      }
    } catch (err) {
      console.error("[BadgeDisplay] Failed to load badges from contract:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchBadges();
    }
  }, [walletAddress]);

  const handleClaim = async () => {
    if (!walletAddress || claiming || isConnecting) return;
    setClaiming(true);
    setClaimNotice(null);
    try {
      const result = await claimBadges(walletAddress);
      console.log("[BadgeDisplay] Claimed badges on-chain:", result);
      setClaimNotice("Syncing verified consensus state...");
      // Re-fetch after short latency to pick up confirmed state
      setTimeout(async () => {
        await fetchBadges();
        setClaimNotice("Achievements updated from on-chain records!");
        setTimeout(() => setClaimNotice(null), 4000);
      }, 2000);
    } catch (err: any) {
      console.error("[BadgeDisplay] Claim error:", err);
      setClaimNotice(err?.message || "Contract verification check completed.");
      setTimeout(() => setClaimNotice(null), 4000);
    } finally {
      setClaiming(false);
    }
  };

  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);
  const totalCount = badges.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredBadges = useMemo(() => {
    if (filterMode === 'UNLOCKED') return badges.filter(b => b.unlocked);
    if (filterMode === 'LOCKED') return badges.filter(b => !b.unlocked);
    return badges;
  }, [badges, filterMode]);

  return (
    <div className="mt-6 border border-green-500/30 rounded-xl bg-gray-950/70 p-5 relative overflow-hidden backdrop-blur-md">
      {/* Ambient Cyber Grid Background Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header Zone with Retro-Cyber HUD */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-green-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-green-400" />
            <h3 className="text-base font-bold text-green-400 arcade-font tracking-wider">
              Operator Insignias
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/50 text-emerald-300 font-bold uppercase tracking-wider">
              GenLayer Certified
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Gated exclusively by immutable on-chain consensus records. Zero caller spoofing.
          </p>
        </div>

        {/* Claim & Sync Action Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBadges}
            disabled={loading}
            title="Re-sync on-chain state"
            className="p-2 border border-green-500/30 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClaim}
            disabled={claiming || isConnecting || loading}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-black font-mono font-bold text-xs rounded-lg hover:from-emerald-400 hover:to-green-500 transition-all shadow-[0_0_15px_rgba(0,255,65,0.3)] disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Zap className={`w-3.5 h-3.5 ${claiming ? 'animate-bounce' : ''}`} />
            {claiming ? 'Verifying...' : 'Claim Badges'}
          </button>
        </div>
      </div>

      {/* Claim Notification Toast */}
      {claimNotice && (
        <div className="relative z-10 mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded text-xs font-mono text-emerald-300 flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {claimNotice}
          </span>
          <button onClick={() => setClaimNotice(null)} className="text-emerald-500 hover:text-emerald-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Progression Meter & Tab Filter */}
      <div className="relative z-10 my-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Shiny Progress Bar */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between items-center text-xs font-mono mb-1 text-gray-300">
            <span className="text-green-500 font-bold">Consensus Verification:</span>
            <span className="font-bold text-emerald-400">
              {unlockedCount} / {totalCount} Unlocked ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full bg-gray-900 border border-green-500/30 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-cyan-400 rounded-full transition-all duration-700 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-gray-900/90 border border-green-500/20 rounded-lg text-xs font-mono">
          {(['ALL', 'UNLOCKED', 'LOCKED'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === mode 
                  ? 'bg-green-500 text-black font-bold' 
                  : 'text-gray-400 hover:text-green-300'
              }`}
            >
              {mode} {mode === 'UNLOCKED' ? `(${unlockedCount})` : mode === 'LOCKED' ? `(${totalCount - unlockedCount})` : `(${totalCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && badges.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-green-400 animate-pulse flex flex-col items-center gap-2">
          <Cpu className="w-8 h-8 text-green-500 animate-spin" />
          <span>Interrogating GenLayer smart contract storage for operator achievements...</span>
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="py-10 text-center text-xs font-mono text-gray-500">
          No badges found matching filter "{filterMode}".
        </div>
      ) : (
        /* Badges Grid - Shiny Retro-Cyberpunk Cards */
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBadges.map((badge) => {
            const meta = BADGE_META[badge.id] || DEFAULT_META;
            const isUnlocked = !!badge.unlocked;

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'} group relative cursor-pointer p-0.5 rounded-xl transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Outer Shiny Holographic Border Wrapper */}
                <div 
                  className={`w-full h-full rounded-xl p-[1.5px] transition-all duration-300 ${
                    isUnlocked 
                      ? `${meta.borderColorClass} shadow-lg` 
                      : 'bg-gray-800/80 border border-gray-800'
                  }`}
                  style={isUnlocked ? { boxShadow: `0 0 20px ${meta.glowColor}` } : {}}
                >
                  {/* Card Interior */}
                  <div className={`relative h-full rounded-[10px] p-3.5 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${meta.bgGradient} ${
                    isUnlocked ? '' : 'opacity-65 grayscale-[35%]'
                  }`}>
                    {/* Ambient shine layer for unlocked cards */}
                    {isUnlocked && <div className="shimmer-layer" />}
                    {isUnlocked && <div className="shimmer-layer-ambient shimmer-layer opacity-40" />}

                    {/* Top Row: Serial & Verification Stamp */}
                    <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                      <span className="text-gray-400 truncate max-w-[130px]">
                        {meta.serial}
                      </span>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500 px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700">
                          <Lock className="w-3 h-3" />
                          SEALED
                        </span>
                      )}
                    </div>

                    {/* Middle Row: Medallion Emblem + Info */}
                    <div className="flex items-center gap-3.5 my-1">
                      <BadgeEmblem id={badge.id} unlocked={isUnlocked} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-sm font-bold truncate arcade-font ${
                            isUnlocked ? 'text-white' : 'text-gray-300'
                          }`}>
                            {badge.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2 font-sans">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Tier Indicator & Quick Inspect Action */}
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <span 
                        className="font-bold tracking-wider px-1.5 py-0.2 rounded"
                        style={{ color: isUnlocked ? meta.accentHex : '#888' }}
                      >
                        [{meta.tier}]
                      </span>
                      <span className="text-gray-400 group-hover:text-green-300 transition-colors flex items-center gap-1 text-[10px]">
                        <Info className="w-3 h-3" /> Inspect
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cyber Hologram Inspection Modal */}
      {selectedBadge && (() => {
        const meta = BADGE_META[selectedBadge.id] || DEFAULT_META;
        const isUnlocked = !!selectedBadge.unlocked;

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedBadge(null)}
          >
            <div 
              className="relative max-w-lg w-full rounded-2xl p-[2px] transition-all"
              style={{
                background: isUnlocked 
                  ? `linear-gradient(135deg, ${meta.accentHex}, #ffffff, ${meta.accentHex})` 
                  : 'linear-gradient(135deg, #333333, #555555, #222222)',
                boxShadow: isUnlocked ? `0 0 35px ${meta.glowColor}` : 'none'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Card Content */}
              <div className="rounded-[14px] bg-gray-950 p-6 relative overflow-hidden text-gray-200">
                {/* Shiny Shimmer Sweep in Modal */}
                {isUnlocked && <div className="shimmer-layer-ambient shimmer-layer opacity-30" />}

                {/* Close Button */}
                <button 
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg border border-gray-700 bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Top Hologram Header */}
                <div className="flex items-center gap-2 mb-4 font-mono text-xs text-gray-400">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>ON-CHAIN BADGE DOSSIER</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">{meta.serial}</span>
                </div>

                {/* Center Showcase: Large Glowing Medallion */}
                <div className="flex flex-col items-center text-center my-4 py-4 border-y border-white/10 bg-gradient-to-b from-white/5 to-transparent rounded-xl">
                  <div className="relative mb-3">
                    <BadgeEmblem id={selectedBadge.id} unlocked={isUnlocked} size="lg" />
                    {isUnlocked && (
                      <div 
                        className="absolute inset-0 rounded-full blur-xl pointer-events-none"
                        style={{ backgroundColor: meta.glowColor }}
                      />
                    )}
                  </div>

                  <h2 className="text-xl font-bold arcade-font tracking-wider text-white">
                    {selectedBadge.name}
                  </h2>
                  <span 
                    className="font-mono text-xs font-bold tracking-widest mt-1 px-2.5 py-0.5 rounded border"
                    style={{ 
                      color: isUnlocked ? meta.accentHex : '#aaa',
                      borderColor: isUnlocked ? meta.accentHex : '#444',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    STATUS: {isUnlocked ? 'CONSENSUS VERIFIED & CLAIMED' : 'SEALED // PENDING OBJECTIVE'}
                  </span>
                </div>

                {/* Flavor & Description */}
                <div className="space-y-3 font-sans text-sm">
                  <p className="text-gray-300">
                    {selectedBadge.description}
                  </p>
                  <p className="text-xs italic text-gray-400 border-l-2 border-green-500/40 pl-3">
                    "{meta.flavor}"
                  </p>
                </div>

                {/* Cryptographic Gate Verification Specs */}
                <div className="mt-5 p-3.5 rounded-lg bg-gray-900 border border-green-500/30 font-mono text-xs space-y-1.5">
                  <div className="text-green-400 font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> Consensus Contract Requirement:
                  </div>
                  <div className="text-gray-300 text-[11px] bg-black/60 p-2 rounded border border-gray-800 select-all overflow-x-auto">
                    {meta.contractGate}
                  </div>
                  <div className="text-[10px] text-gray-400 flex justify-between pt-1">
                    <span>Source: SnakeGame.py (Storage Root)</span>
                    <span className="text-emerald-400">Caller args ignored</span>
                  </div>
                </div>

                {/* Action button inside modal */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="px-4 py-2 border border-gray-700 rounded-lg text-xs font-mono hover:bg-gray-800 text-gray-300"
                  >
                    Close Dossier
                  </button>
                  {!isUnlocked && (
                    <button
                      onClick={() => {
                        setSelectedBadge(null);
                        handleClaim();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-black text-xs font-mono font-bold rounded-lg hover:from-emerald-400 hover:to-green-500 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" /> Check On-Chain
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
