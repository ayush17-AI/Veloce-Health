import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import HeartSystem from './HeartSystem';
import ThermometerSystem from './ThermometerSystem';
import GlassContainer3D from './GlassContainer3D';
import { MathUtils } from 'three';

interface SeeSawPhysicsSystemProps {
  bpm: number;
  temperature: number;
  heartStatus: 'good' | 'average' | 'poor';
  tempStatus: 'normal' | 'warning' | 'danger';
  onHeartClick: () => void;
  onTempClick: () => void;
}

const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

function SeeSawMechanics({ bpm, temperature, heartStatus, tempStatus, onHeartClick, onTempClick }: SeeSawPhysicsSystemProps) {
  const beamRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    // Pulse Rate (LEFT): Low BPM -> Left DOWN (+ rotation.z), High BPM -> Left UP (- rotation.z)
    const clampedBpm = MathUtils.clamp(bpm, 50, 120);
    const bpmOffset = mapRange(clampedBpm, 50, 120, 0.25, -0.25);
    
    // Temperature (RIGHT): High Temp -> Right DOWN (- rotation.z), Low Temp -> Right UP (+ rotation.z)
    const clampedTemp = MathUtils.clamp(temperature, 95, 105);
    const tempOffset = mapRange(clampedTemp, 95, 105, 0.25, -0.25);
    
    const targetZ = bpmOffset + tempOffset;

    if (beamRef.current) {
      // Elastic/spring feel with micro bounce
      const bounce = Math.sin(state.clock.elapsedTime * 2) * 0.008;
      beamRef.current.rotation.z = MathUtils.lerp(
        beamRef.current.rotation.z,
        targetZ + bounce,
        delta * 2.5
      );
    }
  });

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.05}
          roughness={0.85}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Fulcrum Base */}
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.9, 1.8, 4]} />
        <meshPhysicalMaterial
          color="#374151"
          metalness={0.6}
          roughness={0.4}
          clearcoat={0.3}
        />
      </mesh>

      {/* Oscillating Beam Section */}
      <group ref={beamRef} position={[0, 1.8, 0]}>
        {/* Thick Metal Beam */}
        <mesh>
          <boxGeometry args={[11, 0.2, 1.2]} />
          <meshPhysicalMaterial
            color="#4B5563"
            metalness={0.5}
            roughness={0.3}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
          />
        </mesh>

        {/* Central Pivot Cylinder */}
        <mesh position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 32]} />
          <meshStandardMaterial color="#B91C1C" emissive="#7F1D1D" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 32]} />
          <meshStandardMaterial color="#B91C1C" emissive="#7F1D1D" emissiveIntensity={0.5} />
        </mesh>

        {/* Left Holder & Glass Container (Heart) */}
        <mesh position={[-4.5, 0.15, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.1, 32]} />
          <meshPhysicalMaterial color="#1f2937" metalness={0.3} roughness={0.5} />
        </mesh>
        
        <GlassContainer3D position={[-4.5, 1.1, 0]} onClick={onHeartClick}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <HeartSystem status={heartStatus} />
          </Float>
        </GlassContainer3D>

        {/* Right Holder & Glass Container (Thermometer) */}
        <mesh position={[4.5, 0.15, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.1, 32]} />
          <meshPhysicalMaterial color="#1f2937" metalness={0.3} roughness={0.5} />
        </mesh>

        <GlassContainer3D position={[4.5, 1.1, 0]} rotation={[0, -0.3, 0]} onClick={onTempClick}>
          <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
            <ThermometerSystem status={tempStatus} />
          </Float>
        </GlassContainer3D>
      </group>
    </group>
  );
}

export default function SeeSawPhysicsSystem(props: SeeSawPhysicsSystemProps) {
  return (
    <div className="w-full relative cursor-auto" style={{ height: '65vh' }}>
      <Canvas
        camera={{ position: [0, 6, 15], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 12, 6]} intensity={1.2} castShadow />
        <directionalLight position={[-6, 10, -4]} intensity={0.5} color="#E0F2FE" />
        <pointLight position={[0, 8, 8]} intensity={0.4} color="#fef2f2" />
        
        {/* Accent lights */}
        <pointLight position={[-5, 4, 4]} intensity={0.3} color="#B91C1C" />
        <pointLight position={[5, 4, 4]} intensity={0.2} color="#22C55E" />

        <SeeSawMechanics {...props} />

        <ContactShadows position={[0, -0.01, 0]} opacity={0.3} scale={25} blur={3.0} far={10} />
        <Environment preset="studio" />
      </Canvas>
      {/* Interaction prompt text */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-50 z-10 transition-opacity duration-1000">
         <p className="text-[10px] font-inter text-white tracking-[0.4em] uppercase">Click Enclosures To Reveal Data</p>
      </div>
    </div>
  );
}
