'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GlowField from './GlowField';
import useActOpacity from '@/lib/useActOpacity';
import { stage } from '@/lib/state';

// Trees grown out of glowing particles: a vertical trunk of cyan "syntax" and
// a canopy sphere of green "code leaves". Fireflies are tiny variables drifting
// between them, and a data-river of points flows along the forest floor.
export default function ForestWorld({ z }) {
  const opacity = useActOpacity(0.08, 0.28, 0.05);
  const river = useActOpacity(0.08, 0.28, 0.05);

  const TREES = 70;
  const PER = 80;
  const total = TREES * PER;

  const data = useMemo(() => {
    const arr = new Array(total);
    for (let t = 0; t < TREES; t++) {
      const tx = (Math.random() - 0.5) * 70;
      const tz = (Math.random() - 0.5) * 46;
      const height = 7 + Math.random() * 7;
      const base = -8;
      for (let k = 0; k < PER; k++) {
        const i = t * PER + k;
        const isCanopy = k > PER * 0.55;
        if (isCanopy) {
          // spherical canopy of leaves at the top
          const r = 1.6 + Math.random() * 1.8;
          const th = Math.random() * Math.PI * 2;
          const ph = Math.acos(2 * Math.random() - 1);
          arr[i] = {
            x: tx + r * Math.sin(ph) * Math.cos(th),
            y: base + height + r * Math.cos(ph) * 0.9,
            z: tz + r * Math.sin(ph) * Math.sin(th),
            size: 0.6 + Math.random() * 1.1,
            color: Math.random() < 0.7 ? '#6ee7a8' : '#a7f3d0',
          };
        } else {
          // trunk + branches
          const up = k / (PER * 0.55);
          const jitter = up * 1.3;
          arr[i] = {
            x: tx + (Math.random() - 0.5) * jitter,
            y: base + up * height,
            z: tz + (Math.random() - 0.5) * jitter,
            size: 0.5 + Math.random() * 0.9,
            color: Math.random() < 0.5 ? '#7cf6ff' : '#6aa8ff',
          };
        }
      }
    }
    return arr;
  }, [total]);

  const treeBuilder = useCallback((i) => data[i], [data]);

  const riverBuilder = useCallback((i) => {
    // fireflies + flowing data stream near the floor
    const firefly = Math.random() < 0.4;
    return {
      x: (Math.random() - 0.5) * 80,
      y: firefly ? -6 + Math.random() * 10 : -8.4 + Math.random() * 0.8,
      z: (Math.random() - 0.5) * 50,
      size: firefly ? 0.6 + Math.random() * 1.0 : 0.5 + Math.random() * 0.7,
      color: firefly ? '#ffe58a' : '#7cf6ff',
    };
  }, []);

  return (
    <group position={[0, 0, z]}>
      <GlowField
        count={total}
        size={1.0}
        drift={0.25}
        builder={treeBuilder}
        opacityRef={opacity}
      />
      <GlowField
        count={1400}
        size={1.2}
        drift={1.1}
        builder={riverBuilder}
        opacityRef={river}
      />
      <Fog opacityRef={opacity} color="#0a2f2a" />
    </group>
  );
}

// A soft ground haze plane to seat the forest in atmosphere.
function Fog({ opacityRef, color }) {
  const mat = useRef();
  useFrame(() => {
    if (mat.current) mat.current.opacity = opacityRef.current * 0.5;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8.5, 0]}>
      <circleGeometry args={[60, 48]} />
      <meshBasicMaterial
        ref={mat}
        color={color}
        transparent
        opacity={0}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
