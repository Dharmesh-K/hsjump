/** Engine - WebGPU/TSL/GLTF Asset Loader */

import * as THREE from "three/webgpu";
import { color, mix, normalWorld, output, Fn, uniform, vec4, rotate, screenCoordinate, screenSize } from "three/tsl";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

import { APP_STATE } from "./state.js";

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.timer = null;
        this.halftoneSettings = null;

        this.listentoState();
    }

    async init() {

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(45, 12, -12);

        // Scene
        this.scene = new THREE.Scene();

        // Timer
        this.timer = new THREE.Timer();
        this.timer.connect(document);

        // Renderer
        this.renderer = new THREE.WebGPURenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        await this.renderer.init();

        // Lighting
        const ambientLight = new THREE.AmbientLight("#1a1a2e", 1.2);
        this.scene.add(ambientLight);

        const directionLight = new THREE.DirectionalLight("#E0C39A", 4);
        directionLight.position.set(4, 3, 1);
        this.scene.add(directionLight);

        const rimLight = new THREE.DirectionalLight("#94ffd1", 2);
        rimLight.position.set(-3, 2, -2);
        this.scene.add(rimLight);

        // Halftone Effect Setting - from Threejs.org Examples
        this.halftoneSettings = [
            // Purple
            {
                count: 140,
                color: "#fb00ff",
                direction: new THREE.Vector3( - 0.4, - 1, 0.5 ),
                start: 1,
                end: 0,
                mixLow: 0,
                mixHigh: 0.5,
                radius: 0.8
            },

            // Cyan Highlights
            {
                count: 180,
                color: "#a6292a",
                direction: new THREE.Vector3( 0.5, 0.5, - 0.2 ),
                start: 0.55,
                end: 0.2,
                mixLow: 0.5,
                mixHigh: 1,
                radius: 0.5
            }
        ];

        for (const index in this.halftoneSettings) {

            const settings = this.halftoneSettings[index];

            // Setting up uniforms
            const uniforms = {};

            uniforms.count = uniform(settings.count);
            uniforms.color = uniform(color(settings.color));
            uniforms.direction = uniform(settings.direction);
            uniforms.start = uniform(settings.start);
            uniforms.end = uniform(settings.end);
            uniforms.mixLow = uniform(settings.mixLow);
            uniforms.mixHigh = uniform(settings.mixHigh);
            uniforms.radius = uniform(settings.radius);

            settings.uniforms = uniforms;
        }

        // Halftone Settings
        const halftone = Fn(([count, color, direction, start, end, radius, mixLow, mixHigh]) => {

            // Grid Pattern
            let gridUV = screenCoordinate.xy.div(screenSize.yy).mul(count);
            gridUV = rotate(gridUV, Math.PI * 0.25).mod(1);

            // Orientation Strength
            const orientationStrength = normalWorld
                .dot(direction.normalize())
                .remapClamp(end, start, 0, 1);

            // Mask
            const mask = orientationStrength.mul(radius).mul(0.5)
                .step(gridUV.sub(0.5).length())
                .mul(mix(mixLow, mixHigh, orientationStrength));

            return vec4(color, mask);

        });

        const halftones = Fn(([input]) => {

			const halftonesOutput = input;

            for (const settings of this.halftoneSettings) {
                const halfToneOutput = halftone( settings.uniforms.count, settings.uniforms.color, settings.uniforms.direction, settings.uniforms.start, settings.uniforms.end, settings.uniforms.radius, settings.uniforms.mixLow, settings.uniforms.mixHigh );
                halftonesOutput.rgb.assign( mix( halftonesOutput.rgb, halfToneOutput.rgb, halfToneOutput.a ));
            }

            return halftonesOutput;

        });

        // Default Material
        const defaultMaterial = new THREE.MeshStandardMaterial({
            color: "#ff622e",
            roughness: 0.4,
            metalness: 0.2
        });
        defaultMaterial.outputNode = halftones(output);

        // Object/(s) - Test includes only the Torus Knot
        // const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32), defaultMaterial);
        // torusKnot.position.x = 3;
        // this.scene.add(torusKnot);

        // GTLF Asset
        const gltfloader = new GLTFLoader();
        gltfloader.load (
            "./public/testplan.glb",
            (gltf) => {
                const model = gltf.scene;
                model.scale.setScalar(2.5);
                model.traverse((child) => {
                    if(child.isMesh)
                        child.material.outputNode = halftones(output);
                });
                this.scene.add(model);
            }
        );

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 50;

        window.addEventListener("resize", () => this.onWindowResize);
        console.log("Engine Iniliased");
    }

    listentoState() {
        APP_STATE.subscribe((state) => {
            if(state.mode == "menu") {
                this.focusCameraOnHouse(true);
            } else if(state.mode == "landing") {
                this.focusCameraOnHouse(false);
            }
        });
    }

    focusCameraOnHouse(isMenuOpen) {
        if (isMenuOpen) {
            this.camera.position.set(15, 4, -4);
        } else {
            this.camera.position.set(45, 12, -12);
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

        const time = this.timer.getElapsed();
        this.halftoneSettings[1].uniforms.direction.value.x = Math.cos(time);
        this.halftoneSettings[1].uniforms.direction.value.y = Math.sin(time);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

}