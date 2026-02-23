const waitingPlayers = [];

const addToLobby = (player) => {
  waitingPlayers.push(player);
};

const removeFromLobby = (socketId) => {
  const index = waitingPlayers.findIndex(p => p.socketId === socketId);
  if (index !== -1) {
    waitingPlayers.splice(index, 1);
  }
};

const getWaitingPlayers = () => waitingPlayers;

module.exports = {
  addToLobby,
  removeFromLobby,
  getWaitingPlayers,
};