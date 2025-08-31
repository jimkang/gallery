export default `#version 300 es
precision mediump float;

#define PI 3.14159265359
#define WAVE_COUNT 5

out vec4 outColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// signedDistanceCos from https://www.shadertoy.com/view/3t23WG
// f: frequency
// a: amplitude
// Distance to y(x) = a + b*cos(cx+d)
float signedDistanceCos(in vec2 p, in float offset, in float amp, in float freq, in float phase) {
  // convert all data to primitive cosine space where y(x) = w·cos(x)
  p = freq * (p - vec2(phase, offset));
  float w = freq * amp;

  // reduce to principal half cycle
  const float TPI = 6.28318530718;
  
  p.x = mod( p.x, TPI);
  if (p.x > 0.5 * TPI) {
    p.x = TPI - p.x;
  }

  // find zero of derivative (minimize distance)
  float xOffset = 0.0;
  float xAmp = TPI/2.0;
  for (int i = 0; i < 24; i++) {
    float x = 0.5 * (xOffset + xAmp);
    float y = x - p.x + w * sin(x) * (p.y - w * cos(x));
    if (y < 0.0) {
      xOffset = x;
    } else {
      xAmp = x;
    }
  }

  // compute distance    
  vec2 qOffset = vec2(xOffset, w * cos(xOffset));
  vec2 qAmp = vec2(xAmp, w * cos(xAmp));
  vec2 pOffset = p - qOffset;
  vec2 ba = qAmp - qOffset;
	float h = clamp(dot(pOffset, ba)/dot(ba, ba), 0.0, 1.0);
	float r = length(pOffset - ba * h );

  // convert back to the non primitive cosine space 
  return r/freq;
}

float wave(vec2 st, float amp, float baseFreq, float yOffset,
  float invMaxWaveSpan, float waveFadeFactor) {

  return pow(
    1. - invMaxWaveSpan * signedDistanceCos(st, yOffset, amp, baseFreq, 0.),
    waveFadeFactor
  );
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

  float baseFreq = PI;
  // float on = step(distance(st, vec2(st.x, .5 * sin(st.x * 2. * PI) + .5)), .1);
  float invMaxWaveSpan = 3.;
  float waveFadeFactor = 5.;
  // waveFadeFactor = 1.;
  float basePhaseShift = 0.;//u_time * PI * .125;
  float baseYShift = mod(u_time/5., 2.25) - 2.;
  // baseYShift = -.6;
  // We can't put in an amp of 0.
  float baseAmp = max(sin(u_time), .01);
  
  float on = 0.;

  for (int waveIndex = 0; waveIndex < WAVE_COUNT; ++waveIndex) {
    float phaseShift = float(waveIndex) * PI * .5;
    float yShift = baseYShift + float(waveIndex) * .15;
    float amp = .1 + sin(float(waveIndex) * PI) * .025;
    amp = .1 * sin(u_time);

    on = max(
      on,
      wave(
        vec2(st.x + phaseShift + basePhaseShift, st.y),
        amp, baseFreq, yShift, invMaxWaveSpan, waveFadeFactor
      )
    );
  }

  outColor = vec4(vec3(on), 1.0);
}
`;
