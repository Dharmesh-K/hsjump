import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import "./Menu.css";


gsap.registerPlugin(CustomEase, SplitText);
CustomEase.create("hop", "0.87, 0, 0.13, 1");

export default function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigate = (e, path) => {
        e.preventDefault();

        if (window.location.pathname === path) {
            toggleMenu();
            return;
        }

        toggleMenu();

        setTimeout(() => {
            navigate(path);
        }, 1000);
        
    };

    const handleLogoClick = (e) => {
        e.preventDefault();

        if (window.location.pathname === "/") {
            if (isMenuOpen) toggleMenu(); // Just closes the menu if it open and we are only on the homescreen
        }

        if (isMenuOpen) {
            toggleMenu();
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } else {
            navigate("/");
        }
    }
    
    const menuRef = useRef(null);
    const tlRef = useRef(null); // Keeps track of text splits between renders
    
    useEffect(() => {
        // gsap.context() isolates selectors to ONLY elements inside menuRef
        const ctx = gsap.context(() => {
            const textContainers = gsap.utils.toArray(".menu-col");
            const splitTextByContainer = [];

            textContainers.forEach((container) => {
                const textElements = container.querySelectorAll("a, p");
                const containerSplits = [];

                textElements.forEach((element) => {
                    const split = new SplitText(element, {
                        type: "lines",
                        linesClass: "line",
                        // Note: Svelte had mask: "lines". Standard GSAP handles masking via CSS overflow.
                    });
                    containerSplits.push(split);
                    gsap.set(split.lines, { y: "-110%" });
                });
                splitTextByContainer.push(containerSplits);
            });

            // Store the splits in a ref so toggleMenu can access them
            tlRef.current = { splits: splitTextByContainer };
            // Line to divide the menu - for non-mobile only
            gsap.set(".menu-divider", { scaleY: 0 });

        }, menuRef);

        return () => ctx.revert();
    }, []);

    const toggleMenu = () => {
        // Prevent spam clicking while timeline runs
        if (gsap.isTweening(".menu-overlay")) return; 

        // Use context again to ensure our selectors are localized
        gsap.context(() => {
            const tl = gsap.timeline();

            if (!isMenuOpen) {
                setIsMenuOpen(true);

                tl.to(".menu-toggle-label p", { y: "-110%", duration: 1, ease: "hop" })
                  .to(".menu-overlay", { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1, ease: "hop" }, "<")
                  .to(".menu-overlay-content", { yPercent: 0, duration: 1, ease: "hop" }, "<")
                  .to(".menu-divider", { scaleY: 1, duration: 1.1, ease: "hop" }, "-=0.7");

                tlRef.current.splits.forEach((containerSplits, index) => {
                    const copyLines = containerSplits.flatMap((split) => split.lines);
                    tl.to(copyLines, { y: "0%", duration: 1.0, ease: "hop", stagger: -0.075 }, index === 0 ? "-=0.85" : "<0.1");
                });
            } else {
                setIsMenuOpen(false);

                tl.to(".menu-overlay", { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", duration: 1, ease: "hop" })
                  .to(".menu-overlay-content", { yPercent: -50, duration: 1, ease: "hop" }, "<")
                  .to(".menu-toggle-label p", { y: "0%", duration: 1, ease: "hop" }, "<")
                  .to(".menu-divider", { scaleY: 0, duration: 0.8, ease: "power2.inOut" }, "<")
                  .to(".menu-col", { opacity: 0.25, duration: 1, ease: "hop" }, "<");

                tl.call(() => {
                    tlRef.current.splits.forEach((containerSplits) => {
                        const copyLines = containerSplits.flatMap((split) => split.lines);
                        gsap.set(copyLines, { y: "-110%" });
                    });
                    gsap.set(".menu-col", { opacity: 1 });
                    gsap.set(".menu-divider", { scaleY: 0 });
                });
            }
        }, menuRef);
    };

    return (
        <nav ref={menuRef}>
            <div className="menu-bar">
                <div className="menu-logo">
                    <a href="/" onClick={handleLogoClick}>
                        <img src="./logo.svg" alt="Honeysuckle Jump Studios" className="logo-svg" />
                    </a>
                </div>
                <div className="menu-toggle-btn" onClick={toggleMenu}>
                    <div className="menu-toggle-label"><p>Menu</p></div>
                    <div className={`menu-hamburger-icon ${isMenuOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
            
            <div className="menu-overlay">
                <div className="menu-overlay-content">
                    <div className="menu-content-wrapper">
                        <div className="menu-content-main">
                            <div className="menu-col">
                                <div className="menu-link"><a href="/works" onClick={(e) => handleNavigate(e, '/works')}>Works</a></div>
                                <div className="menu-link"><a href="/careers" onClick={(e) => handleNavigate(e, '/careers')}>Careers</a></div>
                                <div className="menu-link"><a href="/contact" onClick={(e) => handleNavigate(e, '/contact')}>Contact</a></div>
                            </div>

                            <div className="menu-divider"></div>

                            <div className="menu-col">
                                <div className="menu-tag"><span>Harbourer of Stories</span></div>
                                <div className="menu-tag"><span>Procedural World Building</span></div>
                                <div className="menu-tag"><span>Original IP</span></div>
                                <div className="menu-tag"><span>Animated Short Films</span></div>
                            </div>
                        </div>
                        <div className="menu-footer">
                            <div className="menu-col">
                                <p>Honeysuckle Jump Studios</p>
                                <p>Bangalore, India</p>
                            </div>
                            <div className="menu-col">
                                <a href="mailto:enquiries@hsjump.com" className="email-link">
                                    enquiries@hsjump.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
        </nav>
    );
}