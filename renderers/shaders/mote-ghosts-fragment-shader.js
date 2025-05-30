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

  // Transform the shape into a non-circle.
  radius *= getDistortFactor(anchor, st, thinness);

  float distSq = distSquared(center, radius, st);
  distSq = max(.5 * distSq, .5 * distSquared(center, radius + halo, st));

  // distSq = .75 * distSq + .25 * distSq * roughRand(st.x * st.y);

  return smoothstep(distSq, distSq + fuzzThickness, radius * radius);
}

vec3 circleColor(vec2 anchor, vec2 center, float radius, float thinness, float halo, vec3 baseColor, vec2 st) {
  float pct = 0.0;
  pct = isInShape(anchor, center, radius, thinness, halo, 0.001, st);
  
  float colorPart = max(distSquared(anchor, radius, st)/pow(radius, 1.7), 1.); 
  // Make it flat.
  // colorPart = 1.;

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

  vec2 guy1Pos = vec2(1.1, .6);
  guy1Pos += vec2(-mod(u_time/12., 1.4), sin(u_time)/8.);

  vec3 guy1Color = vec3(.2, .45, .8);
  vec3 guy1ColorAlt = vec3(2. * st.y, max(st.x, .4), distSquared(guy1Pos, 0., st));
  float guy1AltFactor = sin(u_time/9.);
  // guy1AltFactor = 1.;
  guy1Color = max(mix(guy1Color, guy1ColorAlt, guy1AltFactor), vec3(0., 0., .5));
  // Purple shift.
  guy1Color += vec3(max(-guy1Pos.x, -.3), .0, max(-guy1Pos.y, -.3))/2.;
  // Don't go into LED Blue.
  guy1Color = min(guy1Color, vec3(1., 1., .8));
  guy1Color = max(guy1Color, vec3(0., .4, .0));

  float guy2TimeMax = 70.;
  float guy2TimeFactor = mod(u_time, guy2TimeMax);
  vec2 guy2Drift = vec2(.02, .02) * guy2TimeFactor;
  vec2 guy2Pos = vec2(-0.05, .0) + guy2Drift;
  vec2 guy2Anchor = guy2Pos - vec2(.3, .1);
  vec2 guy2Direction = vec2(1., 1.);
  float guy2Radius = .2 * (1. + pow(guy2TimeFactor/guy2TimeMax, 4.));

  vec3 guy2Color = vec3(.4, .8, .3);
  vec3 guy2ColorAlt = vec3(st.y, guy2Anchor.x - guy2Pos.y, st.x);
  float guy2AltFactor = cos(u_time/24.);
  guy2Color = mix(guy2Color, guy2ColorAlt, guy2AltFactor);
  // Keep the green a little bit blue.
  guy2Color = min(guy2Color, vec3(1., .8, 1.));
  guy2Color = max(guy2Color, vec3(0., 0., .2));

  float guy3Rate = .125;
  vec2 guy3LinearDrift = calcLinearDrift(u_time * guy3Rate);
  vec2 guy3LinearDriftPrev = calcLinearDrift((u_time - 2.) * guy3Rate);

  vec2 guy3RotationalDrift = calcRotationalDrift(u_time * guy3Rate);
  vec2 guy3RotationalDriftPrev = calcRotationalDrift((u_time - 1.) * guy3Rate);
  vec2 guy3BasePos = vec2(.5, .6);
  vec2 guy3Anchor = guy3BasePos + guy3LinearDriftPrev + guy3RotationalDriftPrev;
  vec2 guy3Pos = guy3BasePos + guy3LinearDrift + guy3RotationalDrift;

  vec3 guy3Color = vec3(.7, .2, .15);
  vec3 guy3ColorAlt = vec3(abs(guy3Anchor.x - st.y), guy3Anchor.x - guy3Pos.y, abs(guy3Pos.y - st.x));
  float guy3AltFactor = sin(u_time/7. + PI);
  guy3Color = min(mix(guy3Color, guy3ColorAlt, guy3AltFactor), vec3(1., .8, .8));
  
  vec3 color = circleColor(guy1Pos, guy1Pos, .1, .1, .0, guy1Color, st);
  if (color == vec3(0)) {
    color = circleColor(guy2Anchor, guy2Pos, guy2Radius, 1., .0, guy2Color, st);
  }
  if (color == vec3(0)) {
    color = circleColor(guy3Anchor, guy3Pos, .25, 1., .0, guy3Color, st);
  }
  
  outColor = vec4(color, 1.);
}
`;
