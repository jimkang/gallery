export default `#version 300 es
precision mediump float;

#define PI 3.1415927

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

float rand(float n) {
  return fract(cos(n) * 400000.);
}

float smoothrand(float n) {
  return mix(rand(n), rand(n + 1.), smoothstep(0., 1., n));
}

float rand2d(vec2 pt, vec2 st) {
  return fract(sin(
    dot(pt, st * (.8 + mod(rand(st.x), .2))) * 100.
  ));
}

float getDistortFactor(vec2 center, vec2 st) {
  vec2 fromCenter = st - center;
  float timeFactor = sin(u_time) * 2.;
  float spaceFactor = sin(fromCenter.x) * 1.;
  float smearFactor = rand2d(fromCenter, st);
  float warpedAngle = smoothstep(spaceFactor * PI, 2. * PI, atan(fromCenter.x, fromCenter.y * smearFactor));
  float spikeFactor = 6.;
  float sinFactor = sin(spikeFactor * warpedAngle);
  float cosFactor = cos(atan(fromCenter.y, fromCenter.x));
  return sinFactor + sinFactor * cosFactor;
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

  // Stutter
  //vec2 guy1Pos = vec2(.25, .5) + mix(sin(u_time), tan(rand(u_time)), .5);
  vec2 guy1Pos = vec2(.25, .5) + vec2(cos(u_time/2.), sin(u_time * 2.))/4.;
  // guy1Pos *= getDistortFactor(guy1Pos, st * u_time);
  vec2 guy2Pos = vec2(.5);
  // guy2Pos += guy2Pos * smoothrand(u_time);
  vec2 guy3Pos = vec2(.6, .35);

  vec3 color = circleColor(guy1Pos, .15, .0, vec3(.4, .3, 1.), st);
  if (color == vec3(0)) {
    color = circleColor(guy2Pos, .2, .0, vec3(.4, .8, .2), st);
  }
  if (color == vec3(0)) {
    color = circleColor(guy3Pos, .25, .0, vec3(.7, .2, .15), st);
  }
  
  outColor = vec4(color, 1.);
}
`;
