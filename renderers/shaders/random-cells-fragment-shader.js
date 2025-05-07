export default `#version 300 es
precision mediump float;

#define PI 3.1415927
#define TWOPI 2. * PI
#define MAX_BAR_ARRAY_SIZE 18
#define BIG 99.

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

uniform int u_horizontalBarCount;
uniform int u_verticalBarCount;
uniform float u_horizontalBarYs[MAX_BAR_ARRAY_SIZE];
uniform float u_verticalBarXs[MAX_BAR_ARRAY_SIZE];
uniform float u_barThickness;

bool debugLinesOn = false;
// bool debugLinesOn = true;

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

void setBarPositions(in float srcBarArray[MAX_BAR_ARRAY_SIZE], int srcBarCount, float barDrift, out float destBarArray[MAX_BAR_ARRAY_SIZE]) {
  int totalBarCount = srcBarCount;

  for (int barIndex = 0; barIndex < totalBarCount; ++barIndex) {
    // This would be cool if it weren't possibly seizure-causing.
    //float individualBarDrift = rand(vec2(float(barIndex) * PI/8., -1.));

    float individualBarDrift = 0.;//cos(float(barIndex) * PI/4.)/16.;

    float barPos = srcBarArray[barIndex] + barDrift + individualBarDrift;
  
    // TODO: Why is there a gap in the horizontal bars?
    // Wrap around.
    if (barPos > 1.) {
      barPos = mod(barPos, 1.);
    }

    destBarArray[barIndex] = barPos;
  }
}

int cantorPair(int a, int b) {
  float sum = float(a + b);
  return int(sum/2. * (sum + 1.) + float(b));
}

vec3 getColorForHAndV(int hIndex, int vIndex) {
  int sum = cantorPair(hIndex, vIndex);
  int colorIndex = int(mod(float(sum), 10.));
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

bool checkForBoxHitInVerticalStrip(vec2 st, float x, float width, in float[MAX_BAR_ARRAY_SIZE] horizontalBarYs, int totalHBarCount, out int hitHBarIndex) {
  for (int hBarIndex = 0; hBarIndex < totalHBarCount - 1; ++hBarIndex) {
    float hBarY = horizontalBarYs[hBarIndex];
    float boxY = hBarY + u_barThickness;
    float nextBoxY = horizontalBarYs[hBarIndex + 1];
    bool isOn = false;
    if (nextBoxY < boxY) {
      // Box is split across the top and bottom edges; check both.
      isOn = rect(st, vec2(x, boxY), vec2(width, 1. - boxY));
      if (!isOn) {
        isOn = rect(st, vec2(x, 0.), vec2(width, nextBoxY));
      }
    } else {
      float boxHeight = nextBoxY - boxY;
      isOn = rect(st, vec2(x, boxY), vec2(width, boxHeight));
    }

    if (isOn) {
      hitHBarIndex = hBarIndex;
      return isOn;
    }
  }
  return false;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

  // Patternize!
  st *= mod(u_time, 4.);
  st = fract(st);

  outColor = vec4(.05, .03, .01, 1.);

  float deltaFactor = u_time/2.;
  float drift = sin(deltaFactor)/4.;
  float hBarDrift = 0.;
  float vBarDrift = 0.;
  if (mod(deltaFactor, 2. * TWOPI) > TWOPI) {
    hBarDrift = drift;
  } else {
    vBarDrift = drift;
  }

  float horizontalBarYs[MAX_BAR_ARRAY_SIZE];
  float verticalBarXs[MAX_BAR_ARRAY_SIZE];

  setBarPositions(u_horizontalBarYs, u_horizontalBarCount, hBarDrift, horizontalBarYs);
  setBarPositions(u_verticalBarXs, u_verticalBarCount, vBarDrift, verticalBarXs);

  for (int vBarIndex = 0; vBarIndex < u_verticalBarCount; ++vBarIndex) {
    float vBarX = verticalBarXs[vBarIndex];
    float boxX = vBarX + u_barThickness;
    int nextVBarIndex = vBarIndex + 1;
    if (nextVBarIndex >= u_verticalBarCount) {
      nextVBarIndex = 0;
    }

    int hitHBarIndex = -1;
    float nextBoxX = verticalBarXs[nextVBarIndex];
    bool isOn = false;

    if (nextBoxX < boxX) {
      // This box is on the edge, so we split it and do checks for two boxes in this case.
      isOn = checkForBoxHitInVerticalStrip(st, boxX, 1. - boxX, 
        horizontalBarYs, u_horizontalBarCount, hitHBarIndex);
      if (!isOn) {
        isOn = checkForBoxHitInVerticalStrip(st, 0., nextBoxX,
          horizontalBarYs, u_horizontalBarCount, hitHBarIndex);
      }
    } else {
      float boxWidth = nextBoxX - boxX;
      isOn = checkForBoxHitInVerticalStrip(st, boxX, boxWidth,
        horizontalBarYs, u_horizontalBarCount, hitHBarIndex);
    }
    
    if (isOn) {
      outColor = vec4(getColorForHAndV(hitHBarIndex, vBarIndex), 1.0);
      break;
    }
  }

  // Debug line drawing
  if (!debugLinesOn) {
    return;
  }

  if (st.y > 0.999 && st.y < 1.001) {
    outColor = vec4(0., 1., 0., 1.);
    return;
  }
  if (st.y > -.01 && st.y < .01) {
    outColor = vec4(0., 1., 1., 1.);
    return;
  }

  for (int hBarIndex = 0; hBarIndex < u_horizontalBarCount; ++hBarIndex) {
    float hBarY = horizontalBarYs[hBarIndex];
    if (rect(st, vec2(0., hBarY), vec2(1., .01))) {
      outColor = vec4(0., 0., 1., 1.);
      return;
    }
  }

  for (int vBarIndex = 0; vBarIndex < u_verticalBarCount; ++vBarIndex) {
    float vBarX = verticalBarXs[vBarIndex];
    if (rect(st, vec2(vBarX, 0.), vec2(.01, 1.))) {
      outColor = vec4(0., 0., 1., 1.);
      return;
    }
  }

  if (rect(st, vec2(0., hBarDrift), vec2(1., .01))) {
    outColor = vec4(1., 0., 0., 1.);
  }
}

`;
