import * as d3 from 'd3';

const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
document.body.append(svgElem);

/** D3 svg element */
const svg = d3.select(svgElem);

/** Color scheme */
const color = d3.scaleOrdinal(d3.schemeCategory10);

export default function visualize(brain, config) {

  /** ref to tick function */
  let tick;

  const configuration = Object.assign({
    runStepper: true,
    allowDrag: true,
    nodeSize: 5,
    click: node => {
      node.stimulate(1);
    }
  }, config)

  const {
    links,
    neurons
  } = brain;

  const linksArr = Object.values(links);

  const simulation = d3.forceSimulation(neurons)
    .force('link', d3.forceLink(linksArr).id(d => d.id).distance(10))
    .force('charge', d3.forceManyBody().strength(-10))
    .force('center', d3.forceCenter(document.body.clientWidth / 2, document.body.clientHeight / 2));

  /** Links D3 Reference */
  const link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(linksArr)
    .enter().append('line')
    .attr('stroke', '#000')
    .attr('stroke-width', d => d.weight);

  /** Node D3 Reference */
  const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(neurons)
    .enter().append('g')
    .on('click', d => configuration.click(d))

  if (configuration.allowDrag) {
    node.call(d3.drag()
      .on('start', d => {
        if (!d3.event.active) {simulation.alphaTarget(0.3).restart();}
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', d => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      })
      .on('end', d => {
        if (!d3.event.active) {simulation.alphaTarget(0);}
        d.fx = null;
        d.fy = null;
      }))
  }

  /** Node Circle D3 Dataset reference - will be needed to update node state */
  const circles = node.append('circle')
    .attr('r', configuration.nodeSize)
    .attr('fill', d => 'rgba(0,255,0,0.1)')
    .attr('stroke', d => color(d.cathegory))

  /** Add text to each node - won't save reference because at the moment we are not changing it over time */
  node.append('text')
    .text(function (d) {
      return d.name;
    })
    .attr('font-size', 8)
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -6);

  tick = (step = false, frozen = false) => {
    if (step) {
      brain.step(frozen);
    }
    link
      .attr('x1', function (d) {
        return d.source.x;
      })
      .attr('y1', function (d) {
        return d.source.y;
      })
      .attr('x2', function (d) {
        return d.target.x;
      })
      .attr('y2', function (d) {
        return d.target.y;
      })
      .attr('stroke-width', d => d.weight);

    node
      .attr('transform', function (d) {
        return `translate(${d.x},${d.y})`;
      });

    circles
      .attr('fill', d => `rgba(0, 0, 255, ${d.value})`)
  }

  simulation
    .nodes(neurons)
    .on('tick', tick);

  simulation.force('link')
    .links(linksArr);

  let stepperCount;
  let startStepper = (interval = 100) => {
    if (!stepperCount) {
      stepperCount = setInterval(() => {
        brain.step();
      }, interval);
    }
  }

  let stopStepper = () => {
    clearInterval(stepperCount);
    stepperCount = undefined;
  }

  if (configuration.runStepper) {
    startStepper(100);
  }

  const tools = {
    startStepper,
    stopStepper,
    step: () => {
      brain.step()
    }
  }

  return tools;

}
