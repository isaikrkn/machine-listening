export class AudioEngine {

constructor(){

this.ctx = new (window.AudioContext || window.webkitAudioContext)();

this.master = this.ctx.createGain();
this.master.gain.value = 0.8;
this.master.connect(this.ctx.destination);

this.filter = this.ctx.createBiquadFilter();
this.filter.type = "lowpass";
this.filter.frequency.value = 8000;

this.distortion = this.ctx.createWaveShaper();
this.distortion.curve = this.makeDistortionCurve(0);
this.distortion.oversample = "4x";

this.gain = this.ctx.createGain();
this.gain.gain.value = 0.9;

this.filter.connect(this.distortion);
this.distortion.connect(this.gain);
this.gain.connect(this.master);

this.source = null;

}

async resume(){
if(this.ctx.state === "suspended"){
await this.ctx.resume();
}
}

async load(url){

const res = await fetch(url);
const arrayBuffer = await res.arrayBuffer();
this.buffer = await this.ctx.decodeAudioData(arrayBuffer);

}

playLoop(){

this.source = this.ctx.createBufferSource();
this.source.buffer = this.buffer;
this.source.loop = true;

this.source.connect(this.filter);

this.source.start();

}

updateFromInteraction(x,y,speed){

// filtro respiración
let cutoff = 2000 + x * 6000;
this.filter.frequency.setTargetAtTime(cutoff,this.ctx.currentTime,0.1);

// distorsión suave
let amount = speed * 30;
this.distortion.curve = this.makeDistortionCurve(amount);

}

makeDistortionCurve(amount){

let k = amount;
let n = 44100;
let curve = new Float32Array(n);
let deg = Math.PI/180;

for(let i=0;i<n;i++){

let x = i*2/n-1;
curve[i]=(3+k)*x*20*deg/(Math.PI+k*Math.abs(x));

}

return curve;

}

}