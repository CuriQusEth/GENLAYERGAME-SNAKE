# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class SnakeBadges(gl.Contract):
    # player -> badge_id -> unlocked (1 = true)
    player_badges: TreeMap[str, TreeMap[str, u256]]
    
    # Optional: track when it was unlocked
    badge_unlocked_at: TreeMap[str, TreeMap[str, u256]]  # timestamp or block

    def __init__(self) -> None:
        self.player_badges = TreeMap[str, TreeMap[str, u256]]()
        self.badge_unlocked_at = TreeMap[str, TreeMap[str, u256]]()

    @gl.public.write
    def claim_badges(
        self,
        player: str,
        best_score: u256,
        total_apples: u256,
        total_games: u256,
        play_style: str,
        confidence: u256,
        has_won_challenge: bool,
    ) -> str:
        """
        Player (or frontend) submits current stats.
        Contract evaluates and unlocks eligible badges.
        Returns JSON list of newly unlocked badges.
        """
        if player not in self.player_badges:
            self.player_badges[player] = TreeMap[str, u256]()

        badges = self.player_badges[player]
        newly_unlocked = []

        # 1. First Blood
        if total_games >= u256(1) and badges.get("first_blood", u256(0)) == u256(0):
            badges["first_blood"] = u256(1)
            newly_unlocked.append("first_blood")

        # 2. Century Club
        if best_score >= u256(100) and badges.get("century_club", u256(0)) == u256(0):
            badges["century_club"] = u256(1)
            newly_unlocked.append("century_club")

        # 3. Apple Hoarder
        if total_apples >= u256(50) and badges.get("apple_hoarder", u256(0)) == u256(0):
            badges["apple_hoarder"] = u256(1)
            newly_unlocked.append("apple_hoarder")

        # 4. Style Master
        if (play_style != "unknown" and confidence >= u256(70) 
            and badges.get("style_master", u256(0)) == u256(0)):
            badges["style_master"] = u256(1)
            newly_unlocked.append("style_master")

        # 5. Challenger
        if has_won_challenge and badges.get("challenger", u256(0)) == u256(0):
            badges["challenger"] = u256(1)
            newly_unlocked.append("challenger")

        return "[" + ",".join([f'"{b}"' for b in newly_unlocked]) + "]"

    @gl.public.view
    def get_player_badges(self, player: str) -> str:
        if player not in self.player_badges:
            return "[]"
        
        unlocked = []
        badges = self.player_badges[player]
        for badge_id in ["first_blood", "century_club", "apple_hoarder", "style_master", "challenger"]:
            if badges.get(badge_id, u256(0)) == u256(1):
                unlocked.append(f'"{badge_id}"')
        return "[" + ",".join(unlocked) + "]"

    @gl.public.view
    def get_all_badges_info(self) -> str:
        return '''[
            {"id":"first_blood","name":"First Blood","description":"Submit your first score on-chain","icon":"🩸"},
            {"id":"century_club","name":"Century Club","description":"Reach a score of 100 or higher","icon":"💯"},
            {"id":"apple_hoarder","name":"Apple Hoarder","description":"Eat 50 apples in total","icon":"🍎"},
            {"id":"style_master","name":"Style Master","description":"Receive a clear AI play-style (70%+ confidence)","icon":"🎯"},
            {"id":"challenger","name":"Challenger","description":"Win at least one PvP challenge","icon":"⚔️"}
        ]'''
