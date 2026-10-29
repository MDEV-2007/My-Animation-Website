'use client';

import { useEffect, useRef } from 'react';
import { stage } from '@/lib/state';

const CHAPTERS = [
  ['01', 'Genesis'],
  ['02', 'Forest of Logic'],
  ['03', 'Ocean of Data'],
  ['04', 'Mountains'],
  ['05', 'Cosmic AI'],
  ['06', 'The Developer'],
  ['07', 'Work'],
  ['08', 'Skills'],
  ['09', 'Contact'],
];

// Cinematic side rail: a filling line + the current chapter, driven straight
// from the scroll signal via refs (no per-frame React state).
export default function ProgressRail() {
  const fill = useRef(null);
  const num = useRef(null);
  const label = useRef(null);
  const last = useRef(-1);

  useEffect(() => {
    let raf;
    const loop = () => {
      const p = stage.progress;
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      const idx = Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length));
      if (idx !== last.current) {
        last.current = idx;
        if (num.current) num.current.textContent = CHAPTERS[idx][0];
        if (label.current) label.current.textContent = CHAPTERS[idx][1];
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex">
      <div className="text-right font-mono">
        <div
          ref={num}
          className="text-2xl font-light tracking-tight text-white"
          style={{ textShadow: '0 0 20px rgba(124,246,255,0.4)' }}
        >
          01
        </div>
        <div
          ref={label}
          className="text-[10px] uppercase tracking-[0.3em] text-white/45"
        >
          Genesis
        </div>
      </div>
      <div className="relative h-40 w-px bg-white/10">
        <div
          ref={fill}
          className="absolute left-0 top-0 h-full w-full origin-top bg-gradient-to-b from-[#7cf6ff] to-[#a78bfa]"
          style={{ transform: 'scaleY(0)', boxShadow: '0 0 12px rgba(124,246,255,0.6)' }}
        />
      </div>
    </div>
  );
}
