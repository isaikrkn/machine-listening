const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

let t = 0;
let userImpulse = { density: 0, energy: 0, modulation: 0, anomaly: 0 };

const globalState = {
  density: 0.5,
  energy: 0.5,
  modulation: 0.5,
  anomaly: 0.2,
  climate: 0.45,
  coherence: 0.55,
  source: "server"
};

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function updateAutonomousState() {
  t += 0.02;

  const climate = 0.45 + Math.sin(t * 0.08 + 1.3) * 0.24;
  const baselineDensity = 0.48 + Math.sin(t * 0.62) * 0.18 + Math.sin(t * 0.11) * 0.1;
  const baselineEnergy = 0.46 + Math.sin(t * 1.2 + 2.0) * 0.16 + Math.sin(t * 0.21) * 0.08;
  const baselineMod = 0.5 + Math.sin(t * 0.47 + 0.2) * 0.22;
  const anomalyPulse = Math.max(0, Math.sin(t * 0.33 + 0.7)) * 0.45;

  userImpulse.density *= 0.94;
  userImpulse.energy *= 0.94;
  userImpulse.modulation *= 0.94;
  userImpulse.anomaly *= 0.93;

  globalState.climate = clamp01(climate);
  globalState.density = clamp01(baselineDensity + userImpulse.density * 0.4);
  globalState.energy = clamp01(baselineEnergy + userImpulse.energy * 0.45);
  globalState.modulation = clamp01(baselineMod + userImpulse.modulation * 0.42);
  globalState.anomaly = clamp01(0.15 + anomalyPulse + userImpulse.anomaly * 0.55);
  globalState.coherence = clamp01(0.62 - globalState.anomaly * 0.28 + Math.sin(t * 0.17) * 0.09);
}

app.get("/", (req, res) => {
  res.send("Machine Listening Server Running");
});

app.get("/state", (req, res) => {
  res.json(globalState);
});

io.on("connection", (socket) => {
  socket.emit("stateUpdate", globalState);

  socket.on("userInfluence", (data = {}) => {
    userImpulse.density = clamp01((userImpulse.density + (data.density || 0)) * 0.7);
    userImpulse.energy = clamp01((userImpulse.energy + (data.energy || 0)) * 0.7);
    userImpulse.modulation = clamp01((userImpulse.modulation + (data.modulation || 0)) * 0.7);
    userImpulse.anomaly = clamp01((userImpulse.anomaly + (data.anomaly || 0)) * 0.7);
  });
});

setInterval(() => {
  updateAutonomousState();
  io.emit("stateUpdate", globalState);
}, 120);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Machine Listening server running on port ${PORT}`);
});
