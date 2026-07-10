"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface CoreDotProps {
  className?: string;
  pulse?: boolean; // for chat thinking state
  color?: string; // custom color (e.g. for nav status indicator phase color)
  dotRef?: React.RefObject<HTMLDivElement | null>;
  style?: React.CSSProperties;
}

export default function CoreDot({
  className = "",
  pulse = false,
  color,
  dotRef,
  style = {},
}: CoreDotProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const activeRef = dotRef || localRef;

  useEffect(() => {
    if (!pulse || !activeRef.current) return;
    
    // Scale breathing animation for thinking state: 1 -> 1.15 -> 1 on 1.2s loop (0.6s yoyo)
    const tween = gsap.to(activeRef.current, {
      scale: 1.15,
      duration: 0.6,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

    return () => {
      tween.kill();
      // Reset scale when pulse stops
      if (activeRef.current) {
        gsap.set(activeRef.current, { scale: 1 });
      }
    };
  }, [pulse, activeRef]);

  return (
    <div
      ref={activeRef as React.RefObject<HTMLDivElement>}
      className={`w-2 h-2 rounded-full flex-shrink-0 ${className}`}
      style={{
        backgroundColor: color || "var(--color-signal-500)",
        ...style,
      }}
    />
  );
}
