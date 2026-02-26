import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

function App() {
  const socketRef = useRef(null);
  const matchIdRef = useRef(null);
const roundIdRef = useRef(null);

  useEffect(() => {
  socketRef.current = io("http://localhost:5000");

  socketRef.current.emit("joinLobby", {
    username: "Player_" + Math.floor(Math.random() * 1000),
  });

 socketRef.current.on("matchFound", (data) => {
  matchIdRef.current = data.matchId;
});

socketRef.current.on("startRound", (data) => {
  roundIdRef.current = data.roundId;
});

  socketRef.current.on("tickStart", (data) => {
    console.log("Tick Started:", data);
  });
   
  socketRef.current.on("revealTile", (data) => {
  console.log("Tile Revealed:", data);
});

socketRef.current.on("roundEnd", (data) => {
  console.log("Round Ended:", data);
});

socketRef.current.on("matchEnd", (data) => {
  console.log("Match Ended:", data);
});

  return () => {
    socketRef.current.disconnect();
  };
}, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      Open two browser tabs
      <button
  onClick={() =>
   socketRef.current.emit("submitGuess", {
  matchId: matchIdRef.current,
  roundId: roundIdRef.current,
  guessText: prompt("Enter guess"),
})
  }
  className="bg-blue-500 px-4 py-2 rounded"
>
  Submit Guess
</button>
    </div>
  );
}

export default App;