export default `#version 300 es
precision mediump float;

#define PI 3.14159265359
#define WAVE_COUNT 10
#define WAVE_YSPAN 1.4
// Extra waves to avoid a gap in the scroll-around space
#define SCROLL_FILLERS 2

out vec4 outColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_density;

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
  float waveFadeFactor = 3.;
  float basePhaseShift = u_time * PI * .125 * u_density;
  float offscreenHeight = (WAVE_YSPAN - 1.)/2.;
  float baseYShift = mod(u_time/5., WAVE_YSPAN);
  float baseAmp = sin(u_time) * u_density;
  
  float on = 0.;

  for (int waveIndex = -SCROLL_FILLERS/2; waveIndex < WAVE_COUNT + SCROLL_FILLERS/2; ++waveIndex) {
    float fWaveindex = float(waveIndex);
    // -1 or 3.
    float shiftMult = -1. + mod(abs(fWaveindex), 2.) * 4.;
    float phaseShift = basePhaseShift * shiftMult;
    float yShift = baseYShift + fWaveindex * 1./float(WAVE_COUNT);
    if (yShift > WAVE_YSPAN) {
      yShift = mod(yShift, WAVE_YSPAN);
    }
    yShift -= offscreenHeight;

    float amp = .1 + sin(fWaveindex * PI) * .025;
    amp = .2 * sin(u_time);

    on = max(
      on,
      wave(
        vec2(st.x + phaseShift, st.y),
        amp, baseFreq, yShift, invMaxWaveSpan, waveFadeFactor
      )
    );
  }

  outColor = vec4(vec3(on), 1.0);
}
`;
