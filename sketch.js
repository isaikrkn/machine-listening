let stars = [];
let center;
const NUM_STARS = 400;

function setup() {
  console.log("p5 setup running");

  createCanvas(window.innerWidth, window.innerHeight);
  center = createVector(width / 2, height / 2);

  for (let i = 0; i < NUM_STARS; i++) {
    stars.push(new Star());
  }

  background(0);
}

function draw() {
  background(0, 40);

  translate(center.x, center.y);

  // usar estado desde audioEngine si existe
  let density = window.audioEngine?.globalState?.density ?? 0.5;
  let energy  = window.audioEngine?.globalState?.energy ?? 0.5;

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
    this.angle += this.speed * density * 5;
    this.radius += sin(frameCount * 0.001 + this.angle) * energy * 0.3;
  }

  draw() {
    let x = cos(this.angle) * this.radius;
    let y = sin(this.angle) * this.radius;

    noStroke();
    fill(255, 180);
    ellipse(x, y, this.size);
  }
}