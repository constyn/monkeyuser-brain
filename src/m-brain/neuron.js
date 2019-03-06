import uuid from 'uuid4';

export default class Neuron {

  constructor(config) {
    Object.assign(this, {
      id: uuid(),
      charge: 0,
      value: 0,
      links: [],
      threshold: Math.random(),
      canActivate: () => this.value > this.threshold 
    }, config);
  }

  createLink(neuron, weight = 0.1) {
    if (this !== neuron) {
      this.links.push({
        source: this,
        target: neuron,
        charge: 0,
        weight
      })
    }
  }

  chargeLinks() {
    let value = this.canActivate() ? this.value - this.threshold : 0;
    this.links.forEach(link => link.charge = value * link.weight)
    this.value = 0;
  }

  applyCharge() {
    this.links.forEach(link => { 
      link.target.value += link.charge;
      if (link.charge) {
        link.weight += 0.01;
      } else {
        link.weight -= 0.0001;
      }
      if (link.weight < 0) {
        link.weight = 0;
      }
    })
  }

  stimulate() {
    this.value = 1;
    this.chargeLinks()
    this.applyCharge() 
  }
}
