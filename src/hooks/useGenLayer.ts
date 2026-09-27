import { useState, useCallback, useEffect } from 'react';
import { createClient, chains } from 'genlayer-js';

export const STUDIO_NEXT_CHAIN_ID = 61997;
export const STUDIO_NEXT_RPC_URL = import.meta.env.VITE_GENLAYER_RPC_URL || 'https://studio-dev.genlayer.com/api';
export const STUDIO_NEXT_CHAIN_HEX = '0xf22d'; // 61997 in hex

export const studioNextChain = {
  ...chains.studionet,
  id: STUDIO_NEXT_CHAIN_ID,
  isStudio: true,
  name: 'GenLayer Studio Next',
  network: 'studio-next',
  rpcUrls: {
    default: { http: [STUDIO_NEXT_RPC_URL] },
    public: { http: [STUDIO_NEXT_RPC_URL] },
  },
  nativeCurrency: {
    name: 'GEN Token',
    symbol: 'GEN',
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: 'GenLayer Explorer',
      url: 'https://genlayer-explorer.vercel.app',
    },
  },
  testnet: true,
};

const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_ADDRESS = (envAddress && envAddress !== 'undefined') ? envAddress : '0xc0e6b7C203cbebb17402aA2C097c9669d2744f8a';
const badgeEnvAddress = import.meta.env.VITE_BADGE_CONTRACT_ADDRESS;
const BADGE_CONTRACT_ADDRESS = (badgeEnvAddress && badgeEnvAddress !== 'undefined') ? badgeEnvAddress : '0x254Fbc1Be7419ECc88361fd121A049Cb603E6B70';
const GENLAYER_API_KEY = import.meta.env.VITE_GENLAYER_API_KEY;

const parseTransactionError = (error: any): Error => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('deployment_not_found') || errorMessage.includes('404: not_found')) {
    return new Error('Cüzdan RPC Hatası: Cüzdanınızdaki (Metamask/Rabby) GenLayer ağının RPC adresi artık geçersiz. Lütfen cüzdan ayarlarından GenLayer Studio Next ağı için RPC URL adresini "https://studio-dev.genlayer.com/api" olarak güncelleyin.');
  }
  
  if (errorMessage.includes('user rejected') || errorMessage.includes('denied transaction') || errorMessage.includes('rejected the request')) {
    return new Error('İşlem kullanıcı tarafından reddedildi.');
  }
  
  if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
    return new Error('İşlem için yeterli bakiye (gas) bulunmuyor.');
  }
  
  if (errorMessage.includes('revert')) {
    return new Error('İşlem akıllı kontrat tarafından reddedildi (Revert).');
  }

  return new Error(error?.shortMessage || error?.message || 'İşlem sırasında bilinmeyen bir hata oluştu.');
};

