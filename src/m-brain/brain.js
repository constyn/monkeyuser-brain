import Neuron from './neuron';

export default class Brain {
  constructor(config) {
    Object.assign(this, {
      count: 100
    }, config);

    this.setup();
  }

  setup() {
    this.createNeurons();    
    this.setupInterval();
  }

  createNeurons() {
    this.neurons = Array.from(Array(this.count)).map(() => new Neuron())
    this.linkNeurons();
  }

  linkNeurons() {
    let links = this.count * 3;
    while (links) {
      let from = this.getRandomNeuron()
      let to = this.getRandomNeuron()
      from.createLink(to);
      links--;
    }
  }

  getRandomNeuron() {
    return this.neurons[Math.floor(this.neurons.length * Math.random())]
  }

  setupInterval() {
    setInterval(() => {
      this.neurons.forEach(neuron => neuron.chargeLinks());
      this.neurons.forEach(neuron => neuron.applyCharge());
    }, 200);
  }

  getVisData() {

    console.log('getVisData');
    
    return {
      neurons: this.neurons,
      links: [].concat(...this.neurons.map(neuron => neuron.links)),
      step: () => {}
    }
  }
}
