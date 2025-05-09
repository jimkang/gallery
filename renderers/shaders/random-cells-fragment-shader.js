export default `#version 300 es
precision mediump float;

#define PI 3.1415927
#define TWOPI 2. * PI
#define MAX_BAR_ARRAY_SIZE 100
#define HBAR_COUNT 50.
#define VBAR_COUNT 50.
#define OFFSET .2

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

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

float rand(float seed) {
  return fract(sin(seed) * 10000.);
}

float rand(vec2 st) {
  return fract(
    sin(
      dot(st.xy, vec2(12.456, -47.34))
      * u_time
    )
  );
}

void setBarPositions(float srcBarCount, float barDrift, out float destBarArray[MAX_BAR_ARRAY_SIZE]) {
  int totalBarCount = int(srcBarCount);

  for (int barIndex = 0; barIndex < totalBarCount; ++barIndex) {
    // This would be cool if it weren't possibly seizure-causing.
    //float individualBarDrift = rand(vec2(float(barIndex) * PI/8., -1.));

    float individualBarDrift = 0.;//cos(float(barIndex) * PI/4.)/16.;

    if (mod(float(barIndex), 2.) == .0) {
      // barDrift *= -1.;
    }
    float barPos = 1./srcBarCount * float(barIndex) + barDrift + individualBarDrift;
  
    // TODO: Why is there a gap in the horizontal bars?
    // Wrap around.
    if (barPos > 1.) {
      barPos = mod(barPos, 1.);
    }

    destBarArray[barIndex] = barPos;
  }
}

float cantorPair(int a, int b) {
  float sum = float(a + b);
  return sum/2. * (sum + 1.) + float(b);
}

vec3 getColorForHAndV(int hIndex, int vIndex) {
  float cantorNumber = cantorPair(hIndex, vIndex);
  float maxCantor = cantorPair(int(HBAR_COUNT), int(VBAR_COUNT));
  return vec3(cantorNumber/maxCantor);

  return vec3(rand(mod(cantorNumber, 64.)), rand(mod(cantorNumber, 411.)), rand(mod(cantorNumber, 3.)));
}

bool checkForBoxHitInVerticalStrip(vec2 st, float x, float width,
in float[MAX_BAR_ARRAY_SIZE] horizontalBarYs, float totalHBarCount, out int hitHBarIndex) {

  for (int hBarIndex = 0; hBarIndex < int(totalHBarCount) - 1; ++hBarIndex) {
    float hBarY = horizontalBarYs[hBarIndex];
    float boxY = hBarY + 1.;
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

bool checkForBoxHitsInColumns(float[MAX_BAR_ARRAY_SIZE] verticalBarXs,
  float[MAX_BAR_ARRAY_SIZE] horizontalBarYs, vec2 st,
  out int hitVBarIndex, out int hitHBarIndex) {

  for (int vBarIndex = 0; vBarIndex < int(VBAR_COUNT); ++vBarIndex) {
    float boxX = verticalBarXs[vBarIndex];
    int nextVBarIndex = vBarIndex + 1;
    if (nextVBarIndex >= int(VBAR_COUNT)) {
      nextVBarIndex = 0;
    }

    float nextBoxX = verticalBarXs[nextVBarIndex];
    bool isOn = false;

    if (nextBoxX < boxX) {
      // This box is on the edge, so we split it and do checks for two boxes in
      // this case.
      isOn = checkForBoxHitInVerticalStrip(st, boxX, 1. - boxX, 
        horizontalBarYs, HBAR_COUNT, hitHBarIndex);
      if (!isOn) {
        isOn = checkForBoxHitInVerticalStrip(st, 0., nextBoxX,
          horizontalBarYs, HBAR_COUNT, hitHBarIndex);
      }
    } else {
      float boxWidth = nextBoxX - boxX;
      isOn = checkForBoxHitInVerticalStrip(st, boxX, boxWidth,
        horizontalBarYs, HBAR_COUNT, hitHBarIndex);
    }

    if (isOn) {
      hitVBarIndex = vBarIndex;
      return isOn;
    }
  }
  return false;
}

bool checkForBoxHitsInRows(float[MAX_BAR_ARRAY_SIZE] verticalBarXs,
  float[MAX_BAR_ARRAY_SIZE] horizontalBarYs, vec2 st,
  out int hitVBarIndex, out int hitHBarIndex) {

  vec2 flippedST = vec2(st.y, st.x);

  for (int hBarIndex = 0; hBarIndex < int(HBAR_COUNT); ++hBarIndex) {
    float boxY = horizontalBarYs[hBarIndex];
    int nextHBarIndex = hBarIndex + 1;
    if (nextHBarIndex >= int(HBAR_COUNT)) {
      nextHBarIndex = 0;
    }

    float nextBoxY = horizontalBarYs[nextHBarIndex];
    bool isOn = false;

    if (nextBoxY < boxY) {
      // This box is on the edge, so we split it and do checks for two boxes in
      // this case.
      isOn = checkForBoxHitInVerticalStrip(flippedST, boxY, 1. - boxY, 
        verticalBarXs, HBAR_COUNT, hitVBarIndex);
      if (!isOn) {
        isOn = checkForBoxHitInVerticalStrip(flippedST, 0., nextBoxY,
          verticalBarXs, HBAR_COUNT, hitVBarIndex);
      }
    } else {
      float boxHeight = nextBoxY - boxY;

      // We're using checkForBoxHitInVerticalStrip to check for a box hit in a
      // horizontal strip by flipping x and y and passing in vertical stuff
      // instead of horizontal stuff.
      isOn = checkForBoxHitInVerticalStrip(flippedST, boxY, boxHeight,
        verticalBarXs, HBAR_COUNT, hitVBarIndex);
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

  // Zoom in and move closer to the center so that we never show the edge of the bars.
  st *= .5;
  st += OFFSET;

  outColor = vec4(.05, .03, .01, 1.);

  int hitVBarIndex = -1;
  int hitHBarIndex = -1;

  float deltaFactor = u_time/2.;
  float drift = sin(deltaFactor)/4.;
  float hBarDrift = 0.;
  float vBarDrift = 0.;
  bool vDrift = false;

  if (mod(deltaFactor, 2. * TWOPI) > TWOPI) {
    hBarDrift = drift;
  } else {
    vDrift = true;
    vBarDrift = drift;
  }

  float horizontalBarYs[MAX_BAR_ARRAY_SIZE];
  float verticalBarXs[MAX_BAR_ARRAY_SIZE];

  setBarPositions(HBAR_COUNT, hBarDrift, horizontalBarYs);
  setBarPositions(VBAR_COUNT, vBarDrift, verticalBarXs);

  bool isOn = false;

  if (vDrift) {
    isOn = checkForBoxHitsInRows(verticalBarXs, horizontalBarYs, st,
      hitVBarIndex, hitHBarIndex);
  } else {
    isOn = checkForBoxHitsInColumns(verticalBarXs, horizontalBarYs, st,
      hitVBarIndex, hitHBarIndex);
  }
  
  if (isOn) {
    outColor = vec4(getColorForHAndV(hitHBarIndex, hitVBarIndex), 1.0);
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

  for (int hBarIndex = 0; hBarIndex < int(HBAR_COUNT); ++hBarIndex) {
    float hBarY = horizontalBarYs[hBarIndex];
    if (rect(st, vec2(0., hBarY), vec2(1., .01))) {
      outColor = vec4(0., 0., 1., 1.);
      return;
    }
  }

  for (int vBarIndex = 0; vBarIndex < int(VBAR_COUNT); ++vBarIndex) {
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
