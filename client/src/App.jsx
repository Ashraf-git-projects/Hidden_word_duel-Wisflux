import { useEffect } from "react";
import { io } from "socket.io-client";

function App() {
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.emit("joinLobby", { username: "Player_" + Math.floor(Math.random() * 1000) });

    socket.on("matchFound", (data) => {
      console.log("Match Found:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      Open two browser tabs
    </div>
  );
}

export default App;