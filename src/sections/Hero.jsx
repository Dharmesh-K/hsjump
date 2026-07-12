import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

import "./Hero.css";

gsap.registerPlugin(useGSAP, SplitText);

export default function Hero() {
    const container = useRef();

    useGSAP(() => {
        const split = new SplitText(".studio-title", { type: "words, chars" });

        gsap.from(split.chars, {
            opacity: 0, 
            scale: 0.8, 
            filter: "blur(4px)",
            stagger: { each: 0.06, from: "center" },
            duration: 0.4, 
            ease: "power2.out",
            delay: 0.8
        });

        // Scroll-Indicator appears after the Studio Logo Animation is complete
        gsap.from(".scroll-indicator", {
            opacity: 0,
            y: 20,
            duration: 1,
            delay: 2.5,
            ease: "power2.out"
        });

        return () => {
            split.revert();
        };

    }, {scope: container});

    return (
        <section ref={container} className="hero">
            <h1 className="studio-title">Honeysuckle Jump Studios</h1>

            {/* Scroll-Down Helper */}
            <div className="scroll-indicator">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v6" />
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </div>
        </section>
    );
}