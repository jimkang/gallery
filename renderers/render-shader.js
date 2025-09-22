import vertexShaderSrc from './shaders/vertex-shader';
import UniformCache from './uniforms';

export function RenderShader({ setCustomUniforms, fragmentShaderSrc }) {
  var gl;
  var program;
  var { setUniform } = UniformCache();
  var updateKey;

  return {
    render,
    updateViewport,
    cleanUp,
  };

  function updateViewport() {
    if (!gl) {
      return;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    setUniform({
      gl,
      program,
      uniformType: '2fv',
      name: 'u_resolution',
      value: [gl.canvas.width, gl.canvas.height],
    });
  }

  function render({ canvas, reinitGL, on, customParams }) {
    if (!on) {
      cleanUp();
      return;
    }

    if (reinitGL && gl && program) {
      gl.deleteProgram(program);
      program = undefined;
      gl = undefined;
    }

    if (!gl || !program) {
      ({ gl, program } = setUpShaders({
        canvas,
        fragmentShaderSrc,
      }));
    }

    ({ setUniform } = UniformCache());

    if (updateKey) {
      window.cancelAnimationFrame(updateKey);
    }
    updateKey = window.requestAnimationFrame(renderWithUpdatedTime);

    if (setCustomUniforms) {
      setCustomUniforms({ gl, program, setUniform, customParams });
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    function renderWithUpdatedTime(timeStamp) {
      setUniform({
        gl,
        program,
        uniformType: '1f',
        name: 'u_time',
        value: timeStamp / 1000,
      });

      if (setCustomUniforms) {
        setCustomUniforms({ gl, program, setUniform, customParams });
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      updateKey = requestAnimationFrame(renderWithUpdatedTime);
    }
  }

  function setUpShaders({ canvas, fragmentShaderSrc }) {
    var gl = getRenderingContext(canvas);

    var vertexShader = createShader({
      gl,
      src: vertexShaderSrc,
      shaderType: gl.VERTEX_SHADER,
    });
    var fragmentShader = createShader({
      gl,
      src: fragmentShaderSrc,
      shaderType: gl.FRAGMENT_SHADER,
    });

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      var linkErrLog = gl.getProgramInfoLog(program);
      cleanUp(gl, program);
      throw new Error(
        `Shader program did not link successfully. Error log:\n${linkErrLog}`
      );
    }

    initializeGlAttributes(gl);

    gl.useProgram(program);

    return { gl, program };
  }

  function cleanUp(gl, program) {
    if (gl) {
      gl.useProgram(null);
      if (program) {
        gl.deleteProgram(program);
      }
    }
    if (updateKey) {
      window.cancelAnimationFrame(updateKey);
      updateKey = null;
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
}

function initializeGlAttributes(gl) {
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
function createShader({ gl, src, shaderType }) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}
