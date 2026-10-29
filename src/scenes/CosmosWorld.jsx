'use client';

import { useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GlowField from './GlowField';
import useActOpacity from '@/lib/useActOpacity';
import { stage } from '@/lib/state';

const CORE_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const CORE_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    float fres = pow(1.0 - max(dot(vN, vView), 0.0), 2.2);
    float pulse = 0.6 + 0.4 * sin(uTime * 1.5);
    vec3 a = vec3(0.49, 0.55, 0.98);
    vec3 b = vec3(0.49, 0.96, 1.0);
    vec3 col = mix(a, b, fres) * (0.5 + pulse);
    gl_FragColor = vec4(col, (0.25 + fres * 0.9) * uOpacity);
  }
`;

function GptCore({ opacityRef }) {
  const mat = useRef();
  const mesh = useRef();
  useFrame(() => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = stage.time;
      mat.current.uniforms.uOpacity.value = opacityRef.current;
    }
    if (mesh.current) {
      mesh.current.rotation.y = stage.time * 0.25;
      mesh.current.rotation.x = stage.time * 0.12;
      const s = 1 + Math.sin(stage.time * 1.5) * 0.03;
      mesh.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[5, 3]} />
      <shaderMaterial
        ref={mat}
        uniforms={{ uTime: { value: 0 }, uOpacity: { value: 0 } }}
        vertexShader={CORE_VERT}
        fragmentShader={CORE_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// The Cosmic AI world: a spiral galaxy of machine-learning nodes rotating
// around a glowing GPT core, with a scatter of star-neurons filling deep space.
export default function CosmosWorld({ z }) {
  const opacity = useActOpacity(0.49, 0.66, 0.05);

  const galaxy = useCallback((i, count) => {
    const branches = 5;
    const radius = Math.pow(Math.random(), 0.7) * 34 + 4;
    const branch = ((i % branches) / branches) * Math.PI * 2;
    const spin = radius * 0.16;
    const rand = () =>
      Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
    const rx = rand() * radius * 0.18;
    const ry = rand() * radius * 0.09;
    const rz = rand() * radius * 0.18;
    const ang = branch + spin;
    const inner = radius < 16;
    return {
      x: Math.cos(ang) * radius + rx,
      y: ry,
      z: Math.sin(ang) * radius + rz,
      size: inner ? 0.7 + Math.random() * 1.3 : 0.4 + Math.random() * 0.8,
      color: inner ? '#a78bfa' : radius < 26 ? '#7cf6ff' : '#6aa8ff',
    };
  }, []);

  const stars = useCallback(() => {
    const r = 40 + Math.random() * 60;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    return {
      x: r * Math.sin(ph) * Math.cos(th),
      y: r * Math.cos(ph),
      z: r * Math.sin(ph) * Math.sin(th),
      size: 0.4 + Math.random() * 0.8,
      color: Math.random() < 0.5 ? '#ffffff' : '#bdb2ff',
    };
  }, []);

  return (
    <group position={[0, 0, z]}>
      <GptCore opacityRef={opacity} />
      <GlowField
        count={9000}
        size={1.0}
        drift={0.15}
        builder={galaxy}
        opacityRef={opacity}
        rotationSpeed={0.05}
      />
      <GlowField
        count={1600}
        size={0.9}
        drift={0.1}
        builder={stars}
        opacityRef={opacity}
      />
    </group>
  );
}
