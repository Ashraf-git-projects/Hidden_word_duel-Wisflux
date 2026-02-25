import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

function App() {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("joinLobby", {
      username: "Player_" + Math.floor(Math.random() * 1000),
    });

    socketRef.current.on("matchFound", (data) => {
      console.log("Match Found:", data);
    });

    socketRef.current.on("startRound", (data) => {
      console.log("Round Started:", data);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      Open two browser tabs
    </div>
  );
}

export default App;