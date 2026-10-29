'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import GlowField from './GlowField';
import useActOpacity from '@/lib/useActOpacity';
import { stage } from '@/lib/state';

// Shared holographic body material — dark, metallic, self-lit, brought to life
// by coloured rim lights + bloom so it reads as a premium 3D avatar.
function useBodyMaterial(opacityRef) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a2733',
        emissive: '#0e4a5c',
        emissiveIntensity: 0.7,
        metalness: 0.7,
        roughness: 0.28,
        transparent: true,
      }),
    []
  );
  useFrame(() => {
    mat.opacity = Math.min(1, opacityRef.current * 1.2);
  });
  return mat;
}

function Developer({ opacityRef }) {
  const root = useRef();
  const head = useRef();
  const chest = useRef();
  const foreL = useRef();
  const foreR = useRef();
  const eyeL = useRef();
  const eyeR = useRef();
  const rgb = useRef();
  const body = useBodyMaterial(opacityRef);

  useFrame(() => {
    const o = opacityRef.current;
    if (root.current) {
      root.current.visible = o > 0.01;
      root.current.rotation.y = Math.sin(stage.time * 0.3) * 0.08 + stage.pointerX * 0.06;
    }
    // breathing
    if (chest.current) {
      const b = 1 + Math.sin(stage.time * 1.4) * 0.03;
      chest.current.scale.set(1, b, 1);
    }
    // head looks toward the pointer, with idle drift
    if (head.current) {
      head.current.rotation.y = stage.pointerX * 0.4 + Math.sin(stage.time * 0.5) * 0.08;
      head.current.rotation.x = stage.pointerY * 0.25 + Math.sin(stage.time * 0.7) * 0.04;
    }
    // typing — forearms tap in alternation
    if (foreL.current)
      foreL.current.rotation.x = -0.7 + Math.sin(stage.time * 9.0) * 0.12;
    if (foreR.current)
      foreR.current.rotation.x = -0.7 + Math.sin(stage.time * 9.0 + 1.6) * 0.12;
    // blinking
    const blink = Math.sin(stage.time * 2.3) > 0.985 ? 0.1 : 1;
    if (eyeL.current) eyeL.current.scale.y = blink;
    if (eyeR.current) eyeR.current.scale.y = blink;
    // RGB desk strip cycling hue
    if (rgb.current) {
      rgb.current.color.setHSL((stage.time * 0.1) % 1, 0.9, 0.6);
      rgb.current.opacity = o;
    }
  });

  return (
    <group ref={root} position={[0, -1.7, 0]}>
      {/* hips */}
      <mesh material={body} position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 20, 16]} />
      </mesh>
      {/* torso */}
      <group ref={chest} position={[0, 0.95, 0.05]}>
        <mesh material={body} rotation={[0.12, 0, 0]}>
          <capsuleGeometry args={[0.48, 1.0, 10, 20]} />
        </mesh>
      </group>
      {/* neck */}
      <mesh material={body} position={[0, 1.7, 0.05]}>
        <cylinderGeometry args={[0.16, 0.18, 0.3, 12]} />
      </mesh>
      {/* head */}
      <group ref={head} position={[0, 2.05, 0.06]}>
        <mesh material={body}>
          <sphereGeometry args={[0.44, 28, 24]} />
        </mesh>
        {/* visor */}
        <mesh position={[0, 0.03, 0.34]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.66, 0.2, 0.12]} />
          <meshBasicMaterial color="#7cf6ff" transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <mesh ref={eyeL} position={[-0.14, 0.03, 0.42]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial color="#bff7ff" toneMapped={false} />
        </mesh>
        <mesh ref={eyeR} position={[0.14, 0.03, 0.42]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial color="#bff7ff" toneMapped={false} />
        </mesh>
      </group>

      {/* shoulders + arms */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.6 * s, 1.42, 0.05]}>
          <mesh material={body}>
            <sphereGeometry args={[0.22, 16, 14]} />
          </mesh>
          {/* upper arm */}
          <mesh material={body} position={[0.12 * s, -0.42, 0.28]} rotation={[0.5, 0, -0.2 * s]}>
            <capsuleGeometry args={[0.15, 0.7, 8, 14]} />
          </mesh>
          {/* forearm (typing pivot) */}
          <group
            ref={s < 0 ? foreL : foreR}
            position={[0.22 * s, -0.82, 0.6]}
          >
            <mesh material={body} position={[0, 0, 0.35]} rotation={[0, 0, 0]}>
              <capsuleGeometry args={[0.13, 0.7, 8, 14]} />
            </mesh>
            <mesh material={body} position={[0, -0.05, 0.75]}>
              <sphereGeometry args={[0.16, 12, 12]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* thighs + shins (seated) */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={body} position={[0.28 * s, -0.05, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.22, 0.9, 8, 14]} />
          </mesh>
          <mesh material={body} position={[0.28 * s, -0.75, 1.15]}>
            <capsuleGeometry args={[0.19, 0.9, 8, 14]} />
          </mesh>
        </group>
      ))}

      {/* chair back */}
      <mesh material={body} position={[0, 1.0, -0.5]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[1.3, 1.9, 0.16]} />
      </mesh>

      {/* desk */}
      <mesh position={[0, 0.3, 1.35]}>
        <boxGeometry args={[3.6, 0.1, 1.4]} />
        <meshStandardMaterial color="#07131c" metalness={0.8} roughness={0.3} transparent opacity={0.9} />
      </mesh>
      {/* RGB under-glow */}
      <mesh position={[0, 0.22, 1.35]}>
        <boxGeometry args={[3.7, 0.03, 1.5]} />
        <meshBasicMaterial ref={rgb} color="#7cf6ff" transparent toneMapped={false} />
      </mesh>
      {/* keyboard */}
      <mesh position={[0, 0.37, 1.15]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[1.7, 0.06, 0.6]} />
        <meshBasicMaterial color="#ff8a5c" transparent opacity={0.5} toneMapped={false} />
      </mesh>

      {/* floating holographic monitor with live code */}
      <group position={[0, 1.55, 1.7]} rotation={[-0.12, 0, 0]}>
        <mesh>
          <planeGeometry args={[2.9, 1.7]} />
          <meshBasicMaterial color="#7cf6ff" transparent opacity={0.06} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(2.9, 1.7)]} />
          <lineBasicMaterial color="#7cf6ff" transparent opacity={0.7} toneMapped={false} />
        </lineSegments>
        <CodeScroll opacityRef={opacityRef} />
      </group>

      {/* floating coffee */}
      <group position={[1.25, 0.55, 1.1]}>
        <mesh material={body}>
          <cylinderGeometry args={[0.14, 0.11, 0.26, 16]} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.02, 16]} />
          <meshBasicMaterial color="#7a4a2a" toneMapped={false} />
        </mesh>
      </group>

      {/* rim lights that give the avatar its glow */}
      <pointLight position={[2.4, 2.2, 2.2]} intensity={22} distance={16} decay={2} color="#7cf6ff" />
      <pointLight position={[-2.4, 1.6, 1.6]} intensity={18} distance={16} decay={2} color="#a78bfa" />
      <pointLight position={[0, 0.7, 1.3]} intensity={8} distance={8} decay={2} color="#ff8a5c" />
      <pointLight position={[0, 2.0, -2.5]} intensity={16} distance={16} decay={2} color="#6ee7a8" />
    </group>
  );
}

