import { AudioEngine } from "./audioEngine.js";

let audio;
let started=false;

let lastX=0;
let lastY=0;

async function init(){

audio = new AudioEngine();

await audio.resume();

await audio.load("./assets/audio/machine-listening.wav");

audio.playLoop();

console.log("galaxy audio started");

}

document.addEventListener("pointerdown",async()=>{

if(!started){

started=true;
await init();

}

});

document.addEventListener("pointermove",(e)=>{

if(!audio) return;

let x = e.clientX/window.innerWidth;
let y = e.clientY/window.innerHeight;

let speed = Math.abs(e.movementX)+Math.abs(e.movementY);

audio.updateFromInteraction(x,y,speed*0.01);

lastX=x;
lastY=y;

});