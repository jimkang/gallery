export default `#version 300 es
precision mediump float;

#define PI 3.1412759

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_heights[100];
uniform int u_colLengths[7];
uniform int u_colCount;

const float yGap = 0.02;
const float xGap = 0.02;
// TODO: Get from uniform.
const float colWidth = 0.25;
const float allBoxesYFloor = -1.;
// const float allBoxesYCeiling = 2.;


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
    float baseY = 0.3;

    float cornerX = 0.;
    int heightIndexBase = 0;
   
    for (int colIndex = 0; colIndex < u_colCount; ++colIndex) {
      int colLength = u_colLengths[colIndex];
      float colDriftOffset = float(colIndex) * PI/4.;
      float drift = sin(u_time + colDriftOffset);
      float cornerY = allBoxesYFloor + drift;

      for (int rowIndex = 0; rowIndex < colLength; ++rowIndex) {
          float height = u_heights[heightIndexBase + rowIndex];
          vec2 rectCorner = vec2(cornerX, cornerY);
          vec2 rectSize = vec2(colWidth, height);
          isOn = rect(st, rectCorner, rectSize);        
          if (isOn) {
              color = rectColors[int(mod(float(rowIndex), 3.))];
              break;
          }
          cornerY = cornerY + height + yGap;
      }
      heightIndexBase += colLength;
      outColor = vec4(color, 1.0);

      cornerX += (colWidth + xGap);
   }
}

`;
