import { RenderShader } from './render-shader.js';
import fragmentShaderSrc from './shaders/moving-mondrian-fragment-shader';
import seedrandom from 'seedrandom';
import { createProbable as Probable } from 'probable';
import { range } from 'd3-array';

var renderShader;

export default function render({ canvas, seed, barThickness = 0.005 }) {
  var random = seedrandom(seed);
  var { rollDie, shuffle } = Probable({ random });

  if (!renderShader) {
    renderShader = RenderShader({ fragmentShaderSrc, setCustomUniforms });
  }
  renderShader({ canvas });

  function setCustomUniforms({ gl, program, setUniform }) {
    const verticalBarDesiredCount = 8 + rollDie(8);
    const verticalBarXs = divideRangeRandomly({
      count: verticalBarDesiredCount,
      numberOfUnits: 24,
      minimum: 0,
      maximum: 1,
      rollDie,
      shuffle,
    });

    const horizontalBarDesiredCount = 8 + rollDie(8);
    const horizontalBarYs = divideRangeRandomly({
      count: horizontalBarDesiredCount,
      numberOfUnits: 24,
      minimum: 0,
      maximum: 1,
      rollDie,
      shuffle,
    });

    console.log('verticalBarXs', verticalBarXs);
    console.log('horizontalBarYs', horizontalBarYs);

    setUniform({
      gl,
      program,
      uniformType: '1f',
      name: 'u_barThickness',
      value: barThickness,
    });
    setUniform({
      gl,
      program,
      uniformType: '1i',
      name: 'u_verticalBarCount',
      value: verticalBarXs.length,
    });
    setUniform({
      gl,
      program,
      uniformType: '1i',
      name: 'u_horizontalBarCount',
      value: horizontalBarYs.length,
    });
    setUniform({
      gl,
      program,
      uniformType: '1fv',
      name: 'u_verticalBarXs',
      value: verticalBarXs,
    });
    setUniform({
      gl,
      program,
      uniformType: '1fv',
      name: 'u_horizontalBarYs',
      value: horizontalBarYs,
    });
  }
}

function divideRangeRandomly({
  count,
  numberOfUnits,
  minimum,
  maximum,
  rollDie,
  shuffle,
}) {
  const maxRange = maximum - minimum;
  const unitSize = maxRange / numberOfUnits;
  const maxUnitsPerDeal = Math.floor((numberOfUnits / count) * 3);

  var unitsPerDivision = range(count).map(() => 1);
  var remainingUnits = numberOfUnits - count;
  if (remainingUnits > 0) {
    let i = 0;
    do {
      let extraUnits = rollDie(Math.min(maxUnitsPerDeal, remainingUnits));
      unitsPerDivision[i] += extraUnits;
      remainingUnits -= extraUnits;
      i += 1;
      if (i >= unitsPerDivision.length) {
        i = 0;
      }
    } while (remainingUnits > 0);
    unitsPerDivision = shuffle(unitsPerDivision);
  }

  var divisionSizes = unitsPerDivision.map((units) => units * unitSize);
  var divisionPositions = [0];

  for (let i = 1; i < count; ++i) {
    divisionPositions[i] = divisionPositions[i - 1] + divisionSizes[i - 1];
  }
  return divisionPositions;
}
