// network.js
import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

export class Network {
  constructor(audioEngine) {
    this.socket = io("https://YOUR_BACKEND_URL");
    this.audioEngine = audioEngine;

    this.state = {
      density: 0.5,
      energy: 0.5,
      modulation: 0.5
    };

    this.init();
  }

  init() {
    this.socket.on("stateUpdate", (globalState) => {
      this.audioEngine.updateFromNetwork(globalState);
    });

    this.socket.on("connect", () => {
      console.log("Connected to global ecosystem");
    });
  }

  sendLocalInfluence(data) {
    this.socket.emit("userInfluence", data);
  }
}