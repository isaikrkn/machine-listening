// Simulated infrastructure data engine
// Later this can connect to real APIs

export class DataEngine {

constructor(){

this.data={
wind:0.5,
solar:0.6,
noise:0.4,
network:0.5
}

}

update(){

// slow natural variation

this.data.wind += random(-0.005,0.005)
this.data.solar += random(-0.004,0.004)
this.data.noise += random(-0.01,0.01)
this.data.network += random(-0.006,0.006)

this.data.wind = constrain(this.data.wind,0,1)
this.data.solar = constrain(this.data.solar,0,1)
this.data.noise = constrain(this.data.noise,0,1)
this.data.network = constrain(this.data.network,0,1)

return this.data

}

}