export default `#version 300 es
precision mediump float;

#define RGB_PERIOD 1.
#define RGB_AMP 1.5
#define PI 3.1415927

out vec4 outColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform int u_rgbWaveStyle;
uniform float u_rAmp;
uniform float u_gAmp;
uniform float u_bAmp;
uniform float u_rShift;
uniform float u_gShift;
uniform float u_bShift;
uniform float u_rVShift;
uniform float u_gVShift;
uniform float u_bVShift;
uniform float u_rPeriod;
uniform float u_gPeriod;
uniform float u_bPeriod;
uniform int u_drawRGBWaves;

float rgbWave(float x, float phaseShift, float vShift) {
  float y = mod(x + RGB_PERIOD/2. + phaseShift, RGB_PERIOD);
  y = abs(y - RGB_PERIOD/2.);
  y = 4. * RGB_AMP * y - RGB_AMP + .5;
  return clamp(y + vShift, 0., 1.);
}

float rgbSineWave(float x, float phaseShift, float amp, float period, float vShift) {
  return clamp(amp * sin(2. * PI/period * x + phaseShift) + .5 + vShift, 0., 1.);
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

  float r = rgbSineWave(st.x, u_rShift * PI, u_rAmp, u_rPeriod, u_rVShift); 
  float g = rgbSineWave(st.x, u_gShift * PI, u_gAmp, u_gPeriod, u_gVShift);
  float b = rgbSineWave(st.x, u_bShift * PI, u_bAmp, u_bPeriod, u_bVShift);

  if (u_rgbWaveStyle == 0) {
    r = rgbWave(st.x, u_rShift, u_rVShift);
    g = rgbWave(st.x, u_gShift, u_gVShift);
    b = rgbWave(st.x, u_bShift, u_bVShift);
  }
  vec3 lineColor = vec3(r, g, b);

  if (u_drawRGBWaves == 1) {
    float greenLineOn = 1. - step(.01, abs(st.y - g));
    if (greenLineOn > 0.) {
      lineColor = vec3(0., 1., 0.);
    } else {
      float redLineOn = 1. - step(.01, abs(st.y - r));
      if (redLineOn > 0.) {
        lineColor = vec3(1., 0., 0.);
      } else {
        float blueLineOn = 1. - step(.01, abs(st.y - b));
        if (blueLineOn > 0.) {
          lineColor = vec3(0., 0., 1.);
        }
      }
    }
  }

  outColor = vec4(lineColor, 1.);
}
`;
