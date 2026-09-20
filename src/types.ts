export interface PlayerStats {
  address: string;
  best_score: number;
  total_apples: number;
  total_games: number;
  play_style: string;
  last_replay_hash: string;
  verdict?: 'VALID' | 'INVALID' | string;
  validator_assessment?: string;
  last_verified_score?: number;
  is_verified?: boolean;
  risk_level?: string;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  play_style: string;
  verdict?: 'VALID' | 'INVALID' | string;
  assessment?: string;
  is_verified?: boolean;
}

export interface FullProfile {
  address: string;
  display_name: string;
  bio: string;
  avatar_uri: string;
  joined_at: number;
  badges: string[];
  clan_id: string;
  referrals: number;
  game_stats: {
    best_score: number;
    total_apples: number;
    total_games: number;
    play_style: string;
    confidence: number;
    pattern: string;
    risk_level: string;
    last_replay_hash: string;
    verdict?: string;
    validator_assessment?: string;
    last_verified_score?: number;
    is_verified?: boolean;
  };
}

export interface Challenge {
  challenge_id: string;
  challenger: string;
  opponent: string;
  challenger_score: number;
  opponent_score: number;
  status: 'pending' | 'resolved';
  winner: string;
  commentary?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked?: boolean;
}
