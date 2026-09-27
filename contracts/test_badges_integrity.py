# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""
Test Suite: SnakeChain Badge Verification Integrity
Verifies that badges CANNOT be earned with fake scores, fake challenge wins,
or identity theft, and that badges are strictly gated by verified on-chain state.
"""

import sys
import os
import types

# Ensure contracts directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Standalone execution harness when run directly with python3 outside GenLayer VM
if "genlayer" not in sys.modules:
    genlayer_mod = types.ModuleType("genlayer")

    class u256(int):
        def __ge__(self, other):
            return int(self) >= int(other)
        def __le__(self, other):
            return int(self) <= int(other)
        def __gt__(self, other):
            return int(self) > int(other)
        def __lt__(self, other):
            return int(self) < int(other)
        def __add__(self, other):
            return u256(int(self) + int(other))
        def __sub__(self, other):
            return u256(max(0, int(self) - int(other)))

    class TreeMap(dict):
        def get(self, k, default=None):
            val = super().get(k, default)
            return val if val is not None else default

    class DynArray(list):
        pass

    class gl:
        class Contract:
            pass
        class public:
            @staticmethod
            def write(fn):
                return fn
            @staticmethod
            def view(fn):
                return fn

    genlayer_mod.u256 = u256
    genlayer_mod.TreeMap = TreeMap
    genlayer_mod.DynArray = DynArray
    genlayer_mod.gl = gl
    sys.modules["genlayer"] = genlayer_mod
else:
    from genlayer import *

# Import contracts
try:
    from contracts.SnakeGame import SnakeGame
    from contracts.SnakeBadges import SnakeBadges
except ImportError:
    from SnakeGame import SnakeGame
    from SnakeBadges import SnakeBadges

PLAYER_A = "0xAAA0000000000000000000000000000000000001"
PLAYER_B = "0xBBB0000000000000000000000000000000000002"

def create_fresh_game() -> SnakeGame:
    game = SnakeGame()
    # Initialize TreeMaps
    game.player_best_score = TreeMap()
    game.player_total_apples = TreeMap()
    game.player_total_games = TreeMap()
    game.player_play_style = TreeMap()
    game.player_confidence = TreeMap()
    game.player_pattern = TreeMap()
    game.player_risk_level = TreeMap()
    game.player_replay_hash = TreeMap()
    game.player_verdict = TreeMap()
    game.player_validator_assessment = TreeMap()
    game.player_last_verified_score = TreeMap()
    game.challenge_challenger = TreeMap()
    game.challenge_opponent = TreeMap()
    game.challenge_challenger_score = TreeMap()
    game.challenge_opponent_score = TreeMap()
    game.challenge_status = TreeMap()
    game.challenge_winner = TreeMap()
    game.challenge_commentary = TreeMap()
    game.player_challenge_wins = TreeMap()
    game.player_display_name = TreeMap()
    game.player_bio = TreeMap()
    game.player_avatar_uri = TreeMap()
    game.player_joined_at = TreeMap()
    game.player_badges = TreeMap()
    game.clan_owner = TreeMap()
    game.clan_name = TreeMap()
    game.clan_tag = TreeMap()
    game.clan_description = TreeMap()
    game.clan_members = TreeMap()
    game.clan_score = TreeMap()
    game.player_clan = TreeMap()
    game.player_referrer = TreeMap()
    game.player_referral_count = TreeMap()
    return game

def create_fresh_badges() -> SnakeBadges:
    badges = SnakeBadges()
    badges.player_badges = TreeMap()
    return badges


def test_fake_score_cannot_earn_century_club():
    """Çağıran 9999 skor iddia etse bile, VALID kayıt yoksa century_club yok."""
    game = create_fresh_game()
    # Sahte: hiç submit_score yok / INVALID
    game.player_verdict[PLAYER_A] = "INVALID"
    game.player_best_score[PLAYER_A] = u256(0)
    game.player_total_games[PLAYER_A] = u256(0)

    newly = game.claim_badges(PLAYER_A)
    badges = game.player_badges.get(PLAYER_A, "")

    assert "century_club" not in badges, "Security violation: century_club unlocked with INVALID verdict"
    assert "first_blood" not in badges, "Security violation: first_blood unlocked with INVALID verdict"
    assert newly == "", f"Expected empty newly granted badges, got {newly}"
    print("  [PASS] test_fake_score_cannot_earn_century_club")


def test_fake_win_cannot_earn_challenger():
    """has_won_challenge parametresi yok; win sayacı 0 iken Challenger yok."""
    game = create_fresh_game()
    # Meşru bir VALID oyun var ama challenge win yok
    game.player_verdict[PLAYER_A] = "VALID"
    game.player_best_score[PLAYER_A] = u256(50)
    game.player_total_games[PLAYER_A] = u256(1)
    game.player_total_apples[PLAYER_A] = u256(5)
    game.player_play_style[PLAYER_A] = "efficient"
    game.player_challenge_wins[PLAYER_A] = u256(0)

    newly = game.claim_badges(PLAYER_A)
    badges = game.player_badges.get(PLAYER_A, "")

    assert "challenger" not in badges, "Security violation: challenger unlocked with 0 verified wins"
    assert "first_blood" in badges, "Expected first_blood to be unlocked for verified game"
    print("  [PASS] test_fake_win_cannot_earn_challenger")


def test_other_player_identity_cannot_steal_badges():
    """B, A'nın doğrulanmış skorunu kendi adına claim edemez."""
    game = create_fresh_game()
    # A gerçekten VALID + yüksek skor
    game.player_verdict[PLAYER_A] = "VALID"
    game.player_best_score[PLAYER_A] = u256(200)
    game.player_total_games[PLAYER_A] = u256(3)
    game.player_total_apples[PLAYER_A] = u256(60)
    game.player_play_style[PLAYER_A] = "aggressive"
    game.player_challenge_wins[PLAYER_A] = u256(1)

    # B boş / INVALID
    game.player_verdict[PLAYER_B] = ""
    game.player_best_score[PLAYER_B] = u256(0)
    game.player_total_games[PLAYER_B] = u256(0)
    game.player_challenge_wins[PLAYER_B] = u256(0)

    game.claim_badges(PLAYER_B)
    badges_b = game.player_badges.get(PLAYER_B, "")

    assert badges_b == "" or (
        "century_club" not in badges_b
        and "apple_hoarder" not in badges_b
        and "challenger" not in badges_b
    ), "Security violation: Player B was able to steal Player A's achievements"

    # A claim ederse kendi kaydından alır
    newly_a = game.claim_badges(PLAYER_A)
    badges_a = game.player_badges.get(PLAYER_A, "")
    assert "century_club" in badges_a
    assert "apple_hoarder" in badges_a
    assert "challenger" in badges_a
    assert "first_blood" in badges_a
    assert newly_a != ""
    print("  [PASS] test_other_player_identity_cannot_steal_badges")


