export class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // 🎛 Master
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7; // evita clipping global
    this.masterGain.connect(this.ctx.destination);

    // 🎚 Compresor para estabilizar mezcla
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.compressor.connect(this.masterGain);

    this.buffers = {};
    this.globalState = {
      density: 0.5,
      energy: 0.5,
      modulation: 0.5
    };

    this.autonomousInterval = null;
  }

  // 🔓 importante para Chrome/Safari
  async resumeContext() {
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
      console.log("🔊 AudioContext resumed");
    }
  }

  async loadSample(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.buffers[name] = audioBuffer;
  }

  playSample(name) {
    if (!this.buffers[name]) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers[name];

    // 🎚 Ganancia dinámica según energía
    const gain = this.ctx.createGain();
    gain.gain.value = 0.1 + Math.random() * this.globalState.energy * 0.5;

    // 🎛 Filtro controlado por modulation
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value =
      200 + this.globalState.modulation * 6000;

    // 🎧 Paneo estéreo leve (más espacial)
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * 0.6;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.compressor);

    source.start();
  }

  updateFromNetwork(state) {
    this.globalState = state;
  }

  startAutonomousProcess() {
    if (this.autonomousInterval) return;

    this.autonomousInterval = setInterval(() => {
      const densityCurve = Math.pow(this.globalState.density, 2);

      if (Math.random() < densityCurve) {
        const keys = Object.keys(this.buffers);
        if (keys.length > 0) {
          const randomKey =
            keys[Math.floor(Math.random() * keys.length)];
          this.playSample(randomKey);
        }
      }
    }, 150); // más fluido que 200ms
  }
}