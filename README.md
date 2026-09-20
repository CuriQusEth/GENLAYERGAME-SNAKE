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

### 5. On-Chain Badges & Achievements
Tracked and minted via `SnakeBadges.py`:
- **First Blood**: Submit your first verified score on-chain.
- **Century Club**: Attain a single-game score of 100+ points.
- **Apple Hoarder**: Eat 50 cumulative apples across all sessions.
- **Challenger**: Duel and defeat an opponent in 1v1 PvP.
- **Style Master**: Complete cognitive playstyle analysis.

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
