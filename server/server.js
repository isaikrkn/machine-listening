const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let globalState = {
  density: 0.5,
  energy: 0.5,
  modulation: 0.5
};

io.on("connection", (socket) => {

  socket.emit("stateUpdate", globalState);

  socket.on("userInfluence", (data) => {
    // Promedio colectivo
    globalState.density = (globalState.density + data.density) / 2;
    globalState.energy = (globalState.energy + data.energy) / 2;
    globalState.modulation = (globalState.modulation + data.modulation) / 2;

    io.emit("stateUpdate", globalState);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Distributed sonic ecosystem running on port", PORT);
});