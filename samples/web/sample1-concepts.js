import {
  Brain
} from '../../src';

const TRAINING_STEPS = 10;

const brain = new Brain({
  neurons: 300,
  maxLinks: 2,
  stepCleanup: 10
});

const [cat, lion, feline, rat, mouse, rodent] = [
  brain.borrowSpecializedNode('cat'),
  brain.borrowSpecializedNode('lion'),
  brain.borrowSpecializedNode('feline'),
  brain.borrowSpecializedNode('rat'),
  brain.borrowSpecializedNode('mouse'),
  brain.borrowSpecializedNode('rodent'),
];

/** Train the network in pairs cat + feline and lion + feline */
for (let group of [
    [cat, feline],
    [lion, feline],
    //[rat, rodent],
    //[mouse, rodent]
  ]) {
  for (let j = 0; j < TRAINING_STEPS; j++) {
    group[0].stimulate(1);
    group[1].stimulate(1);

    for (let i = 0; i < brain.config.stepCleanup; i++) {
      brain.step();
    }
  }
}
export default brain;
