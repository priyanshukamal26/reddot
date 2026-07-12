"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import CoreDot from "./CoreDot";

export default function CursorAndGrain() {
  const pathname = usePathname();
  const dotRef = useRef<HTMLDivElement>(null);
  const viewTagRef = useRef<HTMLDivElement>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Monitor prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Monitor touch device (pointer: coarse) vs mouse (pointer: fine)
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) return;
    const finePointer = window.matchMedia("(pointer: fine)");
    const updateCursorSupport = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsTouchDevice(!e.matches);
      if (e.matches) {
        document.documentElement.classList.add("custom-cursor-active");
      } else {
        document.documentElement.classList.remove("custom-cursor-active");
      }
    };
    updateCursorSupport(finePointer);
    const listener = (e: MediaQueryListEvent) => updateCursorSupport(e);
    finePointer.addEventListener("change", listener);
    return () => {
      finePointer.removeEventListener("change", listener);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [prefersReducedMotion]);

  // Handle cursor tracking
  useEffect(() => {
    if (isTouchDevice || prefersReducedMotion || typeof window === "undefined") return;

    const xToDot = gsap.quickSetter(dotRef.current, "x", "px");
    const yToDot = gsap.quickSetter(dotRef.current, "y", "px");

    let currentCarouselImageState = false;

    const onMouseMove = (e: MouseEvent) => {
      // Center 8px dot (w-2 h-2)
      xToDot(e.clientX - 4);
      yToDot(e.clientY - 4);

      if (viewTagRef.current) {
        gsap.to(viewTagRef.current, {
          x: e.clientX + 16,
          y: e.clientY - 12,
          duration: 0.1,
        });
      }

      const target = e.target as HTMLElement;
      if (!target) return;

      const isCarouselImage = target.closest(".carousel-image-trigger");

      // View tag display on phase carousel images
      if (!!isCarouselImage !== currentCarouselImageState) {
        currentCarouselImageState = !!isCarouselImage;
        gsap.to(viewTagRef.current, {
          opacity: isCarouselImage ? 1 : 0,
          scale: isCarouselImage ? 1 : 0.8,
          duration: 0.2,
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isTouchDevice, prefersReducedMotion, pathname]);

  // Ambient film grain opacity updates based on path
  useEffect(() => {
    // If not on landing page, we want Void (4%) opacity by default.
    // Landing page sections handle opacity locally via targeting .ambient-grain class.
    if (pathname !== "/") {
      gsap.to(".ambient-grain", {
        opacity: 0.04,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [pathname]);

  return (
    <>
      {/* Ambient Film Grain Overlay */}
      <div className="ambient-grain pointer-events-none fixed inset-0 z-50 opacity-4 transition-opacity duration-500" />

      {/* Custom Pointer Comet (Desktop only) */}
      {!isTouchDevice && !prefersReducedMotion && (
        <>
          <CoreDot
            dotRef={dotRef}
            className="fixed top-0 left-0 pointer-events-none z-[999999]"
            style={{ transform: "translate3d(0, 0, 0)" }}
          />
          <div
            ref={viewTagRef}
            className="fixed top-0 left-0 opacity-0 pointer-events-none z-50 px-2.5 py-1 bg-black/90 border border-void-border rounded font-mono text-[9px] tracking-wider text-signal-500 font-bold"
          >
            VIEW
          </div>
        </>
      )}
    </>
  );
}
