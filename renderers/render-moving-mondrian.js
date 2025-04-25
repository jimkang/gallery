import vertexShaderSrc from './shaders/vertex-shader';
import fragmentShaderSrc from './shaders/moving-mondrian-fragment-shader';
import seedrandom from 'seedrandom';
import { createProbable as Probable } from 'probable';
import UniformCache from './uniforms';
import { range } from 'd3-array';

var gl;
var program;
var glBuffer;
var { setUniform } = UniformCache();

export default function render({ canvas, seed, barThickness = 0.01 }) {
  var random = seedrandom(seed);
  var { rollDie, shuffle } = Probable({ random });

  if (!gl) {
    setUpShaders(canvas);
    window.requestAnimationFrame(renderWithUpdatedTime);
  }

  const verticalBarDesiredCount = 8 + rollDie(8);
  const verticalBarXs = divideRangeRandomly({
    count: verticalBarDesiredCount,
    numberOfUnits: 24,
    minimum: 0,
    maximum: 1,
  });

  const horizontalBarDesiredCount = 8 + rollDie(8);
  const horizontalBarYs = divideRangeRandomly({
    count: horizontalBarDesiredCount,
    numberOfUnits: 24,
    minimum: 0,
    maximum: 1,
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

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  function divideRangeRandomly({ count, numberOfUnits, minimum, maximum }) {
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
}

function setUpShaders(canvas) {
  gl = getRenderingContext(canvas);

  var vertexShader = createShader(vertexShaderSrc, gl.VERTEX_SHADER);
  var fragmentShader = createShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);

  program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var linkErrLog = gl.getProgramInfoLog(program);
    cleanup();
    throw new Error(
      `Shader program did not link successfully. Error log:\n${linkErrLog}`
    );
  }

  initializeGlAttributes();

  gl.useProgram(program);

  setUniform({
    gl,
    program,
    uniformType: '2fv',
    name: 'u_resolution',
    value: [canvas.width, canvas.height],
  });

  // cleanup();
}

function initializeGlAttributes() {
  var squareArray = gl.createVertexArray();
  gl.bindVertexArray(squareArray);

  var positions = new Float32Array([
    -1, -1, 0,
    //
    1, -1, 0,
    //
    -1, 1, 0,
    //
    1, 1, 0,
  ]);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
}

function cleanup() {
  gl.useProgram(null);
  if (glBuffer) {
    gl.deleteBuffer(glBuffer);
  }
  if (program) {
    gl.deleteProgram(program);
  }
}

function getRenderingContext(canvas) {
  var gl = canvas.getContext('webgl2');

  if (!gl) {
    throw new Error(
      'Failed to get WebGL context. Your browser or device may not support WebGL 2.'
    );
  }
  return gl;
}

function createShader(src, shaderType) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

function renderWithUpdatedTime(timeStamp) {
  setUniform({
    gl,
    program,
    uniformType: '1f',
    name: 'u_time',
    value: timeStamp / 1000,
  });
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(renderWithUpdatedTime);
}
