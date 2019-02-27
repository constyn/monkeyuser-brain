import Neuron from './neuron';

const defaultConfig = {
  neurons: 100,
  maxLinks: 2,
  friction: 0.1,
  degradation: 0.01,
  learningRate: 0.01,
  linkDegradationRate: 0.005,
  timeToRest: 10,
  maxActiveSteps: 5
}

export default class Brain {
  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.buildBrain();
  }

  buildBrain() {
    let neurons = [];
    let links = {};

    for (let i = 0; i < this.config.neurons; i++) {
      let neuron = new Neuron({
        maxActiveSteps: this.config.maxActiveSteps,
        timeToRest: this.config.timeToRest
      });
      neurons.push(neuron);
    }

    /** we need to come up with a better way to do this */
    for (let i = 0; i < this.config.neurons * 2; i++) {
      let source = neurons[Math.floor(Math.random() * neurons.length)];
      let target = neurons[Math.floor(Math.random() * neurons.length)];
      let combinedId = `${source.id}-${target.id}`;
      let reversed = `${target.id}-${source.id}`;
      if (source !== target && source.next.length < this.config.maxLinks && !links[combinedId] && !links[reversed]) {
        let link = {
          source,
          target,
          weight: Math.random()
        };
        links[combinedId] = link;
        source.next.push(link);
      }
    }

    this.topology = {
      neurons,
      links
    }
  }

  getSpecializedNeuron(name, config) {
    let selected;
    for (let neuron of this.topology.neurons) {
      if (!neuron.isSpecialized && neuron.next.length > 0) {
        selected = neuron;
        Object.assign(selected, {
          isSpecialized: true,
          name
        }, config);
        break;
      }
    }
    return selected;
  }

  step(frozen = false) {
    const {
      degradation,
      friction,
      learningRate
    } = this.config;
    for (let neuron of this.topology.neurons) {
      const {
        value,
        next,
        activation
      } = neuron;

      const active = activation(value);

      if (active && next.length > 0) {
        for (let rightLink of next) {
          if (!frozen) {
            rightLink.target.value = rightLink.target.value + (value - friction) * rightLink.weight;
            rightLink.weight += learningRate;
          }
          rightLink.target.triggered = true;
        }
      }

      neuron.value -= degradation;
      if (neuron.value < 0) {
        neuron.value = 0;
      }

    }
  }

  clear(frozen = false) {
    for (let neuron of this.topology.neurons) {
      if (!neuron.triggered) {
        for (let rightLink of neuron.next) {
          if (!frozen) {
            rightLink.weight -= this.config.linkDegradationRate;
          }
          if (rightLink.weight < 0) {
            rightLink.weight = 0;
          }
        }
      }
      neuron.triggered = false;
      neuron.value = 0;
    }
  }

  getActiveNeurons(except) {
    const list = [];

    for (let neuron of this.topology.neurons) {
      if (neuron !== except && neuron.value > 0) {
        list.push(neuron);
      }
    }

    return list;
  }
}
