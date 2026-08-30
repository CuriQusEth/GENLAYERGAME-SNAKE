import { useState, useCallback } from 'react';
import { createClient, chains } from 'genlayer-js';

const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_ADDRESS = (envAddress && envAddress !== 'undefined') ? envAddress : '0x25067c997C3973f80a233fC9F3e1833486CaF1d5';
const GENLAYER_API_KEY = import.meta.env.VITE_GENLAYER_API_KEY;

const parseTransactionError = (error: any): Error => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('deployment_not_found') || errorMessage.includes('404: not_found')) {
    return new Error('Cüzdan RPC Hatası: Cüzdanınızdaki (Metamask/Rabby) GenLayer ağının RPC adresi artık geçersiz. Lütfen cüzdan ayarlarından GenLayer Studionet ağı için RPC URL adresini "https://studio.genlayer.com/api" olarak güncelleyin.');
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

  const getClient = useCallback(() => {
    const provider = typeof window !== 'undefined' ? (window as any).ethereum : null;
    const config: any = { 
      chain: chains.studionet,
    };
    
    if (provider) {
      config.provider = {
        request: provider.request.bind(provider),
        on: provider.on?.bind(provider),
        removeListener: provider.removeListener?.bind(provider),
      };
    }
    
    if (GENLAYER_API_KEY) {
      config.endpoint = `https://studio.genlayer.com/api?api_key=${GENLAYER_API_KEY}`;
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

  return {
    submitScore,
    getLeaderboard,
    getPlayerStats,
    createChallenge,
    submitChallengeScore,
    resolveChallenge,
    getChallenge,
    isConnecting
  };
}
