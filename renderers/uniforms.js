var locationsForNames = {};

export function getUniformLocation({ gl, program, name }) {
  var uniformLocation = locationsForNames[name];
  if (!uniformLocation) {
    uniformLocation = gl.getUniformLocation(program, name);
    locationsForNames[name] = uniformLocation;
  }
  return uniformLocation;
}

export function setUniform({ gl, program, uniformType, name, value }) {
  var uniformLocation = getUniformLocation({ gl, program, name });
  gl['uniform' + uniformType](uniformLocation, value);
}
