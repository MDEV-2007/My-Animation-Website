'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { stage, damp, lerp } from '@/lib/state';

import HeroWorld from '@/scenes/HeroWorld';
import ForestWorld from '@/scenes/ForestWorld';
import OceanWorld from '@/scenes/OceanWorld';
import MountainWorld from '@/scenes/MountainWorld';
import CosmosWorld from '@/scenes/CosmosWorld';
import DeveloperWorld from '@/scenes/DeveloperWorld';
import ProjectsWorld from '@/scenes/ProjectsWorld';
import SkillsWorld from '@/scenes/SkillsWorld';

const TRACK = 250;
const camZ = (p) => 10 - p * TRACK;

// World centers, aligned so the camera flies *through* each act's midpoint.
// These progress values match the overlay section centers in Overlay.jsx.
const Z = {
  forest: camZ(0.176),
  ocean: camZ(0.313),
  mountains: camZ(0.443),
  cosmos: camZ(0.557),
  developer: camZ(0.652),
  projects: camZ(0.759),
  skills: camZ(0.863),
};

// Advances global time, eases scroll progress and smooths the pointer. One
// place owns these so every scene reads a consistent, frame-stable signal.
function Ticker() {
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    stage.time += d;
    stage.eased = damp(stage.eased, stage.progress, 3.2, d);
    stage.pointerX = damp(stage.pointerX, stage.mouseX, 4, d);
    stage.pointerY = damp(stage.pointerY, stage.mouseY, 4, d);
  });
  return null;
}

// Cinematic camera: dollies along the track with scroll, adds handheld sway
// and mouse parallax, and always looks a little further down the corridor.
function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  useFrame(() => {
    const p = stage.eased;
    const z = camZ(p);
    const swayX = Math.sin(stage.time * 0.25) * 1.2;
    const swayY = Math.cos(stage.time * 0.19) * 0.7;
    camera.position.x = lerp(camera.position.x, swayX + stage.pointerX * 3.2, 0.06);
    camera.position.y = lerp(camera.position.y, 0.5 + swayY + stage.pointerY * -2.0, 0.06);
    camera.position.z = z;
    target.current.set(
      stage.pointerX * 2.0,
      stage.pointerY * -1.2,
      z - 24
    );
    camera.lookAt(target.current);
  });
  return null;
}

export default function Experience() {
  return (
    <Canvas
      className="!fixed inset-0"
      dpr={[1, 1.8]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 0.5, 10] }}
    >
      <color attach="background" args={['#02030a']} />
      <fog attach="fog" args={['#02030a', 30, 140]} />
      <ambientLight intensity={0.25} />

      <Ticker />
      <CameraRig />

      <Suspense fallback={null}>
        <HeroWorld />
        <ForestWorld z={Z.forest} />
        <OceanWorld z={Z.ocean} />
        <MountainWorld z={Z.mountains} />
        <CosmosWorld z={Z.cosmos} />
        <DeveloperWorld z={Z.developer} />
        <ProjectsWorld z={Z.projects} />
        <SkillsWorld z={Z.skills} />
      </Suspense>

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.75}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.25} />
      </EffectComposer>
    </Canvas>
  );
}
