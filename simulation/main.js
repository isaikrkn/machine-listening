(() => {
  const AUDIO_FILE = "./assets/audio/machine-listening.wav";

  const overlay = document.getElementById("overlay");
  const startButton = document.getElementById("startButton");
  const audioStatus = document.getElementById("audioStatus");
  const metricEnergy = document.getElementById("metricEnergy");
  const metricAnomaly = document.getElementById("metricAnomaly");
  const metricClimate = document.getElementById("metricClimate");

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.analyser = null;
      this.bufferSource = null;
      this.fallbackNodes = [];
      this.freqData = null;
      this.timeData = null;
      this.started = false;
      this.energySmoothed = 0;
      this.state = {
        density: 0.5,
        energy: 0.5,
        modulation: 0.5,
        anomaly: 0.2,
        climate: 0.4,
        coherence: 0.55,
        audioEnergy: 0,
        pointerEnergy: 0,
        source: "boot"
      };
    }

    async start() {
      if (this.started) return;
      this.started = true;

      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.fftSize);

      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      try {
        const response = await fetch(AUDIO_FILE);
        if (!response.ok) throw new Error(`Audio fetch failed: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const decoded = await this.ctx.decodeAudioData(arrayBuffer);

        this.bufferSource = this.ctx.createBufferSource();
        this.bufferSource.buffer = decoded;
        this.bufferSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 650;
        filter.Q.value = 0.8;

        this.bufferSource.connect(filter);
        filter.connect(this.master);
        this.bufferSource.start();

        audioStatus.textContent = "audio: wav running";
      } catch (error) {
        console.warn("Falling back to synthetic soundscape", error);
        this.startFallbackSoundscape();
        audioStatus.textContent = "audio: synthetic fallback";
      }

      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
    }

    startFallbackSoundscape() {
      const makeNoise = () => {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.22;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        return source;
      };

      const noise = makeNoise();
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 480;
      noiseFilter.Q.value = 1.2;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.2;

      const osc1 = this.ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.value = 43;
      const osc1Gain = this.ctx.createGain();
      osc1Gain.gain.value = 0.03;

      const osc2 = this.ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.value = 96;
      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.value = 0.02;

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.master);

      osc1.connect(osc1Gain);
      osc1Gain.connect(this.master);
      osc2.connect(osc2Gain);
      osc2Gain.connect(this.master);

      noise.start();
      osc1.start();
      osc2.start();

      this.fallbackNodes.push({ noiseFilter, noiseGain, osc1, osc2, osc1Gain, osc2Gain });
    }

    setState(partialState) {
      this.state = { ...this.state, ...partialState };
    }

    pushPointerInfluence(xNorm, yNorm, movement) {
      this.state.pointerEnergy = Math.max(this.state.pointerEnergy * 0.92, movement);
      const anomaly = Math.min(1, (1 - yNorm) * 0.5 + movement * 1.6);
      const modulation = Math.min(1, xNorm * 0.65 + movement * 1.3);

      this.setState({ anomaly, modulation });

      if (window.networkEngine) {
        window.networkEngine.sendInfluence({
          density: Math.max(0, Math.min(1, xNorm)),
          energy: Math.max(0, Math.min(1, 1 - yNorm + movement * 0.3)),
          modulation,
          anomaly
        });
      }
    }

    update() {
      if (!this.analyser) return this.state;

      this.analyser.getByteFrequencyData(this.freqData);
      this.analyser.getByteTimeDomainData(this.timeData);

      let sum = 0;
      for (let i = 0; i < this.freqData.length; i++) sum += this.freqData[i];
      const avg = sum / this.freqData.length / 255;
      this.energySmoothed = this.energySmoothed * 0.9 + avg * 0.1;
      this.state.audioEnergy = this.energySmoothed;

      if (this.fallbackNodes.length) {
        const n = this.fallbackNodes[0];
        n.noiseFilter.frequency.value = 220 + this.state.climate * 1200 + this.state.anomaly * 600;
        n.noiseGain.gain.value = 0.1 + this.state.energy * 0.24;
        n.osc1.frequency.value = 34 + this.state.density * 40;
        n.osc2.frequency.value = 70 + this.state.modulation * 120;
        n.osc1Gain.gain.value = 0.015 + this.state.coherence * 0.035;
        n.osc2Gain.gain.value = 0.01 + this.state.anomaly * 0.03;
      }

      metricEnergy.textContent = `energy ${this.state.energy.toFixed(2)}`;
      metricAnomaly.textContent = `anomaly ${this.state.anomaly.toFixed(2)}`;
      metricClimate.textContent = `climate ${this.state.climate.toFixed(2)}`;

      return this.state;
    }
  }

  const audioEngine = new AudioEngine();
  const networkEngine = new window.NetworkEngine({
    url: "https://machine-listening.onrender.com",
    enabled: true
  });

  networkEngine.onState = (incoming) => {
    audioEngine.setState({
      density: incoming.density ?? audioEngine.state.density,
      energy: incoming.energy ?? audioEngine.state.energy,
      modulation: incoming.modulation ?? audioEngine.state.modulation,
      anomaly: incoming.anomaly ?? audioEngine.state.anomaly,
      climate: incoming.climate ?? audioEngine.state.climate,
      coherence: incoming.coherence ?? audioEngine.state.coherence,
      source: incoming.source || "network"
    });
  };

  networkEngine.start();

  function startSystem() {
    overlay.classList.add("hidden");
    audioEngine.start();
  }

  startButton.addEventListener("click", startSystem);
  window.addEventListener("pointerdown", () => {
    if (!audioEngine.started) startSystem();
  }, { once: true });

  let lastPointer = null;
  function handlePointerMove(event) {
    const xNorm = event.clientX / window.innerWidth;
    const yNorm = event.clientY / window.innerHeight;
    let movement = 0;
    if (lastPointer) {
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      movement = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 48);
    }
    lastPointer = { x: event.clientX, y: event.clientY };
    audioEngine.pushPointerInfluence(xNorm, yNorm, movement);
  }

  window.addEventListener("pointermove", handlePointerMove, { passive: true });

  window.machineListening = {
    audioEngine,
    networkEngine,
    getState() {
      return audioEngine.update();
    }
  };
})();
