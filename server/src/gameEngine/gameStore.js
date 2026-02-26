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

const startTickEngine = (io, gameState) => {
  const matchId = gameState.matchId;

  gameState.tickInterval = setInterval(() => {
    if (!gameState.isActive) return;

    const round = gameState.roundState;

    if (round.tickNumber > 0) {
      const correctGuesses = [];

      round.guessesThisTick.forEach((value, playerId) => {
        if (value.isCorrect) {
          correctGuesses.push(playerId);
        }
      });

      if (correctGuesses.length === 1) {
        const winnerId = correctGuesses[0];

        round.isRoundActive = false;
        gameState.isActive = false;
        clearInterval(gameState.tickInterval);

        if (gameState.players.player1.id === winnerId) {
          gameState.players.player1.score += 1;
        } else {
          gameState.players.player2.score += 1;
        }

        io.to(matchId).emit("roundEnd", {
          winner: winnerId,
          revealedWord: round.word,
          scores: {
            player1: gameState.players.player1.score,
            player2: gameState.players.player2.score,
          },
        });

        return;
      }

      if (correctGuesses.length === 2) {
        round.isRoundActive = false;
        gameState.isActive = false;
        clearInterval(gameState.tickInterval);

        io.to(matchId).emit("roundEnd", {
          winner: null,
          draw: true,
          revealedWord: round.word,
        });

        return;
      }

      const revealData = revealRandomTile(round);

      if (revealData) {
        io.to(matchId).emit("revealTile", revealData);
      }

      if (!round.revealedTiles.includes(false)) {
        round.isRoundActive = false;
        gameState.isActive = false;
        clearInterval(gameState.tickInterval);

        io.to(matchId).emit("roundEnd", {
          winner: null,
          revealedWord: round.word,
        });

        return;
      }
    }

    round.tickNumber += 1;
    round.tickStartedAt = Date.now();
    round.guessesThisTick.clear();

    io.to(matchId).emit("tickStart", {
      tickNumber: round.tickNumber,
      duration: gameState.tickDuration,
    });

  }, gameState.tickDuration);
};

const revealRandomTile = (roundState) => {
  const unrevealedIndexes = [];

  roundState.revealedTiles.forEach((revealed, index) => {
    if (!revealed) {
      unrevealedIndexes.push(index);
    }
  });

  if (unrevealedIndexes.length === 0) return null;

  const randomIndex =
    unrevealedIndexes[Math.floor(Math.random() * unrevealedIndexes.length)];

  roundState.revealedTiles[randomIndex] = true;

  return {
    index: randomIndex,
    letter: roundState.word[randomIndex],
  };
};

module.exports = {
  activeMatches,
  createGameState,
  createRoundState,
  startTickEngine,
  revealRandomTile
};