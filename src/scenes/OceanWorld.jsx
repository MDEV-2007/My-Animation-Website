'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GlowField from './GlowField';
import useActOpacity from '@/lib/useActOpacity';
import { stage } from '@/lib/state';

const WAVE_VERT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vH;
  void main() {
    vUv = uv;
    vec3 p = position;
    float h =
      sin(p.x * 0.15 + uTime * 0.8) * 0.9 +
      cos(p.y * 0.18 + uTime * 0.6) * 0.8 +
      sin((p.x + p.y) * 0.08 - uTime * 0.5) * 1.2;
    p.z += h;
    vH = h;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const WAVE_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vH;
  void main() {
    // flowing data grid
    vec2 g = fract((vUv * 40.0) + vec2(uTime * 0.05, uTime * 0.02));
    float line = smoothstep(0.0, 0.04, g.x) * smoothstep(0.0, 0.04, g.y);
    line = 1.0 - line;
    vec3 deep = vec3(0.02, 0.09, 0.22);
    vec3 crest = vec3(0.35, 0.9, 1.0);
    vec3 col = mix(deep, crest, smoothstep(-1.5, 2.0, vH));
    col += line * vec3(0.2, 0.7, 0.9) * 0.6;
    float edge = smoothstep(0.5, 0.0, distance(vUv, vec2(0.5)));
    gl_FragColor = vec4(col, (0.28 + line * 0.5) * uOpacity * (0.4 + edge));
  }
`;

function WaveSurface({ opacityRef, y, flip }) {
  const mat = useRef();
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }),
    []
  );
  useFrame(() => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = stage.time;
      mat.current.uniforms.uOpacity.value = opacityRef.current;
    }
  });
  return (
    <mesh rotation={[flip ? Math.PI / 2 : -Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[160, 120, 120, 90]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={WAVE_VERT}
        fragmentShader={WAVE_FRAG}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Underwater world of data: a caustic surface above and a dim floor below,
// with JSON objects, API packets and rising bubbles drifting between them.
export default function OceanWorld({ z }) {
  const opacity = useActOpacity(0.24, 0.42, 0.05);

  const builder = useCallback((i) => {
    const kind = Math.random();
    if (kind < 0.35) {
      // rising bubbles
      return {
        x: (Math.random() - 0.5) * 70,
        y: -10 + Math.random() * 20,
        z: (Math.random() - 0.5) * 44,
        size: 0.5 + Math.random() * 1.6,
        color: '#bdf3ff',
      };
    }
    // swimming data (APIs / JSON / packets)
    const pal = ['#7cf6ff', '#6aa8ff', '#a78bfa', '#6ee7a8'];
    return {
      x: (Math.random() - 0.5) * 76,
      y: -8 + Math.random() * 16,
      z: (Math.random() - 0.5) * 46,
      size: 0.6 + Math.random() * 1.3,
      color: pal[(Math.random() * pal.length) | 0],
    };
  }, []);

  return (
    <group position={[0, 0, z]}>
      <WaveSurface opacityRef={opacity} y={9} flip={false} />
      <WaveSurface opacityRef={opacity} y={-11} flip />
      <GlowField
        count={2600}
        size={1.15}
        drift={0.9}
        builder={builder}
        opacityRef={opacity}
      />
    </group>
  );
}
