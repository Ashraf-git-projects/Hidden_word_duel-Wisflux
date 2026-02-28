const { v4: uuidv4 } = require("uuid");
const { getRandomWord } = require("./wordSelector");

const activeMatches = new Map();

const createGameState = (player1, player2, matchDbId) => {
  return {
    matchId: uuidv4(),
    matchDbId,

    players: {
      player1: { ...player1, score: 0 },
      player2: { ...player2, score: 0 },
    },

    currentRound: 1,
    winCondition: 3,

    roundState: null,

    tickInterval: null,
    tickDuration: 5000,

    isActive: false,
    isMatchActive: true,
  };
};

const createRoundState = (word, roundNumber, roundDbId) => ({
  roundId: uuidv4(),
  roundDbId,
  roundNumber,
  word,
  wordLength: word.length,
  revealedTiles: Array(word.length).fill(false),
  guessesThisTick: new Map(),
  isRoundActive: true,
  tickNumber: 0,
  tickStartedAt: null,
});

const startTickEngine = (io, gameState) => {
  const matchId = gameState.matchId;

  if (gameState.tickInterval) {
    clearInterval(gameState.tickInterval);
    gameState.tickInterval = null;
  }

  gameState.tickInterval = setInterval(() => {
    if (!gameState.isActive || !gameState.isMatchActive) return;

    const round = gameState.roundState;

    if (round.tickNumber > 0) {
      const correct = [];

      round.guessesThisTick.forEach((v, id) => {
        if (v.isCorrect) correct.push(id);
      });

      const Guess = require("../models/Guess");
      const guessPromises = Array.from(round.guessesThisTick.entries()).map(([socketId, guessData]) => {
        return Guess.create({
          round: round.roundDbId,
          player: guessData.dbId,
          guessText: guessData.guess,
          isCorrect: guessData.isCorrect
        });
      });
      Promise.all(guessPromises).catch(err => console.error("Error saving guesses", err));

      if (correct.length === 1) {
        const winnerId = correct[0];
        endRound(io, gameState, winnerId);
        return;
      }

      if (correct.length === 2) {
        endRound(io, gameState, null, true);
        return;
      }

      const revealData = revealRandomTile(round);
      if (revealData) {
        io.to(matchId).emit("revealTile", revealData);
      }

      if (!round.revealedTiles.includes(false)) {
        endRound(io, gameState, null, false);
        return;
      }
    }

    round.tickNumber++;
    round.tickStartedAt = Date.now();
    round.guessesThisTick.clear();

    io.to(matchId).emit("tickStart", {
      tickNumber: round.tickNumber,
      duration: gameState.tickDuration,
    });

  }, gameState.tickDuration);
};

const endRound = (io, gameState, winnerId = null, isDraw = false) => {
  const matchId = gameState.matchId;
  const round = gameState.roundState;

  round.isRoundActive = false;
  gameState.isActive = false;

  if (gameState.tickInterval) {
    clearInterval(gameState.tickInterval);
    gameState.tickInterval = null;
  }

  if (winnerId) {
    if (gameState.players.player1.id === winnerId) {
      gameState.players.player1.score++;
    } else {
      gameState.players.player2.score++;
    }
  }

  const Round = require("../models/Round");
  let winnerDbId = null;
  if (winnerId) {
    winnerDbId = gameState.players.player1.id === winnerId ? gameState.players.player1.dbId : gameState.players.player2.dbId;
  }
  
  Round.findByIdAndUpdate(round.roundDbId, {
    winner: winnerDbId
  }).catch(err => console.error("Error updating round", err));

  io.to(matchId).emit("roundEnd", {
    winner: winnerId,
    draw: isDraw,
    revealedWord: round.word,
    scores: {
      player1: gameState.players.player1.score,
      player2: gameState.players.player2.score,
    },
  });

  handleMatchProgression(io, gameState);
};

const handleMatchProgression = (io, gameState) => {
  const matchId = gameState.matchId;
  const { player1, player2 } = gameState.players;

  if (
    player1.score === gameState.winCondition ||
    player2.score === gameState.winCondition
  ) {
    gameState.isMatchActive = false;
    
    const Match = require("../models/Match");
    const winnerDbId = player1.score > player2.score ? player1.dbId : player2.dbId;
    Match.findByIdAndUpdate(gameState.matchDbId, {
       status: "completed",
       score1: player1.score,
       score2: player2.score,
       winner: winnerDbId
    }).catch(err => console.log("Match DB update err", err));

    io.to(matchId).emit("matchEnd", {
      winner: player1.score > player2.score ? player1.id : player2.id,
      finalScores: {
        player1: player1.score,
        player2: player2.score,
      },
    });

    activeMatches.delete(matchId);
    return;
  }

  setTimeout(() => {
    if (!gameState.isMatchActive) return;

    gameState.currentRound++;

    const word = getRandomWord();
    
    const Round = require("../models/Round");
    Round.create({
       match: gameState.matchDbId,
       word,
       roundNumber: gameState.currentRound
    }).then(newRoundDb => {
        const newRound = createRoundState(word, gameState.currentRound, newRoundDb._id);

        gameState.roundState = newRound;
        gameState.isActive = true;

        io.to(matchId).emit("startRound", {
          roundId: newRound.roundId,
          wordLength: newRound.wordLength,
        });

        startTickEngine(io, gameState);
    }).catch(err => console.error(err));

  }, 3000);
};

const revealRandomTile = (round) => {
  const hidden = round.revealedTiles
    .map((v, i) => (!v ? i : null))
    .filter(v => v !== null);

  if (!hidden.length) return null;

  const index = hidden[Math.floor(Math.random() * hidden.length)];
  round.revealedTiles[index] = true;

  return {
    index,
    letter: round.word[index],
  };
};

module.exports = {
  activeMatches,
  createGameState,
  createRoundState,
  startTickEngine,
  endRound
};