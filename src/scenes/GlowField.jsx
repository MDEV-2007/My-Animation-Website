'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { stage } from '@/lib/state';

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  uniform float uTime;
  uniform float uSize;
  uniform float uDrift;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vColor = aColor;
    vec3 p = position;
    p.x += sin(uTime * 0.2 + aPhase) * uDrift;
    p.y += cos(uTime * 0.17 + aPhase * 1.3) * uDrift;
    p.z += sin(uTime * 0.13 + aPhase * 0.7) * uDrift;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 2.0 + aPhase * 6.2831);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * aSize * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uOpacity;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    float core = smoothstep(0.16, 0.0, d);
    vec3 col = vColor * (1.1 + vTwinkle) + core * 0.6;
    gl_FragColor = vec4(col, a * vTwinkle * uOpacity);
  }
`;

const TMP = new THREE.Color();

// A GPU-drawn cloud of glowing, twinkling particles. `builder(i)` returns
// { x, y, z, size, color } for particle i, so every world can shape its own
// constellation without a new shader. `opacityRef` is read each frame so the
// whole cloud can fade with scroll without React re-renders.
export default function GlowField({
  count = 3000,
  size = 1,
  drift = 0.6,
  builder,
  opacityRef,
  rotationSpeed = 0,
}) {
  const mat = useRef();
  const group = useRef();
  const points = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const d = builder(i, count);
      positions[i * 3] = d.x;
      positions[i * 3 + 1] = d.y;
      positions[i * 3 + 2] = d.z;
      TMP.set(d.color);
      colors[i * 3] = TMP.r;
      colors[i * 3 + 1] = TMP.g;
      colors[i * 3 + 2] = TMP.b;
      sizes[i] = d.size ?? 1;
      phases[i] = Math.random() * Math.PI * 2;
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    return g;
  }, [count, builder]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uDrift: { value: drift },
      uOpacity: { value: 1 },
    }),
    [size, drift]
  );

  useFrame(() => {
    const o = opacityRef ? opacityRef.current : 1;
    // Don't draw a whole world's particles while it's faded out.
    if (points.current) points.current.visible = o > 0.01;
    if (o <= 0.01) return;
    if (mat.current) {
      mat.current.uniforms.uTime.value = stage.time;
      mat.current.uniforms.uOpacity.value = o;
    }
    if (group.current && rotationSpeed) {
      group.current.rotation.y = stage.time * rotationSpeed;
    }
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
