precision highp float;

uniform vec2 iResolution;
uniform float iTime;

float ringDensity(vec3 p) {
    float r = length(p.xz);
    float inner = 0.0;
    float outer = 4.0;

    // Ring Band Pattern
    float bands = sin(r * 40.0);
    bands = smoothstep(0.2, 0.6, bands);

    // Thin Vertical Thickness
    float thickness = exp(-abs(p.y) * 8.0);

    // Micro Chaos
    float chaos = sin(p.x * 20.0 + iTime) * (0.31415 * tan(p.z * 20.0));

    // Ring Mask
    //float ringMask = smoothstep(inner, inner + 0.2, r) * (1.0 - smoothstep(outer - 0.2, outer, r));

    return bands * thickness * chaos; // Add in Ring Mask for more control
}

void main() {
    // Screen Co-ordinates
    vec2 uv = (gl_FragCoord.xy - 0.5 *  iResolution.xy) / iResolution.y;

    // Camera
    vec3 ro = vec3(0.3, 0.0, -6.0);
    vec3 rd = normalize(vec3(uv, 4.0)); // Focal length adjustor

    // Logic
    float t = 0.0;
    float density = 0.0;

    for (int i = 0; i < 128; i++) {
        vec3 p = ro + rd * t;
        float d = ringDensity(p);
        density += d * 0.02;

        t += 0.5;
    }

    // *** Debug Output - left in for future updates! ***
    //vec3 sky = vec3(0.6, 0.8, 1.0);
    //vec3 ringColor = vec3(0.9, 0.85, 0.8);
    //vec3 col = mix(sky, ringColor, clamp(density, 0.0, 1.0));
    //gl_FragColor = vec4(vec3(density * 10.0), 1.0);

    float col = clamp(density * 10.0, 0.0, 1.0);
    gl_FragColor = vec4(vec3(col), 1.0);
}