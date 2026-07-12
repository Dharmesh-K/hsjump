import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Careers.css";

export default function Careers() {
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      gsap.from(".fade-up", {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.1
      });

    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={pageRef} className="careers-section">
      <div className="careers-content">
        <h1 className="fade-up careers-title">
          Careers
        </h1>
        <p className="fade-up careers-body">
          While our seats are currently full, our studio is always evolving. Future opportunities for artists who see magic in the mundane will be posted here - keep an eye out!
        </p>
      </div>
    </section>
  );
}