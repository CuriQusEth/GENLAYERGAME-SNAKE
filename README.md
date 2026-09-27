# 🐍 SNAKECHAIN: Proof of Play & On-Chain AI Validator Consensus

A fully decentralized, AI-consensus audited Web3 arcade game deployed on **GenLayer Studio Next (Chain ID 61997)**. Experience high-octane competitive snake gameplay backed by on-chain cognitive classification, non-deterministic validator consensus, and cryptographic replay verification.

---

## 🛡️ GenLayer Validator Consensus (Studio Next Chain 61997)

Unlike conventional Web3 games where the smart contract blindly trusts client-reported scores, **SnakeChain enforces substantial contract-side verification**:

1. **Substantial Contract Physics Invariant Audit**:
   - Every submitted score undergoes mathematical invariant checking on-chain.
   - Impossible score-to-apple ratios, zero-second survival exploits, or anomalous velocities are immediately identified.

2. **On-Chain Validator Consensus (`gl.nondet.exec_prompt`)**:
   - Telemetry (score, apples, survival seconds, wall collisions, replay hash, and playstyle insight) is dispatched to GenLayer validators.
   - Validators run LLM inference directly within the smart contract execution environment to assess the legitimacy of the run and determine a definitive verdict: **`VALID`** or **`INVALID`**.

3. **Equivalence Principle Consensus (`gl.eq_principle.prompt_comparative`)**:
   - Validators must reach democratic consensus on the game outcome before the transaction is finalized.
   - Only scores sealed as **`VALID`** are admitted to the global on-chain leaderboard.

4. **Persistent On-Chain Audit Records**:
   - `player_verdict`: Stores `"VALID"` or `"INVALID"`.
   - `player_validator_assessment`: Stores the official validator justification.
   - `player_last_verified_score`: Stores the authenticated high score.

---

## 🌐 Network Configuration: Studio Next (61997)

Connect your Web3 wallet (MetaMask, Rabby) to GenLayer Studio Next:

| Parameter | Value |
| :--- | :--- |
| **Network Name** | GenLayer Studio Next |
| **Chain ID** | `61997` (`0xf22d`) |
| **RPC URL** | `https://studio-dev.genlayer.com/api` |
| **Currency Symbol** | `GEN` |
| **Decimals** | `18` |
| **Block Explorer** | `https://genlayer-explorer.vercel.app` |

*The application includes an automated one-click network switcher (`Switch to 61997`) directly in the header.*

---

## 🎮 Complete Gameplay & Mechanics

### 1. Movement & Controls
- **Arrow Keys** (`↑`, `↓`, `←`, `→`) or **WASD**: Control the snake's direction.
- **Grid Dimension**: 20x20 matrix grid with 100ms movement ticks.
- **Physics**: Wall collision and self-collision result in game over.

### 2. Objectives & Scoring System
- **Regular Apples**: +100 base score points per apple eaten. Each apple increases snake length by 1 segment.
- **Survival Bonus**: Score accumulates dynamically as survival time increases.
- **Black Hole & Multipliers**: Rare cosmic anomalies provide 2x score multipliers and warp segments across opposite axes.

### 3. Cryptographic Replay Proof (SHA-256)
- Every movement vector is logged in real-time.
- Upon game over, client generates a deterministic `SHA-256` replay hash of all chronological inputs.
- The replay hash is submitted to the contract alongside the telemetry, ensuring tamper-proof reproducibility.

### 4. On-Chain Cognitive Playstyle Classification
- The contract categorizes players into distinct playstyle archetypes:
  - **Aggressive**: High velocity, close wall maneuvers, rapid apple acquisition.
  - **Cautious**: Defensive circling, high survival duration, calculated turns.
  - **Efficient**: Optimal path-finding with minimal redundant steps.
  - **Chaotic**: Unpredictable rapid direction changes and high-risk maneuvers.

### 5. On-Chain Badges & Verified Achievements
Badges are governed by an **immutable verified on-chain state model**. The smart contract strictly forbids client-supplied statistics:
- **First Blood**: Unlocked only after at least 1 gameplay run with a consensus verdict of **`VALID`**.
- **Century Club**: Requires verified high score (`best_score >= 100`) recorded under a `VALID` consensus run.
- **Apple Hoarder**: Requires cumulative apples (`total_apples >= 50`) collected in verified gameplay.
- **Style Master**: Assigned based on the on-chain GenLayer validator cognitive classification.
- **Challenger**: Requires winning an asynchronous 1v1 duel (`player_challenge_wins >= 1`), written exclusively by `resolve_challenge`.

