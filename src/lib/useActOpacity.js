'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { stage, band } from './state';

// Returns a ref whose `.current` tracks 0..1 visibility for an act band,
// updated every frame from global scroll progress. Feed it to GlowField's
// opacityRef and to material opacities so whole worlds cross-fade cleanly.
export default function useActOpacity(start, end, feather = 0.05) {
  const ref = useRef(0);
  useFrame(() => {
    ref.current = band(stage.eased, start, end, feather);
  });
  return ref;
}
