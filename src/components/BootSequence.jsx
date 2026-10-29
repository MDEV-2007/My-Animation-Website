'use client';

import { useEffect, useRef, useState } from 'react';
import { stage } from '@/lib/state';
import { getAudio } from '@/lib/audio';

const LINES = [
  { t: '> initializing kernel', d: 260 },
  { t: '> mounting /dev/dreams', d: 220 },
  { t: '> compiling dreams ....... ok', d: 420 },
  { t: '> building future ......... ok', d: 380 },
  { t: '> loading neural weights ... 100%', d: 360 },
  { t: '> ai core online', d: 240 },
  { t: '> rendering universe', d: 300 },
];

// Fullscreen black terminal boot. Types each line, then reveals an ENTER
// prompt. On enter (click / key / auto), it fades and unlocks the journey.
export default function BootSequence({ onEnter }) {
  const [shown, setShown] = useState([]);
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let i = 0;
    const run = () => {
      if (i >= LINES.length) {
        setReady(true);
        return;
      }
      const line = LINES[i];
      setShown((s) => [...s, line.t]);
      i += 1;
      setTimeout(run, line.d);
    };
    const startTimer = setTimeout(run, 500);
    return () => clearTimeout(startTimer);
  }, []);

  const enter = () => {
    if (!ready || gone) return;
    // User gesture — unlock and start the procedural ambient engine.
    const a = getAudio();
    if (a) {
      a.init();
      a.chime(520);
    }
    setGone(true);
    stage.entered = true;
    setTimeout(() => onEnter && onEnter(), 900);
  };

  useEffect(() => {
    if (!ready) return;
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') enter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, gone]);

  return (
    <div
      onClick={enter}
      data-hover
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#02030a] transition-all duration-[900ms]"
      style={{
        opacity: gone ? 0 : 1,
        filter: gone ? 'blur(14px)' : 'blur(0px)',
        pointerEvents: gone ? 'none' : 'auto',
      }}
    >
      <div className="w-[min(560px,88vw)] font-mono text-[13px] leading-relaxed md:text-sm">
        <div className="mb-6 flex items-center gap-2 text-white/40">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 tracking-widest">odyssey — boot.sh</span>
        </div>
        {shown.map((l, idx) => (
          <div
            key={idx}
            className="text-[#7cf6ff]/90"
            style={{ textShadow: '0 0 14px rgba(124,246,255,0.35)' }}
          >
            {l}
          </div>
        ))}
        <div className="mt-1 flex items-center gap-2 text-white">
          <span className="text-[#7cf6ff]/90">$</span>
          <span
            className="inline-block h-4 w-2 bg-[#7cf6ff]"
            style={{ animation: 'blink 1s steps(2) infinite' }}
          />
        </div>

        <div
          className="mt-10 transition-all duration-700"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <button
            data-hover
            onClick={enter}
            className="group relative overflow-hidden rounded-full border border-white/15 px-8 py-3 text-xs uppercase tracking-[0.35em] text-white/80 transition-colors hover:text-white"
          >
            <span className="relative z-10">Enter the universe</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#7cf6ff]/20 to-[#a78bfa]/20 transition-transform duration-500 group-hover:translate-x-0" />
          </button>
          <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/25">
            scroll to travel · sound recommended
          </div>
        </div>
      </div>

      <style>{`@keyframes blink { 0%,50%{opacity:1} 50.01%,100%{opacity:0} }`}</style>
    </div>
  );
}
