"use client";

import { useEffect, useState } from "react";

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
    let frame = 0;
    const totalFrames = 14;
    let raf = 0;

    const update = () => {
      frame++;
      const progress = frame / totalFrames;
      const revealedCount = Math.floor(progress * text.length);

      let next = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " " || text[i] === "•") {
          next += text[i];
        } else if (i < revealedCount) {
          next += text[i];
        } else {
          next += GLYPHS[(i * 7 + frame * 3) % GLYPHS.length];
        }
      }
      setOutput(next);

      if (frame < totalFrames) {
        raf = requestAnimationFrame(update);
      } else {
        setOutput(text);
      }
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return <span className={className}>{output}</span>;
}