def test_legitimate_verified_record_earns_badges():
    """submit_score VALID yolu ile yazılmış kayıt → rozetler verilir."""
    game = create_fresh_game()
    # Simüle edilmiş meşru VALID kayıt (gerçek akışta submit_score yazar)
    game.player_verdict[PLAYER_A] = "VALID"
    game.player_last_verified_score[PLAYER_A] = u256(150)
    game.player_best_score[PLAYER_A] = u256(150)
    game.player_total_apples[PLAYER_A] = u256(55)
    game.player_total_games[PLAYER_A] = u256(2)
    game.player_play_style[PLAYER_A] = "efficient"
    game.player_challenge_wins[PLAYER_A] = u256(1)

    newly = game.claim_badges(PLAYER_A)
    badges = game.player_badges.get(PLAYER_A, "")

    assert "first_blood" in badges
    assert "century_club" in badges
    assert "apple_hoarder" in badges
    assert "style_master" in badges
    assert "challenger" in badges
    assert newly != ""
    print("  [PASS] test_legitimate_verified_record_earns_badges")


def test_invalid_submit_does_not_update_best_or_badges():
    """INVALID verdict → best 0 kalır, claim rozet vermez."""
    game = create_fresh_game()
    game.player_verdict[PLAYER_A] = "INVALID"
    game.player_last_verified_score[PLAYER_A] = u256(0)
    game.player_best_score[PLAYER_A] = u256(0)
    game.player_total_games[PLAYER_A] = u256(1)  # deneme olmuş olabilir

    newly = game.claim_badges(PLAYER_A)
    assert newly == ""
    assert "century_club" not in game.player_badges.get(PLAYER_A, "")
    assert "first_blood" not in game.player_badges.get(PLAYER_A, "")
    print("  [PASS] test_invalid_submit_does_not_update_best_or_badges")


def test_old_badges_contract_blocks_arbitrary_stats_call():
    """Eski SnakeBadges kontratı çağrılsa bile istatistik kabul etmez ve güvenli bir şekilde kilitlenmiştir."""
    badges = create_fresh_badges()
    try:
        badges.claim_badges(PLAYER_A)
        assert False, "Should have raised exception when calling legacy claim_badges"
    except Exception as e:
        assert "Use SnakeGame.claim_badges" in str(e)
    print("  [PASS] test_old_badges_contract_blocks_arbitrary_stats_call")


def test_resolve_challenge_increments_winner_challenge_wins():
    """resolve_challenge kazananın player_challenge_wins sayacını on-chain artırır."""
    game = create_fresh_game()
    cid = game.create_challenge(PLAYER_A, PLAYER_B)
    game.challenge_challenger_score[cid] = u256(180)
    game.challenge_opponent_score[cid] = u256(120)

    winner = game.resolve_challenge(cid)
    assert winner == PLAYER_A
    assert game.player_challenge_wins.get(PLAYER_A, u256(0)) == u256(1)
    assert game.player_challenge_wins.get(PLAYER_B, u256(0)) == u256(0)

    # Now verify Challenger badge can be claimed ONLY after game is verified
    game.player_verdict[PLAYER_A] = "VALID"
    game.player_total_games[PLAYER_A] = u256(1)
    game.claim_badges(PLAYER_A)
    assert "challenger" in game.player_badges.get(PLAYER_A, "")
    print("  [PASS] test_resolve_challenge_increments_winner_challenge_wins")


def run_all_tests():
    print("=" * 60)
    print("SNAKECHAIN BADGE ON-CHAIN INTEGRITY VERIFICATION SUITE")
    print("=" * 60)
    test_fake_score_cannot_earn_century_club()
    test_fake_win_cannot_earn_challenger()
    test_other_player_identity_cannot_steal_badges()
    test_legitimate_verified_record_earns_badges()
    test_invalid_submit_does_not_update_best_or_badges()
    test_old_badges_contract_blocks_arbitrary_stats_call()
    test_resolve_challenge_increments_winner_challenge_wins()
    print("=" * 60)
    print("ALL 7 CONTRACT INTEGRITY TESTS PASSED SUCCESSFULLY! (100% OK)")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
