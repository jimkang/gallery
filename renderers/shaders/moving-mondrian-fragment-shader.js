export default `#version 300 es
precision mediump float;

#define PI 3.1415927
#define MAX_BAR_ARRAY_SIZE 18
#define BIG 99.

out vec4 outColor;

struct PosAndId {
  float pos;
  int id;
};

uniform vec2 u_resolution;
uniform float u_time;

uniform int u_horizontalBarCount;
uniform int u_verticalBarCount;
// These are expected to be sorted.
uniform float u_horizontalBarYs[MAX_BAR_ARRAY_SIZE];
uniform float u_verticalBarXs[MAX_BAR_ARRAY_SIZE];

const float barWidth = 0.02;
const float allBoxesYFloor = 0.;
const float allBoxesXFloor = -.4;

bool isInYBounds(float y, float top, float bottom) {
    bool isAfterBottom = y > top;
    bool isBeforeTop = y < bottom;
    return isAfterBottom && isBeforeTop;
}

// Decide if this is inside or outside the rectangle.
bool rect(vec2 st, vec2 corner, vec2 size) {
    bool isAfterLeft = st.x > corner.x;
    bool isBeforeRight = st.x < corner.x + size.x;
    return isAfterLeft && isBeforeRight && isInYBounds(st.y, corner.y, corner.y + size.y);
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

void sort(float[MAX_BAR_ARRAY_SIZE] array, int arrayPopulation) {
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

void sortPosAndId(PosAndId[MAX_BAR_ARRAY_SIZE] array, int arrayPopulation) {
  if (arrayPopulation < 2) {
    return;
  }

  for (int i = 1; i < arrayPopulation; ++i) {
    PosAndId current = array[i];
    for (int j = i - 1; j > -1; --j) {
      PosAndId other = array[j];
      if (current.pos >= other.pos) {
        array[j + 1] = current;
        break;
      }
      // Shift other to the right.
      array[j + 1] = other;
      array[j] = current;
    }
  }
}

// Adds bars at 0 and 1 in addition to the bars in srcBarArray.
void setBarPositions(in float srcBarArray[MAX_BAR_ARRAY_SIZE], int srcBarCount, float barDrift, out PosAndId destBarArray[MAX_BAR_ARRAY_SIZE]) {
  int totalBarCount = srcBarCount + 2;

  for (int barIndex = 0; barIndex < totalBarCount; ++barIndex) {
    if (barIndex == 0) {
      destBarArray[barIndex] = PosAndId(0., 0);
      continue;
    }
    if (barIndex == totalBarCount - 1) {
      destBarArray[barIndex] = PosAndId(BIG, 0);
      continue;
    }

    float individualBarDrift = float(barIndex) * PI/8.;
    int srcBarPosIndex = barIndex - 1;
    float barPos = srcBarArray[srcBarPosIndex] + barDrift + individualBarDrift;

    // Wrap around.
    if (barPos > 1.) {
      barPos = mod(barPos, 1.);
    }

    destBarArray[barIndex] = PosAndId(barPos, barIndex);
  }
}

float cantorPair(int a, int b) {
  float sum = float(a + b);
  return sum/2. * (sum + 1.) + float(b);
}

vec3 getColorForHAndV(int hIndex, int vIndex) {
  int sum = hIndex + vIndex;
  int colorIndex = int(mod(float(sum), 3.));
  if (colorIndex == 0) {
    return vec3(.65, .12, .05);
  }
  if (colorIndex == 1) {
    return vec3(.98, .76, .13);
  }
  if (colorIndex == 2) {
    return vec3(0., .38, .61);
  }
  
  return vec3(.96, .96, .86);
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

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

  float hBarDrift = mod(u_time/8., 1.);
  float vBarDrift = mod(u_time/8., 1.);

  PosAndId horizontalBarPosAndIds[MAX_BAR_ARRAY_SIZE];
  PosAndId verticalBarPosAndIds[MAX_BAR_ARRAY_SIZE];
  int totalHBarCount = u_horizontalBarCount + 2;
  int totalVBarCount = u_verticalBarCount + 2;

  setBarPositions(u_horizontalBarYs, u_horizontalBarCount, hBarDrift, horizontalBarPosAndIds);
  setBarPositions(u_verticalBarXs, u_verticalBarCount, vBarDrift, verticalBarPosAndIds);

  
  for (int vBarIndex = 0; vBarIndex < totalVBarCount - 1; ++vBarIndex) {
    PosAndId vBarPosAndId = verticalBarPosAndIds[vBarIndex];
    float boxX = vBarPosAndId.pos + barWidth;
    float boxWidth = verticalBarPosAndIds[vBarIndex + 1].pos - boxX;

    for (int hBarIndex = 0; hBarIndex < totalHBarCount - 1; ++hBarIndex) {
      PosAndId hBarPosAndId = horizontalBarPosAndIds[hBarIndex];
      float boxY = hBarPosAndId.pos + barWidth;
      float boxHeight = horizontalBarPosAndIds[hBarIndex + 1].pos - boxY;

      vec2 rectCorner = vec2(boxX, boxY);
      vec2 rectSize = vec2(boxWidth, boxHeight);
      bool isOn = rect(st, rectCorner, rectSize);        
      if (isOn) {
        // float hvBarHash = cantorPair(hBarPosAndId.id, vBarPosAndId.id);
        // int colorIndex = 3000;//int(hvBarHash);// int(mod(hvBarHash * 100., 9.));
        outColor = vec4(getColorForHAndV(hBarPosAndId.id, vBarPosAndId.id), 1.0);
      }
    }
  }

  // Debug line drawing
  if (st.y > 0.999 && st.y < 1.001) {
    outColor = vec4(0., 1., 0., 1.);
    return;
  }
  if (st.y > -.01 && st.y < .01) {
    outColor = vec4(0., 1., 1., 1.);
    return;
  }

  for (int hBarIndex = 0; hBarIndex < totalHBarCount; ++hBarIndex) {
    PosAndId hBarPosAndId = horizontalBarPosAndIds[hBarIndex];
    if (rect(st, vec2(0., hBarPosAndId.pos), vec2(1., .01))) {
      outColor = vec4(0., 0., 1., 1.);
      return;
    }
  }

  for (int vBarIndex = 0; vBarIndex < totalVBarCount; ++vBarIndex) {
    PosAndId vBarPosAndId = verticalBarPosAndIds[vBarIndex];
    if (rect(st, vec2(vBarPosAndId.pos, 0.), vec2(.01, 1.))) {
      outColor = vec4(0., 0., 1., 1.);
      return;
    }
  }

  if (rect(st, vec2(0., hBarDrift), vec2(1., .01))) {
    outColor = vec4(1., 0., 0., 1.);
    return;
  }
}


void simpleWrapAroundDemoMain() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

  if (st.y > 0.999 && st.y < 1.001) {
    outColor = vec4(0., 1., 0., 1.);
    return;
  }
  if (st.y > -.01 && st.y < .01) {
    outColor = vec4(0., 1., 1., 1.);
    return;
  }

  float hBarDrift = mod(u_time/8., 1.);

  PosAndId horizontalBarPosAndIds[MAX_BAR_ARRAY_SIZE];
  int totalHBarCount = u_horizontalBarCount + 2;

  for (int hBarIndex = 0; hBarIndex < totalHBarCount; ++hBarIndex) {
    if (hBarIndex == 0) {
      horizontalBarPosAndIds[0] = PosAndId(0., 0);
      continue;
    }
    if (hBarIndex == totalHBarCount - 1) {
      horizontalBarPosAndIds[u_horizontalBarCount + 1] = PosAndId(BIG, 0);
      continue;
    }

    int uBarYIndex = hBarIndex - 1;
    float hBarY = u_horizontalBarYs[uBarYIndex] + hBarDrift;

    // Wrap around.
    if (hBarY > 1.) {
      hBarY = mod(hBarY, 1.);
    }

    horizontalBarPosAndIds[hBarIndex] = PosAndId(hBarY, hBarIndex);
  }

  for (int hBarIndex = 0; hBarIndex < totalHBarCount; ++hBarIndex) {
    PosAndId hBarPosAndId = horizontalBarPosAndIds[hBarIndex];
    if (rect(st, vec2(0., hBarPosAndId.pos), vec2(1., .01))) {
      outColor = vec4(0., 0., 1., 1.);
      return;
    }
  }

  if (rect(st, vec2(0., hBarDrift), vec2(1., .01))) {
    outColor = vec4(1., 0., 0., 1.);
    return;
  }
}

`;
