'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import GlowField from './GlowField';
import useActOpacity from '@/lib/useActOpacity';
import { stage } from '@/lib/state';

const PALETTE = ['#7cf6ff', '#a78bfa', '#6aa8ff', '#ff8a5c', '#6ee7a8', '#f472b6'];
const TOKENS = [
  'const', 'async', 'await', '=>', 'import', 'export', 'return', 'useEffect',
  'def', 'class', 'lambda', 'yield', 'fn', 'impl', 'go func', 'struct',
  'React', 'Next.js', 'Django', 'Docker', 'Rust', 'TypeScript', 'Python',
  'GET /api', 'POST', '{ }', '[ ]', 'git commit', 'SELECT *', 'JOIN',
  'npm run', 'kubectl', '0x1F', 'null', 'true', '&&', '||', 'try {', '} catch',
  'model.fit', 'tensor', 'gradient', 'redis', 'psql', 'webgl',
];

// ---- floating code tokens -------------------------------------------------
function CodeTokens({ opacityRef }) {
  const group = useRef();
  const items = useMemo(
    () =>
      TOKENS.map((label) => ({
        label,
        p: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 16,
          -Math.random() * 42,
        ],
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * 6.28,
      })),
    []
  );

  useFrame(() => {
    if (!group.current) return;
    const o = opacityRef.current;
    group.current.visible = o > 0.01;
    group.current.children.forEach((c, i) => {
      const it = items[i];
      c.position.y = it.p[1] + Math.sin(stage.time * it.speed + it.phase) * 0.6;
      if (c.material) c.material.opacity = o * 0.85;
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <Billboard key={i} position={it.p}>
          <Text
            fontSize={0.62}
            color={it.color}
            anchorX="center"
            anchorY="middle"
            font={undefined}
            material-transparent
            material-toneMapped={false}
          >
            {it.label}
          </Text>
        </Billboard>
      ))}
    </group>
  );
}

// ---- holographic workspace (transparent monitors + terminal) --------------
function Monitor({ position, rotation, w, h, tint, lines }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(w, h)]} />
        <lineBasicMaterial color={tint} transparent opacity={0.7} toneMapped={false} />
      </lineSegments>
      {lines?.map((l, i) => (
        <Text
          key={i}
          position={[-w / 2 + 0.28, h / 2 - 0.4 - i * 0.34, 0.02]}
          fontSize={0.17}
          color={i === 0 ? '#7cf6ff' : '#bfe9ff'}
          anchorX="left"
          anchorY="middle"
          material-transparent
          material-toneMapped={false}
          maxWidth={w - 0.5}
        >
          {l}
        </Text>
      ))}
    </group>
  );
}

function Workspace({ opacityRef }) {
  const group = useRef();
  useFrame(() => {
    if (!group.current) return;
    const o = opacityRef.current;
    group.current.visible = o > 0.01;
    group.current.rotation.y =
      Math.sin(stage.time * 0.15) * 0.06 + stage.pointerX * 0.08;
    group.current.rotation.x = -stage.pointerY * 0.04;
    group.current.traverse((c) => {
      if (c.material && c.material.transparent && c.userData.baseOpacity != null) {
        c.material.opacity = c.userData.baseOpacity * o;
      }
    });
  });

  return (
    <group ref={group} position={[0, -0.2, -3]}>
      <Monitor
        position={[0, 0.4, 0]}
        rotation={[0, 0, 0]}
        w={4.4}
        h={2.6}
        tint="#7cf6ff"
        lines={[
          '~/odyssey $ npm run universe',
          'compiling shaders ............ ok',
          'spawning worlds .............. 6',
          'loading developer ............ 100%',
          'framerate .................... 60 fps',
          'status: online',
        ]}
      />
      <Monitor
        position={[-3.6, 0.1, 1.2]}
        rotation={[0, 0.5, 0]}
        w={2.6}
        h={1.9}
        tint="#a78bfa"
        lines={['GITHUB', '▓▓▓▓▓░ 1,284', 'streak: 312d', 'PRs merged', 'CI: passing']}
      />
      <Monitor
        position={[3.6, 0.1, 1.2]}
        rotation={[0, -0.5, 0]}
        w={2.6}
        h={1.9}
        tint="#6ee7a8"
        lines={['SERVER LOGS', '200 GET /', '201 POST', 'cpu  34%', 'mem  1.2G']}
      />
    </group>
  );
}

// ---- the hero world -------------------------------------------------------
export default function HeroWorld() {
  const opacity = useActOpacity(0.0, 0.16, 0.06);

  const builder = useCallback((i) => {
    // A drift of code-dust: dense central river fading into deep space.
    const central = Math.random() < 0.55;
    const spread = central ? 8 : 26;
    return {
      x: (Math.random() - 0.5) * spread * 2.4,
      y: (Math.random() - 0.5) * spread,
      z: -Math.random() * 60 + 6,
      size: central ? 0.7 + Math.random() * 1.4 : 0.4 + Math.random() * 0.8,
      color: PALETTE[(Math.random() * PALETTE.length) | 0],
    };
  }, []);

  return (
    <group>
      <GlowField count={3600} size={1.1} drift={0.7} builder={builder} opacityRef={opacity} />
      <CodeTokens opacityRef={opacity} />
      <Workspace opacityRef={opacity} />
    </group>
  );
}
