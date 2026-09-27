# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class SnakeBadges(gl.Contract):

    player_badges: TreeMap[str, str]

    def __init__(self) -> None:
        pass

    @gl.public.write
    def claim_badges(self, player: str) -> str:
        """
        Guarded against fabricated statistics.
        Badges can ONLY be claimed from SnakeGame verified on-chain state.
        """
        raise Exception("Use SnakeGame.claim_badges(player); badges read verified records only")

    @gl.public.view
    def get_player_badges(self, player: str) -> str:
        return self.player_badges.get(player, "")

    @gl.public.view
    def get_all_badges_info(self) -> str:
        result = "["
        result = result + '{"id":"first_blood","name":"First Blood","description":"First score on-chain","icon":"1"},'
        result = result + '{"id":"century_club","name":"Century Club","description":"Score 100 or higher","icon":"2"},'
        result = result + '{"id":"apple_hoarder","name":"Apple Hoarder","description":"Eat 50 apples total","icon":"3"},'
        result = result + '{"id":"style_master","name":"Style Master","description":"Clear AI play style","icon":"4"},'
        result = result + '{"id":"challenger","name":"Challenger","description":"Win a PvP challenge","icon":"5"}'
        result = result + "]"
        return result
