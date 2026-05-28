/** Engine - WebGPU/TSL */
/** Main 3D Point Cloud Scene is the courtesy of the eponymous Mr. Doob (repo: https://github.com/mrdoob/three.js/blob/master/examples/webgpu_lights_custom.html) */

import * as THREE from "three/webgpu";
import { color, deltaTime, emissive, float, Fn, hash, If, instancedArray, instanceIndex, mrt, output, pass, positionLocal, rand, sin, texture, time, uniform, vec2, vec3, vec4, vertexIndex } from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { caustics, perlinNoise } from "tsl-textures/tsl-textures.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/Addons.js";
import { gsap } from "gsap/gsap-core";

import { APP_STATE } from "./state.js";

import { OrbitControls } from "three/examples/jsm/Addons.js";

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.renderPipeline = null;
        this.onResize = this.onWindowResize.bind(this);

        this.controls = null;

        this.updateParticles = null;
        this.jump = null;
        this.particles = null;
        this.waveMesh = null;
        this.parts = {};
    }

    async init() {

        /** 1. Scene */
        this.scene = new THREE.Scene();

        /** 2. Camera */
        this.camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(5, 0.5, 2);

        this.listentoState();

        /** 3. Renderer */
        this.renderer = new THREE.WebGPURenderer({ canvas: this.canvas, antialias: true });
        await this.renderer.init();
        console.log("Engine Initialised!")
        this.renderer.setSize(window.innerWidth , window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.1;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        /** 4. Render and Bloom Pipeline */
        const scenePass = pass(this.scene, this.camera);
        const mrtNode = mrt({output: output, emissive: vec4(emissive, output.a)});
        mrtNode.setBlendMode("emissive", new THREE.BlendMode(THREE.NormalBlending));
        scenePass.setMRT(mrtNode);
        const emissiveTexture = scenePass.getTexture("emissive");
        emissiveTexture.type = THREE.UnsignedByteType;
        const outputPass = scenePass.getTextureNode();
        const emissivePass = scenePass.getTextureNode("emissive");
        const bloomPass = bloom(emissivePass, 10, 0.25);
        
        this.renderPipeline = new THREE.RenderPipeline(this.renderer);
        this.renderPipeline.outputNode = outputPass.add(bloomPass);

        /** 5. Particle Effect TSL Compute Shader Functions */
        const count = 100000;
        const positions = instancedArray(count, "vec3");

        const computePosition = Fn(() => {
            const i = instanceIndex.toFloat();

            const x = hash(i.add(1.0)).sub(0.5).mul(20.0);
            const z = hash(i.add(2.0)).sub(0.5).mul(20.0);
            const y = hash(i.add(3.0).mul(2.0));
        
            positions.element(instanceIndex).assign(vec3(x, y, z));

        })().compute(count);
        this.renderer.compute(computePosition);

        this.updateParticles = Fn(() => {
            const pos = positions.element(instanceIndex);
            const i = instanceIndex.toFloat();

            const speed = hash(i).mul(0.01).add(0.05);

            const swirlX = perlinNoise(pos.add(time.mul(0.02))).mul(0.01);
            const swirlZ = perlinNoise(pos.add(vec3(10.0)).add(time.mul(0.02))).mul(0.01);

            pos.addAssign(vec3(swirlX, speed, swirlZ))

            // Respawn Logic - slightly below the plane to make it evocative
            If(pos.y.greaterThan(1.0), () => {
                pos.y.assign(-0.1);
                //Reassign the reset particles to the same as the computePosition function
                pos.x.assign(hash(i.add(1.0)).sub(0.5).mul(20.0));
                pos.z.assign(hash(i.add(2.0)).sub(0.5).mul(20.0));
            });
        })().compute(count);

        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(count * 3);
        geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

        const material = new THREE.PointsNodeMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        material.positionNode = positions.element(vertexIndex);
        const particleGlow = color("#00f0ff");
        material.colorNode = particleGlow;
        material.emissiveNode = particleGlow.mul(0.5);

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        /** 6. GLB Asset Loader and GSAP Animation (Combined) */
        this.jump = gsap.timeline({repeat: -1});

        const textureLoader = new THREE.TextureLoader();
        const bakedTexture = textureLoader.load("./baked_first_text_background.webp");
        bakedTexture.colorSpace = THREE.SRGBColorSpace;

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/"); // Need to check whether local hosting is better!
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load("marquee.glb", (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isMesh) this.parts[child.name] = child;
            });

            if(this.parts.first_text_background || this.parts.studio_text_background) {
                this.parts.first_text_background.material = new THREE.MeshBasicNodeMaterial();
                this.parts.first_text_background.material.colorNode = color("#a34400")

                this.parts.studio_text_background.material = new THREE.MeshBasicNodeMaterial();
                this.parts.studio_text_background.material.colorNode = color("#a34400");
            }

            if(this.parts.second_text) {
                const startY = this.parts.second_text.position.y;

                // GSAP Custom Bounce Animation for the "JUMP" part of the studio name
                this.jump.to(this.parts.second_text.position, {
                    y: startY + 2,
                    duration: 0.5,
                    ease: "power2.out"
                }, "up");

                this.jump.to(this.parts.second_text.scale, {
                    x: 0.7,
                    y: 1.5,
                    z: 0.7,
                    duration: 0.5,
                    ease: "power2.out"
                }, "up");

                this.jump.to(this.parts.second_text.position, {
                    y: startY,
                    duration: 0.6,
                    ease: "power2.in"
                }, "down");

                this.jump.to(this.parts.second_text.scale, {
                    x: 1.2,
                    y: 0.6,
                    z: 1.2,
                    duration: 0.6,
                    ease: "power2.in"
                }, "down");

                this.jump.to(this.parts.second_text.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.4,
                    ease: "elastic.out(1, 0.3)"
                });
                this.jump.to({}, {duration: 0.5}); // Make the text stay on the ground for a wee bit before jumping again
            }
            gltf.scene.scale.setScalar(0.3);
            this.scene.add(gltf.scene); 
        });

        const waveGeometry = new THREE.PlaneGeometry(10, 10, 50, 50);
        const waveMaterial = new THREE.MeshSSSNodeMaterial();
        const causticNode = caustics({
            scale: 2,
            speed: 0,
            color: new THREE.Color("#067799"),
            seed: 0
        }); 
        const bakedBase = texture(textureLoader.load("./baked_base.webp"));
        waveMaterial.colorNode = (bakedBase.mul(2.0)).add(causticNode.mul(0.5));

        const wave = positionLocal.x
        .mul(0.5)
        .sin()
        .add(
            positionLocal.y.add(time).sin().mul(perlinNoise({scale: 20}))
        )
        .mul(0.2);
        waveMaterial.positionNode = positionLocal.add(vec3(0, 0, wave));

        this.waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
        this.waveMesh.rotation.x = -Math.PI / 2;
        this.scene.add(this.waveMesh);

        /** 7. Basic Lighting and Fog */
        this.scene.add(new THREE.AmbientLight("#cacaca", 5)) 
        this.scene.fog = new THREE.FogExp2("black", 0.075);

        /** 8. Resizing */
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
        window.addEventListener("resize", this.onResize);
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

    focusCamera(isMenuOpen, animate = true) {
        const isMobile = window.innerWidth < 768;

        let targetX, targetY, targetZ;

        if (isMenuOpen) {
            targetX = isMobile ? 4.5 : 3.5;
            targetY = 0.5;
            targetZ = isMobile ? 3.5 : 1.5;
        } else {
            targetX = isMobile ? 7.0 : 5.0; 
            targetY = 0.5;
            targetZ = isMobile ? 4.0 : 2.0;
        }

        if (animate) {
            gsap.to(this.camera.position, {
                x: targetX,
                y: targetY,
                z: targetZ,
                duration: 1.5,
                ease: "power3.inOut"
            });
        } else {
            this.camera.position.set(targetX, targetY, targetZ);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const isMenuOpen = APP_STATE.getCurrentState().mode === "menu"; 
        this.focusCamera(isMenuOpen, false);
    }

    start() {
        this.renderer.setAnimationLoop(() => {
            this.update();
            this.render();
        });
    }

    update() {
        this.controls.update();
        this.renderer.compute(this.updateParticles);
    }

    destroy() {
        // to clean up memory
        this.renderer.setAnimationLoop(null);
        window.removeEventListener("resize", this.onResize);
        this.jump?.kill();
        this.updateParticles = null;
    }

    render() {
        this.renderPipeline.render();
    }
}