let audio;
let started = false;

async function init(){

audio = new Audio("./assets/audio/machine-listening.wav");

audio.loop = true;
audio.volume = 1.0;

await audio.play();

console.log("galaxy audio started");

}

document.addEventListener("pointerdown", async ()=>{

if(!started){

started = true;

await init();

}

});