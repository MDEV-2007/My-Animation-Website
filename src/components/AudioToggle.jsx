'use client';

import { useEffect, useState } from 'react';
import { getAudio } from '@/lib/audio';

// Small animated sound toggle. Reflects engine state and flips mute. The engine
// itself is started from the boot "Enter" gesture (autoplay policy).
export default function AudioToggle() {
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = getAudio();
    if (!a) return;
    setMuted(a.muted);
    setReady(a.ready);
    return a.onChange((m, r) => {
      setMuted(m);
      setReady(r);
    });
  }, []);

  const bars = [0.4, 0.9, 0.6, 1.0, 0.5];

  return (
    <button
      data-hover
      aria-label={muted ? 'Unmute ambient sound' : 'Mute ambient sound'}
      onClick={() => {
        const a = getAudio();
        if (!a) return;
        if (!a.ready) a.init();
        else a.toggleMute();
      }}
      className="fixed left-6 top-6 z-[75] flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2.5 backdrop-blur-md transition-colors hover:border-white/30"
    >
      <div className="flex h-4 items-end gap-[3px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-[#7cf6ff]"
            style={{
              height: `${h * 100}%`,
              opacity: muted || !ready ? 0.25 : 1,
              boxShadow: muted ? 'none' : '0 0 6px rgba(124,246,255,0.7)',
              animation:
                muted || !ready
                  ? 'none'
                  : `eq 0.9s ease-in-out ${i * 0.12}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
        {!ready ? 'sound' : muted ? 'muted' : 'on'}
      </span>
      <style>{`@keyframes eq { from { transform: scaleY(0.4);} to { transform: scaleY(1);} }`}</style>
    </button>
  );
}
