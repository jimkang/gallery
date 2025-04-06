export default function UniformCache() {
  var locationsForNames = {};

  return { getUniformLocation, setUniform };

  function getUniformLocation({ gl, program, name }) {
    var uniformLocation = locationsForNames[name];
    if (!uniformLocation) {
      uniformLocation = gl.getUniformLocation(program, name);
      locationsForNames[name] = uniformLocation;
    }
    return uniformLocation;
  }

  function setUniform({ gl, program, uniformType, name, value }) {
    var uniformLocation = getUniformLocation({ gl, program, name });
    gl['uniform' + uniformType](uniformLocation, value);
  }
}
