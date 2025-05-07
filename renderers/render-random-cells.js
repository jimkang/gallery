import vertexShaderSrc from './shaders/vertex-shader';
import fragmentShaderSrc from './shaders/random-cells-fragment-shader';
import UniformCache from './uniforms';

var gl;
var program;
var glBuffer;
var { setUniform } = UniformCache();

export default function render({ canvas }) {
  if (!gl) {
    setUpShaders(canvas);
    window.requestAnimationFrame(renderWithUpdatedTime);
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  setUniform({
    gl,
    program,
    uniformType: '2fv',
    name: 'u_resolution',
    value: [canvas.width, canvas.height],
  });

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
