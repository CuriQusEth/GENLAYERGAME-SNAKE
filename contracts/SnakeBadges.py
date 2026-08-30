# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class SnakeBadges(gl.Contract):

    player_badges: TreeMap[str, str]

    def __init__(self) -> None:
        pass

    @gl.public.write
    def claim_badges(
        self,
        player: str,
        best_score: u256,
        total_apples: u256,
        total_games: u256,
        play_style: str,
        has_won_challenge: u256,
    ) -> str:

        current = self.player_badges.get(player, "")
        newly = ""

        if total_games >= u256(1):
            if current == "":
                current = "first_blood"
                newly = "first_blood"
            else:
                current = current + ",first_blood"
                newly = "first_blood"

        if best_score >= u256(100):
            if current == "":
                current = "century_club"
            else:
                current = current + ",century_club"
            if newly == "":
                newly = "century_club"
            else:
                newly = newly + ",century_club"

        if total_apples >= u256(50):
            if current == "":
                current = "apple_hoarder"
            else:
                current = current + ",apple_hoarder"
            if newly == "":
                newly = "apple_hoarder"
            else:
                newly = newly + ",apple_hoarder"

        if play_style != "unknown":
            if current == "":
                current = "style_master"
            else:
                current = current + ",style_master"
            if newly == "":
                newly = "style_master"
            else:
                newly = newly + ",style_master"

        if has_won_challenge == u256(1):
            if current == "":
                current = "challenger"
            else:
                current = current + ",challenger"
            if newly == "":
                newly = "challenger"
            else:
                newly = newly + ",challenger"

        self.player_badges[player] = current
        return newly

    @gl.public.view
    def get_player_badges(self, player: str) -> str:
        return self.player_badges.get(player, "")

    @gl.public.view
    def get_all_badges_info(self) -> str:
        result = "["
        result = result + '{"id":"first_blood","name":"First Blood","description":"First score on-chain"},'
        result = result + '{"id":"century_club","name":"Century Club","description":"Score 100 or higher"},'
        result = result + '{"id":"apple_hoarder","name":"Apple Hoarder","description":"Eat 50 apples total"},'
        result = result + '{"id":"style_master","name":"Style Master","description":"Clear AI play style"},'
        result = result + '{"id":"challenger","name":"Challenger","description":"Win a PvP challenge"}'
        result = result + "]"
        return result
