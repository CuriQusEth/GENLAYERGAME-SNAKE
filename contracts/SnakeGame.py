# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class SnakeGame(gl.Contract):
    # ─── Persistent Storage ───────────────────────────────────────────
    player_best_score:   TreeMap[str, u256]
    player_total_apples: TreeMap[str, u256]
    player_total_games:  TreeMap[str, u256]
    player_play_style:   TreeMap[str, str]
    player_confidence:   TreeMap[str, u256]
    player_pattern:      TreeMap[str, str]
    player_risk_level:   TreeMap[str, str]
    player_replay_hash:  TreeMap[str, str]

    leaderboard_addresses: DynArray[str]
    leaderboard_scores:    DynArray[u256]

    challenge_challenger:       TreeMap[str, str]
    challenge_opponent:         TreeMap[str, str]
    challenge_challenger_score: TreeMap[str, u256]
    challenge_opponent_score:   TreeMap[str, u256]
    challenge_status:           TreeMap[str, str]
    challenge_winner:           TreeMap[str, str]
    challenge_commentary:       TreeMap[str, str]
    challenge_counter:          u256

    player_display_name: TreeMap[str, str]
    player_bio:          TreeMap[str, str]
    player_avatar_uri:   TreeMap[str, str]
    player_joined_at:    TreeMap[str, u256]
    player_badges:       TreeMap[str, str] # Comma separated
    
    clan_counter:        u256
    clan_owner:          TreeMap[str, str]
    clan_name:           TreeMap[str, str]
    clan_tag:            TreeMap[str, str]
    clan_description:    TreeMap[str, str]
    clan_members:        TreeMap[str, str] # Comma separated
    clan_score:          TreeMap[str, u256]
    player_clan:         TreeMap[str, str]

    player_referrer:       TreeMap[str, str]
    player_referral_count: TreeMap[str, u256]

    def __init__(self) -> None:
        self.leaderboard_addresses = DynArray[str]([])
        self.leaderboard_scores    = DynArray[u256]([])
        self.challenge_counter     = u256(0)
        self.clan_counter          = u256(0)

    @gl.public.write
    def submit_score(self, player: str, score: u256, apples_eaten: u256, survival_seconds: u256, deaths_near_wall: u256, replay_hash: str, insight: str = "") -> None:
        prev_apples = self.player_total_apples.get(player, u256(0))
        prev_games  = self.player_total_games.get(player, u256(0))

        self.player_total_apples[player] = prev_apples + apples_eaten
        self.player_total_games[player]  = prev_games  + u256(1)
        self.player_replay_hash[player]  = replay_hash

        prev_best = self.player_best_score.get(player, u256(0))
        if score > prev_best:
            self.player_best_score[player] = score
            self._update_leaderboard(player, score)

        self.player_play_style[player] = "unknown"
        self.player_confidence[player] = u256(0)
        self.player_pattern[player] = "frontend_analyzed"
        self.player_risk_level[player] = insight if insight else "unknown"

    def _update_leaderboard(self, player: str, score: u256) -> None:
        MAX = 10
        new_addresses = DynArray[str]([])
        new_scores    = DynArray[u256]([])
        for i in range(len(self.leaderboard_addresses)):
            if self.leaderboard_addresses[i] != player:
                new_addresses.append(self.leaderboard_addresses[i])
                new_scores.append(self.leaderboard_scores[i])

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

        trimmed_addresses = DynArray[str]([])
        trimmed_scores    = DynArray[u256]([])
        for i in range(min(MAX, len(final_addresses))):
            trimmed_addresses.append(final_addresses[i])
            trimmed_scores.append(final_scores[i])

        self.leaderboard_addresses = trimmed_addresses
        self.leaderboard_scores    = trimmed_scores

    @gl.public.view
    def get_leaderboard(self) -> str:
        entries = []
        for i in range(len(self.leaderboard_addresses)):
            addr  = self.leaderboard_addresses[i]
            score = self.leaderboard_scores[i]
            style = self.player_play_style.get(addr, "unknown")
            entries.append(f'{{"rank":{i+1},"address":"{addr}","score":{score},"play_style":"{style}"}}')
        return "[" + ",".join(entries) + "]"

    @gl.public.view
    def get_player_stats(self, player: str) -> str:
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

    @gl.public.write
    def create_challenge(self, challenger: str, opponent: str) -> str:
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
    def submit_challenge_score(self, challenge_id: str, player: str, score: u256) -> None:
        cid = challenge_id
        if self.challenge_status.get(cid, "") != "pending":
            return
        if player == self.challenge_challenger.get(cid, ""):
            self.challenge_challenger_score[cid] = score
        elif player == self.challenge_opponent.get(cid, ""):
            self.challenge_opponent_score[cid] = score

    @gl.public.write
    def resolve_challenge(self, challenge_id: str) -> str:
        cid = challenge_id
        if self.challenge_status.get(cid, "") != "pending":
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
        self.challenge_commentary[cid] = "A match for the ages."
        return winner

    @gl.public.view
    def get_challenge(self, challenge_id: str) -> str:
        cid = challenge_id
        return (
            f'{{"challenge_id":"{cid}",'
            f'"challenger":"{self.challenge_challenger.get(cid,"")}",'
            f'"opponent":"{self.challenge_opponent.get(cid,"")}",'
            f'"challenger_score":{self.challenge_challenger_score.get(cid, u256(0))},'
            f'"opponent_score":{self.challenge_opponent_score.get(cid, u256(0))},'
            f'"status":"{self.challenge_status.get(cid,"")}",'
            f'"winner":"{self.challenge_winner.get(cid,"")}",'
            f'"commentary":"{self.challenge_commentary.get(cid,"")}"}}'
        )

    @gl.public.write
    def update_profile(self, player: str, display_name: str, bio: str, avatar_uri: str) -> None:
        self.player_display_name[player] = display_name
        self.player_bio[player] = bio
        self.player_avatar_uri[player] = avatar_uri
        if self.player_joined_at.get(player, u256(0)) == u256(0):
            self.player_joined_at[player] = u256(1)
            badges = self.player_badges.get(player, "")
            if "Early Adopter" not in badges:
                if badges == "":
                    self.player_badges[player] = "Early Adopter"
                else:
                    self.player_badges[player] = badges + ",Early Adopter"

    @gl.public.view
    def get_full_profile(self, player: str) -> str:
        best = self.player_best_score.get(player, u256(0))
        apples = self.player_total_apples.get(player, u256(0))
        games = self.player_total_games.get(player, u256(0))
        style = self.player_play_style.get(player, "Unknown")
        confidence = self.player_confidence.get(player, u256(0))
        pattern = self.player_pattern.get(player, "Unknown")
        risk_level = self.player_risk_level.get(player, "Unknown")
        replay = self.player_replay_hash.get(player, "")
        
        display_name = self.player_display_name.get(player, "")
        bio = self.player_bio.get(player, "")
        avatar = self.player_avatar_uri.get(player, "")
        joined = self.player_joined_at.get(player, u256(0))
        
        badges_str = self.player_badges.get(player, "")
        if badges_str == "":
            badges_json = "[]"
        else:
            badges_arr = badges_str.split(",")
            badges_json = "[" + ",".join([f'"{b}"' for b in badges_arr]) + "]"
            
        clan_id = self.player_clan.get(player, "")
        refs = self.player_referral_count.get(player, u256(0))

        return (
            f'{{"address":"{player}",'
            f'"display_name":"{display_name}",'
            f'"bio":"{bio}",'
            f'"avatar_uri":"{avatar}",'
            f'"joined_at":{joined},'
            f'"badges":{badges_json},'
            f'"clan_id":"{clan_id}",'
            f'"referrals":{refs},'
            f'"game_stats":{{'
            f'"best_score":{best},'
            f'"total_apples":{apples},'
            f'"total_games":{games},'
            f'"play_style":"{style}",'
            f'"confidence":{confidence},'
            f'"pattern":"{pattern}",'
            f'"risk_level":"{risk_level}",'
            f'"last_replay_hash":"{replay}"'
            f'}}}}'
        )

    @gl.public.write
    def create_clan(self, player: str, name: str, tag: str, description: str) -> str:
        self.clan_counter = self.clan_counter + u256(1)
        cid = str(self.clan_counter)
        self.clan_owner[cid] = player
        self.clan_name[cid] = name
        self.clan_tag[cid] = tag
        self.clan_description[cid] = description
        self.clan_score[cid] = u256(0)
        self.clan_members[cid] = player
        self.player_clan[player] = cid
        return cid

    @gl.public.write
    def join_clan(self, player: str, clan_id: str) -> None:
        current_clan = self.player_clan.get(player, "")
        if current_clan != "":
            return
        members_str = self.clan_members.get(clan_id, "")
        if members_str == "":
            members = []
        else:
            members = members_str.split(",")
            
        if player not in members and len(members) < 50:
            members.append(player)
            self.clan_members[clan_id] = ",".join(members)
            self.player_clan[player] = clan_id
            best = self.player_best_score.get(player, u256(0))
            self.clan_score[clan_id] = self.clan_score.get(clan_id, u256(0)) + best

    @gl.public.write
    def leave_clan(self, player: str) -> None:
        clan_id = self.player_clan.get(player, "")
        if clan_id == "":
            return
        members_str = self.clan_members.get(clan_id, "")
        if members_str != "":
            members = members_str.split(",")
            if player in members:
                members.remove(player)
                self.clan_members[clan_id] = ",".join(members)
                self.player_clan[player] = ""
                best = self.player_best_score.get(player, u256(0))
                current_clan_score = self.clan_score.get(clan_id, u256(0))
                if current_clan_score >= best:
                    self.clan_score[clan_id] = current_clan_score - best
                else:
                    self.clan_score[clan_id] = u256(0)

    @gl.public.view
    def get_clan(self, clan_id: str) -> str:
        name = self.clan_name.get(clan_id, "")
        tag = self.clan_tag.get(clan_id, "")
        desc = self.clan_description.get(clan_id, "")
        owner = self.clan_owner.get(clan_id, "")
        score = self.clan_score.get(clan_id, u256(0))
        
        members_str = self.clan_members.get(clan_id, "")
        if members_str == "":
            members_json = "[]"
        else:
            members_arr = members_str.split(",")
            members_json = "[" + ",".join([f'"{m}"' for m in members_arr]) + "]"
            
        return (
            f'{{"clan_id":"{clan_id}",'
            f'"name":"{name}",'
            f'"tag":"{tag}",'
            f'"description":"{desc}",'
            f'"owner":"{owner}",'
            f'"score":{score},'
            f'"members":{members_json}}}'
        )

    @gl.public.write
    def register_referral(self, player: str, referrer: str) -> None:
        if player == referrer:
            return
        if self.player_referrer.get(player, "") == "":
            self.player_referrer[player] = referrer
            self.player_referral_count[referrer] = self.player_referral_count.get(referrer, u256(0)) + u256(1)
            badges_str = self.player_badges.get(referrer, "")
            if "Top Inviter" not in badges_str:
                if badges_str == "":
                    self.player_badges[referrer] = "Top Inviter"
                else:
                    self.player_badges[referrer] = badges_str + ",Top Inviter"
