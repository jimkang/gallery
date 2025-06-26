export default `#version 300 es
precision mediump float;

#define PI 3.1415927

out vec4 outColor;

const float lineThickness = .02;
const float lineBlur = .0025;
const vec4 green = vec4(.1, .9, .4, 1.);
const vec4 blue = vec4(.3, .2, 1., 1.);
const vec4 white = vec4(1., .99, 1., 1.);
const vec4 yellow = vec4(.95, 1., .3, 1.);
const float speed = 8.;
const float bigWaveAmpFactor = .0625;
const float bigWavePeriodFactor = .4;
const float bigWaveTimeVaryingPeriodFactor = .8;
const float smallWavePeriodFactor = .03;
const float smallWaveTimeVaryingPeriodFactor = .25;
const float smallWaveAmpFactor = .005;
const float triWavePeriod = .02;
const float triWaveAmp = .005;
const float pulseWavePulseBasePeriod = 1.25;
const float pulseWaveAmplitude = .2;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

//
//            peak1----peak2
//           /              \
//          /                \
// ----foot1                  foot2----
//
float hill(float foot1, float peak1, float peak2, float foot2, float x) {
  return smoothstep(foot1, peak1, x) *
    // This smoothstep returns "on" for stuff higher than foot2. But
    // we want the opposite, "off" for stuff higher than foot2. So, we applt
    // the 1. - result modification.
    (1. - smoothstep(peak2, foot2, x));
}

vec2 rotate2D(vec2 _st, float _angle){
  _st -= 0.5;
  _st =  mat2(cos(_angle),-sin(_angle),
              sin(_angle),cos(_angle)) * _st;
  _st += 0.5;
  return _st;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st = rotate2D(st, PI/2.);

  float x = st.x * 2.;

  float amplitude = .02;
  float frequency = 4.;

  float t = u_time * speed;
  float y = sin(x * frequency / bigWavePeriodFactor + t / bigWaveTimeVaryingPeriodFactor)
    * bigWaveAmpFactor;

  y += sin(x * frequency / smallWavePeriodFactor + t / smallWaveTimeVaryingPeriodFactor)
    * smallWaveAmpFactor;
    
  // Triangle wave.
  float p = triWavePeriod;
  float halfPeriod = p / 2.;
  float ampTerm = 4. * (triWaveAmp / p) * 2. * cos(u_time * 80.);
  float mirroredLineY = mod(x + halfPeriod, p);
  float triWaveY = ampTerm * abs(mirroredLineY - halfPeriod);
  y += triWaveY;

  // y += smallWaveAmpFactor / smallWaveAmpFactor / 2. * (smallWavePeriodFactor/2. - abs(mod(x * frequency / smallWavePeriodFactor + t / smallWaveTimeVaryingPeriodFactor, 2. * smallWavePeriodFactor)) - 2. * smallWavePeriodFactor);

  // sin(x * frequency / smallWavePeriodFactor + t / smallWaveTimeVaryingPeriodFactor)
    // * smallWaveAmpFactor;

  float pulseWavePulsePeriod = pulseWavePulseBasePeriod * (1. + mod(u_time, 1.));
  float pulseY = sin(x * frequency + t) * pulseWaveAmplitude
  * sin(u_time/pulseWavePulsePeriod) * hill(.1, .4, .6, .9, mod(u_time, pulseWavePulsePeriod));
  
  y += pulseY;
  // y = pulseY;

  y += .5;

  float bottomEdge = y - lineThickness;
  float topEdge = y + lineThickness;
  float on = hill(bottomEdge - lineBlur, bottomEdge, topEdge, topEdge 
  + lineBlur, st.y);

  vec4 nonWhite = vec4(max(cos(u_time * 100.), .7), max(sin(u_time * 10.), .7), max(cos(u_time * 1000.), .5), 1.);
  // vec4 normalColor = mix(yellow, white, step(.5, sin(u_time * 100.)));
  vec4 color = mix(green, nonWhite, smoothstep(.94, .95, sin(u_time)));
  outColor = color * on;
}
`;
