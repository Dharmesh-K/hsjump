precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform sampler2D iChannel0; // Feedback Texture
uniform mat4 cameraMatrix;

// Part (A): COMMON FUNCTIONS //

// --- 1. Dave Hoskins: https://www.shadertoy.com/view/4djSRW --- //
float hash13(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 *= dot(p3, p3.zyx + 31.32); // changed this to /= from *= for slightly better visuals from my POV
    return fract((p3.x + p3.y) * p3.z);
}

// --- 2. La Layenda Inigo Quilez: https://iquilezles.org/articles/distfunctions --- //
float smin( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); 
}
float smoothing(float d1, float d2, float k) { 
    return clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 ); 
}

// --- 3. Rotation Matrix --- //
mat2 rot(float a) { 
    return mat2(cos(a),-sin(a),sin(a),cos(a)); 
}
// --- 4. Repeat Helper Function --- //
vec3 repeat(vec3 p, float grid) {
    return mod(p + grid * 0.5, grid) - grid * 0.5;
}

// Part (B): SHADER LOGIC by Leon called "Taste of Noise 7": https://www.shadertoy.com/view/NddSWs //

float material;
float rng;

float map(vec3 p) {
    float t = iTime * 1.0 + rng * 0.9;
    float grid = 5.0;
    vec3 cell = floor(p / grid);
    p = repeat(p, grid);
    
    float dp = length(p);
    vec3 angle = vec3(0.1, -0.5, 0.1) + dp * 0.5 + p * 0.1 + cell;
    float size = sin(rng * 3.14);
    float wave = sin(-dp * 1.0 + t + hash13(cell) * 6.28) * 0.5;
    
    const int count = 4;
    float a = 1.0;
    float scene = 1000.0;
    float shape = 1000.0;
    
    for (int index = 0; index < count; ++index) {
        p.xz = abs(p.xz)-(0.5 + wave) * a;
        p.xz *= rot(angle.y/a);
        p.yz *= rot(angle.x/a);
        p.yx *= rot(angle.z/a);
        shape = length(p)-0.2 * a * size;
        material = mix(material, float(index), smoothing(shape, scene, 0.3*a));
        scene = smin(scene, shape, 1.0 * a);
        a /= 1.9;
    }
    return scene;
}

void main() {
    // 1. Setup Coordinates
    vec2 fragCoord = gl_FragCoord.xy;
    material = 0.0;
    
    // Standardized UV for raymarching
    vec2 uv = (fragCoord - iResolution.xy * 0.5) / iResolution.y;

    // 2. Camera Matrix Integration (The "Bridge")
    // ro = Ray Origin (World position of the Three.js camera)
    vec3 ro = cameraMatrix[3].xyz;
    
    // Extract camera direction vectors from the matrix
    vec3 right   = cameraMatrix[0].xyz;
    vec3 up      = cameraMatrix[1].xyz;
    vec3 forward = -cameraMatrix[2].xyz; // Three.js cameras look down -Z
    
    // rd = Ray Direction (Calculating perspective rays)
    // The 2.0 is the "Lens" (Focal Length). Increase for zoom, decrease for wide-angle.
    vec3 rd = normalize(uv.x * right + uv.y * up + 2.0 * forward);

    // 3. Initialize Raymarching
    vec3 pos = ro;
    vec3 ray = rd;
    rng = hash13(vec3(fragCoord, iTime));
    
    // 4. The Loop
    const float steps = 30.0;
    float index;
    for (index = steps; index > 0.0; --index) {
        float dist = map(pos);
        if (dist < 0.01) break;
        // Jittering the distance slightly for "soft" noise look
        dist *= 0.9 + 0.1 * rng; 
        pos += ray * dist;
    }
    
    // 5. Lighting & Coloring
    float shade = index / steps;
    vec2 off = vec2(0.001, 0.0);
    vec3 normal = normalize(map(pos) - vec3(map(pos - off.xyy), map(pos - off.yxy), map(pos - off.yyx)));
    vec3 tint = 0.5 + 0.5 * cos(vec3(3,2,1) + material * 0.5 + length(pos) * 0.5);

    // Basic Lighting
    float ld = dot(reflect(ray, normal), vec3(0,1,0)) * 0.5 + 0.5;
    vec3 light = vec3(1.000, 0.502, 0.502) * sqrt(ld);
    ld = dot(reflect(ray, normal), vec3(0,0,-1)) * 0.5 + 0.5;
    light += vec3(0.400, 0.714, 0.145) * sqrt(ld) * 0.5;

    // 6. Final Color & Stabilized Feedback
    vec3 currentRGB = (tint + light) * shade;

    // Use the UV fix to prevent "tearing" during camera movement
    vec2 uvFeedback = (floor(fragCoord) + 0.5) / iResolution.xy;
    vec4 lastFrame = texture2D(iChannel0, uvFeedback);
    
    // Stable feedback loop: max() can be aggressive, so we clamp the gain
    vec3 accumulated = max(currentRGB * 1.05, lastFrame.rgb - 0.008);
    gl_FragColor = vec4(clamp(accumulated, 0.0, 1.0), 1.0);
}