"use client";
 
 import { useEffect } from "react";
 import { initOneko } from "./oneko/oneko";
 import nekoGif from "./oneko/oneko.gif";
 
/**
 * Oneko cat that follows cursor — from adryd325/oneko.js
 * Only rendered when portfolio-3 template is active. Cleanup on unmount
 * so the cat never appears on other app routes (e.g. landing, dashboard).
 */
export function OnekoCat() {
  useEffect(() => {
    const nekoFile =
      typeof nekoGif === "string"
        ? nekoGif
        : (nekoGif as { src: string }).src;

    const cleanup = initOneko(nekoFile);
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  return null;
}
