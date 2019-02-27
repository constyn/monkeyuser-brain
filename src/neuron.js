import uuid from 'uuid4';

export default class Neuron {

  constructor(config /** maybe */ ) {
    this.config = Object.assign({
      maxActiveSteps: 5,
      timeToRest: 10,
    }, config);

    let mode = 0; /** pending */
    let step = 0;

    let activate = val => {
      if (val > 0.2) {
        step++;
        if (mode === 0 && step > this.config.maxActiveSteps) {
          mode = 1;
          step = 0;
          this.value = 0;
        } else if (mode === 1 && step > this.config.timeToRest) {
          mode = 0;
          step = 0;
          this.value = 0;
        } else {
          return true;
        }
      }
    }

    Object.assign(this, {
      id: uuid(),
      next: [],
      isSpecialized: false,
      name: '',
      value: 0,
      step: this.config.deactivationSteps,
      cathegory: 0 /** unspecialized - for coloring only */ ,
      activation: () => this.value > 0.2
    });
  }




}
