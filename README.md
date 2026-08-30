# 🐍 GenLayer Matrix Snake

A fully decentralized, AI-enhanced Web3 Snake game built on the **GenLayer** network. Experience the classic arcade game with a futuristic Matrix theme, on-chain player profiles, AI-powered playstyle analysis, and competitive PvP features.

## ✨ Key Features

*   **⛓️ Fully On-Chain:** Player profiles, high scores, total apples eaten, and game stats are securely stored on the GenLayer blockchain.
*   **🏆 Badges & Achievements:** Earn exclusive on-chain badges based on your performance:
    *   *First Blood:* Submit your first score on-chain.
    *   *Century Club:* Reach a score of 100 or higher.
    *   *Apple Hoarder:* Eat 50 apples cumulatively.
    *   *Challenger:* Win a PvP challenge.
    *   *Style Master:* Unlock your AI playstyle analysis.
*   **⚔️ PvP Challenges:** Challenge other wallet addresses to a 1v1 duel. Both players submit their scores, and the smart contract resolves the winner!
*   **🛡️ Clans:** Create or join a clan. Combine your best scores with your friends to climb the global clan leaderboard.
*   **🤖 AI Cognitive Analysis:** The game evaluates your movement patterns, risk tolerance, and survival time to assign you a unique on-chain playstyle profile.
*   **🔗 Referral System:** Invite your friends using your unique referral link and track your invites on-chain.

## 🏗️ Smart Contracts

The game operates using two main Python smart contracts deployed on the GenLayer testnet:
1.  **`SnakeGame.py`**: Manages the core game data, player profiles, leaderboards, clans, and the PvP challenge system.
2.  **`SnakeBadges.py`**: A dedicated contract for tracking and verifying player achievements and unlocking badges.

## 🎮 How to Play

1.  **Connect Wallet:** Click "Connect Wallet" using a Web3 provider (e.g., MetaMask). Ensure you are connected to the GenLayer network if required.
2.  **Initialize Profile:** Head to the **Profile** tab and click "Initialize Profile" to create your on-chain identity (set your display name, bio, and avatar).
3.  **Play:** Use the arrow keys (or WASD) to move the snake. Eat the red apples to grow and increase your score. Avoid hitting the walls or your own tail.
4.  **Submit Score:** When the game ends, your score and stats are automatically submitted to the GenLayer blockchain.
5.  **Challenge & Collaborate:** Go to the Challenge tab to duel other players or the Clan tab to team up!

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables (create a `.env` file):
   ```env
   VITE_CONTRACT_ADDRESS=0xc0e6b7C203cbebb17402aA2C097c9669d2744f8a
   VITE_BADGE_CONTRACT_ADDRESS=0x254Fbc1Be7419ECc88361fd121A049Cb603E6B70
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
