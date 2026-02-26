const {
  activeMatches,
  createGameState,
  createRoundState,
  startTickEngine,
} = require("../gameEngine/gameStore");

const {
  addToLobby,
  removeFromLobby,
  getWaitingPlayers,
} = require("../gameEngine/lobbyStore");

const { getRandomWord } = require("../gameEngine/wordSelector");

const handleDisconnect = (io, gameState, disconnectedPlayerId) => {
  const matchId = gameState.matchId;

  if (!gameState.isActive) return;

  const remainingPlayerId =
    gameState.players.player1.id === disconnectedPlayerId
      ? gameState.players.player2.id
      : gameState.players.player1.id;

  console.log("Starting disconnect grace timer...");

  setTimeout(() => {
    // If match already ended, ignore
    if (!gameState.isActive) return;

    console.log("Disconnect confirmed. Awarding win.");

    gameState.isActive = false;
    clearInterval(gameState.tickInterval);

    // Update score
    if (gameState.players.player1.id === remainingPlayerId) {
      gameState.players.player1.score += 1;
    } else {
      gameState.players.player2.score += 1;
    }

    io.to(matchId).emit("roundEnd", {
      winner: remainingPlayerId,
      reason: "opponent_disconnected",
      revealedWord: gameState.roundState.word,
      scores: {
        player1: gameState.players.player1.score,
        player2: gameState.players.player2.score,
      },
    });

  }, 5000); // 5 second grace
};

module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

  
   socket.on("submitGuess", ({ matchId, roundId, guessText }) => {
  const gameState = activeMatches.get(matchId);
  if (!gameState || !gameState.isActive) return;

  const round = gameState.roundState;
  if (!round || !round.isRoundActive) return;

  if (round.roundId !== roundId) return;

  if (!guessText || typeof guessText !== "string") return;

  const playerId = socket.id;

  if (round.guessesThisTick.has(playerId)) return;

  const now = Date.now();

  if (
    !round.tickStartedAt ||
    now > round.tickStartedAt + gameState.tickDuration
  ) {
    console.log("Late submission rejected");
    return;
  }

  const isCorrect =
    guessText.toLowerCase() === round.word.toLowerCase();

  round.guessesThisTick.set(playerId, {
    guess: guessText,
    isCorrect,
  });

  console.log(`Guess received from ${playerId}: ${guessText}`);
});
     
    const now = Date.now();


    
    socket.on("joinLobby", ({ username }) => {

      const player = {
        id: socket.id,
        username,
        socketId: socket.id,
      };

      addToLobby(player);

      const waitingPlayers = getWaitingPlayers();

      if (waitingPlayers.length >= 2) {
        const player1 = waitingPlayers.shift();
        const player2 = waitingPlayers.shift();

        const gameState = createGameState(player1, player2);

        activeMatches.set(gameState.matchId, gameState);

        // Join room first
        io.sockets.sockets.get(player1.socketId)?.join(gameState.matchId);
        io.sockets.sockets.get(player2.socketId)?.join(gameState.matchId);

        io.to(gameState.matchId).emit("matchFound", {
          matchId: gameState.matchId,
          players: gameState.players,
        });

        // Start Round 1
        const word = getRandomWord();
        const roundState = createRoundState(word, 1);

        gameState.roundState = roundState;
        gameState.isActive = true;

        io.to(gameState.matchId).emit("startRound", {
          roundId: roundState.roundId,
          wordLength: roundState.wordLength,
        });

        startTickEngine(io, gameState);
      }
    });

   socket.on("disconnect", () => {
  removeFromLobby(socket.id);

  console.log("User disconnected:", socket.id);

  // Check if player was in active match
  for (const [matchId, gameState] of activeMatches.entries()) {

    const { player1, player2 } = gameState.players;

    if (
      player1.id === socket.id ||
      player2.id === socket.id
    ) {
      handleDisconnect(io, gameState, socket.id);
      break;
    }
  }
});
  });
};