function CodeScroll({ opacityRef }) {
  const ref = useRef();
  const lines = useMemo(
    () => [
      'export async function build(dream) {',
      '  const world = await render(dream)',
      '  world.lights.on()',
      '  return ship(world)',
      '}',
      '// 60fps · online',
    ],
    []
  );
  useFrame(() => {
    if (ref.current) ref.current.fillOpacity = opacityRef.current;
  });
  return (
    <Text
      ref={ref}
      position={[-1.3, 0.6, 0.02]}
      fontSize={0.14}
      color="#bfe9ff"
      anchorX="left"
      anchorY="top"
      lineHeight={1.5}
      font={undefined}
      material-toneMapped={false}
    >
      {lines.join('\n')}
    </Text>
  );
}

export default function DeveloperWorld({ z }) {
  const opacity = useActOpacity(0.58, 0.72, 0.05);

  const aura = useCallback(() => {
    const r = 6 + Math.random() * 11;
    const a = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(a) * r,
      y: (Math.random() - 0.4) * 13,
      z: Math.sin(a) * r * 0.7,
      size: 0.5 + Math.random() * 1.1,
      color: ['#7cf6ff', '#a78bfa', '#ff8a5c', '#6ee7a8'][(Math.random() * 4) | 0],
    };
  }, []);

  return (
    <group position={[0, 0, z]}>
      <Developer opacityRef={opacity} />
      <GlowField count={1500} size={1.1} drift={0.9} builder={aura} opacityRef={opacity} />
    </group>
  );
}
