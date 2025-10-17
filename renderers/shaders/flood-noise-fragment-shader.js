export default `#version 300 es
precision mediump float;

#define PI 3.14159265359
#define WAVE_COUNT 10
#define WAVE_YSPAN 1.6
// Extra waves to avoid a gap in the scroll-around space
#define SCROLL_FILLERS 2

out vec4 outColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_density;
uniform float[100] u_random_values;

float easeSinInOut(float x) {
  return (1. - cos(PI * x))/2.;
}

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
  
  p.x = mod(p.x, TPI);
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
	float r = length(pOffset - ba * h ) * sign(pOffset.y * ba.x - pOffset.x * ba.y);

  // convert back to the non primitive cosine space 
  return r/freq;
}

float noise(float x) {
  return fract(sin(8374159.3 * x));
}

float repeatedNoise(int repeats, float lacunarity, float gain, float x) {
  float amplitude = 0.05;
  float frequency = 1.;
  float y = 0.;

  for (int i = 0; i < repeats; i++) {
    y += amplitude * fract(sin(frequency * x) * 4000.);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return y;
}

float rgbSineWave(float x, float phaseShift, float amp, float period, float vShift) {
  return clamp(amp * sin(2. * PI/period * x + phaseShift) + .5 + vShift, 0., 1.);
}

vec3 getColor(float x) {
  float r = rgbSineWave(x, -.83 * PI, .5, 1.43, -.21); 
  float g = rgbSineWave(x, -.65 * PI, .09, .98, .27); 
  float b = rgbSineWave(x, .48 * PI, .33, 2., -.04);
  return vec3(r, g, b);
}

vec3 colorForOn(float on, float n) {
  return noise(on) * getColor(u_density);
}

float wave(vec2 st, float amp, float baseFreq, float yOffset,
  float invMaxWaveSpan, float waveFadeFactor) {

  float dist = signedDistanceCos(st, yOffset, amp, baseFreq, 0.);
  if (dist < 0.) {
    dist = 1. + dist;
  }

  return pow(invMaxWaveSpan * dist, waveFadeFactor);
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

  float baseFreq = PI * (.5 + u_density * 2.);
  float invMaxWaveSpan = 1.;
  float waveFadeFactor = 2.5 + 4. * pow(u_density, 5.);
  float basePhaseShift = u_time * PI * .25 * u_density;
  float offscreenHeight = (WAVE_YSPAN - 1.)/2.;
  float baseYShift = mod(u_time/5., WAVE_YSPAN);
  float baseAmp = sin(u_time) * u_density;
  int waveCount = int(max(1., float(WAVE_COUNT) * (.5 + .5 * easeSinInOut(u_density)/2.)));
  
  float on = 0.;
  vec3 waveColor = vec3(0.);

  for (int waveIndex = -SCROLL_FILLERS/2; waveIndex < waveCount + SCROLL_FILLERS/2; ++waveIndex) {
    float fWaveIndex = float(waveIndex);
    // -1 or 3.
    float fIndexAbs = abs(fWaveIndex);
    float shiftMult = -2. + mod(fIndexAbs * u_density, 4.) * 3. + mod(fIndexAbs * u_density, 3.) * 7.;
    float phaseShift = basePhaseShift * shiftMult;
    float yShift = baseYShift + fWaveIndex * 1./float(waveCount);
    float yWaveSpan = WAVE_YSPAN * min(1.05 - u_density, 1.);
    if (yShift > yWaveSpan) {
      yShift = mod(yShift, yWaveSpan) + (WAVE_YSPAN - yWaveSpan)/2.;
    }
    yShift -= offscreenHeight;

    float amp = .1 + sin(fWaveIndex * PI) * .025;
    amp = .4 * sin(u_time);

    float waveOn = wave(
      vec2(st.x + phaseShift, st.y),
      amp, baseFreq, yShift, invMaxWaveSpan, waveFadeFactor
    );
    float sineNoise = noise(waveOn);
    sineNoise = mix(noise(sineNoise), sineNoise, pow(u_density, 4.));
    float repeatedNoise = repeatedNoise(3, .5, .5, waveOn);
    // waveOn += .4 * mix(repeatedNoise, sineNoise, u_density);

    on = max(on, waveOn);
    waveColor = colorForOn(on, fWaveIndex/float(waveCount));
    // waveColor = vec3(on);
  }

  outColor = vec4(waveColor, 1.);
}
`;
