/** Entry Point */

import { Engine } from "./engine.js";
import { UIManager } from "./interface.js";

window.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.querySelector("canvas");

    // Engine Initialisation
    const engine = new Engine(canvas);
    await engine.init();
    engine.start();

    // UI Initialisation
    const ui = new UIManager();

});