export function useGenLayer() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Check current connected network
  const checkCurrentNetwork = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const hexChainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
        const parsed = parseInt(hexChainId, 16);
        setCurrentChainId(parsed);
        return parsed;
      } catch (err) {
        console.warn('Could not read eth_chainId:', err);
      }
    }
    return null;
  }, []);

  useEffect(() => {
    checkCurrentNetwork();
    if (typeof window !== 'undefined' && (window as any).ethereum?.on) {
      const handleChainChanged = (chainIdHex: string) => {
        setCurrentChainId(parseInt(chainIdHex, 16));
      };
      (window as any).ethereum.on('chainChanged', handleChainChanged);
      return () => {
        (window as any).ethereum.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, [checkCurrentNetwork]);

  // Switch or Add Studio Next (chain 61997) to connected wallet
  const switchToStudioNext = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('Web3 cüzdanı bulunamadı. Lütfen MetaMask veya uyumlu bir cüzdan kurun.');
    }
    const provider = (window as any).ethereum;
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: STUDIO_NEXT_CHAIN_HEX }],
      });
      setCurrentChainId(STUDIO_NEXT_CHAIN_ID);
      return true;
    } catch (switchError: any) {
      // 4902 error code means the chain has not been added to MetaMask
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: STUDIO_NEXT_CHAIN_HEX,
                chainName: 'GenLayer Studio Next (61997)',
                rpcUrls: [STUDIO_NEXT_RPC_URL],
                nativeCurrency: {
                  name: 'GEN',
                  symbol: 'GEN',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://genlayer-explorer.vercel.app'],
              },
            ],
          });
          setCurrentChainId(STUDIO_NEXT_CHAIN_ID);
          return true;
        } catch (addError) {
          console.error('Failed to add Studio Next chain:', addError);
          throw addError;
        }
      }
      console.error('Failed to switch to Studio Next chain:', switchError);
      throw switchError;
    }
  }, []);

  const getClient = useCallback(() => {
    const provider = typeof window !== 'undefined' ? (window as any).ethereum : null;
    const config: any = { 
      chain: studioNextChain,
    };
    
    if (provider) {
      config.provider = {
        request: provider.request.bind(provider),
        on: provider.on?.bind(provider),
        removeListener: provider.removeListener?.bind(provider),
      };
    }
    
    if (GENLAYER_API_KEY) {
      config.endpoint = `${STUDIO_NEXT_RPC_URL}?api_key=${GENLAYER_API_KEY}`;
    }
    
    return (createClient as any)(config);
  }, []);

  const submitScore = useCallback(async (
    player: string,
    score: number,
    apples: number,
    survival: number,
    deathsNearWall: number,
    replayHash: string,
    insight: string = ""
  ) => {
    if (!player || player === 'undefined' || !player.startsWith('0x')) {
      console.error('❌ Invalid player address:', player);
      throw new Error('Invalid player address');
    }
    setIsConnecting(true);
    try {
      const client = getClient();
      console.log('📡 Sending TX to:', CONTRACT_ADDRESS);
      console.log('👤 Player Account:', player);
      console.log('📊 Args:', [player, BigInt(score), BigInt(apples), BigInt(survival), BigInt(deathsNearWall), replayHash, insight]);
      
      const safeInsight = insight ? insight.substring(0, 200) : "";
      let tx;
      try {
        tx = await client.writeContract({
          address: CONTRACT_ADDRESS,
          account: player,
          functionName: 'submit_score',
          args: [player, BigInt(score), BigInt(apples), BigInt(survival), BigInt(deathsNearWall), replayHash, safeInsight],
        });
      } catch (err) {
        console.warn('Failed with 7 args, trying 6 args (older contract version)...');
        tx = await client.writeContract({
          address: CONTRACT_ADDRESS,
          account: player,
          functionName: 'submit_score',
          args: [player, BigInt(score), BigInt(apples), BigInt(survival), BigInt(deathsNearWall), replayHash],
        });
      }
      console.log('✅ TX sent successfully:', tx);
      return tx;
    } catch (error: any) {
      console.error('❌ Error submitting score:', error);
      // Log more details if available
      if (error.data) console.error('Error data:', error.data);
      if (error.message) console.error('Error message:', error.message);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const getLeaderboard = useCallback(async () => {
    try {
      const client = getClient();
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_leaderboard',
      });
      return JSON.parse(result as string);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }, [getClient]);

  const getPlayerStats = useCallback(async (address: string) => {
    try {
      const client = getClient();
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_player_stats',
        args: [address],
      });
      return JSON.parse(result as string);
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }, [getClient]);

  const createChallenge = useCallback(async (challenger: string, opponent: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: challenger,
        functionName: 'create_challenge',
        args: [challenger, opponent],
      });
      return tx;
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const submitChallengeScore = useCallback(async (challengeId: string, player: string, score: number) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'submit_challenge_score',
        args: [challengeId, player, BigInt(score)],
      });
      return tx;
    } catch (error: any) {
      console.error('Error submitting challenge score:', error);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const resolveChallenge = useCallback(async (challengeId: string, player: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'resolve_challenge',
        args: [challengeId],
      });
      return tx;
    } catch (error: any) {
      console.error('Error resolving challenge:', error);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const getChallenge = useCallback(async (challengeId: string) => {
    try {
      const client = getClient();
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_challenge',
        args: [challengeId],
      });
      return JSON.parse(result as string);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      return null;
    }
  }, [getClient]);

  const getFullProfile = useCallback(async (address: string) => {
    try {
      const client = getClient();
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_full_profile',
        args: [address],
      });
      return JSON.parse(result as string);
    } catch (error) {
      console.error('Error fetching full profile:', error);
      return null;
    }
  }, [getClient]);

  const updateProfile = useCallback(async (player: string, displayName: string, bio: string, avatarUri: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'update_profile',
        args: [player, displayName, bio, avatarUri],
      });
      return tx;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const createClan = useCallback(async (player: string, name: string, tag: string, description: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'create_clan',
        args: [player, name, tag, description],
      });
      return tx;
    } catch (error: any) {
      console.error('Error creating clan:', error);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const joinClan = useCallback(async (player: string, clanId: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'join_clan',
        args: [player, clanId],
      });
      return tx;
    } catch (error: any) {
      console.error('Error joining clan:', error);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const leaveClan = useCallback(async (player: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'leave_clan',
        args: [player],
      });
      return tx;
    } catch (error: any) {
      console.error('Error leaving clan:', error);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const getClan = useCallback(async (clanId: string) => {
    try {
      const client = getClient();
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_clan',
        args: [clanId],
      });
      return JSON.parse(result as string);
    } catch (error) {
      console.error('Error fetching clan:', error);
      return null;
    }
  }, [getClient]);

  const registerReferral = useCallback(async (player: string, referrer: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'register_referral',
        args: [player, referrer],
      });
      return tx;
    } catch (error: any) {
      console.error('Error registering referral:', error);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const claimBadges = useCallback(async (player: string) => {
    setIsConnecting(true);
    try {
      const client = getClient();
      // Badges are securely evaluated and granted ONLY by SnakeGame from verified on-chain state
      const tx = await client.writeContract({
        address: CONTRACT_ADDRESS,
        account: player,
        functionName: 'claim_badges',
        args: [player],
      });
      return tx;
    } catch (error: any) {
      console.error('Error claiming badges from verified on-chain state:', error);
      throw parseTransactionError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [getClient]);

  const getPlayerBadges = useCallback(async (address: string) => {
    try {
      const client = getClient();
      // First attempt to read from SnakeGame (the authoritative source of verified badges)
      try {
        const result = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: 'get_player_badges',
          args: [address],
        });
        const badgeStr = result as string;
        if (badgeStr !== undefined && badgeStr !== null) {
          return badgeStr ? badgeStr.split(',').filter(Boolean) : [];
        }
      } catch (sgErr) {
        // Fallback to legacy badge address if contract has not deployed new view yet
      }

      const result = await client.readContract({
        address: BADGE_CONTRACT_ADDRESS,
        functionName: 'get_player_badges',
        args: [address],
      });
      const badgeStr = result as string;
      return badgeStr ? badgeStr.split(',').filter(Boolean) : [];
    } catch (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
  }, [getClient]);

  const getAllBadgesInfo = useCallback(async () => {
    try {
      const client = getClient();
      try {
        const result = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: 'get_all_badges_info',
        });
        return JSON.parse(result as string);
      } catch (sgErr) {
        // Fallback
      }

      const result = await client.readContract({
        address: BADGE_CONTRACT_ADDRESS,
        functionName: 'get_all_badges_info',
      });
      return JSON.parse(result as string);
    } catch (error) {
      console.error('Error fetching badge info:', error);
      return [
        { id: "first_blood", name: "First Blood", description: "First verified score on-chain", icon: "1" },
        { id: "century_club", name: "Century Club", description: "Verified score 100 or higher", icon: "2" },
        { id: "apple_hoarder", name: "Apple Hoarder", description: "Collect 50 apples in verified games", icon: "3" },
        { id: "style_master", name: "Style Master", description: "Consensus verified play style", icon: "4" },
        { id: "challenger", name: "Challenger", description: "Win a verified PvP challenge", icon: "5" }
      ];
    }
  }, [getClient]);

  return {
    submitScore,
    getLeaderboard,
    getPlayerStats,
    createChallenge,
    submitChallengeScore,
    resolveChallenge,
    getChallenge,
    getFullProfile,
    updateProfile,
    createClan,
    joinClan,
    leaveClan,
    getClan,
    registerReferral,
    claimBadges,
    getPlayerBadges,
    getAllBadgesInfo,
    getClient,
    isConnecting,
    currentChainId,
    switchToStudioNext,
    isStudioNext: currentChainId === STUDIO_NEXT_CHAIN_ID
  };
}
