const {
  activeMatches,
  createGameState,
  createRoundState,
  startTickEngine,
  handleMatchProgression,
  endRound,
} = require("../gameEngine/gameStore");

const {
  addToLobby,
  removeFromLobby,
  getWaitingPlayers,
} = require("../gameEngine/lobbyStore");

const { getRandomWord } = require("../gameEngine/wordSelector");

const Player = require("../models/Player");

const handleDisconnect = (io, gameState, disconnectedPlayerId) => {
  if (!gameState.isMatchActive) return;

  const remainingDbId =
    gameState.players.player1.id === disconnectedPlayerId
      ? gameState.players.player2.dbId
      : gameState.players.player1.dbId;

  setTimeout(async () => {
    if (!gameState.isMatchActive) return;

    const Match = require("../models/Match");
    await Match.findByIdAndUpdate(gameState.matchDbId, {
      status: "completed",
      winner: remainingDbId
    });

    gameState.isMatchActive = false;
    gameState.isActive = false;

    if (gameState.tickInterval) {
      clearInterval(gameState.tickInterval);
      gameState.tickInterval = null;
    }

    io.to(gameState.matchId).emit("matchEnd", {
      winner: gameState.players.player1.id === disconnectedPlayerId ? gameState.players.player2.id : gameState.players.player1.id,
      finalScores: {
        player1: gameState.players.player1.score,
        player2: gameState.players.player2.score,
      },
      reason: "disconnect"
    });
    
    activeMatches.delete(gameState.matchId);
  }, 3000);
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

      const isCorrect = guessText.toLowerCase() === round.word.toLowerCase();

      round.guessesThisTick.set(playerId, {
        guess: guessText,
        isCorrect,
        dbId: playerId === gameState.players.player1.id ? gameState.players.player1.dbId : gameState.players.player2.dbId
      });

      console.log(`Guess received from ${playerId}: ${guessText}`);
    });

    socket.on("joinLobby", async ({ username }) => {
      try {
        console.log("joinLobby triggered:", username);

        const player = {
          id: socket.id,
          username,
          socketId: socket.id,
        };

        addToLobby(player);

        const waitingPlayers = getWaitingPlayers();

        if (waitingPlayers.length >= 2) {
          console.log("2 players ready");

          const player1Data = waitingPlayers.shift();
          const player2Data = waitingPlayers.shift();
          
          let player1 = await Player.findOne({
            username: player1Data.username,
          });

          if (!player1) {
            player1 = await Player.create({ username: player1Data.username });
          }
          
          let player2 = await Player.findOne({
            username: player2Data.username,
          });

          if (!player2) {
            player2 = await Player.create({ username: player2Data.username });
          }

          const Match = require("../models/Match");
          const Round = require("../models/Round");

          const matchDb = await Match.create({
            player1: player1._id,
            player2: player2._id,
            status: "ongoing"
          });

          const gameState = createGameState(
            {
              ...player1Data,
              dbId: player1._id,
            },
            {
              ...player2Data,
              dbId: player2._id,
            },
            matchDb._id
          );

          activeMatches.set(gameState.matchId, gameState);

          io.sockets.sockets.get(player1Data.socketId)?.join(gameState.matchId);
          io.sockets.sockets.get(player2Data.socketId)?.join(gameState.matchId);

          io.to(gameState.matchId).emit("matchFound", {
            matchId: gameState.matchId,
            players: gameState.players,
          });

          const word = getRandomWord();
          
          const roundDb = await Round.create({
            match: matchDb._id,
            word,
            roundNumber: 1
          });

          const roundState = createRoundState(word, 1, roundDb._id);

          gameState.roundState = roundState;
          gameState.isActive = true;

          io.to(gameState.matchId).emit("startRound", {
            roundId: roundState.roundId,
            wordLength: roundState.wordLength,
          });

          startTickEngine(io, gameState);
        }
      } catch (err) {
        console.error("joinLobby error:", err);
      }
    });

    socket.on("disconnect", () => {
      removeFromLobby(socket.id);

      console.log("User disconnected:", socket.id);

      for (const [matchId, gameState] of activeMatches.entries()) {
        const { player1, player2 } = gameState.players;

        if (player1.id === socket.id || player2.id === socket.id) {
          handleDisconnect(io, gameState, socket.id);
          break;
        }
      }
    });
  });
};
