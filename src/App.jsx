import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

import { Water } from "@paper-design/shaders-react";

import LoadingHand from "./components/LoadingHand";
import ClickToEnter from "./components/ClickToEnter";
import Menu from "./components/Menu";
import Hero from "./sections/Hero";
import About from "./sections/About";

// Menu Content Only
import Careers from "./sections/Careers";
import Contact from "./sections/Contact";
import Works from "./works/Works";
import ProjectDetails from "./works/ProjectDetails";

export default function App() {
  const [appState, setAppState] = useState("loading");

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Audio File Loading
  const audioRef = useRef(null);
  useEffect(() => {
    audioRef.current = new Audio("./lake_sunset.mp3"); 
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
  }, []);

  // Initial Load Phase & Lenis Setup
  useEffect(() => {
    let isMounted = true;

    const assetsToPreload = [
      "./moss.jpg",
      "./project_himadri.jpg",
      "./project_clay_guest.jpg",
      "./logo.svg",
      "./lake_sunset.mp3"
    ];

    const preloadAssets = async () => {
      try {
        const assetPromises = assetsToPreload.map((src) => {
          return new Promise((resolve) => {
            if(src.endsWith(".mp3")) {
              // For audio
              const audio = new Audio();
              audio.src = src;
              audio.addEventListener("canplaythrough", resolve, { once: true });
              audio.addEventListener("error", resolve, { once: true });
              audio.load();
          } else {
            // For JPGs and SVG
            const img = new Image();
              img.src = src;
              img.onload = resolve;
              img.onerror = resolve;
          }
        });
      });

      // Font loading
      const fontPromise = document.fonts ? document.fonts.ready : Promise.resolve();

      // Minimum time for tapping hand animation set to 2.5 seconds
      const minTimePromise = new Promise(resolve => setTimeout(resolve, 2500));

      await Promise.all([...assetPromises, fontPromise, minTimePromise]);

      if (isMounted) setAppState("ready");
      } catch(error) {
        console.error("Asset loading error:", error);
        if (isMounted) setAppState("ready");
      }
    };

    preloadAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight       
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const enterExperience = () => {
    if (appState === "ready") {
      setAppState("entered");
      if (audioRef.current && isHomePage) {
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
        });
      }
    }
  };

  useEffect(() => {
    if(appState!= "entered" || !audioRef.current) return;

    if(isHomePage) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isHomePage, appState]);

  return (
    <ReactLenis root>
      <main>
        <div className="hero-bg-canvas">
            <Water
              width={dimensions.width}
              height={dimensions.height}
              image="/moss.jpg"
              colorBack="#8f8f8f"
              colorHighlight="#f5deb2"
              highlights={0.3}
              layering={0.5}
              edges={0.8}
              waves={0.3}
              caustic={0.1}
              size={1}
              speed={1}
              scale={1.1}
              fit="cover"
            />
        </div>

        {appState !== "entered" && (
          <div 
            className={`loading-overlay ${appState === "ready" ? "is-ready" : ""}`} 
            onClick={enterExperience}
          >
            <div className="state-wrapper">
                {appState === "loading" && (
                  <div className="fade-element">
                    <LoadingHand />
                  </div>
                )}
                
                {appState === "ready" && (
                  <div className="fade-element">
                    <ClickToEnter />
                  </div>
                )}
            </div>
          </div>
        )}

        {appState === "entered" && (
          <>
            <Menu />
            <div className="scroll-container">
              <Routes>
                <Route path="/" element={
                  <>
                    <Hero />
                    <About />
                  </>
                } />
                <Route path="/works" element={<Works />} />
                <Route path="/works/:projectId" element={<ProjectDetails />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </div>
          </>
        )}
      </main>
    </ReactLenis>
  );
}