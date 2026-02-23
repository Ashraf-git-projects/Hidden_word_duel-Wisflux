const { v4: uuidv4 } = require("uuid");

const activeMatches = new Map();

const createGameState = (player1, player2) => {
  return {
    matchId: uuidv4(),

    players: {
      player1: {
        id: player1.id,
        username: player1.username,
        socketId: player1.socketId,
        score: 0,
      },
      player2: {
        id: player2.id,
        username: player2.username,
        socketId: player2.socketId,
        score: 0,
      },
    },

    currentRound: 1,
    maxRounds: 5,
    winCondition: 3, // first to 3 wins

    roundState: null, // will hold word + tiles per round

    tickInterval: null,
    tickDuration: 5000, // 5 seconds

    isActive: false,
  };
};

const createRoundState = (word, roundNumber) => {
  return {
    roundId: uuidv4(),
    roundNumber,

    word, // actual word (hidden from clients)
    wordLength: word.length,

    revealedTiles: Array(word.length).fill(false),

    guessesThisTick: new Map(), 
    // Map<playerId, guessText> (only one guess per player per tick)

    isRoundActive: true,
    winner: null,

    tickNumber: 0,
    tickStartedAt: null,
  };
};

module.exports = {
  activeMatches,
  createGameState,
  createRoundState
};