"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

const L = THREE.MathUtils.lerp;

// ── Procedural Drone ─────────────────────────────────────────────
const MOTOR_XZ: [number, number][] = [
  [-1.1, -1.1],
  [ 1.1, -1.1],
  [-1.1,  1.1],
  [ 1.1,  1.1],
];

function Drone() {
  const r0 = useRef<THREE.Mesh>(null);
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);
  const rotors = [r0, r1, r2, r3];

  useFrame((_, dt) => {
    rotors.forEach((r, i) => {
      if (r.current) r.current.rotation.y += dt * (i % 2 === 0 ? 24 : -24);
    });
  });

  const armLen = Math.sqrt(1.1 ** 2 * 2);

  return (
    <group>
      {/* Main body */}
      <mesh>
        <boxGeometry args={[1.0, 0.22, 1.0]} />
        <meshStandardMaterial
          color="#0d1525"
          emissive="#002255"
          emissiveIntensity={0.55}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Top plate */}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.88, 0.03, 0.88]} />
        <meshStandardMaterial color="#0a1020" metalness={0.95} roughness={0.07} />
      </mesh>
      {/* Front LED cyan */}
      <mesh position={[0, 0.13, 0.46]}>
        <boxGeometry args={[0.64, 0.018, 0.018]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={5} />
      </mesh>
      {/* Rear LED red */}
      <mesh position={[0, 0.13, -0.46]}>
        <boxGeometry args={[0.64, 0.018, 0.018]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={5} />
      </mesh>

      {/* Arms + motors + rotors */}
      {MOTOR_XZ.map(([mx, mz], i) => {
        const rotY = Math.atan2(mx, mz);
        return (
          <group key={i}>
            <mesh
              position={[mx / 2, 0, mz / 2]}
              rotation={[0, rotY, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.026, 0.026, armLen, 6]} />
              <meshStandardMaterial color="#0d1a2a" metalness={0.72} roughness={0.28} />
            </mesh>
            {/* Motor */}
            <mesh position={[mx, 0, mz]}>
              <cylinderGeometry args={[0.1, 0.09, 0.14, 12]} />
              <meshStandardMaterial
                color="#0a1828"
                emissive="#003388"
                emissiveIntensity={0.3}
                metalness={0.92}
                roughness={0.08}
              />
            </mesh>
            {/* Rotor disk */}
            <mesh ref={rotors[i]} position={[mx, 0.1, mz]}>
              <cylinderGeometry args={[0.52, 0.52, 0.022, 24]} />
              <meshStandardMaterial
                color="#00e5ff"
                emissive="#00e5ff"
                emissiveIntensity={0.75}
                transparent
                opacity={0.22}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {/* Hub */}
            <mesh position={[mx, 0.1, mz]}>
              <cylinderGeometry args={[0.045, 0.045, 0.04, 8]} />
              <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} />
            </mesh>
          </group>
        );
      })}

      {/* Camera gimbal */}
      <group position={[0, -0.16, 0.28]}>
        <mesh>
          <sphereGeometry args={[0.11, 14, 12]} />
          <meshStandardMaterial
            color="#060e1a"
            emissive="#00e5ff"
            emissiveIntensity={0.85}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <circleGeometry args={[0.065, 14]} />
          <meshStandardMaterial color="#000811" emissive="#0077cc" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Landing legs */}
      {([ [-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38] ] as [number,number][]).map(([lx, lz], i) => (
        <mesh key={i} position={[lx, -0.24, lz]}>
          <cylinderGeometry args={[0.013, 0.013, 0.28, 4]} />
          <meshStandardMaterial color="#0d1525" metalness={0.65} roughness={0.35} />
        </mesh>
      ))}

      {/* Payload tether */}
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.6, 4]} />
        <meshStandardMaterial color="#00e5ff" transparent opacity={0.28} />
      </mesh>

      {/* Rescue float */}
      <mesh position={[0, -0.78, 0]}>
        <sphereGeometry args={[0.14, 14, 10]} />
        <meshStandardMaterial
          color="#ff5500"
          emissive="#ff3300"
          emissiveIntensity={0.3}
          metalness={0.12}
          roughness={0.65}
        />
      </mesh>
    </group>
  );
}

// ── Lightweight cloud puff cluster ───────────────────────────────
const PUFFS: [number, number, number, number][] = [
  [ 0,    0,    0,    1.6],
  [-2.1,  0.4,  0.2,  1.3],
  [ 2.0,  0.3, -0.2,  1.2],
  [-1.0,  0.9, -0.5,  1.0],
  [ 1.3,  0.7,  0.5,  0.95],
  [ 0,    1.3,  0,    0.85],
];

