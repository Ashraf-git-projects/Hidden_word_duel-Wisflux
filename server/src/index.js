const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

require("./sockets/socketHandler")(io);

connectDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});