import * as THREE from "three";
import vertexShader from "./Shaders/vertex.glsl";
import fragmentShader from "./Shaders/fragment.glsl";

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
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //Read Up!
// renderer.setSize(window.innerWidth , window.innerHeight);

//5. Animation Loop
function tick() {
    material.uniforms.iTime.value = clock.getElapsedTime();
    // material.uniforms.iResolution.value.set(
    //     window.innerWidth,
    //     window.innerHeight
    // );

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
tick();

//6. Resizing Check & Update
function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // A. Update Renderer
    renderer.setSize(width , height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.getDrawingBufferSize(material.uniforms.iResolution.value);

    // B. Update Camera
    const aspect = width / height;
    if(aspect > 1) {
        camera.left = -aspect;
        camera.right = aspect;
        camera.top = 1;
        camera.bottom = -1;
    } else {
        camera.left = -1;
        camera.right = 1    ;
        camera.top = 1 / aspect;
        camera.bottom = -1 / aspect;
    }
    camera.updateProjectionMatrix();

    // material.uniforms.iResolution.value.set(
    //     width * window.devicePixelRatio,
    //     height * window.devicePixelRatio
    // );
}
window.addEventListener("resize", resize);
resize();