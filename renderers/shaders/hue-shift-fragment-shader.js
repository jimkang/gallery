export default `#version 300 es
precision mediump float;

#define RGB_PERIOD 1.
#define RGB_AMP 1.5

out vec4 outColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float rgbWave(float x, float phaseShift) {
  float y = mod(x + RGB_PERIOD/2. + phaseShift, RGB_PERIOD);
  y = abs(y - RGB_PERIOD/2.);
  y = 4. * RGB_AMP * y - RGB_AMP + .5;
  return clamp(y, 0., 1.);
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

  float r = rgbWave(st.x, .5);
  float g = rgbWave(st.x, 1./6.);
  float b = rgbWave(st.x, -7./6.);
  vec3 lineColor = vec3(r, g, b);


  float greenLineOn = 1. - step(.01, abs(st.y - g));
  if (greenLineOn > 0.) {
    lineColor = vec3(0., 1., 0.);
  } else {
    float redLineOn = 1. - step(.01, abs(st.y - r));
    if (redLineOn > 0.) {
      lineColor = vec3(1., 0., 0.);
    } else {
      float blueLineOn = 1. - step(.01, abs(st.y - b));
      if (blueLineOn > 0.) {
        lineColor = vec3(0., 0., 1.);
      }
    }
  }

  outColor = vec4(lineColor, 1.);
}
`;
