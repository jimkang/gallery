export default `#version 300 es
precision mediump float;

#define PI 3.1412759
#define barArraySize 16

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

uniform int u_horizontalBarCount;
uniform int u_verticalBarCount;
// These are expected to be sorted.
uniform float u_horizontalBarYs[barArraySize];
uniform float u_verticalBarXs[barArraySize];

const float barWidth = 0.02;
const float allBoxesYFloor = -.4;
const float allBoxesXFloor = -.4;

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

float hash(int a, int b) {
  return fract(
    sin(
      dot(vec2(float(a), float(b)), vec2(-12.456, -47.34))
    )
  );
}

void sort(float[barArraySize] array, int arrayPopulation) {
  if (arrayPopulation < 2) {
    return;
  }

  for (int i = 1; i < arrayPopulation; ++i) {
    float current = array[i];
    for (int j = i - 1; j > -1; --j) {
      float other = array[j];
      if (current >= other) {
        array[j + 1] = current;
        break;
      }
      // Shift other to the right.
      array[j + 1] = other;
      array[j] = current;
    }
  }
}

void main() {
    vec3 rectColors[9];
    rectColors[0] = vec3(.65, .12, .05);
    rectColors[1] = vec3(.98, .76, .13);
    rectColors[2] = vec3(0., .38, .61);
    rectColors[3] = vec3(.96, .96, .86);
    rectColors[4] = vec3(.96, .96, .86);
    rectColors[5] = vec3(.96, .96, .86);
    rectColors[6] = vec3(.96, .96, .86);
    rectColors[7] = vec3(.96, .96, .86);
    rectColors[8] = vec3(.96, .96, .86);
    
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    bool isOn = false;

    float horizontalBarYs[barArraySize];
    float verticalBarXs[barArraySize];
   
    for (int vBarIndex = 0; vBarIndex < u_verticalBarCount; ++vBarIndex) {
      float vBarDriftOffset = float(vBarIndex) * PI/8.;
      float vBarDrift = cos(u_time + vBarDriftOffset) * 0.2;
      float vBarX = allBoxesXFloor + u_verticalBarXs[vBarIndex] + vBarDrift;

      if (vBarIndex > 0) {
        float prevBarXRight = verticalBarXs[vBarIndex - 1] + barWidth;
        if (vBarX < prevBarXRight) {
          vBarX = prevBarXRight;
        }
      }
      verticalBarXs[vBarIndex] = vBarX;
    }
    for (int hBarIndex = 0; hBarIndex < u_horizontalBarCount; ++hBarIndex) {
      float hBarDriftOffset = float(hBarIndex) * PI/8.;
      float hBarDrift = sin(u_time + hBarDriftOffset) * 0.2;
      float hBarY = allBoxesYFloor + u_horizontalBarYs[hBarIndex] + hBarDrift;

      if (hBarIndex > 0) {
        float prevBarYTop = horizontalBarYs[hBarIndex - 1] + barWidth;
        if (hBarY < prevBarYTop) {
          hBarY = prevBarYTop;
        }
      }
      horizontalBarYs[hBarIndex] = hBarY;
    }

    sort(verticalBarXs, u_verticalBarCount);
    sort(horizontalBarYs, u_horizontalBarCount);

    for (int vBarIndex = 0; vBarIndex < u_verticalBarCount - 1; ++vBarIndex) {
      float boxX = verticalBarXs[vBarIndex] + barWidth;
      float boxWidth = verticalBarXs[vBarIndex + 1] - boxX;
      if (boxWidth < 0.) {
        boxWidth = 0.;
      }

      for (int hBarIndex = 0; hBarIndex < u_horizontalBarCount - 1; ++hBarIndex) {
          float boxY = horizontalBarYs[hBarIndex] + barWidth;
          float boxHeight = horizontalBarYs[hBarIndex + 1] - boxY;
          if (boxHeight < 0.) {
            boxHeight = 0.;
          }

          vec2 rectCorner = vec2(boxX, boxY);
          vec2 rectSize = vec2(boxWidth, boxHeight);
          isOn = rect(st, rectCorner, rectSize);        
          if (isOn) {
              // int colorIndex = int(mod(float(hBarIndex + vBarIndex), 9.));
              int colorIndex = int(mod(round(hash(hBarIndex, vBarIndex) * 100.), 6.));
              outColor = vec4(rectColors[colorIndex], 1.0);
              return;
          }
      }
   }
   
   outColor = vec4(color, 1.0);
}

`;
