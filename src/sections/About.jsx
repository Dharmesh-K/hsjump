import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import "./About.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {

    const container = useRef();

    useGSAP(() => {
        const section = container.current;
        const track = section.querySelector(".about-track");

        const getScrollAmount = () => - (track.scrollWidth - window.innerWidth);

        gsap.fromTo(
            track,
            { x: 0 },
            {
                x: () => getScrollAmount(), 
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: () => "+=" + (track.scrollWidth - window.innerWidth),
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                }
            }
        );

    }, { scope: container, dependencies: [] });

    return (

        <section ref={container} className="about-section">

            <div className="about-track">

                <div className="about-panel">
                    <p> Inspired by the words of Hamlet: "He was a man, take him for all in all, and I shall not look upon his like again." We believe that every life is a <span className="highlight">{" "}masterpiece{" "}</span> in its own accord.  </p>
                </div>

                <div className="about-panel">
                    <p>This studio was founded to immortalize these unrepeatable stories through <span className="highlight">{" "}cinematic storytelling</span> and to forge new <span className="highlight">{" "}interactive worlds,</span> inviting souls to live epic tales that have not yet come to pass. </p>
                </div>

                <div className="about-panel">
                    <p>We weave stories around fleeting moments in one's life, unseen worlds that remain bounded to one's imagination, and deeply <span className="highlight">{" "}human emotions{" "}</span> that are not forgotten but merely lying dormant, transforming them into visual art that resonates long after the screen fades to black.</p>
                </div>

            </div>

        </section>

    );

}