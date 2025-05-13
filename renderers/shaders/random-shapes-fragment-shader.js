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

float isInCircle(vec2 center, float radius, float halo, float fuzzThickness, vec2 st) {
    float distSq = distSquared(center, radius, st);
    distSq = max(.5 * distSq, .5 * distSquared(center, radius + halo, st));
    return smoothstep(distSq, distSq + fuzzThickness, radius * radius);
}

vec3 circleColor(vec2 center, float radius, float halo, vec3 baseColor, vec2 st) {
    float pct = 0.0;
    pct = isInCircle(center, radius, halo, 0.005, st);
    
    float colorPart = 1. - distSquared(center, radius, st)/(radius * radius);

    return pct * colorPart * baseColor;    
}

vec3 revolvingGlowBallColor(vec2 revolutionCenter, float revolutionRadius, float revolveRate, float radius, float halo, vec3 baseColor, vec2 st) {
    float angle = mod(u_time * revolveRate, 2. * PI);
    vec2 circleCenter = revolutionCenter + vec2(cos(angle), sin(angle)) * 0.3;
    // Radius pulse
    float pulseSpeed = 8.;
    radius *= cos(pulseSpeed * mod(u_time, 2. * PI))/16. + 15./16.;
    return circleColor(circleCenter, radius, halo, baseColor, st); 
}

void main(){
	  vec2 st = gl_FragCoord.xy/u_resolution;

    vec3 color = circleColor(vec2(.5), .3, .4, vec3(.4, .3, 1.), st);
    color += circleColor(vec2(.5, .5), .4, .1, vec3(.4, .8, .2), st);
    color += circleColor(vec2(.6, .35), .5, .2, vec3(.7, .2, .15), st);
    
	  outColor = vec4(color, 1.);
}
`;
