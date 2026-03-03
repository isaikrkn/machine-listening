// audioEngine.js

export class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.buffers = {};
    this.sources = [];
    this.globalState = {
      density: 0.5,
      energy: 0.5,
      modulation: 0.5
    };

    this.autonomousInterval = null;
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

    const gain = this.ctx.createGain();
    gain.gain.value = Math.random() * this.globalState.energy;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200 + this.globalState.modulation * 4000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    this.sources.push(source);
  }

  updateFromNetwork(state) {
    this.globalState = state;
  }

  startAutonomousProcess() {
    this.autonomousInterval = setInterval(() => {
      if (Math.random() < this.globalState.density) {
        const keys = Object.keys(this.buffers);
        if (keys.length > 0) {
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          this.playSample(randomKey);
        }
      }
    }, 200);
  }
}