import { AudioEngine } from "./audioEngine.js";
import { Network } from "./network.js";

const audioEngine = new AudioEngine();
const network = new Network(audioEngine);

await audioEngine.loadSample("machine1", "./assets/audio/file1.wav");
await audioEngine.loadSample("machine2", "./assets/audio/file2.wav");

audioEngine.startAutonomousProcess();

document.addEventListener("mousemove", (e) => {
  const density = e.clientX / window.innerWidth;
  const energy = e.clientY / window.innerHeight;

  network.sendLocalInfluence({
    density,
    energy,
    modulation: Math.random()
  });
});