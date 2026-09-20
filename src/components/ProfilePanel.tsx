import React, { useState, useEffect } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { User, Edit3, Shield, Trophy, Activity, Hash, Save, X, Link, Copy } from 'lucide-react';
import { BadgeDisplay } from './BadgeDisplay';

interface ProfilePanelProps {
  walletAddress: string;
  onClose: () => void;
  onChallenge?: (address: string) => void;
}

export function ProfilePanel({ walletAddress, onClose, onChallenge }: ProfilePanelProps) {
  const { getFullProfile, updateProfile, isConnecting } = useGenLayer();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      console.log('[Profile] Fetching for', walletAddress);
      const data = await getFullProfile(walletAddress);
      console.log('[Profile] Received:', data);
      setProfile(data);
      if (data) {
        setEditName(data.display_name || '');
        setEditBio(data.bio || '');
        setEditAvatar(data.avatar_uri || '');
      }
    } catch (err) {
      console.error('[Profile] Fetch error:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchProfile();
    }
  }, [walletAddress]);

  const handleSave = async () => {
    const name = (editName || 'Anonymous').trim();
    const bio = (editBio || '').trim();
    const avatar = (editAvatar || '').trim();

    try {
      console.log('[Profile] Saving...', { walletAddress, name, bio, avatar });
      const tx = await updateProfile(walletAddress, name, bio, avatar);
      console.log('[Profile] TX result:', tx);

      // Optimistic UI – beklemeden göster
      setProfile({
        address: walletAddress,
        display_name: name,
        bio: bio,
        avatar_uri: avatar,
        joined_at: 0,
        badges: [],
        clan_id: '',
        referrals: 0,
        game_stats: {
          best_score: 0,
          total_apples: 0,
          total_games: 0,
          play_style: 'unknown',
          confidence: 0,
          pattern: 'unknown',
          risk_level: 'unknown',
          last_replay_hash: ''
        }
      });
      setIsEditing(false);
      alert('Profile saved!');

      // 3 sn sonra zincirden tekrar oku
      setTimeout(() => fetchProfile(), 3000);
    } catch (error: any) {
      console.error('[Profile] Save error:', error);
      alert('Failed: ' + (error?.message || String(error)));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const referralLink = `${window.location.origin}/?ref=${walletAddress}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-green-500/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative text-green-500">
        
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-green-500/30 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Operator Profile
          </h2>
          <button onClick={onClose} className="hover:text-green-300 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-10 animate-pulse">Decrypting profile data...</div>
          ) : (
            <div className="space-y-6">
              
              {/* Profile yoksa ve edit modunda değilse uyarı göster */}
              {!profile && !isEditing && (
                <div className="text-center py-10">
                  <p className="mb-4">Profile not found on-chain.</p>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-green-500 rounded hover:bg-green-500/10"
                  >
                    Initialize Profile
                  </button>
                </div>
              )}

              {/* Edit formu – hem ilk oluşturma hem güncelleme için */}
              {isEditing && (
                <div className="space-y-3 border border-green-500/30 rounded-lg p-4 bg-gray-800/50">
                  <h3 className="text-sm font-bold text-green-400 mb-2">
                    {profile ? 'Edit Profile' : 'Create Profile'}
                  </h3>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Display Name" 
                    maxLength={20}
                    className="w-full bg-gray-800 border border-green-500/50 rounded p-2 text-green-500 outline-none"
                  />
                  <input 
                    type="text" 
                    value={editAvatar} 
                    onChange={e => setEditAvatar(e.target.value)}
                    placeholder="Avatar URL (optional)"
                    className="w-full bg-gray-800 border border-green-500/50 rounded p-2 text-green-500 outline-none text-sm"
                  />
                  <textarea 
                    value={editBio} 
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Bio (max 140 chars)" 
                    maxLength={140}
                    className="w-full bg-gray-800 border border-green-500/50 rounded p-2 text-green-500 outline-none resize-none h-20 text-sm"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave} 
                      disabled={isConnecting} 
                      className="flex-1 bg-green-500 text-black py-2 rounded font-bold hover:bg-green-400 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> 
                      {profile ? 'Save' : 'Create Profile'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Profile varsa normal görünüm */}
              {profile && !isEditing && (
                <>
                  {/* Top Section - Avatar + Identity */}
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-24 h-24 rounded-lg bg-gray-800 border border-green-500/50 flex items-center justify-center overflow-hidden shrink-0">
                      {profile.avatar_uri ? (
                        <img src={profile.avatar_uri} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-green-500/50" />
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h1 className="text-2xl font-bold text-green-400">
                            {profile.display_name || 'Anonymous'}
                          </h1>
                          <p className="text-xs text-green-600 font-mono flex items-center gap-2 mt-1">
                            {profile.address?.substring(0, 10)}...{profile.address?.substring(38)}
                            <button onClick={() => copyToClipboard(profile.address)} className="hover:text-green-400">
                              <Copy className="w-3 h-3" />
                            </button>
                          </p>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="p-2 border border-green-500/30 rounded hover:bg-green-500/10">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {profile.bio && (
                        <p className="mt-3 text-sm text-gray-300 border-l-2 border-green-500/30 pl-3">"{profile.bio}"</p>
                      )}
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.clan_id && (
                          <span className="text-xs bg-blue-900/30 border border-blue-500/40 px-2 py-1 rounded text-blue-400">
                            Clan: #{profile.clan_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-3 rounded border border-green-500/20 text-center">
                      <div className="text-green-600 text-xs uppercase mb-1">Best Score</div>
                      <div className="text-xl font-bold">{profile.game_stats?.best_score ?? 0}</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded border border-green-500/20 text-center">
                      <div className="text-green-600 text-xs uppercase mb-1">Total Games</div>
                      <div className="text-xl font-bold">{profile.game_stats?.total_games ?? 0}</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded border border-green-500/20 text-center">
                      <div className="text-green-600 text-xs uppercase mb-1">Apples Eaten</div>
                      <div className="text-xl font-bold">{profile.game_stats?.total_apples ?? 0}</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded border border-green-500/20 text-center">
                      <div className="text-green-600 text-xs uppercase mb-1">Referrals</div>
                      <div className="text-xl font-bold">{profile.referrals ?? 0}</div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="border border-green-500/30 rounded p-4 bg-gray-800/50">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-3 text-green-400 uppercase tracking-wider">
                      <Activity className="w-4 h-4" /> Cognitive Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-green-600 mb-1">Dominant Style</div>
                        <div className="font-mono text-sm">{profile.game_stats?.play_style ?? 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-green-600 mb-1">Risk Profile</div>
                        <div className="font-mono text-sm">{profile.game_stats?.risk_level ?? 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-green-600 mb-1">Movement Pattern</div>
                        <div className="font-mono text-sm">{profile.game_stats?.pattern ?? 'Unknown'}</div>
                      </div>
                    </div>
                  </div>

                  {/* GenLayer Validator Consensus Verdict */}
                  <div className="border border-emerald-500/40 rounded-lg p-4 bg-emerald-950/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400 uppercase tracking-wider">
                        <Shield className="w-4 h-4" /> GenLayer Validator Verdict
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${
                        profile.game_stats?.verdict === 'INVALID' 
                          ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      }`}>
                        {profile.game_stats?.verdict || 'VALID'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-mono italic">
                      "{profile.game_stats?.validator_assessment || 'Result authenticated and sealed on-chain via GenLayer validator consensus evaluation.'}"
                    </p>
                    <div className="mt-2 pt-2 border-t border-emerald-500/20 flex justify-between text-[11px] text-emerald-500/80 font-mono">
                      <span>Network: Studio Next (61997)</span>
                      <span>Verified Score: {profile.game_stats?.last_verified_score || profile.game_stats?.best_score || 0} pts</span>
                    </div>
                  </div>

                  {/* Achievements */}
                  <BadgeDisplay walletAddress={walletAddress} />

                  {/* Replay Hash & Referral Link */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-green-500/30 rounded p-3 bg-gray-800/30">
                      <div className="text-xs text-green-600 mb-1 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> Last Replay Hash
                      </div>
                      {profile.game_stats?.last_replay_hash ? (
                        <div className="flex items-center gap-2">
                          <div className="truncate font-mono text-xs text-gray-300 flex-1">
                            {profile.game_stats.last_replay_hash}
                          </div>
                          <button onClick={() => copyToClipboard(profile.game_stats.last_replay_hash)} className="p-1 hover:text-green-400">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">No replay yet</div>
                      )}
                    </div>

                    <div className="border border-green-500/30 rounded p-3 bg-gray-800/30">
                      <div className="text-xs text-green-600 mb-1 flex items-center gap-1">
                        <Link className="w-3 h-3" /> Referral Link
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="truncate font-mono text-xs text-gray-300 flex-1">
                          {referralLink}
                        </div>
                        <button onClick={() => copyToClipboard(referralLink)} className="p-1 hover:text-green-400">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Challenge Button (If not self) */}
                  {onChallenge && (
                    <button 
                      onClick={() => onChallenge(profile.address)}
                      className="w-full bg-red-900/50 border border-red-500/50 text-red-400 py-3 rounded font-bold hover:bg-red-900/80 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
                    >
                      <Trophy className="w-5 h-5" /> Challenge Operator
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
