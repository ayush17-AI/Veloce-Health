import type { ReactNode } from 'react';
import * as THREE from 'three';

interface GlassContainer3DProps {
  children: ReactNode;
  onClick: () => void;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function GlassContainer3D({ children, onClick, position, rotation }: GlassContainer3DProps) {
  return (
    <group position={position} rotation={rotation} onClick={(e) => {
      e.stopPropagation();
      document.body.style.cursor = 'default';
      onClick();
    }}
    onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
    onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'default'; }}
    >
      {/* Invisible larger box for easier clicking hit area */}
      <mesh visible={false}>
        <boxGeometry args={[1.5, 1.8, 1.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Inner object slightly floating */}
      <group position={[0, -0.3, 0]}>
        {children}
      </group>

      {/* Glass Casing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.5, 1.2]} />
        <meshPhysicalMaterial
          transmission={1}
          roughness={0}
          thickness={0.08}
          ior={1.4}
          clearcoat={1}
          clearcoatRoughness={0}
          color="#ffffff"
          side={THREE.DoubleSide}
        />
        {/* Wireframe accent overlay for premium medical feel */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.2, 1.5, 1.2)]} />
          <lineBasicMaterial color="#ffffff" opacity={0.2} transparent />
        </lineSegments>
      </mesh>
    </group>
  );
}
