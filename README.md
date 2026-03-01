# Hidden Word Duel ⚔️

A real-time multiplayer word-guessing game built using the **MERN** stack and **Socket.io**. Challenge your friends, guess the hidden word before the ticks run out, and claim victory in this intensely synchronized battle of wits!

---

### 🌐 Live Demo & Deployments

*   **Frontend (Vercel):** [Play Hidden Word Duel Now!](https://hidden-word-duel-wisflux.vercel.app/)
*   **Backend (Render API):** [API Base URL](https://hidden-word-duel-wisflux.onrender.com)

---

## 📖 The Game Rules

At the start of a match, a random hidden word is generated. Let's say it's a 5-letter word: `_ _ _ _ _`. 

Both players are brought to the Game Board together and the **Server Tick System** begins its countdown (exactly 5 seconds per tick).

1.  **The Tick Cycle:** Every 5 seconds, a brand new tile random letter is revealed dynamically for both players.
2.  **Submitting Guesses:** You must carefully deduce the word and submit a guess before the current tick expires! 
3.  **Spam Prevention:** Once you submit a guess, you are **locked in** for the remainder of that 5-second tick phase to prevent spamming.
4.  **Winning the Round:** The first player to submit the correctly spelled word within a tick wins the round and earns a point! 
5.  **Draws:** 
    *   If *both* players miraculously submit the correct answer in the **exact same tick window**, it's a draw—no points are awarded!
    *   If all letters are revealed and no correct guesses have been made at all, the round is also declared a draw.
6.  **Match Victory:** First to 3 round victories wins the Match!

---

## 🛠 Tech Stack

This project was engineered to be highly reactive and fully modular:

*   **Frontend Client:** 
    *   **React (Vite)** for lightning-fast module replacement.
    *   **Tailwind CSS** for beautiful, responsive, mobile-first glassmorphism styling and UI progression bars.
    *   **Socket.io-client** to synchronize the React state directly to the server engine.
*   **Backend Server:**
    *   **Node.js & Express.js** architecture.
    *   **Socket.io** serving as the real-time bidirectional event engine handling matchmaking and tick cycles.
    *   **MongoDB (Mongoose)** for non-relational database storage of players, match history, round data, and guess ledgers.

---
## 📂 Folder Structure
hidden-word-duel/
│
├── client/                     # Frontend Application (React + Vite)
│   ├── src/                    
│   │   ├── components/         # Reusable React UI Components
│   │   │   ├── GameBoard.jsx   # Main game interface and tick progress bar
│   │   │   ├── Lobby.jsx       # Matchmaking queue screen
│   │   │   ├── Login.jsx       # Initial username entry screen
│   │   │   └── MatchEnd.jsx    # Post-match summary and stats
│   │   ├── App.jsx             # Global state machine & Socket.io listeners
│   │   ├── index.css           # Tailwind base styles and setup
│   │   └── main.jsx            # React root injection
│   ├── .env                    # Client environment variables (VITE_BACKEND_URL)
│   ├── index.html              # Vite HTML entry point
│   ├── package.json            # Client dependencies and build scripts
│   ├── tailwind.config.js      # Tailwind CSS customized themes and settings
│   └── vite.config.js          # Vite build configurations
│
├── server/                     # Backend Application (Node.js + Express)
│   ├── src/                    
│   │   ├── config/             
│   │   │   └── db.js           # Mongoose MongoDB connection setup
│   │   ├── gameEngine/         # Core game logic
│   │   │   ├── gameStore.js    # Tick cycle logic, room state, win/draw evaluations
│   │   │   └── wordSelector.js # Dictionary and random word generator
│   │   ├── models/             # Mongoose Database Schemas
│   │   │   ├── Guess.js        # Stores individual guess attempts
│   │   │   ├── Match.js        # Stores match metadata and final scores
│   │   │   ├── Player.js       # Stores persistent player accounts
│   │   │   └── Round.js        # Stores individual round winners and the secret word
│   │   ├── sockets/            
│   │   │   └── socketHandler.js # WebSocket event listeners (joinLobby, submitGuess)
│   │   ├── app.js              # Express app routing and middleware
│   │   └── index.js            # Node HTTP server and Socket.io initialization
│   ├── .env                    # Server environment variables (MONGO_URI, PORT)
│   └── package.json            # Server dependencies and start scripts
│
├── .gitignore                  
└── README.md                   # Project documentation

## 🚨 Edge-Cases Handled Beautifully

Unlike many simple Socket apps, this engine has been rigorously stress-tested for real-world networking chaos:
*   **Out-of-Sync Late Guesses:** If a client experiences network lag and their frontend timer allows them to submit a guess *after* the server tick has rolled over, the server utilizes timestamp validation (`now > round.tickStartedAt + gameState.tickDuration`) to strictly reject the spoofed guess from evaluating into the next tick.
*   **Rage Quitting / Disconnects:** If a player disconnects mid-match, the game pauses. If the player does not reconnect within a 3-second grace period (preventing brief ping drops from ruining matches), the opponent is gracefully awarded a victory and the server cleans up the garbage state.
*   **Duplicate Players:** The database intelligently tracks player identities and handles the initialization of Match tracking docs seamlessly.

---

## 💻 Running the Game Locally

Want to boot up the duel on your own machine? It takes just three steps!

### Prerequisites:
*   Node.js (v18+)
*   MongoDB locally installed (or a free cloud MongoDB Atlas cluster URI)

### 1. Clone the repository
```bash
git clone https://github.com/Ashraf-git-projects/Hidden_word_duel-Wisflux.git
cd hidden-word-duel
```

### 2. Configure the Backend (Server)
```bash
cd server
npm install
```
*Environment Variables (Create a `.env` in the `/server` folder):*
*   `MONGO_URI` = `mongodb://127.0.0.1:27017/hidden-word-duel` (or your Atlas string)
*   `PORT` = `5000`

Boot up the backend:
```bash
npm run dev
```

### 3. Configure the Frontend (Client)
In a separate terminal:
```bash
cd client
npm install
```
*Environment Variables (Create a `.env` in the `/client` folder):*
*   `VITE_BACKEND_URL` = `http://localhost:5000`

Boot up the frontend:
```bash
npm run dev
```

Visit `http://localhost:5173` in two different browser tabs to matchmake against yourself!

---
*Created as a real-time game assignment project! Happy dueling!* ⚔️

Thank you
Ashraf Hussain Siddiqui
ashrafhussain2265@gmail.com
