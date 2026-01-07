import * as THREE from 'https://cdn.skypack.dev/three@0.150.0';

const canvas = document.querySelector("canvas.webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const fragmentShader = `
    uniform float iTime;
    uniform vec2 iResolution;

    vec3 palette (in float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.3, 0.2, 0.2);
        // Using 6.28318 (2*PI) gives a full color rotation
        return a + b*cos(6.28318*(c*t+d));
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
        vec2 uv0 = uv;
        vec3 finalColor = vec3(0.0);

        // FIX: Added 'float' type declaration for i
        for(float i = 0.0; i < 6.0; i++) {
            uv = fract(uv * 1.5) - 0.5;
            float d = length(uv) * exp(-length(uv0));
            vec3 col = palette(length(uv0) + i*0.4 + iTime*0.4);
            d = sin(d*8.0 + iTime)/8.0; // Restored to 8.0 for better contrast
            d = abs(d);
            d = pow(0.01 / d, 1.2);
            finalColor += col * d;
        }
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const material = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms: {
        iTime: { value: 0 },
        iResolution : { value: new THREE.Vector2() }
    }
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);
scene.add(mesh);

function render(time) {
    time *= 0.001;
    material.uniforms.iTime.value = time;
    
    // Update resolution and size
    const width = window.innerWidth;
    const height = window.innerHeight;
    material.uniforms.iResolution.value.set(width, height);
    renderer.setSize(width, height);
    
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);