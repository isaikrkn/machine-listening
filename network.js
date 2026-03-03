// network.js
import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

export class Network {
  constructor(audioEngine) {
    this.socket = io("https://machine-listening.onrender.com");
    this.audioEngine = audioEngine;

    this.state = {
      density: 0.5,
      energy: 0.5,
      modulation: 0.5
    };

    this.init();
  }

    init() {

    this.socket.on("connect", () => {
        console.log("✅ Connected to server:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
        console.log("❌ Disconnected from server");
    });

    this.socket.on("connect_error", (err) => {
        console.error("⚠️ Connection error:", err.message);
    });

    this.socket.on("stateUpdate", (globalState) => {
        console.log("🌍 State received:", globalState);
        this.audioEngine.updateFromNetwork(globalState);
    });
    }

  sendLocalInfluence(data) {
    this.socket.emit("userInfluence", data);
  }
}