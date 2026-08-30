import React, { useState, useEffect } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { Users, Plus, Shield, Search, X } from 'lucide-react';

interface ClanPanelProps {
  walletAddress: string;
  onClose: () => void;
}

export function ClanPanel({ walletAddress, onClose }: ClanPanelProps) {
  const { getClan, createClan, joinClan, leaveClan, getFullProfile, isConnecting } = useGenLayer();
  
  const [profile, setProfile] = useState<any>(null);
  const [clan, setClan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'my_clan' | 'search' | 'create'>('my_clan');

  // Create states
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Search states
  const [searchId, setSearchId] = useState('');
  const [searchedClan, setSearchedClan] = useState<any>(null);

  const fetchProfileAndClan = async () => {
    setLoading(true);
    const p = await getFullProfile(walletAddress);
    setProfile(p);
    if (p && p.clan_id) {
      const c = await getClan(p.clan_id);
      setClan(c);
      setActiveTab('my_clan');
    } else {
      setActiveTab('search');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileAndClan();
  }, [walletAddress]);

  const handleCreate = async () => {
    if (!newName || !newTag) return alert('Name and Tag are required');
    try {
      await createClan(walletAddress, newName, newTag, newDesc);
      fetchProfileAndClan();
    } catch (err: any) {
      alert("Failed to create clan: " + (err.message || "Unknown error"));
    }
  };

  const handleSearch = async () => {
    if (!searchId) return;
    const c = await getClan(searchId);
    setSearchedClan(c);
  };

  const handleJoin = async (cid: string) => {
    try {
      await joinClan(walletAddress, cid);
      fetchProfileAndClan();
    } catch (err: any) {
      alert("Failed to join clan: " + (err.message || "Unknown error"));
    }
  };

  const handleLeave = async () => {
    try {
      await leaveClan(walletAddress);
      setClan(null);
      fetchProfileAndClan();
    } catch (err: any) {
      alert("Failed to leave clan: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-green-500/30 rounded-xl max-w-2xl w-full h-[600px] flex flex-col relative text-green-500">
        
        {/* Header */}
        <div className="bg-gray-900 p-4 border-b border-green-500/30 flex justify-between items-center z-10 rounded-t-xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Syndicates (Clans)
          </h2>
          <button onClick={onClose} className="hover:text-green-300 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-green-500/30">
          <button 
            onClick={() => setActiveTab('my_clan')}
            className={`flex-1 py-3 font-mono text-sm ${activeTab === 'my_clan' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-green-300'}`}
          >
            My Syndicate
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 font-mono text-sm ${activeTab === 'search' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-green-300'}`}
          >
            Find
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 font-mono text-sm ${activeTab === 'create' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-green-300'}`}
          >
            Form New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center animate-pulse">Syncing network...</div>
          ) : (
            <>
              {/* My Clan */}
              {activeTab === 'my_clan' && (
                <div>
                  {clan && clan.clan_id ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h1 className="text-3xl font-bold text-green-400">
                            {clan.name} <span className="text-sm bg-green-900/50 text-green-300 px-2 py-1 rounded ml-2 border border-green-500/30">[{clan.tag}]</span>
                          </h1>
                          <p className="text-gray-400 mt-2 text-sm">{clan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-600">Total Score</div>
                          <div className="text-2xl font-bold font-mono">{clan.score}</div>
                        </div>
                      </div>

                      <div className="border border-green-500/30 rounded bg-gray-800/30 p-4">
                        <h3 className="text-sm text-green-500 font-bold mb-3 border-b border-green-500/30 pb-2">Members ({clan.members?.length || 0}/50)</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                          {clan.members?.map((m: string, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 hover:bg-green-500/10 rounded font-mono text-xs">
                              <span className="flex items-center gap-2">
                                {m === clan.owner && <Shield className="w-3 h-3 text-yellow-500" />}
                                {m.substring(0,6)}...{m.substring(38)}
                                {m === walletAddress && <span className="text-green-600">(You)</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={handleLeave}
                          disabled={isConnecting}
                          className="px-4 py-2 border border-red-500/50 text-red-500 rounded hover:bg-red-500/10 text-sm disabled:opacity-50"
                        >
                          Leave Syndicate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      You are not part of any syndicate.
                      <div className="mt-4 flex justify-center gap-4">
                        <button onClick={() => setActiveTab('search')} className="px-4 py-2 border border-green-500 rounded text-green-500 hover:bg-green-500/10">Find One</button>
                        <button onClick={() => setActiveTab('create')} className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400">Create One</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Search */}
              {activeTab === 'search' && (
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={searchId} 
                      onChange={e => setSearchId(e.target.value)}
                      placeholder="Enter Syndicate ID..."
                      className="flex-1 bg-gray-800 border border-green-500/50 rounded p-3 text-green-500 outline-none font-mono"
                    />
                    <button 
                      onClick={handleSearch}
                      className="bg-green-500 text-black px-6 rounded font-bold hover:bg-green-400 flex items-center justify-center"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>

                  {searchedClan && searchedClan.clan_id ? (
                    <div className="border border-green-500/30 rounded p-4 bg-gray-800/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-green-400">{searchedClan.name} [{searchedClan.tag}]</h3>
                          <p className="text-xs text-gray-400 mt-1">{searchedClan.description}</p>
                          <div className="text-xs text-green-600 mt-2">Members: {searchedClan.members?.length || 0} / 50 | Score: {searchedClan.score}</div>
                        </div>
                        {!clan?.clan_id && (
                          <button 
                            onClick={() => handleJoin(searchedClan.clan_id)}
                            disabled={isConnecting}
                            className="bg-green-500 text-black px-4 py-2 rounded text-sm font-bold hover:bg-green-400 disabled:opacity-50"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    searchId && <div className="text-center text-gray-500">No syndicate found with that ID.</div>
                  )}
                </div>
              )}

              {/* Create */}
              {activeTab === 'create' && (
                <div className="max-w-md mx-auto space-y-4 pt-4">
                  {clan?.clan_id ? (
                    <div className="text-center text-red-400">You must leave your current syndicate first.</div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs text-green-600 mb-1">Syndicate Name</label>
                        <input 
                          type="text" value={newName} onChange={e => setNewName(e.target.value)}
                          maxLength={30}
                          className="w-full bg-gray-800 border border-green-500/50 rounded p-2 text-green-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-green-600 mb-1">Tag (3-5 chars)</label>
                        <input 
                          type="text" value={newTag} onChange={e => setNewTag(e.target.value.toUpperCase())}
                          maxLength={5}
                          className="w-full bg-gray-800 border border-green-500/50 rounded p-2 text-green-500 outline-none font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-green-600 mb-1">Description</label>
                        <textarea 
                          value={newDesc} onChange={e => setNewDesc(e.target.value)}
                          maxLength={100}
                          className="w-full bg-gray-800 border border-green-500/50 rounded p-2 text-green-500 outline-none resize-none h-20"
                        />
                      </div>
                      <button 
                        onClick={handleCreate}
                        disabled={isConnecting || !newName || !newTag}
                        className="w-full bg-green-500 text-black py-3 rounded font-bold hover:bg-green-400 disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
                      >
                        <Plus className="w-5 h-5" /> Form Syndicate
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
