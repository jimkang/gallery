export default `#version 300 es
precision mediump float;

#define PI 3.1415927

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

vec2 rotate2D(vec2 _st, float _angle) {
  _st -= 0.5;
  _st =  mat2(cos(_angle),-sin(_angle),
              sin(_angle),cos(_angle)) * _st;
  _st += 0.5;
  return _st;
}

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

float getDistortFactor(vec2 anchor, vec2 st, float thinness) {
  vec2 fromCenter = st - anchor;
  float timeFactor = sin(u_time) * 2.;
  float spaceFactor = sin(fromCenter.x) * thinness;
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

float isInShape(vec2 anchor, vec2 center, float baseRadius, float thinness, float halo,
float fuzzThickness, vec2 st) {
  float n = st.x/st.y;
  float radius = pow(rand(n), 1.5) * baseRadius;
  vec2 fromCenter = st - center;
  radius *= getDistortFactor(anchor, st, thinness);

  float distSq = distSquared(center, radius, st);
  distSq = max(.5 * distSq, .5 * distSquared(center, radius + halo, st));

  // distSq = .75 * distSq + .25 * distSq * roughRand(st.x * st.y);

  return smoothstep(distSq, distSq + fuzzThickness, radius * radius);
}

vec3 circleColor(vec2 anchor, vec2 center, float radius, float thinness, float halo, vec3 baseColor, vec2 st) {
  float pct = 0.0;
  pct = isInShape(anchor, center, radius, thinness, halo, 0.001, st);
  
  // float colorPart = 1. - distSquared(center, radius, st)/(radius * radius);
  // Make it flat.
  float colorPart = 1.;

  return pct * colorPart * baseColor;    
}

vec2 calcLinearDrift(float f) {
  return vec2((cos(f) - 1.)/2. + .25, 0.);
}

vec2 calcRotationalDrift(float f) {
  return vec2((cos(f) + 1.)/2., sin(f)) * .2;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution;

  // Stutter
  //vec2 guy1Pos = vec2(.25, .5) + mix(sin(u_time), tan(rand(u_time)), .5);
  vec2 guy1Pos = vec2(1.1, .6);
  guy1Pos += vec2(-mod(u_time/10., 1.4), sin(u_time * 2.)/8.);
  // guy1Pos *= getDistortFactor(guy1Pos, st * u_time);

  vec2 guy2Drift = vec2(.01, .01) * mod(u_time, 110.);
  vec2 guy2Pos = vec2(.1, .0) + guy2Drift;
  vec2 guy2Anchor = guy2Pos - vec2(.3, .1);
  vec2 guy2Direction = vec2(1., 1.);

  // TODO: Pac-Man back around.
  vec2 guy3LinearDrift = calcLinearDrift(u_time/4.);
  vec2 guy3LinearDriftPrev = calcLinearDrift((u_time - 2.)/4.);

  vec2 guy3RotationalDrift = calcRotationalDrift(u_time/4.);
  vec2 guy3RotationalDriftPrev = calcRotationalDrift((u_time - 1.)/4.);
  vec2 guy3BasePos = vec2(.5, .6);
  vec2 guy3Anchor = guy3BasePos + guy3LinearDriftPrev + guy3RotationalDriftPrev;
  vec2 guy3Pos = guy3BasePos + guy3LinearDrift + guy3RotationalDrift;
  
  vec3 color = circleColor(guy1Pos, guy1Pos, .1, .1, .0, vec3(.4, .3, 1.), st);
  if (color == vec3(0)) {
    color = circleColor(guy2Anchor, guy2Pos, .2, 1., .0, vec3(.4, .8, .2), st);
  }
  if (color == vec3(0)) {
    color = circleColor(guy3Anchor, guy3Pos, .25, 1., .0, vec3(.7, .2, .15), st);
  }
  
  outColor = vec4(color, 1.);
}
`;
