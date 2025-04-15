import vertexShaderSrc from './shaders/vertex-shader';
import fragmentShaderSrc from './shaders/moving-mondrian-fragment-shader';
import seedrandom from 'seedrandom';
import { createProbable as Probable } from 'probable';
import UniformCache from './uniforms';

var gl;
var program;
var glBuffer;
var { setUniform } = UniformCache();

export default function render({ canvas, seed, barThickness = 0.01 }) {
  var random = seedrandom(seed);
  var { rollDie, roll } = Probable({ random });

  if (!gl) {
    setUpShaders(canvas);
    window.requestAnimationFrame(renderWithUpdatedTime);
  }

  const verticalBarDesiredCount = 4 + rollDie(4);
  const verticalBarXs = generateNumbersOverRange({
    count: verticalBarDesiredCount,
    minimum: 0,
    maximum: 1,
    minGap: barThickness,
  });

  const horizontalBarDesiredCount = 4 + rollDie(8);
  const horizontalBarYs = generateNumbersOverRange({
    count: horizontalBarDesiredCount,
    minimum: 0,
    maximum: 1,
    minGap: barThickness,
  });

  console.log(verticalBarXs, horizontalBarYs);

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

  function generateNumbersOverRange({ count, minGap, minimum, maximum }) {
    var numbers = [];
    const avgDist = (maximum - minimum) / count - minGap;
    var number;
    do {
      if (number === undefined) {
        number = minimum + roll(2 * avgDist * 1000) / 1000;
      } else {
        number += minGap + roll(2 * avgDist * 1000) / 1000;
      }

      if (number <= maximum) {
        numbers.push(number);
      }
    } while (numbers.length < count && number < maximum);

    return numbers;
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
