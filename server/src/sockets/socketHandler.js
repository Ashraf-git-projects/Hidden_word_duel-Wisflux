const { addToLobby, removeFromLobby, getWaitingPlayers } = require("../gameEngine/lobbyStore");
const { activeMatches, createGameState } = require("../gameEngine/gameStore");

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

        socket.join(gameState.matchId);
        io.sockets.sockets.get(player1.socketId)?.join(gameState.matchId);
        io.sockets.sockets.get(player2.socketId)?.join(gameState.matchId);

        io.to(gameState.matchId).emit("matchFound", {
          matchId: gameState.matchId,
          players: gameState.players,
        });
      }
    });

    socket.on("disconnect", () => {
      removeFromLobby(socket.id);
      console.log("User disconnected:", socket.id);
    });
  });
};