---

## 🔒 Immutable Record Verification & Badge Security Architecture

### 1. Problem Solved: Parameter Spoofing Prevention
In naive designs, badge claiming methods trust client parameters (`best_score`, `total_apples`, `has_won_challenge`). This allows malicious actors to forge high scores, claim unearned badges, or misappropriate another player's address.

In SnakeChain, **all badge eligibility is calculated strictly and solely from verified on-chain storage inside `SnakeGame.py`**. The caller cannot pass any metrics:
```python
# Secured signature: Only the player address is provided
@gl.public.write
def claim_badges(self, player: str) -> str:
    verdict = self.player_verdict.get(player, "")
    if verdict != "VALID":
        return ""  # Unverified or INVALID run -> NO badges
    ...
```

### 2. Immutable Source Comparison Model

| Storage Record | Written By | Badge Logic Usage |
| :--- | :--- | :--- |
| `player_last_verified_score` | Only `submit_score` + `verdict == VALID` | Yes (verified history) |
| `player_best_score` | Only `VALID` consensus branch | Yes (`century_club`) |
| `player_verdict` | GenLayer AI Validator consensus | **Security Gate**: Must be `"VALID"` |
| `player_challenge_wins` | Only `resolve_challenge` | Yes (`challenger`) |
| Caller `best_score` / `apples` | Client request | **REJECTED (Removed)** |

**Immutable Acceptance Invariant:**
```text
accepted_score(player) :=
  if player_verdict[player] == "VALID"
    then player_best_score[player]
    else 0

badge_eligible := accepted_score / verified apples / verified wins
                ≠ caller_supplied_stats
```

### 3. Contract Integrity Test Suite (`contracts/test_badges_integrity.py`)
A comprehensive test suite verifies the security gates:
- `test_fake_score_cannot_earn_century_club`: Assert that fabricated scores without a VALID on-chain verdict cannot unlock `century_club` or `first_blood`.
- `test_fake_win_cannot_earn_challenger`: Assert that players with 0 verified challenge wins cannot claim `challenger`.
- `test_other_player_identity_cannot_steal_badges`: Assert that Player B cannot claim badges using Player A's verified achievements.
- `test_legitimate_verified_record_earns_badges`: Assert that legitimate records signed off with `VALID` correctly unlock earned badges.
- `test_invalid_submit_does_not_update_best_or_badges`: Assert that scores with an `INVALID` verdict are never committed to best score or badge eligibility.
- `test_old_badges_contract_blocks_arbitrary_stats_call`: Assert that the legacy badge contract raises an exception and rejects arbitrary parameters.
- `test_resolve_challenge_increments_winner_challenge_wins`: Assert that only contract-mediated duel resolution increments the challenge win counter.

To run the verification suite:
```bash
python3 contracts/test_badges_integrity.py
```

### 6. PvP Challenge Arena
- Challenge any wallet address to a 1v1 asynchronous snake duel.
- Both competitors record their runs; the smart contract evaluates scores, resolves the winner, and awards on-chain bragging rights.

### 7. Clan Synergy
- Create or join on-chain Clans with unique clan tags and descriptions.
- Cumulative member scores aggregate into the Global Clan Leaderboard.

---

## 🏗️ Smart Contract Architecture

The project is driven by two intelligent Python contracts:

- **`contracts/SnakeGame.py`**:
  - Contains core telemetry validation, GenLayer validator consensus logic (`gl.nondet` & `gl.eq_principle`), leaderboard ranking, challenge arbitration, and clan management.
- **`contracts/SnakeBadges.py`**:
  - Implements dynamic badge minting and performance milestone validation.

---

## 💻 Local Development & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or edit `.env`:
```env
VITE_CONTRACT_ADDRESS=0xc0e6b7C203cbebb17402aA2C097c9669d2744f8a
VITE_BADGE_CONTRACT_ADDRESS=0x254Fbc1Be7419ECc88361fd121A049Cb603E6B70
VITE_GENLAYER_RPC_URL=https://studio-dev.genlayer.com/api
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
