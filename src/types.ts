export interface PlayerStats {
  address: string;
  best_score: number;
  total_apples: number;
  total_games: number;
  play_style: string;
  last_replay_hash: string;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  play_style: string;
}

export interface Challenge {
  challenge_id: string;
  challenger: string;
  opponent: string;
  challenger_score: number;
  opponent_score: number;
  status: 'pending' | 'resolved';
  winner: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked?: boolean;
}
