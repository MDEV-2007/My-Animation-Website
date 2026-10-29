'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import useActOpacity from '@/lib/useActOpacity';
import { stage } from '@/lib/state';
import { getAudio } from '@/lib/audio';

const PROJECTS = [
  {
    title: 'AI ArtCAM',
    tag: 'AI · Computer Vision',
    glyph: '◈',
    desc: 'Turns any image into a machine-ready DXF vector for CNC & furniture carving. FastAPI · OpenCV · ezdxf.',
    stat: 'image → DXF',
    color: '#7cf6ff',
  },
  {
    title: 'AgentLab HQ',
    tag: 'Agents · Platform',
    glyph: '⬡',
    desc: 'A living pixel-office where a roster of AI agents wield 16 tools inside a Phaser world.',
    stat: '5 agents · 16 tools',
    color: '#a78bfa',
  },
  {
    title: 'Learning Bot',
    tag: 'EdTech · Backend',
    glyph: '❖',
    desc: 'A Telegram learning platform with gamification, streaks, coin shop and analytics — built for 10k+ learners.',
    stat: '10k scale',
    color: '#6ee7a8',
  },
  {
    title: 'Admin & Teacher',
    tag: 'Full Stack · Dashboards',
    glyph: '▣',
    desc: 'Role-scoped control rooms with live analytics, mistake revision and leaderboard caching.',
    stat: 'realtime',
    color: '#ff8a5c',
  },
];

function Cube({ data, index, selected, anySelected, onSelect, opacityRef }) {
  const group = useRef();
  const inner = useRef();
  const matFace = useRef();
  const matEdge = useRef();
  const [hovered, setHovered] = useState(false);
  const home = useMemo(() => {
    const spread = 9;
    return new THREE.Vector3((index - 1.5) * spread, 0, -6);
  }, [index]);
  const color = useMemo(() => new THREE.Color(data.color), [data.color]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const o = opacityRef.current;
    g.visible = o > 0.01;

    // target transform depending on selection
    let tx = home.x,
      ty = home.y,
      tz = home.z,
      ts = 1;
    if (selected) {
      tx = 0;
      ty = 0;
      tz = -15; // move in front of the camera (camera looks toward -z)
      ts = 1.8;
    } else if (anySelected) {
      ts = 0.35;
    }
    ty += Math.sin(stage.time * 0.8 + index) * 0.5;

    g.position.x += (tx - g.position.x) * 0.08;
    g.position.y += (ty - g.position.y) * 0.08;
    g.position.z += (tz - g.position.z) * 0.08;
    const target = ts * (hovered && !anySelected ? 1.18 : 1);
    const s = g.scale.x + (target - g.scale.x) * 0.12;
    g.scale.setScalar(s);

    g.rotation.y += dt * (selected ? 0.25 : 0.4);
    g.rotation.x = Math.sin(stage.time * 0.5 + index) * 0.15;
    if (inner.current) {
      inner.current.rotation.y -= dt * 0.8;
      inner.current.rotation.z += dt * 0.3;
    }

    const dim = anySelected && !selected ? 0.15 : 1;
    if (matFace.current)
      matFace.current.opacity = o * dim * (hovered ? 0.22 : 0.12);
    if (matEdge.current)
      matEdge.current.opacity = o * dim * (hovered || selected ? 1 : 0.7);
  });

  return (
    <group
      ref={group}
      position={home.toArray()}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!anySelected) setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(selected ? null : index);
      }}
    >
      <mesh>
        <boxGeometry args={[3.2, 3.2, 3.2]} />
        <meshBasicMaterial
          ref={matFace}
          color={color}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(3.2, 3.2, 3.2)]} />
        <lineBasicMaterial ref={matEdge} color={color} transparent toneMapped={false} />
      </lineSegments>
      <mesh ref={inner} scale={0.8}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <Billboard position={[0, 0, 0]}>
        <Text fontSize={1.4} color="#ffffff" anchorX="center" anchorY="middle" material-toneMapped={false}>
          {data.glyph}
        </Text>
      </Billboard>
      <Billboard position={[0, -2.6, 0]}>
        <Text
          fontSize={0.5}
          color="#eaf6ff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#02030a"
          material-toneMapped={false}
        >
          {data.title}
        </Text>
      </Billboard>
    </group>
  );
}

function DetailPanel({ data, onClose }) {
  return (
    <Html center position={[0, -3.6, -15]} distanceFactor={16} zIndexRange={[40, 0]}>
      <div
        className="pointer-events-auto w-[340px] rounded-2xl border p-6 backdrop-blur-xl"
        style={{
          borderColor: `${data.color}55`,
          background: 'rgba(6,10,20,0.72)',
          boxShadow: `0 0 60px ${data.color}33`,
        }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: data.color }}>
          {data.tag}
        </div>
        <h3 className="mt-2 font-display text-3xl font-light text-white">{data.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{data.desc}</p>
        <div className="mt-5 flex items-center justify-between">
          <span
            className="rounded-full border px-3 py-1 font-mono text-[11px]"
            style={{ borderColor: `${data.color}55`, color: data.color }}
          >
            {data.stat}
          </span>
          <button
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white"
          >
            close ✕
          </button>
        </div>
      </div>
    </Html>
  );
}

// A world tint that washes the environment in the active project's colour.
function WorldTint({ colorRef, opacityRef }) {
  const mat = useRef();
  useFrame(({ camera }) => {
    if (mat.current) {
      mat.current.opacity = opacityRef.current;
      mat.current.color.lerp(colorRef.current, 0.1);
    }
  });
  return (
    <mesh position={[0, 0, -24]} scale={[120, 80, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={mat}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function ProjectsWorld({ z }) {
  const opacity = useActOpacity(0.69, 0.83, 0.05);
  const [selected, setSelected] = useState(null);
  const openAt = useRef(0);
  const tintColor = useRef(new THREE.Color('#000000'));
  const tintOpacity = useRef(0);

  const select = (i) => {
    setSelected(i);
    if (i != null) {
      openAt.current = stage.eased;
      const a = getAudio();
      if (a) a.chime([520, 660, 590, 440][i] || 560);
      tintColor.current.set(PROJECTS[i].color);
    }
  };

  useFrame(() => {
    // auto-close if the visitor scrolls out of the projects act
    if (selected != null && Math.abs(stage.eased - openAt.current) > 0.05) {
      setSelected(null);
    }
    const targetTint = selected != null ? 0.16 : 0;
    tintOpacity.current += (targetTint - tintOpacity.current) * 0.08;
  });

  return (
    <group position={[0, 0, z]}>
      <WorldTint colorRef={tintColor} opacityRef={tintOpacity} />
      {PROJECTS.map((p, i) => (
        <Cube
          key={p.title}
          data={p}
          index={i}
          selected={selected === i}
          anySelected={selected != null}
          onSelect={select}
          opacityRef={opacity}
        />
      ))}
      {selected != null && (
        <DetailPanel data={PROJECTS[selected]} onClose={() => setSelected(null)} />
      )}
    </group>
  );
}
