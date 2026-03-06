let stars = [];
let center;

const NUM_STARS = 400;

let audioCtx;
let source;

async function startAudio(){

if(audioCtx) return;

audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const response = await fetch("./assets/audio/machine-listening.wav");

const arrayBuffer = await response.arrayBuffer();

const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

source = audioCtx.createBufferSource();
source.buffer = audioBuffer;
source.loop = true;

source.connect(audioCtx.destination);

source.start();

console.log("audio loop started");

}

function setup(){

createCanvas(windowWidth, windowHeight);

center = createVector(width/2,height/2);

for(let i=0;i<NUM_STARS;i++){

stars.push(new Star());

}

background(0);

window.addEventListener("pointerdown",startAudio);

}

function draw(){

background(0,40);

translate(center.x,center.y);

for(let s of stars){

s.update();

s.draw();

}

}

class Star{

constructor(){

this.angle=random(TWO_PI);

this.radius=random(20,min(width,height)/2);

this.speed=random(0.0005,0.003);

this.size=random(1,3);

}

update(){

this.angle+=this.speed;

this.radius+=sin(frameCount*0.001+this.angle)*0.3;

}

draw(){

let x=cos(this.angle)*this.radius;
let y=sin(this.angle)*this.radius;

noStroke();
fill(255,180);

ellipse(x,y,this.size);

}

}