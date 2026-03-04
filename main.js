import { AudioEngine } from "./audioEngine.js";
import { Network } from "./network.js";

let audioEngine;
let network;
let started = false;

async function init() {
  if (started) return;
  started = true;

  audioEngine = new AudioEngine();
  network = new Network(audioEngine);

  // 🔊 Cargar samples WAV
  await audioEngine.loadSample("machine1", "./assets/audio/07_electric_room.wav");
  await audioEngine.loadSample("machine2", "./assets/audio/08_welding.wav");

  console.log("✅ Samples loaded");

  // Iniciar proceso autónomo (como en SuperCollider)
  audioEngine.startAutonomousProcess();

  console.log("🌍 Distributed sonic ecosystem started");
}

// 🔓 Desbloqueo obligatorio del audio context
document.addEventListener("click", async () => {
  if (!started) {
    await init();
  }
});

// 🎛 Influencia del usuario
document.addEventListener("mousemove", (e) => {
  if (!network) return;

  const density = e.clientX / window.innerWidth;
  const energy = 1 - (e.clientY / window.innerHeight);

  network.sendLocalInfluence({
    density,
    energy,
    modulation: Math.random()
  });
});