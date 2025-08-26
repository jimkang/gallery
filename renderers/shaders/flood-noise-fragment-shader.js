export default `#version 300 es
precision mediump float;

#define PI 3.1415927

out vec4 outColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

  float on = smoothstep(abs(st.y - sin(st.x * 10.)), 0., .1);
  outColor = vec4(vec3(on), 1.0);
}
`;
