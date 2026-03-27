import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

// --- 1. The Integrated "AAA" Styles ---
const style = document.createElement('style');
style.textContent = `
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
    
    canvas { display: block; position: fixed; top: 0; left: 0; z-index: 1; }

    .aladin-regular {
        font-family: "Aladin", system-ui;
        font-weight: 500;
        font-style: normal;
    }

    #ui-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        pointer-events: none;
        color: white;
        text-align: center;
        font-family: "Aladin", system-ui;
        opacity: 0;
        animation: fadeInUI 2s ease-out forwards;
        animation-delay: 0.5s;
    }

    h1 {
        font-size: 5.5rem;
        color: #F0FFF0;
        letter-spacing: 0.1em;
        margin: 0;
        filter: drop-shadow(0 0 20px rgba(24, 129, 42, 0.6));
    }

    .cta-btn {
        margin-top: 3rem;
        padding: 1rem 3.5rem;
        border: 1px solid rgba(255,255,255,0.4);
        background: rgba(255,255,255,0.05);
        color: F0FFF0;
        text-transform: uppercase;
        letter-spacing: 0.3em;
        cursor: pointer;
        pointer-events: auto; /* Clickable even if parent is none */
        backdrop-filter: blur(8px);
        transition: 0.4s all ease;
    }

    .cta-btn:hover { background: white; color: black; transform: scale(1.05); }

    @keyframes fadeInUI {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .nav-toggle {
        width: 64px;
        height: 64px;
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 100;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 6px;

        background: rgba(255,255,255,0.06);
        backdrop-filter: blur(32px) saturate(200%) sepia(100%);
        -webkit-backdrop-filter: blur(32px) saturate(180%) sepia(100%);

        clip-path: polygon(
            25% 5%, 75% 5%,
            95% 50%, 75% 95%,
            25% 95%, 5% 50%
        );

        cursor: pointer;
    }
    
    .nav-toggle span {
        width: 24px;
        height: 1px;
        background: white;
        transition: transform 0.4s cubic-bezier(0.23,1,0.32,1),
                    opacity 0.1s ease;
    }

    .nav-toggle:hover {
        transform: scale(1.2) rotate(90deg);
    }

    /* The Menu Container */
    #menu-overlay::before {
        content: "";
        position: absolute; 
        inset: 0;
        background: url("/noise.jpg");
        opacity: 0.1;
        pointer-events: none;
    }
    
    #menu-overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 15, 25, 0.45);
        backdrop-filter: blur(40px) saturate(140%);
        z-index: 90;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    }

    /* State handling */
    body.menu-open #menu-overlay {
        opacity: 1;
        pointer-events: auto;
    }

    .menu-link {
        font-size: 3rem;
        font-family: "Aladin", system-ui;
        display: block;
        color: white;
        text-decoration: none;
        margin: 1rem 0;
        transform: translateY(20px);
        transition: transform 0.4s ease;
    }

    body.menu-open .menu-link {
        transform: translateY(0);
    }
    
    body.menu-open .nav-toggle span:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
    }

    body.menu-open .nav-toggle span:nth-child(2) {
        opacity: 0;
    }

    body.menu-open .nav-toggle span:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
    }

    body {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
    }

    @media (max-width: 768px) {


    h1 {
        font-size: 2.8rem;
        letter-spacing: 0.04em;
        line-height: 1.15;
        margin: 0 auto;
    }

    #ui-layer p {
        font-size: 1.4rem !important;
        letter-spacing: 0.12em !important;
        margin-top: 1rem;
    }

    .nav-toggle {
        width: 52px;
        height: 52px;
        top: 1.5rem;
        right: 1.5rem;
    }

    .menu-link {
        font-size: 2rem;
    }
}
`;
document.head.appendChild(style);

// --- 2. The UI ---
// <button class="cta-btn">Home</button>; This can be added below to <p></p> if you want to revert back.
const ui = document.createElement('div');
ui.id = 'ui-layer';
ui.innerHTML = `
    <h1>Honeysuckle Jump Studios</h1>
    <p style="opacity: 1.0; font-size: 2.5rem; letter-spacing: 0.1em;">Harbourer of Stories</p>
`;
document.body.appendChild(ui);

const menuBtn = document.createElement('button');
menuBtn.className = "nav-toggle";
menuBtn.setAttribute("aria-label", "Toggle Menu");

menuBtn.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
`;
document.body.appendChild(menuBtn);

menuBtn.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
});

const menuOverlay = document.createElement('div');
menuOverlay.id = "menu-overlay";
menuOverlay.innerHTML = `
    <nav>
        <a href="#" class="menu-link">Work</a>
        <a href="#" class="menu-link">About</a>
        <a href="#" class="menu-link">Contact</a>
    </nav>
`;
document.body.appendChild(menuOverlay);

// 1. Pre-requisities
const canvas = document.querySelector("canvas.webgl");
const renderer = new THREE.WebGLRenderer({canvas, antialias: false});
const clock = new THREE.Clock();

// 2. Render Targets ("Ping-Pong??" Buffers) - Appaz one to read from and one to write to
const renderOptions = {
    format: THREE.RGBAFormat,
    type: THREE.FloatType, // High precision here for better colours
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
};

let renderTargetA = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderOptions);
let renderTargetB = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderOptions);

// 3. Scene
const scene = new THREE.Scene();

// 4A. Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
camera.position.set(2.5, 2.5, -6.5);

// 4B. Interactivity via., Orbital Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// 5. Geometry
const geometry = new THREE.PlaneGeometry(2,2);
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        iTime: {value: 0.0},
        iResolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
        iMouse: {value: new THREE.Vector4(0, 0, 0, 0)},
        cameraMatrix: { value: new THREE.Matrix4() },
        iChannel0: {value: null} // To hold the previous frame
    }
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// 6. Pixel Ratio owing to drop in sharpness otherwise
const dpr = Math.min(window.devicePixelRatio, 2);
renderer.setPixelRatio(dpr);

// 7. Resizing Handler
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    renderTargetA.setSize(w * dpr, h * dpr);
    renderTargetB.setSize(w * dpr, h * dpr);
    material.uniforms.iResolution.value.set(w * dpr, h * dpr);
});

// 8. Animation Loop
const tick = () => {
    controls.update();
    const elapsedTime = clock.getElapsedTime() * 0.5;
    material.uniforms.iTime.value = elapsedTime;
    material.uniforms.cameraMatrix.value.copy(camera.matrixWorld);
    
    // A. Tell the shader to use the texture from RenderTarget B (Previous Frame)
    material.uniforms.iChannel0.value = renderTargetB.texture;

    // B. Render the scene into RenderTarget A
    renderer.setRenderTarget(renderTargetA);
    renderer.render(scene, camera);

    // C. Now render RenderTarget A to the actual screen so we can see it
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    // D. Here we swap, i.e., A becomes the "old" frame for the next iteration
    let temp = renderTargetA;
    renderTargetA = renderTargetB;
    renderTargetB = temp;

    window.requestAnimationFrame(tick);
};

renderer.setSize(window.innerWidth, window.innerHeight);
tick();