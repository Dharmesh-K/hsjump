/** Engine - WebGPU/TSL */
/** Main 3D Point Cloud Scene is the courtesy of the eponymous Mr. Doob (repo: https://github.com/mrdoob/three.js/blob/master/examples/webgpu_lights_custom.html) */

import * as THREE from "three/webgpu";
import { color, lights, pass } from "three/tsl";
import { APP_STATE } from "./state.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";

class CustomLightingModel extends THREE.LightingModel {
    direct({lightColor, reflectedLight}) {
        reflectedLight.directDiffuse.addAssign(lightColor); // Need to understand how this builder works!
    }
};

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.renderPipeline = null;
        this.controls = null;
        this.timer = null;
        this.gui = null;

        this.light1 = null;
        this.light2 = null;
        this.light3 = null;

        this.listentoState();
    }

    async init() {

        // Camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 1.5;

        // Scene
        this.scene = new THREE.Scene();

        // Timer
        this.timer = new THREE.Timer();
        this.timer.connect(document);

        // Renderer
        this.renderer = new THREE.WebGPURenderer({ canvas: this.canvas, antialias: true, alpha: true });
        await this.renderer.init();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // RenderPipeline
        // this.renderPipeline = new THREE.RenderPipeline(this.renderer);
        // this.renderPipeline.outputNode = pass(this.scene, this.camera);

        // Lighting
        const sphereGeometry = new THREE.SphereGeometry(0.02, 16, 8);
        const addLight = (hexColor) => {
            const sphereMaterial = new THREE.NodeMaterial();
            sphereMaterial.colorNode = color(hexColor);
            
            sphereMaterial.lightsNode = lights(); // This makes the material ignore scene lights (if any)

            const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

            const light = new THREE.PointLight(hexColor, 0.1, 1);
            light.add(sphereMesh);
            this.scene.add(light);

            return light;
        };
        
        this.light1 = addLight(0xffaa00);
        this.light2 = addLight(0x0040ff); 
        this.light3 = addLight(0x80ff80);

        const allLightsNode = lights([this.light1, this.light2, this.light3]);

        const points = [];

        for(let i = 0; i < 500000; i++) {
            const point = new THREE.Vector3().random().subScalar(0.5).multiplyScalar(3);
            points.push(point);
        }

        const geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
        const materialPoints = new THREE.PointsNodeMaterial();

        // Custom Lighting Model
        const lightingModel = new CustomLightingModel();
        const lightingModelContext = allLightsNode.context({lightingModel});
        materialPoints.lightsNode = lightingModelContext;

        const pointCloud = new THREE.Points(geometryPoints, materialPoints);
        this.scene.add(pointCloud);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 50;

        window.addEventListener("resize", this.onWindowResize.bind(this));
        console.log("Engine Iniliased");
    }

    listentoState() {
        APP_STATE.subscribe((state) => {
            if(state.mode == "menu") {
                this.focusCamera(true);
            } else if(state.mode == "landing") {
                this.focusCamera(false);
            }
        });
    }

    focusCamera(isMenuOpen) {
        if (isMenuOpen) {
            this.camera.position.set(0, 0, 1.5);
        } else {
            this.camera.position.set(0, 0, 1.5);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    start() {
        this.renderer.setAnimationLoop(() => {
            this.update();
            this.render();
        });
    }

    update() {
        this.timer.update();
        this.controls.update();
        const time = Date.now() * 0.001;
        const scale = 0.5;

        this.light1.position.x = Math.sin(time * 0.7) * scale;
        this.light1.position.y = Math.cos(time * 0.5) * scale;
        this.light1.position.z = Math.cos(time * 0.3) * scale;

        this.light2.position.x = Math.cos(time * 0.3) * scale;
        this.light2.position.y = Math.sin(time * 0.5) * scale;
        this.light2.position.z = Math.sin(time * 0.7) * scale;

        this.light3.position.x = Math.sin(time * 0.7) * scale;
        this.light3.position.y = Math.cos(time * 0.3) * scale;
        this.light3.position.z = Math.sin(time * 0.5) * scale;

        this.scene.rotation.y = time * 0.1;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

}