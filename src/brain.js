import uuid from 'uuid4';

const defaultConfig = {
  neuronsCount: 1000,
  maxLinks: 2,
  learningFactor: 0.01,
  unlinkFactor: 0.02,
  stepCleanup: 10,
  weightInitializer: (left, right) => 0.1 + 0.2 * Math.random()
}

let hadStimulus = false;

class Neuron {

  constructor(config) {
    Object.assign(this, {
      id: uuid(),
      value: 0,
      next: [],
      canActivate: value => value > 0.1,
      /** kinda stupid but works for now */
      valueDescent: () => {
        this.value -= 0.1;
      }
    }, config);
  }

  stimulate(forceValue) {
    if (forceValue) {
      hadStimulus = true;
    }

    this.value = forceValue || this.value;
    if (this.canActivate(this.value)) {
      for (let link of this.next) {
        link.activated = true;
        link.target.value = this.value * link.weight;
        link.weight += this.learningFactor;
        if (link.weight > 0.9) {
          link.weight = 0.9;
        }
      }
      this.valueDescent();
    }
  }

}

export default class Brain {
  constructor(config) {
    this.currentStep = 0;
    this.config = Object.assign({}, defaultConfig, config);
    this.buildBrain();
  }

  buildBrain() {
    const neurons = [];
    const links = [];

    for (let i = 0; i < this.config.neuronsCount; i++) {
      const neuron = new Neuron(this.config);
      neurons.push(neuron);
    }

    /** We should come up with a better method to link neurons */
    let errorCount = 100;

    let linkNeurons = (source, target) => {
      let combinedId = `${source.id}-${target.id}`;
      let reversed = `${target.id}-${source.id}`;
      if (source !== target && source.next.length < this.config.maxLinks && !links[combinedId] && !links[reversed]) {
        let link = {
          source,
          target,
          weight: this.config.weightInitializer(source, target)
        };
        links[combinedId] = link;
        source.next.push(link);
      } else {
        errorCount--;
      }
    }

    while (errorCount > 0) {
      let source = neurons[Math.floor(Math.random() * neurons.length)];
      let target = neurons[Math.floor(Math.random() * neurons.length)];
      linkNeurons(source, target);
    }

    const extremities = [];

    /** Link orphan nodes */
    for (let source of neurons) {
      if (source.next.length === 0) {
        extremities.push(source);
        let target = neurons[Math.floor(Math.random() * neurons.length)];
        linkNeurons(source, target);
      }
    }

    Object.assign(this, {
      neurons,
      links,
      extremities
    });
  }

  step() {
    this.currentStep++;
    if (this.currentStep < this.config.stepCleanup) {
      for (let neuron of this.neurons) {
        neuron.stimulate();
      }
    } else if (hadStimulus) {

      hadStimulus = false;
      this.currentStep = 0;
      let linksDecreased = 0;
      for (let link of Object.values(this.links)) {
        if (!link.activated) {
          link.weight -= this.config.unlinkFactor;
          linksDecreased++;
          if (link.weight < 0) {
            link.weight = 0;
          }
        }
        link.activated = false;
      }
      console.log(`Links decreased: ${linksDecreased}`);

    }
  }

  borrowSpecializedNode(name) {
    let specialized;
    while (!specialized) {
      let neuron = this.neurons[Math.floor(Math.random() * this.neurons.length)];
      if (!neuron.isSpecialized) {
        specialized = neuron;
        neuron.isSpecialized = true;
        Object.assign(specialized, {
          name
        });
        break;
      }
    }

    return specialized;
  }
}
