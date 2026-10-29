'use client';

import { useRef } from 'react';

// A glass panel that tilts toward the pointer with a moving specular sheen —
// the "objects have weight / glass refracts" micro-interaction.
export default function TiltCard({ children, className = '', max = 12 }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };
  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
  };

  return (
    <div
      ref={ref}
      data-hover
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`tilt-card relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [.tilt-card:hover_&]:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(124,246,255,0.16), transparent 60%)',
        }}
      />
      {children}
    </div>
  );
}
