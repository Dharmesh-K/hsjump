    import * as THREE from "three";
    import { SparkRenderer, PointerControls, generators } from "@sparkjsdev/spark";

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
            z-index: 10; /* Ensures it sits on top of the canvas */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            pointer-events: none; /* Let the mouse "see" the 3D scene through the text */
            color: white;
            text-align: center;
            font-family: "Aladin", system-ui;
            opacity: 0;
            animation: fadeInUI 2s ease-out forwards;
            animation-delay: 0.5s;
        }

        h1 {
            font-size: 5rem;
            letter-spacing: 0.1em;
            margin: 0;
            filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));
        }

        .cta-btn {
            margin-top: 3rem;
            padding: 1rem 3.5rem;
            border: 1px solid rgba(255,255,255,0.4);
            background: rgba(255,255,255,0.05);
            color: white;
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
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.25);

            clip-path: polygon(
                25% 5%, 75% 5%,
                95% 50%, 75% 95%,
                25% 95%, 5% 50%
            );

            cursor: pointer;
             transition: transform 0.3s ease, background 0.3s ease;
        }
        
        .nav-toggle span {
            width: 24px;
            height: 1px;
            background: white;
            transition: transform 0.4s cubic-bezier(0.23,1,0.32,1),
                        opacity 0.1s ease;
        }

        .nav-toggle:hover {
            transform: scale(1.05) rotate(3deg);
        }

        /* The Menu Container */
        #menu-overlay::before {
            content: "";
            position: absolute;git 
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

        #ui-layer {
            padding: 0 1.5rem;
            text-align: center;
        }

        h1 {
            font-size: 2.8rem;
            letter-spacing: 0.04em;
            line-height: 1.15;
            margin: 0 auto;
        }

        #ui-layer p {
            font-size: 1.1rem !important;
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
        <p style="opacity: 0.6; font-size: 2.0rem; letter-spacing: 0.2em;">Harbourer of Stories</p>
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

    const SCENE_CONFIG = {
        SNOW_HEIGHT: 8,
        HALF_WIDTH: 12,
        HALF_DEPTH: 48,
        SNOW_MIN_Y: -4,
        CAMERA_DURATION: 90,
    }

    // --- 3. The Spark.js and Three.js Scene ---
        
    // Device type check to optimize performance on mobile
    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        isMobile ? 60 : 45, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setPixelRatio(
        isMobile ? 1.2 : Math.min(window.devicePixelRatio, 2)
    );
    document.body.appendChild(renderer.domElement);

    const spark = new SparkRenderer({ 
        renderer,
        apertureAngle: 0.1,
        focalDistance: isMobile ? 6.0 : 8.0,
     });
    scene.add(spark);

    const apertureSize = {
        apertureSize: 0.1,
    };

    function updateAperture() {
        if (spark.focalDistance > 0) {
            spark.apertureAngle = 2 * Math.atan(0.5 * apertureSize.apertureSize / spark.focalDistance);
        } else {
            spark.apertureAngle = 0.0; // default value when focal distance is zero or negative
        }
    }
    updateAperture();

    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobile = width < 768;

        renderer.setPixelRatio(
            isMobile ? 1.2 : Math.min(window.devicePixelRatio, 2)
        );

        camera.aspect = width / height;
        camera.fov = isMobile ? 60 : 45;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    resize();
    window.addEventListener("resize", resize);

    const controls = new PointerControls({ canvas: renderer.domElement });
    const mouse = new THREE.Vector2(0, 0);

    if (!isMobile) {
        window.addEventListener("mousemove", (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
    }

    const cam = camera.position;
    const snowVolumeBox = new THREE.Box3(
        new THREE.Vector3(
            cam.x - SCENE_CONFIG.HALF_WIDTH,
            cam.y - (SCENE_CONFIG.SNOW_HEIGHT * 8),
            cam.z - (SCENE_CONFIG.SNOW_HEIGHT * 8),
        ),
        new THREE.Vector3(
            cam.x + SCENE_CONFIG.HALF_WIDTH,
            cam.y + SCENE_CONFIG.SNOW_HEIGHT  * 2,
            cam.z + SCENE_CONFIG.HALF_DEPTH / 128,
        ),
    );

    const snow = generators.snowBox({
        ...generators.DEFAULT_SNOW,
        box: snowVolumeBox.clone(),
        minY: SCENE_CONFIG.SNOW_MIN_Y,
        color1: new THREE.Color(1.0, 1.0, 1.0),
        color2: new THREE.Color(0.580, 0.949, 0.957), //new THREE.Color(0.91, 0.9, 0.97)
        density: isMobile ? 300 : 600,
        maxScale: 0.02,
    });
    scene.add(snow.snow);

    let lastTime;
    renderer.setAnimationLoop(function animate(time) {
        const t = time * 0.001;
        const dt = t - (lastTime ?? t);
        lastTime = t;

        controls.update(dt, camera);

        // Target a small rotation based on mouse position
        const targetRotationY = mouse.x * 0.25;
        const targetRotationX = mouse.y * 0.25;

        // Use lerp to "slide" the rotation smoothly toward the target
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotationY, 0.05);
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotationX, 0.05);

        // camera movement
        const targetZ = -13.5;
        const startZ = 0;
        const duration = 90;
        const progress = Math.min(1, t / duration);
        const smoothProgress = Math.sin(progress * Math.PI * 0.5);
        camera.position.z = startZ + (targetZ - startZ) * smoothProgress;

        renderer.render(scene, camera);
    });