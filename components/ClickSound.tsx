"use client";

import { useEffect } from "react";

const SOUND_SRC = "/se_ui_decide1_01.wav";
// Everything the visitor can press: enabled buttons, links, checkboxes and radios.
// A <label> forwards its click to its input, so the input is what plays the sound (once).
const CLICKABLE = 'button:not(:disabled), a[href], input[type="checkbox"]:not(:disabled), input[type="radio"]:not(:disabled), [role="button"]:not([aria-disabled="true"])';

// Plays the UI "decide" sound on every click on something clickable, anywhere on the site.
export default function ClickSound() {
  useEffect(() => {
    const audio = new Audio(SOUND_SRC);
    audio.preload = "auto";

    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest(CLICKABLE)) return;
      // Restart from the beginning so quick successive clicks each make a sound
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Playback can be blocked by the browser; the click itself must never fail because of it
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
