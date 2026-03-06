let sound;
let fft;
let stars = [];

function preload(){

sound = loadSound("assets/audio/machine-listening.wav");

}

function setup(){

createCanvas(windowWidth, windowHeight);

fft = new p5.FFT();

for(let i=0;i<400;i++){

stars.push({
x: random(width),
y: random(height),
size: random(1,3)
});

}

background(0);

}

function draw(){

background(0,40);

let spectrum = fft.analyze();

for(let s of stars){

let energy = spectrum[int(random(spectrum.length))];

fill(energy,150,255);
noStroke();

circle(
s.x,
s.y,
s.size + energy*0.05
);

}

}

function mousePressed(){

if(!sound.isPlaying()){

sound.loop();

}

}

function windowResized(){

resizeCanvas(windowWidth,windowHeight);

}