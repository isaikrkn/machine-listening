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


const NUM_STARS = 400;

function setup() {
  console.log("p5 setup running");
  createCanvas(windowWidth, windowHeight);
  center = createVector(width / 2, height / 2);

  new WebSocket("wss://machine-listening.onrender.com");
  socket.onopen = () => {
    console.log("🟢 WebSocket connected");
  };

  // crear estrellas
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push(new Star());
  }

  background(0);
}

function draw() {
  console.log("drawing frame");
  background(0, 40); // deja estela (ambience visual)

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
  autoEnergy  += random(-0.004, 0.004);

  autoDensity = constrain(autoDensity, 0.05, 0.9);
  autoEnergy  = constrain(autoEnergy, 0.1, 1.0);
}


  
  let density = map(mouseX, 0, width, 0, 1);
  let energy  = map(mouseY, height, 0, 0, 1);

  // enviar a SuperCollider
  if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
        density,
        energy,
        anomaly: anomaly ? 1 : 0,
        autonomous: autonomous ? 1 : 0      
        }));

  }

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

    this.angle += (this.speed * density * 5) + chaos * 0.001;
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
