export default `#version 300 es
precision mediump float;

#define PI 3.1415927

out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;

float distSquared(vec2 center, float radius, vec2 st) {
    vec2 distVec = st - center;
    return dot(distVec, distVec);
}

float isInCircle(vec2 center, float radius, float fuzzThickness, vec2 st) {
    float distSquared = distSquared(center, radius, st);
    return smoothstep(distSquared, distSquared + fuzzThickness, radius * radius);
}

vec3 circleColor(vec2 center, float radius, vec3 baseColor, vec2 st) {
    float pct = 0.0;
    pct = isInCircle(center, radius, 0.005, st);
    
    float colorPart = 1. - distSquared(center, radius, st)/(radius * radius);

    return pct * colorPart * baseColor;    
}

vec3 revolvingGlowBallColor(vec2 revolutionCenter, float revolutionRadius, float revolveRate, float radius, vec3 baseColor, vec2 st) {
    float angle = mod(u_time * revolveRate, 2. * PI);
    vec2 circleCenter = revolutionCenter + vec2(cos(angle), sin(angle)) * 0.3;
    // Radius pulse
    float pulseSpeed = 8.;
    radius *= cos(pulseSpeed * mod(u_time, 2. * PI))/16. + 15./16.;
    return circleColor(circleCenter, radius, baseColor, st); 
}

void main(){
	vec2 st = gl_FragCoord.xy/u_resolution;
    
    vec3 color = revolvingGlowBallColor(vec2(0.5), .3, 1., 0.194, vec3(.4, .3, 1.), st);
    color += revolvingGlowBallColor(vec2(0.5, 0.5), .4, 1.25, 0.1, vec3(.4, .8, .2), st);
    color += revolvingGlowBallColor(vec2(0.6, 0.35), .5, -.5, 0.1, vec3(.7, .2, .15), st);
    
	outColor = vec4(color, 1.0 );
}
`;
