import vertexShaderSrc from './shaders/vertex-shader';
import fragmentShaderSrc from './shaders/bouncing-mondrian-fragment-shader';
import seedrandom from 'seedrandom';
import { createProbable as Probable } from 'probable';
import { range } from 'd3-array';

const maxHeightsCount = 50;
const maxColTotalHeight = 2;

var gl;
var program;
var glBuffer;
var resolutionLocation;
var timeLocation;
var heightsLocation;
var colLengthsLocation;
var colCountLocation;

export default function render({ canvas, seed }) {
  var random = seedrandom(seed);
  var { rollDie } = Probable({ random });

  if (!gl) {
    setUpShaders(canvas);
    window.requestAnimationFrame(renderWithUpdatedTime);
  }

  gl.uniform2fv(resolutionLocation, [canvas.width, canvas.height]);

  const maxColCount = rollDie(4) + rollDie(3);
  var colCount = 0;
  var colLengths = [];
  var totalColLengths = 0;
  var heights = [];

  for (let colIndex = 0; colIndex < maxColCount; ++colIndex) {
    let colLength = rollDie(8) + rollDie(8);
    colLength -= Math.max(0, colLength + totalColLengths - maxHeightsCount);
    if (colLength < 1) {
      break;
    }

    colCount += 1;
    colLengths.push(colLength);
    totalColLengths += colLength;
    let colHeights = range(colLength).map(() => rollDie(3));
    const heightSum = colHeights.reduce((sum, n) => sum + n, 0);
    heights = heights.concat(
      colHeights.map((height) => (height / heightSum) * maxColTotalHeight)
    );
  }

  gl.uniform1i(colCountLocation, colCount);
  gl.uniform1iv(colLengthsLocation, colLengths);
  gl.uniform1fv(heightsLocation, heights);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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

  resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  timeLocation = gl.getUniformLocation(program, 'u_time');
  heightsLocation = gl.getUniformLocation(program, 'u_heights');
  colLengthsLocation = gl.getUniformLocation(program, 'u_colLengths');
  colCountLocation = gl.getUniformLocation(program, 'u_colCount');
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
  gl.uniform1f(timeLocation, timeStamp / 1000);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(renderWithUpdatedTime);
}
