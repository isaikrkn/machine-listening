(() => {
  class NetworkEngine {
    constructor(options = {}) {
      this.url = options.url || "https://machine-listening.onrender.com";
      this.enabled = options.enabled ?? true;
      this.socket = null;
      this.connected = false;
      this.lastRemoteState = null;
      this.fallbackStarted = false;
      this.onState = () => {};
      this.networkLabel = document.getElementById("networkStatus");
    }

    start() {
      if (!this.enabled || typeof window.io === "undefined") {
        this.setLabel("network: local simulation");
        this.startFallback();
        return;
      }

      try {
        this.socket = window.io(this.url, {
          transports: ["websocket", "polling"],
          timeout: 3500,
          reconnectionAttempts: 2
        });

        this.socket.on("connect", () => {
          this.connected = true;
          this.setLabel("network: render live");
        });

        this.socket.on("disconnect", () => {
          this.connected = false;
          this.setLabel("network: disconnected → local simulation");
          this.startFallback();
        });

        this.socket.on("connect_error", () => {
          this.connected = false;
          this.setLabel("network: fallback simulation");
          this.startFallback();
        });

        this.socket.on("stateUpdate", (state) => {
          this.lastRemoteState = state;
          this.onState(state);
        });
      } catch (error) {
        console.error("Network start error", error);
        this.setLabel("network: fallback simulation");
        this.startFallback();
      }
    }

    startFallback() {
      if (this.fallbackStarted) return;
      this.fallbackStarted = true;

      let t = 0;
      setInterval(() => {
        t += 0.015;
        const state = {
          density: 0.45 + Math.sin(t * 0.9) * 0.2 + Math.sin(t * 0.23) * 0.08,
          energy: 0.48 + Math.sin(t * 1.6 + 1.3) * 0.22,
          modulation: 0.5 + Math.sin(t * 0.7 + 2.1) * 0.25,
          anomaly: 0.2 + Math.max(0, Math.sin(t * 0.37 + 0.4)) * 0.55,
          climate: 0.42 + Math.sin(t * 0.11 + 2.4) * 0.3,
          coherence: 0.5 + Math.sin(t * 0.17) * 0.25,
          source: "simulated"
        };
        this.onState(this.clampState(state));
      }, 120);
    }

    sendInfluence(data) {
      if (this.connected && this.socket) {
        this.socket.emit("userInfluence", data);
      }
    }

    clampState(state) {
      const s = { ...state };
      for (const key of ["density", "energy", "modulation", "anomaly", "climate", "coherence"]) {
        if (typeof s[key] === "number") {
          s[key] = Math.max(0, Math.min(1, s[key]));
        }
      }
      return s;
    }

    setLabel(text) {
      if (this.networkLabel) this.networkLabel.textContent = text;
    }
  }

  window.NetworkEngine = NetworkEngine;
})();
