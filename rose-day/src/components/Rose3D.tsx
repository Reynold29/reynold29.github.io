import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import roseModelUrl from './rose.glb?url';

const DEFAULT_ROT_X = 0.65;
const DEFAULT_ROT_Y = 0;
const IDLE_RESET_SEC = 2;
const POINTER_SENSITIVITY = 0.35;
const LERP = 0.08;

function Model() {
  const { scene } = useGLTF(roseModelUrl);
  const cloned = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const currentX = useRef(DEFAULT_ROT_X);
  const currentY = useRef(DEFAULT_ROT_Y);
  const lastPointerTime = useRef(0);
  const prevPointer = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const t = state.clock.elapsedTime;
    const px = state.pointer.x;
    const py = state.pointer.y;
    const moved = Math.abs(px - prevPointer.current.x) > 1e-4 || Math.abs(py - prevPointer.current.y) > 1e-4;
    prevPointer.current = { x: px, y: py };
    if (moved) lastPointerTime.current = t;

    const idle = t - lastPointerTime.current > IDLE_RESET_SEC;
    const targetX = idle ? DEFAULT_ROT_X : DEFAULT_ROT_X + py * POINTER_SENSITIVITY;
    const targetY = idle ? DEFAULT_ROT_Y : px * POINTER_SENSITIVITY;

    currentX.current += (targetX - currentX.current) * LERP;
    currentY.current += (targetY - currentY.current) * LERP;

    group.rotation.order = 'YXZ';
    group.rotation.x = currentX.current;
    group.rotation.y = currentY.current;
    group.rotation.z = 0;
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={cloned}
        scale={1.2}
        position={[0, -0.45, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

// Preload for Suspense
useGLTF.preload(roseModelUrl);

interface Rose3DProps {
  className?: string;
}

export default function Rose3D({ className = '' }: Rose3DProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      data-interactive
    >
      {/* glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          hover ? 'opacity-80 scale-110' : 'opacity-50'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(255,140,160,0.4) 0%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />

      <Canvas camera={{ position: [0, 0.4, 2.8], fov: 42 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-4, 3, 2]} intensity={0.5} color="#ffb6c1" />

        <Float speed={2} floatIntensity={0.5} rotationIntensity={0.2}>
          <Model />
        </Float>

        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.25}
          scale={2.5}
          blur={2}
          far={4}
        />

        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
