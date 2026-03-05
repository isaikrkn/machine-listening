let socket;
let stars = [];
let center;

// Anomaly state, simulates a glitch in the starfield when triggered by certain audio conditions (e.g., high energy)
let anomaly = false;
let anomalyTimer = 0;

// Autonomous mode (for demo or when no audio input is available)   
let autonomous = false;
let autoDensity = 0.3;
let autoEnergy = 0.5;

let turbulence = 0;

const NUM_STARS = 400;


/* ================================
   AUDIO ENGINE (NEW)
   ================================ */

let audioCtx;
let source;
let filterNode;
let distortionNode;
let masterGain;

let lastMouseX = 0;
let lastMouseY = 0;

async function startAudio() {

  if (!audioCtx) {

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.value = 6000;

    distortionNode = audioCtx.createWaveShaper();
    distortionNode.curve = makeDistortionCurve(0);
    distortionNode.oversample = "4x";

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;

    filterNode.connect(distortionNode);
    distortionNode.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // cargar WAV
    const response = await fetch("./audio/galaxy.wav");
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;

    source.connect(filterNode);
    source.start();

    console.log("🌌 Galaxy audio loop started");

  }

}


/* distortion generator */

function makeDistortionCurve(amount) {

  let k = amount;
  let n = 44100;
  let curve = new Float32Array(n);
  let deg = Math.PI / 180;

  for (let i = 0; i < n; i++) {

    let x = i * 2 / n - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));

  }

  return curve;

}


/* audio interaction */

function updateAudioFromMouse() {

  if (!audioCtx) return;

  let x = mouseX / width;
  let y = mouseY / height;

  let speed = abs(mouseX - lastMouseX) + abs(mouseY - lastMouseY);

  lastMouseX = mouseX;
  lastMouseY = mouseY;

  // filtro suave tipo respiración sonora
  let cutoff = 2000 + x * 8000;
  filterNode.frequency.setTargetAtTime(cutoff, audioCtx.currentTime, 0.1);

  // distorsión mínima controlada por movimiento
  let amount = speed * 0.8;
  distortionNode.curve = makeDistortionCurve(amount);

}


/* ================================
   P5 SKETCH
   ================================ */

function setup() {
  createCanvas(windowWidth, windowHeight);
  center = createVector(width / 2, height / 2);

  /*socket = new WebSocket("ws://localhost:8081");

  socket.onopen = () => {
    console.log("🟢 WebSocket connected");
  };*/

  // crear estrellas
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push(new Star());
  }

  background(0);

  // iniciar audio con interacción (requerido por navegador)
  window.addEventListener("pointerdown", startAudio);

}

function draw() {

  background(0, 40); // deja estela (ambience visual)

  updateAudioFromMouse();

  turbulence += random(-0.002, 0.002);
  turbulence *= 0.98;

  // probabilidad baja de anomalía
  if (!anomaly && random(1) < 0.001) {
    anomaly = true;
    anomalyTimer = random(120, 300); // frames
  }

  // countdown
  if (anomaly) {
    anomalyTimer--;
    if (anomalyTimer <= 0) anomaly = false;
  }

  if (autonomous) {
    autoDensity += random(-0.005, 0.005);
    autoEnergy += random(-0.004, 0.004);

    autoDensity = constrain(autoDensity, 0.05, 0.9);
    autoEnergy = constrain(autoEnergy, 0.1, 1.0);
  }

  let density = map(mouseX, 0, width, 0, 1);
  let energy = map(mouseY, height, 0, 0, 1);

  // enviar a SuperCollider
  /*if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
        density,
        energy,
        anomaly: anomaly ? 1 : 0,
        autonomous: autonomous ? 1 : 0
        }));

  }*/

  translate(center.x, center.y);

  for (let s of stars) {
    s.update(density, energy);
    s.draw();
  }

}

class Star {

  constructor() {

    this.angle = random(TWO_PI);
    this.radius = random(20, min(width, height) / 2);
    this.speed = random(0.0005, 0.003);
    this.size = random(1, 3);

  }

  update(density, energy) {

    let chaos = anomaly ? random(-5, 5) : 0;

    this.angle += (this.speed * density * 5) + chaos * 0.001 + turbulence;

    this.radius += sin(frameCount * 0.001 + this.angle) * energy * (anomaly ? 2 : 0.3);

  }

  draw() {

    let x = cos(this.angle) * this.radius;
    let y = sin(this.angle) * this.radius;

    noStroke();
    fill(255, 180);
    ellipse(x, y, this.size);

  }

}