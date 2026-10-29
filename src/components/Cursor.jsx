'use client';

import { useEffect, useRef } from 'react';

// A weightless light cursor: a crisp dot that chases the pointer instantly and
// a soft glow ring that lags behind with spring-like easing.
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let hovering = false;

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
      const el = e.target;
      hovering = !!(el && el.closest && el.closest('a,button,[data-hover]'));
    };
    window.addEventListener('pointermove', move, { passive: true });

    let raf;
    const loop = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        const s = hovering ? 2.1 : 1;
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${s})`;
        ring.current.style.opacity = hovering ? '0.9' : '0.55';
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 h-10 w-10 rounded-full"
        style={{
          boxShadow: '0 0 24px 2px rgba(124,246,255,0.55)',
          border: '1px solid rgba(124,246,255,0.6)',
          transition: 'opacity 0.3s ease',
          willChange: 'transform',
        }}
      />
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-white"
        style={{ boxShadow: '0 0 12px 2px #fff', willChange: 'transform' }}
      />
    </div>
  );
}
