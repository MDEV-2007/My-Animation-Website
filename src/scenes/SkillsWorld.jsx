'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import useActOpacity from '@/lib/useActOpacity';
import { stage } from '@/lib/state';

const PLANETS = [
  { name: 'Python', color: '#ffd25c', r: 7, size: 1.5, speed: 0.25, tilt: 0.1 },
  { name: 'React', color: '#61dafb', r: 10, size: 1.3, speed: 0.19, tilt: 0.5 },
  { name: 'Next.js', color: '#ffffff', r: 13, size: 1.1, speed: 0.16, tilt: 0.2 },
  { name: 'Django', color: '#44b78b', r: 16, size: 1.35, speed: 0.13, tilt: 0.7 },
  { name: 'Docker', color: '#2496ed', r: 19, size: 1.2, speed: 0.11, tilt: 0.3 },
  { name: 'Redis', color: '#ff5c49', r: 22, size: 1.0, speed: 0.095, tilt: 0.9 },
  { name: 'PostgreSQL', color: '#6aa8ff', r: 25, size: 1.25, speed: 0.08, tilt: 0.4 },
  { name: 'Machine Learning', color: '#a78bfa', r: 28.5, size: 1.6, speed: 0.065, tilt: 0.6 },
];

function Orbit({ radius, opacityRef }) {
  const mat = useRef();
  const geo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);
  useFrame(() => {
    if (mat.current) mat.current.opacity = opacityRef.current * 0.14;
  });
  return (
    <line geometry={geo}>
      <lineBasicMaterial ref={mat} color="#7cf6ff" transparent opacity={0} toneMapped={false} />
    </line>
  );
}

function Planet({ data, opacityRef }) {
  const group = useRef();
  const label = useRef();
  const start = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(() => {
    const o = opacityRef.current;
    if (group.current) {
      group.current.visible = o > 0.01;
      const a = start + stage.time * data.speed;
      group.current.position.set(
        Math.cos(a) * data.r,
        Math.sin(a * 1.3) * data.tilt * 2,
        Math.sin(a) * data.r
      );
      group.current.rotation.y = stage.time * 0.5;
    }
    if (label.current) label.current.fillOpacity = o;
  });
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[data.size, 4]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={1.4}
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>
      <mesh scale={1.35}>
        <sphereGeometry args={[data.size, 16, 16]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.12} toneMapped={false} />
      </mesh>
      <Billboard position={[0, data.size + 1.1, 0]}>
        <Text
          ref={label}
          fontSize={0.75}
          color="#eaf6ff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#02030a"
          material-toneMapped={false}
        >
          {data.name}
        </Text>
      </Billboard>
    </group>
  );
}

function Sun({ opacityRef }) {
  const mat = useRef();
  const mesh = useRef();
  useFrame(() => {
    if (mat.current) mat.current.opacity = opacityRef.current;
    if (mesh.current) mesh.current.rotation.y = stage.time * 0.1;
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[3.4, 5]} />
      <meshBasicMaterial ref={mat} color="#7cf6ff" transparent opacity={0} wireframe toneMapped={false} />
    </mesh>
  );
}

// The Skills galaxy: technologies as planets orbiting a luminous core.
export default function SkillsWorld({ z }) {
  const opacity = useActOpacity(0.79, 1.0, 0.04);
  const group = useRef();
  useFrame(() => {
    if (group.current) {
      group.current.rotation.x = 0.32 + stage.pointerY * 0.05;
      group.current.rotation.y = stage.time * 0.02 + stage.pointerX * 0.1;
    }
  });
  return (
    <group position={[0, 0, z]}>
      <pointLight position={[0, 0, 0]} intensity={80} distance={80} color="#9fe8ff" />
      <group ref={group}>
        <Sun opacityRef={opacity} />
        {PLANETS.map((p) => (
          <group key={p.name}>
            <Orbit radius={p.r} opacityRef={opacity} />
            <Planet data={p} opacityRef={opacity} />
          </group>
        ))}
      </group>
    </group>
  );
}
