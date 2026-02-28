import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Login from "./components/Login";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";
import MatchEnd from "./components/MatchEnd";

function App() {
  const [appState, setAppState] = useState("LOGIN");
  const [players, setPlayers] = useState(null);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [roundId, setRoundId] = useState(null);
  const [wordLength, setWordLength] = useState(0);
  const [revealedTiles, setRevealedTiles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tickDuration, setTickDuration] = useState(5000);
  const [hasGuessedThisTick, setHasGuessedThisTick] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const lastTickTime = useRef(Date.now());

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");

    socketRef.current.on("matchFound", (data) => {
      setMatchId(data.matchId);
      setPlayers(data.players);
    });

    socketRef.current.on("startRound", (data) => {
      setRoundId(data.roundId);
      setWordLength(data.wordLength);
      setRevealedTiles([]);
      setHasGuessedThisTick(false);
      setAppState("PLAYING");
    });

    socketRef.current.on("tickStart", (data) => {
      setTickDuration(data.duration);
      setTimeLeft(data.duration);
      setHasGuessedThisTick(false);
      lastTickTime.current = Date.now();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - lastTickTime.current;
        const remaining = Math.max(0, data.duration - elapsed);
        setTimeLeft(remaining);
        if (remaining === 0) clearInterval(timerRef.current);
      }, 50);
    });

    socketRef.current.on("revealTile", (data) => {
      setRevealedTiles((prev) => [...prev, data]);
    });

    socketRef.current.on("roundEnd", (data) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setPlayers((prev) => {
        if (!prev) return prev;
        return {
          player1: { ...prev.player1, score: data.scores.player1 },
          player2: { ...prev.player2, score: data.scores.player2 }
        };
      });
      const fullReveal = data.revealedWord.split('').map((letter, index) => ({ index, letter }));
      setRevealedTiles(fullReveal);
    });

    socketRef.current.on("matchEnd", (data) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setPlayers((prev) => {
        if (!prev) return prev;
        return {
          player1: { ...prev.player1, score: data.finalScores.player1 },
          player2: { ...prev.player2, score: data.finalScores.player2 }
        };
      });
      setMatchResult({ winnerId: data.winner, reason: data.reason });
      setAppState("MATCH_END");
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      socketRef.current.disconnect();
    };
  }, []);

  const handleJoinLobby = (username) => {
    setMyPlayerId(socketRef.current.id);
    socketRef.current.emit("joinLobby", { username });
    setAppState("LOBBY");
  };

  const handleGuessSubmit = (guessText) => {
    if (!hasGuessedThisTick && appState === "PLAYING") {
      setHasGuessedThisTick(true);
      socketRef.current.emit("submitGuess", {
        matchId,
        roundId,
        guessText,
      });
    }
  };

  const handlePlayAgain = () => {
    setPlayers(null);
    setMatchId(null);
    setRoundId(null);
    setMatchResult(null);
    setAppState("LOGIN");
  };

  return (
    <>
      {appState === "LOGIN" && (
        <Login onJoin={handleJoinLobby} />
      )}
      {appState === "LOBBY" && (
        <Lobby />
      )}
      {appState === "PLAYING" && (
        <GameBoard
          players={players}
          myPlayerId={myPlayerId}
          wordLength={wordLength}
          revealedTiles={revealedTiles}
          timeLeft={timeLeft}
          tickDuration={tickDuration}
          onSubmitGuess={handleGuessSubmit}
          hasGuessedThisTick={hasGuessedThisTick}
        />
      )}
      {appState === "MATCH_END" && matchResult && (
        <MatchEnd
          players={players}
          myPlayerId={myPlayerId}
          winnerId={matchResult.winnerId}
          reason={matchResult.reason}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  );
}

export default App;