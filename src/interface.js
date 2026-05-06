/** User Interface */

import { APP_STATE } from "./state.js";

export class UIManager {
    constructor() {
        this.nodes = {
            menuBtn: document.querySelector(".nav-toggle"),
            overlay: document.querySelector("#menu-overlay"),
            links: document.querySelectorAll(".menu-link"),
            backBtn: document.querySelector(".back-btn"),
            contentBody: document.querySelector(".content-body")
        };
        this.init();
    }

    init() {
        // To toggle the menu
        if(this.nodes.menuBtn) {
            this.nodes.menuBtn.addEventListener("click", () => this.toggleMenu());
        }

        // Navigation links
        this.nodes.links.forEach(link => {
            link.addEventListener("click", (e) => {
                const section = e.target.dataset.section;
                this.navigateTo(section);
            });
        });

        // Back button
        this.nodes.backBtn.addEventListener("click", () => this.goBack());
    }

    toggleMenu() {
        const isOpen = document.body.classList.toggle("menu-open");

        if(!isOpen) {
            // To Reset Menu
            APP_STATE.set({
                mode: "landing",
                activeSection: null
            });

            document.body.classList.remove("view-content");
            this.nodes.contentBody.innerHTML = "";
        } else {
            APP_STATE.set({
            mode: "menu"
            });
        }
    }

    navigateTo(section) {
        APP_STATE.set({
            mode: "content",
            activeSection: section
        });
        document.body.classList.add("view-content");

        // Menu Link Contents
        this.nodes.contentBody.innerHTML = this.getContent(section);
    }

    getContent(section) {
        const content = {
            about: () => `
                <h3>About</h3>
                <p>Inspired by the words of Hamlet: "He was a man, take him for all in all, and I shall not look upon his like again", we believe that every life is a masterpiece in its own accord.</p>
                <p>This studio was founded to capture these unrepeatable stories through the medium of animation.</p>
                <p>We weave stories around fleeting moments in one's life, unseen worlds that remain bounded to one's imagination, and deeply human emotions that are not forgotten but merely lying dormant, and transform them into visual art that resonate with audiences long after the screen fades to black.</p>
            `,

            portfolio: () => `
                <h2>Portfolio</h2>
                <h4>Project: The Clay Guest</h4>
                <p><em>Status: In Production</em></p>
                <p>An animated short film capturing the sensory experiences of a child during the festive period of Ganesh Chaturthi. Inspired by Domee Shi's award winning storytelling in <em>Bao</em>, we aim to bring to the screen the culturally rich and familial rhythms of this vibrant festival.</p>
                <p>Achieving feature film visual fidelity requires a heavy-duty technical architecture. This project is being built on a Universal Scene Description (USD) centric Solaris and RenderMan pipeline, with an emphasis on Houdini's KineFX/APEX for a soulful character performance.</p>

            `,

            contact: () => `
                <h3>Inquiries</h3>
                <p>Whether you are interested in our technical pipeline or a future collaboration, we would love to hear from you.</p>
                <p>Reach out at: <em>enquiries@hsjump.com</em></p>
                <h3>Careers</h3>
                <p>While our seats are currently full, our studio is always evolving. Future opportunities for artists who see magic in the mundane will be posted here - keep an eye out!</p>
            `
        };
        return content[section]?.() || "";
    }

    goBack() {
        document.body.classList.remove("view-content");
        APP_STATE.set({
            mode: "landing",
            activeSection: null
        });
    }
    
}