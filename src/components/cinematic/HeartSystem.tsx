import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HeartSystemProps {
  status: 'good' | 'average' | 'poor';
}

export default function HeartSystem({ status }: HeartSystemProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const s = 0.013;
    const shape = new THREE.Shape();
    shape.moveTo(25 * s, 25 * s);
    shape.bezierCurveTo(25 * s, 25 * s, 20 * s, 0, 0, 0);
    shape.bezierCurveTo(-30 * s, 0, -30 * s, 35 * s, -30 * s, 35 * s);
    shape.bezierCurveTo(-30 * s, 55 * s, -10 * s, 77 * s, 25 * s, 95 * s);
    shape.bezierCurveTo(60 * s, 77 * s, 80 * s, 55 * s, 80 * s, 35 * s);
    shape.bezierCurveTo(80 * s, 35 * s, 80 * s, 0, 50 * s, 0);
    shape.bezierCurveTo(35 * s, 0, 25 * s, 25 * s, 25 * s, 25 * s);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 6,
    });
    geo.center();
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    let baseScale = 1;
    let pulseScale = 0;
    
    if (status === 'good') {
      // Strong rhythmic pulse
      const phase = (t * 1.5) % 1;
      const beat1 = Math.max(0, Math.sin(phase * Math.PI * 4)) * 0.08;
      const beat2 = Math.max(0, Math.sin((phase - 0.15) * Math.PI * 4)) * 0.04;
      pulseScale = beat1 + beat2;
    } else if (status === 'average') {
      // Faster, slightly unstable
      const phase = (t * 2.2) % 1;
      const beat = Math.max(0, Math.sin(phase * Math.PI * 2)) * 0.06;
      const flutter = Math.sin(t * 10) * 0.02;
      pulseScale = beat + flutter;
    } else if (status === 'poor') {
      // Weak, erratic
      baseScale = 0.9;
      const erratic = Math.random() > 0.9 ? 0.05 : 0;
      const weakPulse = Math.sin(t * 4) * 0.02;
      pulseScale = weakPulse + erratic;
    }

    meshRef.current.scale.lerp(new THREE.Vector3().setScalar(baseScale + pulseScale), 0.2);
  });

  // Determine material color
  let color = '#EF4444';
  let emissive = '#7F1D1D';
  let emIntensity = 0.2;
  
  if (status === 'average') {
    color = '#FACC15';
    emissive = '#A16207';
    emIntensity = 0.3;
  } else if (status === 'poor') {
    color = '#18181B';
    emissive = '#000000';
    emIntensity = 0.0;
  }

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[0, 0, Math.PI]}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.1}
        roughness={0.3}
        clearcoat={0.6}
        clearcoatRoughness={0.1}
        emissive={emissive}
        emissiveIntensity={emIntensity}
      />
    </mesh>
  );
}
