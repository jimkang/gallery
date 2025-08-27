export default `#version 300 es
precision mediump float;

#define PI 3.14159265359

out vec4 outColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// signedDistanceSine from https://www.shadertoy.com/view/7djSzK
// See: https://www.desmos.com/calculator/hvqys18zux
// f: frequency
// a: amplitude
float signedDistanceSine(in vec2 p, in float f, in float a) {
  f *= PI * a;
  p /= a; // Modify to handle varying amplitude
  float period = PI / f;
  float halfPeriod = 0.5 * period;
  float fSquared = f * f;
  // Remap p to be inside of a period.
  p = vec2(
    mod(p.x, period) - halfPeriod,
    p.y * sign(period - mod(p.x + halfPeriod, 2.0 * period))
  ); 

  // Get closest on linear approximation
  float closestXGuess = clamp((0.818309886184 * f * p.y + p.x) / (0.669631069826 * fSquared + 1.0), -halfPeriod, halfPeriod);

  // Iterations of Newton-Raphson
  for (int n=0; n < 5; n++) {
    float k = closestXGuess * f, c = cos(k), s = sin(k);
    closestXGuess -= ((s - p.y) * c * f + closestXGuess - p.x) / ((c * c - s * s + s * p.y) * fSquared + 1.0);
  }

  return length(p - vec2(closestXGuess, sin(closestXGuess * f))) * a;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

  // float on = step(distance(st, vec2(st.x, .5 * sin(st.x * 2. * PI) + .5)), .1);
  float on = signedDistanceSine(vec2(st.x, st.y - .5), 4., .125);
  outColor = vec4(vec3(on), 1.0);
}
`;
