import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Contact.css";

export default function Contact() {
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
    <section ref={pageRef} className="contact-section">
      <div className="contact-content">
        <h1 className="fade-up contact-title">
          Contact
        </h1>
        <p className="fade-up contact-body">
          Whether you are interested in our technical pipeline or a future collaboration, we would love to hear from you.
        </p>
        <p className="fade-up contact-body">
          Feel free to reach out to us at{" "}
          <a href="mailto:enquiries@hsjump.com" className="email-link">
            enquiries@hsjump.com
          </a>
        </p>

      </div>
    </section>
  );
}