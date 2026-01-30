import * as THREE from "three";
import vertexShader from "/Shaders/vertex.glsl";
import fragmentShader from "/Shaders/fragment.glsl";

// Pre-requisities
const canvas = document.querySelector("canvas.webgl");
const clock = new THREE.Clock();

// 1. Scene
const scene = new THREE.Scene();

//2. Geometry or Objects
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector2() }
    }
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//3. Camera (fullscreen Ortho)
const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1);
scene.add(camera);

//4. Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //Read Up!
renderer.setSize(window.innerWidth , window.innerHeight);

//5. Animation Loop
function tick() {
    material.uniforms.iTime.value = clock.getElapsedTime();
    material.uniforms.iResolution.value.set(
        window.innerWidth,
        window.innerHeight
    );

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
tick();