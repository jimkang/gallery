export default `#version 300 es
precision mediump float;

//
// psrddnoise2.glsl
//
// Authors: Stefan Gustavson (stefan.gustavson@gmail.com)
// and Ian McEwan (ijm567@gmail.com)
// Version 2021-12-02, published under the MIT license (see below)
//
// Copyright (c) 2021 Stefan Gustavson and Ian McEwan.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
//

//
// Periodic (tiling) 2-D simplex noise (hexagonal lattice gradient noise)
// with rotating gradients and first and second order analytic derivatives.
//
// This is (yet) another variation on simplex noise. Unlike previous
// implementations, the grid is axis-aligned and slightly stretched in
// the y direction to permit rectangular tiling.
// The noise pattern can be made to tile seamlessly to any integer period
// in x and any even integer period in y. Odd periods may be specified
// for y, but then the actual tiling period will be twice that number.
//
// The rotating gradients give the appearance of a swirling motion, and
// can serve a similar purpose for animation as motion along z in 3-D
// noise. The rotating gradients in conjunction with the analytic
// derivatives allow for "flow noise" effects as presented by Ken
// Perlin and Fabrice Neyret.
//


//
// 2-D tiling simplex noise with rotating gradients and first and
// second order analytical derivatives.
// "vec2 x" is the point (x,y) to evaluate,
// "vec2 period" is the desired periods along x and y, and
// "float alpha" is the rotation (in radians) for the swirling gradients.
// The "float" return value is the noise value n,
// the "out vec2 gradient" argument returns the first order derivatives,
// and "out vec3 dg" returns the second order derivatives as
// dg = (dn2/dx2, dn2/dy2, dn2/dxy)
//
// Setting either period to 0.0 or a negative value will skip the wrapping
// along that dimension. Setting both periods to 0.0 makes the function
// execute about 10% faster.
//
// Not using the return value for some or all of the first or second order
// derivatives will make the compiler eliminate the code for computing them.
// If "dg" is not used, the function executes 15% faster. If neither
// "gradient" nor "dg" are used, the function executes 25-30% faster.
//
// The rotation by alpha uses one single addition. Unlike the 3-D version
// of psrddnoise(), setting alpha == 0.0 gives no speedup.
//
float psrddnoise(vec2 x, vec2 period, float alpha, out vec2 gradient,
					out vec3 dg) {

	// Transform to simplex space (axis-aligned hexagonal grid)
	vec2 uv = vec2(x.x + x.y*0.5, x.y);

	// Determine which simplex we're in, with i0 being the "base"
	vec2 i0 = floor(uv);
	vec2 f0 = fract(uv);
	// o1 is the offset in simplex space to the second corner
	float cmp = step(f0.y, f0.x);
	vec2 o1 = vec2(cmp, 1.0-cmp);

	// Enumerate the remaining simplex corners
	vec2 i1 = i0 + o1;
	vec2 i2 = i0 + vec2(1.0, 1.0);

	// Transform corners back to texture space
	vec2 v0 = vec2(i0.x - i0.y * 0.5, i0.y);
	vec2 v1 = vec2(v0.x + o1.x - o1.y * 0.5, v0.y + o1.y);
	vec2 v2 = vec2(v0.x + 0.5, v0.y + 1.0);

	// Compute vectors from v to each of the simplex corners
	vec2 x0 = x - v0;
	vec2 x1 = x - v1;
	vec2 x2 = x - v2;

	vec3 iu, iv;
	vec3 xw, yw;

	// Wrap to periods, if desired
	if(any(greaterThan(period, vec2(0.0)))) {
		xw = vec3(v0.x, v1.x, v2.x);
		yw = vec3(v0.y, v1.y, v2.y);
		if(period.x > 0.0)
			xw = mod(vec3(v0.x, v1.x, v2.x), period.x);
		if(period.y > 0.0)
			yw = mod(vec3(v0.y, v1.y, v2.y), period.y);
		// Transform back to simplex space and fix rounding errors
		iu = floor(xw + 0.5*yw + 0.5);
		iv = floor(yw + 0.5);
	} else { // Shortcut if neither x nor y periods are specified
		iu = vec3(i0.x, i1.x, i2.x);
		iv = vec3(i0.y, i1.y, i2.y);
	}

	// Compute one pseudo-random hash value for each corner
	vec3 hash = mod(iu, 289.0);
	hash = mod((hash*51.0 + 2.0)*hash + iv, 289.0);
	hash = mod((hash*34.0 + 10.0)*hash, 289.0);

	// Pick a pseudo-random angle and add the desired rotation
	vec3 psi = hash * 0.07482 + alpha;
	vec3 gx = cos(psi);
	vec3 gy = sin(psi);

	// Reorganize for dot products below
	vec2 g0 = vec2(gx.x,gy.x);
	vec2 g1 = vec2(gx.y,gy.y);
	vec2 g2 = vec2(gx.z,gy.z);

	// Radial decay with distance from each simplex corner
	vec3 w = 0.8 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2));
	w = max(w, 0.0);
	vec3 w2 = w * w;
	vec3 w4 = w2 * w2;

	// The value of the linear ramp from each of the corners
	vec3 gdotx = vec3(dot(g0, x0), dot(g1, x1), dot(g2, x2));

	// Multiply by the radial decay and sum up the noise value
	float n = dot(w4, gdotx);

	// Compute the first order partial derivatives
	vec3 w3 = w2 * w;
	vec3 dw = -8.0 * w3 * gdotx;
	vec2 dn0 = w4.x * g0 + dw.x * x0;
	vec2 dn1 = w4.y * g1 + dw.y * x1;
	vec2 dn2 = w4.z * g2 + dw.z * x2;
	gradient = 10.9 * (dn0 + dn1 + dn2);

	// Compute the second order partial derivatives
	vec3 dg0, dg1, dg2;
	vec3 dw2 = 48.0 * w2 * gdotx;
	// d2n/dx2 and d2n/dy2
	dg0.xy = dw2.x * x0 * x0 - 8.0 * w3.x * (2.0 * g0 * x0 + gdotx.x);
	dg1.xy = dw2.y * x1 * x1 - 8.0 * w3.y * (2.0 * g1 * x1 + gdotx.y);
	dg2.xy = dw2.z * x2 * x2 - 8.0 * w3.z * (2.0 * g2 * x2 + gdotx.z);
	// d2n/dxy
	dg0.z = dw2.x * x0.x * x0.y - 8.0 * w3.x * dot(g0, x0.yx);
	dg1.z = dw2.y * x1.x * x1.y - 8.0 * w3.y * dot(g1, x1.yx);
	dg2.z = dw2.z * x2.x * x2.y - 8.0 * w3.z * dot(g2, x2.yx);
	dg = 10.9 * (dg0 + dg1 + dg2);

	// Scale the return value to fit nicely into the range [-1,1]
	return 10.9 * n;
}


#define PI 3.1415927
#define TWOPI 2. * PI
#define MAX_BAR_ARRAY_SIZE 100
#define HBAR_COUNT 50.
#define VBAR_COUNT 50.
#define MAX_CANTOR 5100.
#define ZOOM .4
#define OFFSET .25

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

void setBarPositions(in float srcBarCount, in float barDrift, out float destBarArray[MAX_BAR_ARRAY_SIZE]) {
  int totalBarCount = int(srcBarCount);

  for (int barIndex = 0; barIndex < totalBarCount; ++barIndex) {
    float individualBarDrift = barDrift;
    // Every other barIndex, shift the barDrift
    individualBarDrift += step(1., mod(float(barIndex), 2.)) * cos(float(barIndex))/srcBarCount;

    float barPos = 1./srcBarCount * float(barIndex) + individualBarDrift;
  
    // TODO: Why is there a gap in the horizontal bars?
    // Wrap around.
    if (barPos > 1.) {
      barPos = mod(barPos, 1.);
    }

    destBarArray[barIndex] = barPos;
  }
}

float cantorPair(float a, float b) {
  float sum = a + b;
  return sum/2. * (sum + 1.) + b;
}

vec3 getColorForHAndV(int hIndex, int vIndex) {
  float cantorNumber = cantorPair(float(hIndex), float(vIndex));
  float proportion = cantorNumber/MAX_CANTOR;

  return vec3(proportion, rand(1. - proportion), rand(proportion));
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

void checkForBoxHitsInColumns(float[MAX_BAR_ARRAY_SIZE] verticalBarXs,
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
      return;
    }
  }
}

void checkForBoxHitsInRows(float[MAX_BAR_ARRAY_SIZE] verticalBarXs,
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
      return;
    }
  }
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;

  // Zoom in and move closer to the center so that we never show the edge of the bars.
  st *= ZOOM; 
  st += OFFSET;

  outColor = vec4(.05, .03, .01, 1.);

  int hitVBarIndex = -1;
  int hitHBarIndex = -1;

  float deltaFactor = u_time/2.;
  float drift = sin(deltaFactor)/4.;
  float hBarDrift = 0.;
  float vBarDrift = 0.;
  bool vDrift = mod(deltaFactor, 2. * TWOPI) <= TWOPI;

  if (vDrift) {
    vBarDrift = drift;
  } else {
    hBarDrift = drift;
  }

  float horizontalBarYs[MAX_BAR_ARRAY_SIZE];
  float verticalBarXs[MAX_BAR_ARRAY_SIZE];

  setBarPositions(HBAR_COUNT, hBarDrift, horizontalBarYs);
  setBarPositions(VBAR_COUNT, vBarDrift, verticalBarXs);

  if (vDrift) {
    checkForBoxHitsInRows(verticalBarXs, horizontalBarYs, st,
      hitVBarIndex, hitHBarIndex);
  } else {
    checkForBoxHitsInColumns(verticalBarXs, horizontalBarYs, st,
      hitVBarIndex, hitHBarIndex);
  }
  
  outColor = vec4(getColorForHAndV(hitHBarIndex, hitVBarIndex), 1.0);
  vec2 gradient;
  vec3 dg;
  float noiseValue = psrddnoise(vec2(hitVBarIndex, hitHBarIndex), vec2(PI, PI), 0., gradient, dg);
  outColor *= noiseValue;

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
