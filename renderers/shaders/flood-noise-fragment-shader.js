export default `#version 300 es
precision mediump float;

#define PI 3.14159265359
#define WAVE_COUNT 10
#define WAVE_YSPAN 1.6
// Extra waves to avoid a gap in the scroll-around space
#define SCROLL_FILLERS 2
#define COLOR_JITTER .1

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

float rand(float n) {
  return fract(cos(n) * 8173.);
}

float smoothrand(float n) {
  return mix(rand(n), rand(n + 1.), smoothstep(0., 1., n));
}

// 2D Random
float random2d(in vec2 st) {
  return fract(sin(dot(st.xy,
                       vec2(12.9898,78.233)))
               * 43758.5453123);
}

float noise(float x) {
  return fract(sin(x) * 43758.5453);
  // return fract(sin(x * 57587.));
}

float repeatedNoise(float amp, float freq, float lacunarity, float gain, int repeats, float x) {
  float y = 0.;

  for (int i = 0; i < repeats; i++) {
    y += amp * noise(freq * x);//fract(sin(freq * x) * 4000.);
    freq *= lacunarity;
    amp *= gain;
  }

  return y;
}

float perlin1d(float amp, float freq, float lacunarity, float antiGain,
float divisions, int repeats, float seed) {
  float prev = floor(seed * divisions);
  float next = prev + 1.;
  float frac = seed * divisions - prev;

  float result = 0.;
  for (int i = 0; i < repeats; ++i) {
    float noisePrev = noise(prev * freq);
    // return noisePrev * divisions;
    float noiseNext = noise(next * freq);
    // Linear interp.
    // float interpolated = noisePrev + frac * (noiseNext - noisePrev);
    // Cosine interp.
    // float halfInverseCos = (1. - cos(frac * PI))/2.;
    // float interpolated = noisePrev * (1. - halfInverseCos) + noiseNext * halfInverseCos;
    // Cubic interp.
    float noisePrevPrev = noise(prev + 1.);
    float noiseNextNext = noise(next + 1.);
    float p = noiseNextNext + noisePrev - noiseNext - noisePrevPrev;
    float q = noisePrevPrev - noisePrev - frac;
    float r = noiseNext - noisePrevPrev;
    float s = noisePrev;
    float interpolated = p * pow(frac, 3.) + q * pow(frac, 2.) + r * frac + s;

    // interpolated = noise(prev);
    result += interpolated * amp;

    freq *= lacunarity;
    amp /= antiGain;
  }
  return result;
}

float noise2d(in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random2d(i);
  float b = random2d(i + vec2(1.0, 0.0));
  float c = random2d(i + vec2(0.0, 1.0));
  float d = random2d(i + vec2(1.0, 1.0));

  // Smooth Interpolation

  // Cubic Hermine Curve.  Same as SmoothStep()
  vec2 u = f * f * (3.0 - 2.0 * f);
  // u = smoothstep(0., 1., f);

  // Mix 4 corners' percentages
  return mix(a, b, u.x) +
    (c - a) * u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}

float rgbSineWave(float x, float phaseShift, float amp, float period, float vShift) {
  return clamp(amp * sin(2. * PI/period * x + phaseShift) + .5 + vShift, 0., 1.);
}

vec3 getColor(float x) {
  float r = rgbSineWave(x, 1.06 * PI, 1.5, .36, -.11); 
  float g = rgbSineWave(x, -.65 * PI, .24, .98, .13); 
  float b = rgbSineWave(x, .48 * PI, .33, 2., .17);
  return vec3(r, g, b);
}

vec3 colorForOn(float on, float t, float x, float y, int index) {
  float waveNoiseVal = perlin1d(.5, .5, 5., 4., 500., 3, on);
  // noiseVal *= noise2d(vec2(on, x));
  // noiseVal = on;
  float horizontalNoiseVal = perlin1d(4. * sin(t), fract(t), float(index), 4., 10000., 1,
    mod(fract(t) + waveNoiseVal, 1.));
  float noiseVal = mix(waveNoiseVal, horizontalNoiseVal, .75);

  // noiseOn = repeatedNoise(1., 1., 2., 3., 1, on);
  // noiseOn = on;
  // return vec3(noiseVal);
  // vec3 color = getColor(clamp(u_density + COLOR_JITTER * perlin1d(.5, .5, 1., 4., 1., 2, u_density), 0., 1.));
  float jitterInput = pow(noise(float(index)/7. * on * x), 2.);
  jitterInput = sin(t);
  float jitterAmount = jitterInput * COLOR_JITTER;
  jitterAmount = COLOR_JITTER;
  jitterAmount = COLOR_JITTER * (sin(t/100.) * float(index)/.7 + noise(x * y))/2.; 
  vec3 color = getColor(u_density - COLOR_JITTER/2. + jitterAmount);
  // color = getColor(min(u_density + COLOR_JITTER, 1.));
  // color = getColor(u_density + COLOR_JITTER);
  // color = getColor(.5);
  // color = getColor(u_density);
  return mix(noiseVal, on, .4) * 2.5 * color;
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
    // waveOn *= perlin1d(.5, .5, 5., 4., 100., 3, waveOn);

    // float sineNoise = noise(waveOn);
    // sineNoise = mix(noise(sineNoise), sineNoise, pow(u_density, 4.));
    // float repeatedNoise = repeatedNoise(3, .5, .5, waveOn);
    // waveOn += .4 * mix(repeatedNoise, sineNoise, u_density);

    on = max(on, waveOn);
    waveColor = colorForOn(on, u_time, st.x, st.y, waveIndex);
    // waveColor = colorForOn(waveOn);
    // waveColor = vec3(on);
  }

  // Debug noise line graph
  // float noiseVal = perlin1d(.125, .5, 5., 4., 100., 3, st.x);
  // // noiseVal = noise2d(vec2(st.x, st.y));
  // // noiseVal = noise(st.x);
  // float lineOn = 1. - step(.01, abs(st.y - noiseVal));
  // if (lineOn > 0.) {
  //   waveColor = vec3(0., 1., 0.);
  // }

  outColor = vec4(waveColor, 1.);
}
`;