function CloudCluster({
  position,
  scale = 1,
  opacity = 0.12,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {PUFFS.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 7, 5]} />
          <meshStandardMaterial
            color="#ddeeff"
            transparent
            opacity={opacity}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Scene: imperative scroll-driven updates (zero re-renders) ─────
function SceneContent({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const progressRef  = useRef(0);
  const skyRef       = useRef<THREE.Mesh>(null);
  const ambientRef   = useRef<THREE.AmbientLight>(null);
  const sunRef       = useRef<THREE.DirectionalLight>(null);
  const droneRef     = useRef<THREE.Group>(null);
  const starsRef     = useRef<THREE.Group>(null);

  // Cached color objects — avoid GC pressure in useFrame
  const dayColor  = useRef(new THREE.Color("#ffffff"));
  const duskColor = useRef(new THREE.Color("#ff6633"));
  const sunVec    = useRef(new THREE.Vector3());

  const { camera } = useThree();

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      progressRef.current = v;
    });
  }, [scrollYProgress]);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const t = clock.elapsedTime;

    // ── Sky material uniforms (imperative — no React re-render) ──
    if (skyRef.current) {
      const mat = skyRef.current.material as any;
      if (mat) {
        mat.turbidity        = L(2.5, 16,  p);
        mat.rayleigh         = L(3.5, 0.25, p);
        mat.mieCoefficient   = L(0.003, 0.012, p);
        mat.mieDirectionalG  = L(0.78,  0.88, p);
        const elev = L(42, -6, p) * (Math.PI / 180);
        const az   = L(0.22, 0.74, p) * Math.PI;
        sunVec.current.set(
          Math.cos(az) * Math.cos(elev),
          Math.sin(elev),
          Math.sin(az) * Math.cos(elev),
        );
        if (mat.sunPosition && typeof mat.sunPosition.copy === "function") {
          mat.sunPosition.copy(sunVec.current);
        } else {
          mat.sunPosition = sunVec.current;
        }
      }
    }

    // ── Lights ───────────────────────────────────────────────────
    if (ambientRef.current) {
      ambientRef.current.intensity = L(1.15, 0.1, p);
    }
    if (sunRef.current) {
      sunRef.current.intensity = L(1.6, 0.12, p);
      sunRef.current.color.lerpColors(
        dayColor.current,
        duskColor.current,
        Math.min(p * 1.8, 1),
      );
    }

    // ── Stars appear at dusk ─────────────────────────────────────
    if (starsRef.current) {
      starsRef.current.visible = p > 0.5;
    }

    // ── Drone position / scale / tilt ────────────────────────────
    if (droneRef.current) {
      const ty = L(2.2, 0, p);
      const tz = L(-6.5, -2.8, p);
      const ts = L(0.46, 0.84, p);
      droneRef.current.position.y = ty + Math.sin(t * 1.4) * 0.08;
      droneRef.current.position.z = tz;
      droneRef.current.scale.setScalar(ts);
      droneRef.current.rotation.z = Math.sin(t * 0.85)  * 0.022;
      droneRef.current.rotation.x = Math.sin(t * 1.15)  * 0.016;
    }

    // ── Camera descends to reinforce "flying down" ───────────────
    camera.position.y = L(1.5, -1.0, p);
    (camera as THREE.PerspectiveCamera).lookAt(
      0,
      L(0.5, -0.5, p),
      0,
    );
  });

  return (
    <>
      {/* Procedural sky */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Sky
        ref={skyRef as any}
        distance={450000}
        turbidity={2.5}
        rayleigh={3.5}
        mieCoefficient={0.003}
        mieDirectionalG={0.78}
        sunPosition={[0.4, 0.7, -0.6]}
      />

      {/* Stars — hidden until dusk */}
      <group ref={starsRef} visible={false}>
        <Stars radius={90} depth={50} count={3500} factor={4} fade speed={0} />
      </group>

      {/* Lighting */}
      <ambientLight ref={ambientRef} intensity={1.15} />
      <directionalLight ref={sunRef} position={[5, 10, 5]} intensity={1.6} />
      <pointLight position={[0, 0.5, 1]} color="#00e5ff" intensity={1.6} distance={9} />

      {/* Cloud layers at varying depths */}
      <CloudCluster position={[-14,  5, -32]} scale={2.2} opacity={0.14} />
      <CloudCluster position={[ 11,  7, -28]} scale={1.7} opacity={0.12} />
      <CloudCluster position={[ -7,  3, -22]} scale={1.4} opacity={0.11} />
      <CloudCluster position={[ 17,  4, -38]} scale={2.5} opacity={0.09} />
      <CloudCluster position={[-20,  6, -44]} scale={1.9} opacity={0.08} />
      <CloudCluster position={[  6,  2, -18]} scale={1.3} opacity={0.10} />

      {/* Drone group */}
      <group ref={droneRef} position={[0, 2.2, -6.5]} scale={0.46}>
        <Drone />
      </group>
    </>
  );
}

// ── Canvas export ─────────────────────────────────────────────────
export default function DroneScene({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 8], fov: 52 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      dpr={[1, 1.5]}
      frameloop="always"
    >
      <SceneContent scrollYProgress={scrollYProgress} />
    </Canvas>
  );
}
