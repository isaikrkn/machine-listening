import { DataEngine } from "./dataEngine.js"

let particles=[]
let center

const NUM_PARTICLES = 3000

let dataEngine
let plantData

let audioCtx
let source


/* ================================
   AUDIO LOOP (NO INTERACTION)
================================ */

async function startAudio(){

if(audioCtx) return

audioCtx = new (window.AudioContext||window.webkitAudioContext)()

const response = await fetch("./assets/audio/machine-listening.wav")

const arrayBuffer = await response.arrayBuffer()

const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

source = audioCtx.createBufferSource()
source.buffer = audioBuffer
source.loop = true

source.connect(audioCtx.destination)

source.start()

console.log("machine listening audio started")

}


/* ================================
   SETUP
================================ */

function setup(){

createCanvas(windowWidth,windowHeight)

center=createVector(width/2,height/2)

dataEngine=new DataEngine()

for(let i=0;i<NUM_PARTICLES;i++){

particles.push(new Particle())

}

background(0)

window.addEventListener("pointerdown",startAudio)

}


/* ================================
   DRAW
================================ */

function draw(){

background(0,25)

plantData=dataEngine.update()

translate(center.x,center.y)

let energy = (plantData.wind + plantData.solar)/2

let turbulence = plantData.noise

let networkFlow = plantData.network


for(let p of particles){

p.update(energy,turbulence,networkFlow)
p.draw()

}

resetMatrix()

drawScientificOverlay()

}


/* ================================
   PARTICLE CLASS
================================ */

class Particle{

constructor(){

this.angle=random(TWO_PI)

this.radius=random(20,min(width,height)/2)

this.baseRadius=this.radius

this.speed=random(0.0003,0.002)

this.size=random(0.5,2)

}

update(energy,turbulence,network){

this.angle += this.speed * (1 + energy*6)

this.radius = this.baseRadius +
sin(frameCount*0.002 + this.angle)*energy*2

this.radius += random(-turbulence*2,turbulence*2)

this.angle += network*0.002

}

draw(){

let x=cos(this.angle)*this.radius
let y=sin(this.angle)*this.radius

let d = dist(0,0,x,y)

let alpha = map(d,0,width/2,255,60)

noStroke()

fill(255,alpha)

ellipse(x,y,this.size)

}

}


/* ================================
   DATA OVERLAY (SCIENTIFIC UI)
================================ */

function drawScientificOverlay(){

fill(255)

textSize(13)

text("MACHINE LISTENING NETWORK",30,30)

text("WIND FIELD: "+nf(plantData.wind,1,2),30,60)
text("SOLAR ENERGY: "+nf(plantData.solar,1,2),30,80)
text("INDUSTRIAL NOISE: "+nf(plantData.noise,1,2),30,100)
text("NETWORK FLOW: "+nf(plantData.network,1,2),30,120)


drawMiniField(width*0.15,height*0.2,plantData.wind)
drawMiniField(width*0.85,height*0.2,plantData.solar)
drawMiniField(width*0.15,height*0.8,plantData.noise)
drawMiniField(width*0.85,height*0.8,plantData.network)

}


/* ================================
   MINI DATA GALAXY
================================ */

function drawMiniField(x,y,value){

push()

translate(x,y)

let particles=60

for(let i=0;i<particles;i++){

let angle=TWO_PI*i/particles + frameCount*0.02

let r = 50*value

let px = cos(angle)*r
let py = sin(angle)*r

fill(255,120)

ellipse(px,py,2)

}

pop()

}


/* ================================
   RESIZE
================================ */

function windowResized(){

resizeCanvas(windowWidth,windowHeight)

center=createVector(width/2,height/2)

}