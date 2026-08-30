# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class SkillsClient:
    def run(self, skill_name: str, data: str) -> str:
        prompt = f"Execute skill {skill_name} with data {data}. Return ONLY valid JSON."
        if skill_name == "PlayStyleClassifierSkill":
            prompt += " Output keys: play_style, confidence, reasoning."
        elif skill_name == "ReplayAnalyzerSkill":
            prompt += " Output keys: pattern, risk_level, insight."
        elif skill_name == "ChallengeNarratorSkill":
            prompt += " Output keys: commentary."
            
        result = gl.exec_prompt(prompt)
        return result

skills = SkillsClient()

class SnakeGame(gl.Contract):
    # ─── Persistent Storage ───────────────────────────────────────────
    # Player stats: address -> { best_score, total_apples, total_games, play_style, replay_hash }
    player_best_score:   TreeMap[str, u256]
    player_total_apples: TreeMap[str, u256]
    player_total_games:  TreeMap[str, u256]
    player_play_style:   TreeMap[str, str]
    player_confidence:   TreeMap[str, u256]
    player_pattern:      TreeMap[str, str]
    player_risk_level:   TreeMap[str, str]
    player_replay_hash:  TreeMap[str, str]

    # Leaderboard: ranked list of addresses (top 10 by best score)
    leaderboard_addresses: DynArray[str]
    leaderboard_scores:    DynArray[u256]

    # Challenges: challenge_id -> fields stored in parallel maps
    challenge_challenger:       TreeMap[str, str]
    challenge_opponent:         TreeMap[str, str]
    challenge_challenger_score: TreeMap[str, u256]
    challenge_opponent_score:   TreeMap[str, u256]
    challenge_status:           TreeMap[str, str]   # "pending" | "resolved"
    challenge_winner:           TreeMap[str, str]
    challenge_commentary:       TreeMap[str, str]
    challenge_counter:          u256

    # ─── Social & Retention Storage ──────────────────────────────────
    # Profiles
    player_display_name: TreeMap[str, str]
    player_bio:          TreeMap[str, str]
    player_avatar_uri:   TreeMap[str, str]
    player_joined_at:    TreeMap[str, u256]
    player_badges:       TreeMap[str, str] # JSON string of badges
    
    # Clans
    clan_counter:        u256
    clan_owner:          TreeMap[str, str]
    clan_name:           TreeMap[str, str]
    clan_tag:            TreeMap[str, str]
    clan_description:    TreeMap[str, str]
    clan_members:        TreeMap[str, str] # JSON list of addresses
    clan_score:          TreeMap[str, u256]
    player_clan:         TreeMap[str, str] # player_address -> clan_id

    # Referrals
    player_referrer:       TreeMap[str, str]
    player_referral_count: TreeMap[str, u256]

    # ─── Constructor ──────────────────────────────────────────────────
    def __init__(self) -> None:
        self.leaderboard_addresses = DynArray[str]([])
        self.leaderboard_scores    = DynArray[u256]([])
        self.challenge_counter     = u256(0)
        self.clan_counter          = u256(0)

    # ═════════════════════════════════════════════════════════════════
    #  SCORE REGISTRY
    # ═════════════════════════════════════════════════════════════════

    @gl.public.write
    def submit_score(
        self,
        player: str,
        score: u256,
        apples_eaten: u256,
        survival_seconds: u256,
        deaths_near_wall: u256,
        replay_hash: str,
        insight: str = "",
    ) -> None:
        """
        Called at game-over. Records the result, updates the leaderboard,
        and triggers an AI play-style classification stored on-chain.
        """
        # ── Update cumulative stats ──────────────────────────────────
        prev_apples = self.player_total_apples.get(player, u256(0))
        prev_games  = self.player_total_games.get(player, u256(0))

        self.player_total_apples[player] = prev_apples + apples_eaten
        self.player_total_games[player]  = prev_games  + u256(1)
        self.player_replay_hash[player]  = replay_hash

        # ── Update best score ────────────────────────────────────────
        prev_best = self.player_best_score.get(player, u256(0))
        if score > prev_best:
            self.player_best_score[player] = score
            self._update_leaderboard(player, score)

        # ── AI play-style classification ─────────────────────────────
        import json
        
        # Call PlayStyleClassifierSkill
        play_style_data = {
            "apples": int(apples_eaten),
            "survival_seconds": int(survival_seconds),
            "deaths_near_wall": int(deaths_near_wall)
        }
        
        try:
            play_style_result_str = skills.run("PlayStyleClassifierSkill", json.dumps(play_style_data))
            play_style_result = json.loads(play_style_result_str)
            self.player_play_style[player] = str(play_style_result.get("play_style", "unknown"))
            self.player_confidence[player] = u256(int(play_style_result.get("confidence", 0)))
        except:
            self.player_play_style[player] = "unknown"
            self.player_confidence[player] = u256(0)
            
        # Store the insight from the frontend
        self.player_pattern[player] = "frontend_analyzed"
        self.player_risk_level[player] = insight if insight else "unknown"

    # ─── Private: leaderboard maintenance ────────────────────────────
    def _update_leaderboard(self, player: str, score: u256) -> None:
        """Keeps leaderboard sorted, max 10 entries."""
        MAX = 10

        # Remove existing entry for this player if present
        new_addresses = DynArray[str]([])
        new_scores    = DynArray[u256]([])
        for i in range(len(self.leaderboard_addresses)):
            if self.leaderboard_addresses[i] != player:
                new_addresses.append(self.leaderboard_addresses[i])
                new_scores.append(self.leaderboard_scores[i])

        # Insert in sorted position (descending)
        inserted = False
        final_addresses = DynArray[str]([])
        final_scores    = DynArray[u256]([])
        for i in range(len(new_scores)):
            if not inserted and score >= new_scores[i]:
                final_addresses.append(player)
                final_scores.append(score)
                inserted = True
            final_addresses.append(new_addresses[i])
            final_scores.append(new_scores[i])
        if not inserted:
            final_addresses.append(player)
            final_scores.append(score)

        # Trim to MAX
        trimmed_addresses = DynArray[str]([])
        trimmed_scores    = DynArray[u256]([])
        for i in range(min(MAX, len(final_addresses))):
            trimmed_addresses.append(final_addresses[i])
            trimmed_scores.append(final_scores[i])

        self.leaderboard_addresses = trimmed_addresses
        self.leaderboard_scores    = trimmed_scores

    # ─── Public read methods ──────────────────────────────────────────

    @gl.public.view
    def get_leaderboard(self) -> str:
        """
        Returns the top-10 leaderboard as a JSON string.
        Format: [{"rank":1,"address":"0x...","score":42}, ...]
        """
        entries = []
        for i in range(len(self.leaderboard_addresses)):
            addr  = self.leaderboard_addresses[i]
            score = self.leaderboard_scores[i]
            style = self.player_play_style.get(addr, "unknown")
            entries.append(
                f'{{"rank":{i+1},"address":"{addr}",'
                f'"score":{score},"play_style":"{style}"}}'
            )
        return "[" + ",".join(entries) + "]"

    @gl.public.view
    def get_player_stats(self, player: str) -> str:
        """
        Returns a single player's stats as a JSON string.
        """
        best   = self.player_best_score.get(player,   u256(0))
        apples = self.player_total_apples.get(player, u256(0))
        games  = self.player_total_games.get(player,  u256(0))
        style  = self.player_play_style.get(player,   "unknown")
        confidence = self.player_confidence.get(player, u256(0))
        pattern = self.player_pattern.get(player, "unknown")
        risk_level = self.player_risk_level.get(player, "unknown")
        replay = self.player_replay_hash.get(player,  "")
        return (
            f'{{"address":"{player}",'
            f'"best_score":{best},'
            f'"total_apples":{apples},'
            f'"total_games":{games},'
            f'"play_style":"{style}",'
            f'"confidence":{confidence},'
            f'"pattern":"{pattern}",'
            f'"risk_level":"{risk_level}",'
            f'"last_replay_hash":"{replay}"}}'
        )

    # ═════════════════════════════════════════════════════════════════
    #  CHALLENGE REGISTRY (PvP)
    # ═════════════════════════════════════════════════════════════════

    @gl.public.write
    def create_challenge(self, challenger: str, opponent: str) -> str:
        """
        Opens a new PvP challenge. Returns the challenge ID.
        Both players must call submit_challenge_score before resolving.
        """
        self.challenge_counter = self.challenge_counter + u256(1)
        cid = str(self.challenge_counter)

        self.challenge_challenger[cid]       = challenger
        self.challenge_opponent[cid]         = opponent
        self.challenge_challenger_score[cid] = u256(0)
        self.challenge_opponent_score[cid]   = u256(0)
        self.challenge_status[cid]           = "pending"
        self.challenge_winner[cid]           = ""
        self.challenge_commentary[cid]       = ""

        return cid

    @gl.public.write
    def submit_challenge_score(
        self,
        challenge_id: str,
        player: str,
        score: u256,
    ) -> None:
        """
        Records a player's score for a given challenge.
        Can be called by either the challenger or the opponent.
        """
        cid = challenge_id
        status = self.challenge_status.get(cid, "")
        if status != "pending":
            return  # challenge already resolved or doesn't exist

        challenger = self.challenge_challenger.get(cid, "")
        opponent   = self.challenge_opponent.get(cid, "")

        if player == challenger:
            self.challenge_challenger_score[cid] = score
        elif player == opponent:
            self.challenge_opponent_score[cid] = score

    @gl.public.write
    def resolve_challenge(self, challenge_id: str) -> str:
        """
        Compares scores and sets the winner. Returns the winner's address.
        Call this after both players have submitted their scores.
        """
        cid = challenge_id
        status = self.challenge_status.get(cid, "")
        if status != "pending":
            return self.challenge_winner.get(cid, "already_resolved")

        c_score = self.challenge_challenger_score.get(cid, u256(0))
        o_score = self.challenge_opponent_score.get(cid, u256(0))

        challenger = self.challenge_challenger.get(cid, "")
        opponent   = self.challenge_opponent.get(cid, "")

        if c_score >= o_score:
            winner = challenger
        else:
            winner = opponent

        self.challenge_winner[cid] = winner
        self.challenge_status[cid] = "resolved"
        
        import json
        narrator_data = {
            "challenger_score": int(c_score),
            "opponent_score": int(o_score),
            "winner": winner
        }
        commentary_result_str = skills.run("ChallengeNarratorSkill", json.dumps(narrator_data))
        try:
            commentary_result = json.loads(commentary_result_str)
            self.challenge_commentary[cid] = commentary_result.get("commentary", "A match for the ages.")
        except:
            self.challenge_commentary[cid] = "A match for the ages."
            
        return winner

    @gl.public.view
    def get_challenge(self, challenge_id: str) -> str:
        """
        Returns challenge details as a JSON string.
        """
        cid = challenge_id
        return (
            f'{{"challenge_id":"{cid}",'
            f'"challenger":"{self.challenge_challenger.get(cid,"")}",'
            f'"opponent":"{self.challenge_opponent.get(cid,"")}",'
            f'"challenger_score":{self.challenge_challenger_score.get(cid, u256(0))},'
            f'"opponent_score":{self.challenge_opponent_score.get(cid, u256(0))},'
            f'"status":"{self.challenge_status.get(cid,"")}",'
            f'"winner":"{self.challenge_winner.get(cid,"")}",'
            f'"commentary":"{self.challenge_commentary.get(cid,"")}"'
            f'}}'
        )

    # ═════════════════════════════════════════════════════════════════
    #  SOCIAL & RETENTION (Profiles, Clans, Referrals)
    # ═════════════════════════════════════════════════════════════════

    @gl.public.write
    def update_profile(self, player: str, display_name: str, bio: str, avatar_uri: str) -> None:
        """Updates a player's profile info. Gives 'early_adopter' badge on first setup."""
        self.player_display_name[player] = display_name
        self.player_bio[player] = bio
        self.player_avatar_uri[player] = avatar_uri
        
        # Check if first time
        if self.player_joined_at.get(player, u256(0)) == u256(0):
            import time
            self.player_joined_at[player] = u256(int(time.time()))
            
            # Add early adopter badge
            import json
            badges_str = self.player_badges.get(player, "[]")
            try:
                badges = json.loads(badges_str)
            except:
                badges = []
            
            if "Early Adopter" not in badges:
                badges.append("Early Adopter")
                self.player_badges[player] = json.dumps(badges)

    @gl.public.view
    def get_full_profile(self, player: str) -> str:
        """Returns the complete social and game stats profile."""
        import json
        
        # Base stats
        best = self.player_best_score.get(player, u256(0))
        apples = self.player_total_apples.get(player, u256(0))
        games = self.player_total_games.get(player, u256(0))
        style = self.player_play_style.get(player, "Unknown")
        confidence = self.player_confidence.get(player, u256(0))
        pattern = self.player_pattern.get(player, "Unknown")
        risk_level = self.player_risk_level.get(player, "Unknown")
        replay = self.player_replay_hash.get(player, "")
        
        # Social
        display_name = self.player_display_name.get(player, "")
        bio = self.player_bio.get(player, "")
        avatar = self.player_avatar_uri.get(player, "")
        joined = self.player_joined_at.get(player, u256(0))
        badges = self.player_badges.get(player, "[]")
        
        # Clan
        clan_id = self.player_clan.get(player, "")
        
        # Referrals
        refs = self.player_referral_count.get(player, u256(0))

        # We construct a clean dict and dump it
        profile_data = {
            "address": player,
            "display_name": display_name,
            "bio": bio,
            "avatar_uri": avatar,
            "joined_at": int(joined),
            "badges": json.loads(badges) if badges != "[]" else [],
            "clan_id": clan_id,
            "referrals": int(refs),
            "game_stats": {
                "best_score": int(best),
                "total_apples": int(apples),
                "total_games": int(games),
                "play_style": style,
                "confidence": int(confidence),
                "pattern": pattern,
                "risk_level": risk_level,
                "last_replay_hash": replay
            }
        }
        return json.dumps(profile_data)

    @gl.public.write
    def create_clan(self, player: str, name: str, tag: str, description: str) -> str:
        self.clan_counter = self.clan_counter + u256(1)
        cid = str(self.clan_counter)
        
        self.clan_owner[cid] = player
        self.clan_name[cid] = name
        self.clan_tag[cid] = tag
        self.clan_description[cid] = description
        self.clan_score[cid] = u256(0)
        
        import json
        self.clan_members[cid] = json.dumps([player])
        self.player_clan[player] = cid
        
        return cid

    @gl.public.write
    def join_clan(self, player: str, clan_id: str) -> None:
        """Adds a player to a clan if they aren't already in one."""
        current_clan = self.player_clan.get(player, "")
        if current_clan != "":
            return # Already in a clan
            
        import json
        members_str = self.clan_members.get(clan_id, "[]")
        try:
            members = json.loads(members_str)
        except:
            members = []
            
        if player not in members and len(members) < 50:
            members.append(player)
            self.clan_members[clan_id] = json.dumps(members)
            self.player_clan[player] = clan_id
            
            # Add their best score to clan total
            best = self.player_best_score.get(player, u256(0))
            self.clan_score[clan_id] = self.clan_score.get(clan_id, u256(0)) + best

    @gl.public.write
    def leave_clan(self, player: str) -> None:
        clan_id = self.player_clan.get(player, "")
        if clan_id == "":
            return
            
        import json
        members_str = self.clan_members.get(clan_id, "[]")
        try:
            members = json.loads(members_str)
        except:
            members = []
            
        if player in members:
            members.remove(player)
            self.clan_members[clan_id] = json.dumps(members)
            self.player_clan[player] = ""
            
            # Subtract best score
            best = self.player_best_score.get(player, u256(0))
            current_clan_score = self.clan_score.get(clan_id, u256(0))
            if current_clan_score >= best:
                self.clan_score[clan_id] = current_clan_score - best
            else:
                self.clan_score[clan_id] = u256(0)

    @gl.public.view
    def get_clan(self, clan_id: str) -> str:
        import json
        clan_data = {
            "clan_id": clan_id,
            "name": self.clan_name.get(clan_id, ""),
            "tag": self.clan_tag.get(clan_id, ""),
            "description": self.clan_description.get(clan_id, ""),
            "owner": self.clan_owner.get(clan_id, ""),
            "score": int(self.clan_score.get(clan_id, u256(0))),
            "members": json.loads(self.clan_members.get(clan_id, "[]"))
        }
        return json.dumps(clan_data)

    @gl.public.write
    def register_referral(self, player: str, referrer: str) -> None:
        """Registers a referral if the player doesn't already have one."""
        if player == referrer:
            return
            
        current_ref = self.player_referrer.get(player, "")
        if current_ref == "":
            self.player_referrer[player] = referrer
            self.player_referral_count[referrer] = self.player_referral_count.get(referrer, u256(0)) + u256(1)
            
            # Reward: Give the referrer a badge
            import json
            badges_str = self.player_badges.get(referrer, "[]")
            try:
                badges = json.loads(badges_str)
            except:
                badges = []
            
            if "Top Inviter" not in badges:
                badges.append("Top Inviter")
                self.player_badges[referrer] = json.dumps(badges)
