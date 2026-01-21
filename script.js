import * as THREE from "three";
//import * as THREE from 'https://cdn.skypack.dev/three@0.150.0';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

/* ------ 1. Boilerplate Three.js Setup ------ */
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x191970 );

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100); // High Up, Looking Down
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement); //??? Need to learn!

controls.target.set(0, 10, 0);
controls.screenSpacePanning = false;
controls.minDistance = 20;
controls.maxDistance = 250;
controls.zoomSpeed = 0.5;
controls.update();

/* ------ 2. Lighting Setup ------ */
// Why? Because displacement needs lighting to cast shadows on itself to be visible
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); //??? Need to learn!
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
dirLight.position.set(50, 100, 25);
scene.add(dirLight);

/* ------ 3. Loading the Gaea Heightmap ------ */
const exrLoader = new EXRLoader();
exrLoader.setDataType(THREE.FloatType);

exrLoader.load(
    "Heightmap_Cropped_Out.exr",
    function(texture) {
        console.log("Heightmap Loaded!", texture);

        const loaderElement = document.getElementById("loader");
        if(loaderElement) loaderElement.style.display = "none";

        const geometry = new THREE.PlaneGeometry(100, 100, 1024, 1024);
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            displacementMap: texture,
            displacementScale: 25,
            wireframe: true,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        
        scene.add(mesh);
    },
    function(progress) {
        console.log((progress.loaded / progress.total * 100) + "%loaded");
    },

    function(error) {
        console.error("An Error occured while loading the EXR file:", error);
    }
);


/* ------ 4. Animation Loop ------ */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

/* ------ 5. Window Resizing Update ------ */
window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});