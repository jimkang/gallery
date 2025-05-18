export default `#version 300 es
precision mediump float;

#define PI 3.1415927

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

float rand(float n) {
  return fract(cos(n) * 400000.);
}

float getDistortFactor(vec2 center, vec2 st) {
  vec2 fromCenter = st - center;
  float timeFactor = sin(u_time) * 2.;
  float spaceFactor = sin(fromCenter.x) * 1.;
  float warpedAngle = smoothstep(spaceFactor * PI, 2. * PI, atan(fromCenter.x, fromCenter.y * rand(fromCenter.x)));
  float sinFactor = sin(5. * warpedAngle);
  float cosFactor = cos(atan(st.x, st.y));
  return cosFactor/sinFactor;
}

float distSquared(vec2 center, float radius, vec2 st) {
  vec2 distVec = st - center;
  return dot(distVec, distVec);
}

float isInShape(vec2 center, float baseRadius, float halo, float fuzzThickness, vec2 st) {
  float n = st.x/st.y;
  float radius = pow(rand(n), 1.5) * baseRadius;
  vec2 fromCenter = st - center;
  radius *= getDistortFactor(center, st);

  float distSq = distSquared(center, radius, st);
  distSq = max(.5 * distSq, .5 * distSquared(center, radius + halo, st));

  // distSq = .75 * distSq + .25 * distSq * roughRand(st.x * st.y);

  return smoothstep(distSq, distSq + fuzzThickness, radius * radius);
}

vec3 circleColor(vec2 center, float radius, float halo, vec3 baseColor, vec2 st) {
  float pct = 0.0;
  pct = isInShape(center, radius, halo, 0.001, st);
  
  // float colorPart = 1. - distSquared(center, radius, st)/(radius * radius);
  // Make it flat.
  float colorPart = 1.;

  return pct * colorPart * baseColor;    
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution;

  vec3 color = circleColor(vec2(.25, .5), .15, .0, vec3(.4, .3, 1.), st);
  if (color == vec3(0)) {
    color = circleColor(vec2(.5, .5), .2, .0, vec3(.4, .8, .2), st);
  }
  if (color == vec3(0)) {
    color = circleColor(vec2(.6, .35), .25, .0, vec3(.7, .2, .15), st);
  }
  
  outColor = vec4(color, 1.);
}
`;
