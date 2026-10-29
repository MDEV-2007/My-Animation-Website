'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { stage } from '@/lib/state';

// Owns Lenis smooth scroll + global pointer tracking, and writes both into the
// shared `stage` signal that the WebGL loop reads. Renders nothing.
export default function StageProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.4,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const id = requestAnimationFrame(raf);

    const onScroll = ({ scroll, limit }) => {
      stage.progress = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
    };
    lenis.on('scroll', onScroll);

    const onPointer = (e) => {
      stage.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      stage.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(id);
      lenis.off('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      lenis.destroy();
    };
  }, []);

  return children;
}
