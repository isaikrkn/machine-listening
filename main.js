let audioContext;
let source;
let buffer;
let started = false;

async function initAudio(){

  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const response = await fetch("./assets/audio/machine-listening.wav");

  const arrayBuffer = await response.arrayBuffer();

  buffer = await audioContext.decodeAudioData(arrayBuffer);

  source = audioContext.createBufferSource();

  source.buffer = buffer;

  source.loop = true;

  source.connect(audioContext.destination);

  source.start(0);

  console.log("machine listening audio started");

}

document.addEventListener("pointerdown", async () => {

  if(!started){

    started = true;

    await initAudio();

  }

});