export default `#version 300 es
precision mediump float;

#define PI 3.1412759

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;
const float yGap = 0.1;
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
    float rectHeights[3];
    rectHeights[0] = 0.2;
    rectHeights[1] = 0.3;
    rectHeights[2] = 0.5;
    
    vec3 rectColors[3];
    rectColors[0] = vec3(1., 0., 0.);
    rectColors[1] = vec3(1., 1., 0.);
    rectColors[2] = vec3(0., 0., 1.);
    
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    bool isOn = false;
    float baseY = 0.3;

	float drift = sin(mod(u_time, 1. * PI));
    float cornerY = allBoxesYFloor + drift;
    
    for (int i = 0; i < 3; i += 1) {
        vec2 rectCorner = vec2(0.2, cornerY);
        vec2 rectSize = vec2(0.5, rectHeights[i]);
        // color = vec3(rect(st, rectCorner, rectSize));
        isOn = rect(st, rectCorner, rectSize);        
        if (isOn) {
            color = rectColors[i];
            break;
        }
        cornerY = cornerY + rectHeights[i] + yGap;
    }
    
    outColor = vec4(color, 1.0);
}

`;
