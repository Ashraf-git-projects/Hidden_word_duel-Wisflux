const { addToLobby, removeFromLobby, getWaitingPlayers } = require("../gameEngine/lobbyStore");
const { activeMatches, createGameState } = require("../gameEngine/gameStore");
const { createRoundState } = require("../gameEngine/gameStore");
const { getRandomWord } = require("../gameEngine/wordSelector");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

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

  // Join both players to room FIRST
  io.sockets.sockets.get(player1.socketId)?.join(gameState.matchId);
  io.sockets.sockets.get(player2.socketId)?.join(gameState.matchId);

  // Emit matchFound first
  io.to(gameState.matchId).emit("matchFound", {
    matchId: gameState.matchId,
    players: gameState.players,
  });

  // Now start Round 1
  const word = getRandomWord();
  const roundState = createRoundState(word, 1);

  gameState.roundState = roundState;
  gameState.isActive = true;

  io.to(gameState.matchId).emit("startRound", {
    roundId: roundState.roundId,
    wordLength: roundState.wordLength,
  });
}
    });

    socket.on("disconnect", () => {
      removeFromLobby(socket.id);
      console.log("User disconnected:", socket.id);
    });
  });
};