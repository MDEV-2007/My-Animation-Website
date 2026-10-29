'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GlowField from './GlowField';
import useActOpacity from '@/lib/useActOpacity';
import { stage } from '@/lib/state';

function ridgeGeometry(width, seg, base, amp, seed) {
  const shape = new THREE.Shape();
  shape.moveTo(-width, base);
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const x = -width + (i / seg) * width * 2;
    const n =
      Math.sin(i * 0.6 + seed) * 0.5 +
      Math.sin(i * 1.7 + seed * 2.0) * 0.3 +
      Math.sin(i * 0.23 + seed * 3.0) * 0.6;
    const y = base + amp * (0.5 + 0.5 * n) + Math.random() * amp * 0.15;
    pts.push(new THREE.Vector3(x, y, 0));
    shape.lineTo(x, y);
  }
  shape.lineTo(width, base);
  shape.lineTo(-width, base);
  const fill = new THREE.ShapeGeometry(shape);
  const line = new THREE.BufferGeometry().setFromPoints(pts);
  return { fill, line };
}

function Ridge({ z, tint, amp, base, parallax, opacityRef }) {
  const group = useRef();
  const fillMat = useRef();
  const lineMat = useRef();
  const { fill, line } = useMemo(
    () => ridgeGeometry(90, 60, base, amp, z),
    [z, amp, base]
  );
  useFrame(() => {
    const o = opacityRef.current;
    if (fillMat.current) fillMat.current.opacity = o * 0.92;
    if (lineMat.current) lineMat.current.opacity = o;
    if (group.current) group.current.position.x = stage.pointerX * parallax;
  });
  return (
    <group ref={group} position={[0, 0, z]}>
      <mesh geometry={fill}>
        <meshBasicMaterial ref={fillMat} color="#050912" transparent opacity={0} />
      </mesh>
      <line geometry={line}>
        <lineBasicMaterial ref={lineMat} color={tint} transparent opacity={0} toneMapped={false} />
      </line>
    </group>
  );
}

// Mountains of Challenges: receding ridges built from code, climbing
// "algorithm" sparks, and Pull Requests streaking across the sky.
export default function MountainWorld({ z }) {
  const opacity = useActOpacity(0.37, 0.55, 0.05);

  const sparks = useCallback((i) => {
    const pr = Math.random() < 0.25;
    if (pr) {
      // pull requests / deploys flying high
      return {
        x: (Math.random() - 0.5) * 90,
        y: 6 + Math.random() * 12,
        z: -20 + Math.random() * 30,
        size: 1.0 + Math.random() * 1.6,
        color: Math.random() < 0.5 ? '#a78bfa' : '#ff8a5c',
      };
    }
    // algorithms climbing the cliffs
    return {
      x: (Math.random() - 0.5) * 70,
      y: -9 + Math.random() * 16,
      z: -10 + Math.random() * 24,
      size: 0.5 + Math.random() * 0.9,
      color: Math.random() < 0.6 ? '#7cf6ff' : '#6ee7a8',
    };
  }, []);

  return (
    <group position={[0, 0, z]}>
      <Ridge z={-28} tint="#3b5bdb" amp={9} base={-9} parallax={0.4} opacityRef={opacity} />
      <Ridge z={-16} tint="#5c7cfa" amp={12} base={-9} parallax={0.9} opacityRef={opacity} />
      <Ridge z={-6} tint="#7cf6ff" amp={15} base={-9} parallax={1.6} opacityRef={opacity} />
      <Ridge z={4} tint="#a78bfa" amp={18} base={-10} parallax={2.6} opacityRef={opacity} />
      <GlowField
        count={2200}
        size={1.1}
        drift={0.8}
        builder={sparks}
        opacityRef={opacity}
      />
    </group>
  );
}
