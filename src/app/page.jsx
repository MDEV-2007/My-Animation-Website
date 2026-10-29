'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import StageProvider from '@/components/StageProvider';
import BootSequence from '@/components/BootSequence';
import Overlay from '@/components/Overlay';
import Cursor from '@/components/Cursor';
import ProgressRail from '@/components/ProgressRail';
import AudioToggle from '@/components/AudioToggle';

// The WebGL layer touches the GPU + window, so keep it client-only.
const Experience = dynamic(() => import('@/components/Experience'), {
  ssr: false,
});

export default function Page() {
  const [entered, setEntered] = useState(false);

  return (
    <StageProvider>
      <main className="relative">
        {/* Fixed WebGL universe behind everything */}
        <div className="fixed inset-0 z-0">
          <Experience />
        </div>

        {/* Scrollable narrative overlay */}
        <Overlay />

        <ProgressRail />
        <AudioToggle />
        <Cursor />

        {!entered && <BootSequence onEnter={() => setEntered(true)} />}
      </main>
    </StageProvider>
  );
}
