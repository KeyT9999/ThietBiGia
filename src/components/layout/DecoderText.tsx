"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

const GLYPHS = "0123456789ABCDEF#/*+=-:";

export function DecoderText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setOutput(text);
      return;
    }

    let step = 0;
    const totalSteps = 12;

    const update = () => {
      step++;
      const progress = step / totalSteps;
      const revealedCount = Math.floor(progress * text.length);

      let next = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " " || text[i] === "•") {
          next += text[i];
        } else if (i < revealedCount) {
          next += text[i];
        } else {
          next += GLYPHS[(i * 7 + step * 3) % GLYPHS.length];
        }
      }
      setOutput(next);

      if (step >= totalSteps) {
        setOutput(text);
        gsap.ticker.remove(update);
      }
    };

    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
    };
  }, [text]);

  return <span className={className}>{output}</span>;
}
