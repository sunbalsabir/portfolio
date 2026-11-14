/**
 * WebGL hero: a slowly breathing, mouse-reactive distorted sphere wrapped in two
 * thin orbit rings, inside a field of drifting sparkles. Loaded lazily and only
 * on clients with WebGL, so it never touches SSR or the main bundle.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import { MathUtils, type Group } from "three";

function Orb({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const { x, y } = state.pointer; // -1 … 1 across the whole page
    g.rotation.y = MathUtils.damp(
      g.rotation.y,
      x * 0.6 + state.clock.elapsedTime * (reduced ? 0 : 0.12),
      2.5,
      dt,
    );
    g.rotation.x = MathUtils.damp(g.rotation.x, -y * 0.45, 2.5, dt);
  });
  return (
    <group ref={group}>
      <Float
        speed={reduced ? 0 : 1.4}
        rotationIntensity={reduced ? 0 : 0.5}
        floatIntensity={reduced ? 0 : 1.1}
      >
        <mesh>
          <icosahedronGeometry args={[1.25, 48]} />
          <MeshDistortMaterial
            color="#a8d0ff"
            emissive="#4f9cf5"
            emissiveIntensity={0.35}
            distort={0.4}
            speed={reduced ? 0 : 1.8}
            roughness={0.18}
            metalness={0.15}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.3, 0.35, 0]}>
          <torusGeometry args={[2.05, 0.018, 12, 180]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[Math.PI / 1.7, -0.5, 0.6]}>
          <torusGeometry args={[2.45, 0.014, 12, 180]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

/**
 * `active` is false while the hero is scrolled out of view; the render loop then
 * idles so the rest of the page scrolls without competing with WebGL for the GPU.
 */
export default function HeroScene({ reduced, active }: { reduced: boolean; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={reduced || !active ? "demand" : "always"}
      eventSource={document.body}
      eventPrefix="client"
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#dbeafe" />
      <pointLight position={[-5, -3, -4]} intensity={9} color="#22d3ee" />
      <pointLight position={[3, -4, 2]} intensity={3} color="#a5b4fc" />
      <Orb reduced={reduced} />
      <Sparkles
        count={140}
        scale={[10, 7, 4]}
        size={2.2}
        speed={reduced ? 0 : 0.35}
        color="#60a5fa"
        opacity={0.55}
      />
    </Canvas>
  );
}
