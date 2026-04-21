import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ThermometerSystemProps {
  status: 'normal' | 'warning' | 'danger';
}

export default function ThermometerSystem({ status }: ThermometerSystemProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const screenRef = useRef<THREE.Mesh>(null!);
  const bulbRef = useRef<THREE.Mesh>(null!);
  const columnRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Animate glow intensities based on status
    let intensityOffset = 0;
    if (status === 'warning') intensityOffset = Math.sin(t * 5) * 0.3;
    if (status === 'danger') intensityOffset = Math.sin(t * 12) * 0.5 + Math.random() * 0.2;

    if (screenRef.current) {
      (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (status === 'normal' ? 0.4 : status === 'warning' ? 0.6 : 1.0) + intensityOffset;
    }
    if (bulbRef.current) {
      (bulbRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (status === 'normal' ? 0.5 : status === 'warning' ? 0.8 : 1.5) + intensityOffset;
    }
  });

  const liquidColor = status === 'normal' ? '#22C55E' : status === 'warning' ? '#FACC15' : '#DC2626';

  return (
    <group ref={groupRef}>
      {/* Main body — cylindrical shaft */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshPhysicalMaterial
          color="#E5E7EB"
          metalness={0.15}
          roughness={status === 'warning' || status === 'danger' ? 0.6 : 0.35} // Danger makes it rougher
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Shattered top effect (rendered conditionally if danger/warning) */}
      {status === 'danger' && (
        <mesh position={[0, 0.95, 0]} rotation={[0.2, 0.4, 0.1]}>
          <coneGeometry args={[0.09, 0.15, 5]} />
          <meshPhysicalMaterial
            color="#FF0000"
            emissive="#DC2626"
            emissiveIntensity={1}
            metalness={0.5}
            roughness={0.8}
          />
        </mesh>
      )}
      {status !== 'danger' && (
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#E5E7EB" metalness={0.15} roughness={0.35} clearcoat={0.5} />
        </mesh>
      )}

      {/* Mercury bulb at bottom */}
      <mesh ref={bulbRef} position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color={liquidColor}
          emissive={liquidColor}
          emissiveIntensity={0.5}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Mercury column (inside shaft) */}
      <mesh ref={columnRef} position={[0, 0.15, 0.04]}>
        <boxGeometry args={[0.035, 0.85, 0.02]} />
        <meshStandardMaterial
          color={liquidColor}
          emissive={liquidColor}
          emissiveIntensity={status === 'normal' ? 0.3 : 0.8}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Digital display screen */}
      <mesh ref={screenRef} position={[0, 0.55, 0.09]}>
        <planeGeometry args={[0.12, 0.08]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive={liquidColor}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Scale marks */}
      {[0, 0.15, 0.3, 0.45, 0.6].map((y, i) => (
        <mesh key={i} position={[-0.09, y, 0.04]}>
          <boxGeometry args={[0.03, 0.005, 0.005]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.2} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
