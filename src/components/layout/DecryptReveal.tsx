"use client";

import { useEffect, useRef, useState, useId } from "react";
import { gsap } from "gsap";

interface Props {
  src: string;
  alt: string;
  className?: string;
}

export default function DecryptReveal({ src, alt, className = "" }: Props) {
  const [displayedSrc, setDisplayedSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState(src);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rawId = useId();
  const filterId = `decrypt-${rawId.replace(/:/g, "")}`;

  const proxy = useRef({ progress: 0 });
  const isFirstRender = useRef(true);

  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);
  const offsetRef = useRef<SVGFEOffsetElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const colorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Monitor prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const applyFilter = (type: "enter" | "exit", progress: number) => {
    // scale: 0 -> 150 (exit) / 150 -> 0 (enter)
    const scale = type === "exit" ? progress * 150 : (1 - progress) * 150;
    // dy: exit: 0 -> 120 / enter: -80 -> 0
    const dy = type === "exit" ? progress * 120 : (progress - 1) * 80;
    // dx: ±30 -> 0
    const dx = type === "exit" ? progress * 30 : (1 - progress) * -30;
    // stdDeviation: exit: 0 -> 6 / enter: 6 -> 0
    const stdDev = type === "exit" ? progress * 6 : (1 - progress) * 6;
    // alpha: exit: 1 -> 0 / enter: 0 -> 1 (clamped 1.2x rate)
    const alpha = type === "exit"
      ? Math.max(0, Math.min(1, 1 - progress * 1.2))
      : Math.max(0, Math.min(1, progress * 1.2));

    if (displaceRef.current) displaceRef.current.setAttribute("scale", scale.toString());
    if (offsetRef.current) {
      offsetRef.current.setAttribute("dx", dx.toString());
      offsetRef.current.setAttribute("dy", dy.toString());
    }
    if (blurRef.current) blurRef.current.setAttribute("stdDeviation", stdDev.toString());
    if (colorMatrixRef.current) {
      colorMatrixRef.current.setAttribute(
        "values",
        `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${alpha} 0`
      );
    }
  };

  // Initial mount animation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!prefersReducedMotion) {
        proxy.current.progress = 0;
        gsap.to(proxy.current, {
          progress: 1,
          duration: 0.45,
          ease: "power4.out",
          onUpdate: () => applyFilter("enter", proxy.current.progress),
        });
      }
    }
  }, [prefersReducedMotion]);

  // Phase 1: Exit transition on source change
  useEffect(() => {
    if (src !== prevSrc) {
      if (prefersReducedMotion) {
        gsap.to(imgRef.current, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            setDisplayedSrc(src);
            setPrevSrc(src);
            gsap.to(imgRef.current, {
              opacity: 1,
              duration: 0.15,
            });
          },
        });
        return;
      }

      proxy.current.progress = 0;
      gsap.to(proxy.current, {
        progress: 1,
        duration: 0.45,
        ease: "power3.in",
        onUpdate: () => applyFilter("exit", proxy.current.progress),
        onComplete: () => {
          setDisplayedSrc(src);
          setPrevSrc(src);
        },
      });
    }
  }, [src, prevSrc, prefersReducedMotion]);

  // Phase 2: Enter transition on swap completion
  useEffect(() => {
    if (prefersReducedMotion) return;

    if (displayedSrc === src && prevSrc === src) {
      proxy.current.progress = 0;
      gsap.to(proxy.current, {
        progress: 1,
        duration: 0.45,
        ease: "power4.out",
        onUpdate: () => applyFilter("enter", proxy.current.progress),
      });
    }
  }, [displayedSrc, prefersReducedMotion]);

  return (
    <div className={`relative ${className}`}>
      {!prefersReducedMotion && (
        <svg className="hidden" aria-hidden="true">
          <defs>
            <filter id={filterId}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="1.8"
                numOctaves="4"
                result="noise"
              />
              <feDisplacementMap
                ref={displaceRef}
                in="SourceGraphic"
                in2="noise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
              <feGaussianBlur
                ref={blurRef}
                in="displaced"
                stdDeviation="0"
                result="blurred"
              />
              <feOffset
                ref={offsetRef}
                in="blurred"
                dx="0"
                dy="0"
                result="offset"
              />
              <feColorMatrix
                ref={colorMatrixRef}
                in="offset"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 1 0
                "
              />
            </filter>
          </defs>
        </svg>
      )}
      <img
        ref={imgRef}
        src={displayedSrc}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={!prefersReducedMotion ? { filter: `url(#${filterId})` } : undefined}
      />
    </div>
  );
}
