export default `#version 300 es
precision mediump float;

#define PI 3.1412759

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

uniform int u_horizontalBarCount;
uniform int u_verticalBarCount;
// These are expected to be sorted.
uniform float u_horizontalBarYs[16];
uniform float u_verticalBarXs[16];

const float barWidth = 0.01;
const float allBoxesYFloor = -1.;

// Decide if this is inside or outside the rectangle.
bool rect(vec2 st, vec2 corner, vec2 size){
    bool isAfterLeft = st.x > corner.x;
    bool isBeforeRight = st.x < corner.x + size.x;
    bool isAfterBottom = st.y > corner.y;
    bool isBeforeTop = st.y < corner.y + size.y;
    return isAfterLeft && isBeforeRight && isAfterBottom && isBeforeTop;
}

float rand(vec2 st) {
  return fract(
    sin(
      dot(st.xy, vec2(12.456, -47.34))
      * u_time
    )
  );
}

void main() {
    vec3 rectColors[3];
    rectColors[0] = vec3(1., 0., 0.);
    rectColors[1] = vec3(1., 1., 0.);
    rectColors[2] = vec3(0., 0., 1.);
    
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    bool isOn = false;
   
    for (int vBarIndex = 0; vBarIndex < u_verticalBarCount - 1; ++vBarIndex) {
      float vBarDriftOffset = float(vBarIndex) * PI/4.;
      float vBarDrift = sin(u_time + vBarDriftOffset);
      float boxX = u_verticalBarXs[vBarIndex] + barWidth;
      float boxWidth = u_verticalBarXs[vBarIndex + 1] - boxX;
      boxX += vBarDrift;

      for (int hBarIndex = 0; hBarIndex < u_horizontalBarCount - 1; ++hBarIndex) {
          float hBarDriftOffset = float(hBarIndex) * PI/4.;
          float hBarDrift = sin(u_time + hBarDriftOffset);
          float boxY = u_horizontalBarYs[hBarIndex] + barWidth;
          float boxHeight = u_horizontalBarYs[hBarIndex + 1] - boxY;
          boxY += hBarDrift;

          vec2 rectCorner = vec2(boxX, boxY);
          vec2 rectSize = vec2(boxWidth, boxHeight);
          isOn = rect(st, rectCorner, rectSize);        
          if (isOn) {
              outColor = vec4(rectColors[int(mod(float(hBarIndex), 3.))], 1.0);
              return;
          }
      }
   }
   
   outColor = vec4(color, 1.0);
}

`;
