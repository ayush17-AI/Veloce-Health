/**
 * BackgroundLayer — "The Fluid Seam"
 *
 * A living, physics-driven background using Three.js GLSL shaders.
 * Two atmospheric regions (Sky Blue #87CEEB + Light Green #90EE90)
 * meet at a continuously morphing boundary driven by 3D Simplex noise fBM.
 *
 * Features:
 *  - GPU fragment shader with 5-octave fBM for organic boundary
 *  - Mouse-reactive seam distortion (smooth lerp tracking)
 *  - Intensity-driven wave amplitude (controlled by scroll phase 0→3)
 *  - Subtle atmospheric depth within each color region
 *  - Luminous glow along the seam edge
 *  - 60 fps GPU-accelerated, zero CPU paint
 *
 * Props:
 *  intensity  (0-3) — controls ripple speed + amplitude
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   GLSL — Vertex Shader (fullscreen quad, bypass camera)
   ═══════════════════════════════════════════════════════════════ */
const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  // Output position directly to clip space — fills entire viewport
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════════
   GLSL — Fragment Shader (the soul of the fluid seam)
   ═══════════════════════════════════════════════════════════════ */
const fragmentShader = /* glsl */ `
precision highp float;

uniform float u_time;
uniform vec2  u_mouse;
uniform float u_intensity;
uniform vec2  u_resolution;

varying vec2 vUv;

/* ─── Simplex 3D Noise — Ashima Arts (MIT) ─── */
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(
    dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)
  ));
  p0 *= norm.x;  p1 *= norm.y;  p2 *= norm.z;  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(
    dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)
  ), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(
    dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)
  ));
}

/* ─── Fractional Brownian Motion (5 octaves) ─── */
float fbm(vec3 p) {
  float value     = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value     += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

/* ─── Main ─── */
void main() {
  vec2  uv     = vUv;
  float aspect = u_resolution.x / u_resolution.y;

  // ── 1. Base Diagonal (top-left → bottom-right) ──
  // UV (0,1)=top-left  UV (1,0)=bottom-right
  // Line: x + y = 1.   Above → Sky Blue.  Below → Light Green.
  float diagonal = uv.x + uv.y - 1.0;

  // ── 2. Noise Parameters (scaled by intensity) ──
  float timeSpeed      = 0.045 + u_intensity * 0.02;
  float t              = u_time * timeSpeed;
  float noiseScale     = 1.5;
  float noiseAmplitude = 0.22 + u_intensity * 0.08;

  // ── 3. Primary Boundary Distortion (large organic waves) ──
  float boundaryNoise = fbm(vec3(
    uv.x * noiseScale + t * 0.28,
    uv.y * noiseScale - t * 0.18,
    t * 0.35
  ));

  // ── 4. Secondary Detail Layer (finer waves) ──
  float detail = snoise(vec3(
    uv * 3.0 + t * 0.45,
    t * 0.22
  )) * 0.055;

  // ── 5. Tertiary Micro-Ripple ──
  float micro = snoise(vec3(
    uv * 5.5 - t * 0.25,
    t * 0.12 + 10.0
  )) * 0.018;

  // ── 6. Mouse Interaction (smooth push on seam) ──
  vec2 mouseUV = u_mouse;
  vec2 delta   = uv - mouseUV;
  delta.x     *= aspect;                      // correct for aspect ratio
  float mouseDist      = length(delta);
  float mouseInfluence = smoothstep(0.42, 0.0, mouseDist) * 0.14;
  float pushDir        = sign(diagonal + boundaryNoise * noiseAmplitude);

  // ── 7. Combined Boundary ──
  float boundary = diagonal
    + boundaryNoise * noiseAmplitude
    + detail
    + micro
    + mouseInfluence * pushDir;

  // ── 8. Sharp Edge (never blends — this is NOT a gradient) ──
  float edgeWidth = 0.005;
  float edge      = smoothstep(-edgeWidth, edgeWidth, boundary);

  // ── 9. Base Colors ──
  vec3 skyBlue    = vec3(0.529, 0.808, 0.922);   // #87CEEB
  vec3 lightGreen = vec3(0.565, 0.933, 0.565);   // #90EE90

  // ── 10. Atmospheric Depth (living internal motion per region) ──
  //     Makes each side feel like a breathing atmospheric liquid.
  float atmBlue1  = snoise(vec3(uv * 1.6 + t * 0.10, t * 0.07))          * 0.032;
  float atmBlue2  = snoise(vec3(uv * 0.7 + t * 0.05, t * 0.035 + 2.0))   * 0.018;
  float atmGreen1 = snoise(vec3(uv * 1.6 - t * 0.09, t * 0.055 + 5.0))   * 0.032;
  float atmGreen2 = snoise(vec3(uv * 0.7 - t * 0.04, t * 0.028 + 8.0))   * 0.018;

  vec3 blueRegion  = skyBlue    + (atmBlue1  + atmBlue2);
  vec3 greenRegion = lightGreen + (atmGreen1 + atmGreen2);

  vec3 color = mix(greenRegion, blueRegion, edge);

  // ── 11. Seam Luminance (subtle glow along the boundary) ──
  float seamDist = abs(boundary);
  float glow     = exp(-seamDist * 40.0) * (0.065 + u_intensity * 0.045);
  color += glow * vec3(0.94, 0.97, 1.0);

  // ── 12. Depth Vignette (cinematic framing) ──
  float vig = 1.0 - smoothstep(0.45, 1.5, length(uv - 0.5) * 1.45);
  color *= 0.93 + 0.07 * vig;

  gl_FragColor = vec4(color, 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════════
   React — Inner Mesh Component (uses R3F hooks)
   ═══════════════════════════════════════════════════════════════ */
interface FluidSeamMeshProps {
  intensity: number;
}

function FluidSeamMesh({ intensity }: FluidSeamMeshProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const { size }    = useThree();

  // Create uniforms once, mutate .value in useFrame
  const uniforms = useMemo(
    () => ({
      u_time:       { value: 0.0 },
      u_mouse:      { value: new THREE.Vector2(0.5, 0.5) },
      u_intensity:  { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ─── Mouse Tracking (window-level for pointer-events:none compat) ──
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetMouse.current.set(
        e.clientX / window.innerWidth,
        1.0 - e.clientY / window.innerHeight,   // flip Y (screen → UV)
      );
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ─── Resolution Update ──
  useEffect(() => {
    uniforms.u_resolution.value.set(size.width, size.height);
  }, [size, uniforms]);

  // ─── Per-Frame Uniform Updates (runs on rAF) ──
  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;

    // Time (continuous)
    mat.uniforms.u_time.value = state.clock.elapsedTime;

    // Mouse (smooth lerp — premium trailing feel)
    mat.uniforms.u_mouse.value.lerp(targetMouse.current, 0.04);

    // Intensity (smooth ramp — no jarring jumps between phases)
    mat.uniforms.u_intensity.value = THREE.MathUtils.lerp(
      mat.uniforms.u_intensity.value,
      intensity,
      0.03,
    );
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════
   React — Exported BackgroundLayer Component
   ═══════════════════════════════════════════════════════════════ */
interface BackgroundLayerProps {
  /** Scroll-phase intensity 0-3. Controls ripple speed + amplitude. */
  intensity?: number;
}

export default function BackgroundLayer({ intensity = 0 }: BackgroundLayerProps) {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        gl={{
          antialias: false,        // not needed for fullscreen fragment shader
          alpha: false,            // opaque background — no compositing cost
          powerPreference: 'high-performance',
          stencil: false,
          depth: false,
        }}
        dpr={[1, 1.5]}             // cap pixel ratio for perf on HiDPI
        style={{ width: '100%', height: '100%' }}
        // Camera unused (vertex shader outputs clip space directly)
        // but R3F requires one
        camera={{ position: [0, 0, 1] }}
      >
        <FluidSeamMesh intensity={intensity} />
      </Canvas>
    </div>
  );
}
