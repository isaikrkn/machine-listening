let particles = [];
let filaments = [];
let corePulse = 0;
let motionDrift = 0;
const PARTICLE_COUNT = 900;
const FILAMENT_COUNT = 42;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  pixelDensity(1);

  const radiusBase = min(width, height) * 0.12;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(radiusBase));
  }
  for (let i = 0; i < FILAMENT_COUNT; i++) {
    filaments.push(new Filament());
  }

}

function draw() {
  const state = window.machineListening?.getState?.() || {
    density: 0.5,
    energy: 0.5,
    modulation: 0.5,
    anomaly: 0.2,
    climate: 0.4,
    coherence: 0.5,
    audioEnergy: 0,
    pointerEnergy: 0
  };

  motionDrift += 0.001 + state.density * 0.01;
  corePulse = lerp(corePulse, state.energy * 1.5 + state.audioEnergy * 1.7, 0.08);

  drawAtmosphere(state);

  push();
  translate(width / 2, height / 2);

  for (const filament of filaments) {
    filament.update(state);
    filament.draw(state);
  }

  blendMode(ADD);
  for (const particle of particles) {
    particle.update(state);
    particle.draw(state);
  }
  blendMode(BLEND);

  drawCore(state);
  pop();

  drawScanlines(state);
}

function drawAtmosphere(state) {
  noStroke();
  fill(220 + state.climate * 70, 50, 4 + state.energy * 7, 20);
  rect(0, 0, width, height);

  const baseHue = 200 + state.climate * 90 + state.anomaly * 80;
  for (let i = 0; i < 4; i++) {
    const x = width * (0.2 + i * 0.2) + sin(frameCount * 0.002 + i) * 90;
    const y = height * (0.18 + i * 0.16) + cos(frameCount * 0.0015 + i * 2.1) * 80;
    const r = width * (0.16 + state.energy * 0.12 + i * 0.03);
    fill((baseHue + i * 28) % 360, 55, 10 + i * 5, 7 + state.anomaly * 8);
    ellipse(x, y, r, r);
  }
}

function drawCore(state) {
  noStroke();
  const hueA = (195 + state.climate * 90 + state.modulation * 50) % 360;
  const hueB = (320 + state.anomaly * 30) % 360;

  for (let i = 5; i >= 1; i--) {
    const glow = i * 18 + corePulse * 55;
    fill(lerp(hueA, hueB, i / 5), 60 + state.anomaly * 20, 90, 5 + i * 2);
    ellipse(0, 0, glow * 3.2, glow * 3.2);
  }

  fill(hueA, 20, 100, 85);
  ellipse(0, 0, 10 + corePulse * 36, 10 + corePulse * 36);
}

function drawScanlines(state) {
  stroke(255, 6 + state.anomaly * 10);
  strokeWeight(1);
  for (let y = 0; y < height; y += 4) {
    line(0, y + sin(frameCount * 0.01 + y * 0.03) * state.anomaly * 1.2, width, y);
  }
}

class Particle {
  constructor(radiusBase) {
    this.seed = random(1000);
    this.angle = random(TWO_PI);
    this.radius = radiusBase + random(min(width, height) * 0.42);
    this.speed = random(0.0008, 0.005);
    this.size = random(0.8, 3.2);
    this.offset = p5.Vector.random2D().mult(random(0.1, 1.5));
    this.trail = [];
  }

  update(state) {
    const orbitWarp = 0.3 + state.modulation * 1.6 + state.anomaly * 1.2;
    const climateDrag = 0.985 + state.climate * 0.01;
    const radiusNoise = noise(this.seed, frameCount * 0.003 + motionDrift) - 0.5;

    this.angle += this.speed * (1 + state.density * 4 + state.audioEnergy * 4);
    this.radius = this.radius * climateDrag + radiusNoise * orbitWarp;

    const wave = sin(frameCount * 0.01 + this.seed * 8) * state.energy * 18;
    const localRadius = this.radius + wave + state.anomaly * 22;
    const x = cos(this.angle + radiusNoise * orbitWarp) * localRadius + this.offset.x * 8;
    const y = sin(this.angle - radiusNoise * orbitWarp) * localRadius + this.offset.y * 8;

    this.pos = createVector(x, y);
    this.trail.push(this.pos.copy());
    if (this.trail.length > 7) this.trail.shift();
  }

  draw(state) {
    const hue = (180 + state.climate * 100 + state.anomaly * 120 + this.seed * 80) % 360;
    const brightness = 45 + state.energy * 40 + state.audioEnergy * 30;

    noFill();
    beginShape();
    for (let i = 0; i < this.trail.length; i++) {
      const p = this.trail[i];
      stroke(hue, 55, brightness, i * 8);
      strokeWeight(0.6 + i * 0.25);
      vertex(p.x, p.y);
    }
    endShape();

    noStroke();
    fill(hue, 45 + state.modulation * 30, brightness, 30 + state.anomaly * 35);
    ellipse(this.pos.x, this.pos.y, this.size + state.energy * 2.1);
  }
}

class Filament {
  constructor() {
    this.seed = random(1000);
    this.length = random(min(width, height) * 0.18, min(width, height) * 0.42);
    this.baseAngle = random(TWO_PI);
  }

  update(state) {
    this.angle = this.baseAngle + sin(frameCount * 0.003 + this.seed * 10) * (0.4 + state.anomaly * 1.4);
    this.tilt = cos(frameCount * 0.004 + this.seed * 6) * (0.25 + state.modulation * 0.9);
  }

  draw(state) {
    const hue = (210 + state.climate * 70 + this.seed * 20) % 360;
    const segments = 22;
    noFill();
    beginShape();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const bend = sin(t * PI * 2 + frameCount * 0.01 + this.seed * 20) * (12 + state.energy * 35);
      const x = cos(this.angle + this.tilt * t) * this.length * t + bend * sin(this.angle);
      const y = sin(this.angle + this.tilt * t) * this.length * t - bend * cos(this.angle);
      stroke(hue, 40 + state.coherence * 25, 85, 10 + t * 24);
      strokeWeight(0.6 + t * (1.2 + state.density));
      vertex(x, y);
    }
    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
