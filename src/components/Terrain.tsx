import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import { createNoise2D } from 'simplex-noise';

function WaterMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#2c5a69') },
      uDeepColor: { value: new THREE.Color('#1a3a46') },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vElevation;
      uniform float uTime;
      
      void main() {
        vUv = uv;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        // 模拟水面波动
        float elevation = sin(modelPosition.x * 0.4 + uTime * 0.8) * 
                        cos(modelPosition.y * 0.4 + uTime * 0.5) * 0.2;
        modelPosition.z += elevation;
        vElevation = elevation;
        
        gl_Position = projectionMatrix * viewMatrix * modelPosition;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vElevation;
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uDeepColor;
      
      void main() {
        // 混合深浅水色
        vec3 color = mix(uDeepColor, uColor, vElevation * 2.0 + 0.5);
        
        // 模拟流动的纹理 (向西南流动)
        float flow = sin((vUv.x - vUv.y) * 15.0 + uTime * 2.0) * 0.5 + 0.5;
        float waves = sin((vUv.x + vUv.y) * 10.0 - uTime * 1.5) * 0.5 + 0.5;
        
        color += flow * 0.1;
        color += waves * 0.05;
        
        // 增加水波高光
        float specular = pow(max(0.0, waves), 20.0) * 0.4;
        color += specular;
        
        gl_FragColor = vec4(color, 0.85);
      }
    `
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial 
      ref={materialRef}
      args={[shaderArgs]}
      transparent
      side={THREE.DoubleSide}
    />
  );
}

const GRID_SIZE = 120;
const GRID_DIVS = 300;

export function Terrain() {
  const [hoverInfo, setHoverInfo] = useState<{x: number, y: number, elevation: string, slope: string} | null>(null);
  const noise2D = useMemo(() => createNoise2D(), []);

  const { geometry, waterGeometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_DIVS, GRID_DIVS);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // 基础地势：西南(负X, 负Y)低，东北(正X, 正Y)高
      const diagonal = (x + y) / 2;
      let h = diagonal * 0.25;

      // 使用多层噪声
      const n1 = noise2D(x * 0.03, y * 0.03) * 6;
      const n2 = noise2D(x * 0.1, y * 0.1) * 2;
      
      h += n1 + n2;

      // 长江平原与河床 (西南方向 diagonal < -15)
      if (diagonal < -18) {
        h = -5 + noise2D(x * 0.5, y * 0.5) * 0.2; 
      } else if (diagonal < -8) {
        const t = (diagonal + 18) / 10;
        h = THREE.MathUtils.lerp(-5, h + 2, t);
      } else {
        h += 3;
      }

      // 局部地标地形平整化
      // 定慧院 (x -15, y -10) -> 低矮丘陵
      const distD = Math.hypot(x - (-15), y - (-10));
      if (distD < 12) {
        const influence = Math.max(0, 1 - distD / 12);
        h = THREE.MathUtils.lerp(h, 4, influence);
      }

      // 承天寺 (x 20, y 20) -> 冈垄高处
      const distC = Math.hypot(x - 20, y - 20);
      if (distC < 15) {
        const influence = Math.max(0, 1 - distC / 15);
        h = THREE.MathUtils.lerp(h, 15, influence);
      }

      // 黄泥坂 (x 0, y 5) -> 坡道连接处
      const distH = Math.hypot(x - 0, y - 5);
      if (distH < 8) {
        const influence = Math.max(0, 1 - distH / 8);
        h = THREE.MathUtils.lerp(h, 7, influence);
      }

      pos.setZ(i, h);
    }

    geo.computeVertexNormals();

    const norms = geo.attributes.normal;
    const colors = [];
    const color = new THREE.Color();
    
    const colorMeadow = new THREE.Color('#4d7358');
    const colorRock = new THREE.Color('#8c715a');
    const colorSnow = new THREE.Color('#d4c4a8');
    const colorRiver = new THREE.Color('#2c5a69');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // 必须与高度计算中的 diagonal 逻辑保持一致：西南(负X, 负Y)低
      const diagonal = (x + y) / 2;

      if (diagonal < -15) {
        color.copy(colorRiver).lerp(new THREE.Color('#1a3a46'), Math.min(1, Math.abs(z) * 0.1));
      } else {
        const nz = norms.getZ(i);
        const slope = 1.0 - nz;
        const steepness = Math.min(slope * 6, 1.0);
        color.copy(colorMeadow).lerp(colorRock, steepness);
        if (z > 12) {
          color.lerp(colorSnow, (z - 12) / 10);
        }
        color.multiplyScalar(0.9 + Math.random() * 0.2);
      }
      colors.push(color.r, color.g, color.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const waterGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);

    return { geometry: geo, waterGeometry: waterGeo };
  }, [noise2D]);

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    if (e.face) {
      const nz = e.face.normal.z;
      const slopeAngle = Math.acos(nz) * (180 / Math.PI);
      setHoverInfo({
        x: e.clientX,
        y: e.clientY,
        elevation: e.point.y.toFixed(1),
        slope: slopeAngle.toFixed(1)
      });
    }
  };

  return (
    <>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh 
          geometry={geometry} 
          receiveShadow 
          castShadow
          onPointerMove={handlePointerMove}
          onPointerOut={() => setHoverInfo(null)}
        >
          <meshStandardMaterial 
            vertexColors={true}
            roughness={1} 
            metalness={0}
          />
        </mesh>

        <mesh geometry={waterGeometry} position={[0, 0, -2.8]} receiveShadow>
          <WaterMaterial />
        </mesh>
      </group>

      {hoverInfo && (
        <Html
          position={[0, 0, 0]}
          style={{
            transform: `translate3d(${hoverInfo.x + 15}px, ${hoverInfo.y + 15}px, 0)`,
            position: 'absolute',
            top: -window.innerHeight / 2,
            left: -window.innerWidth / 2,
            pointerEvents: 'none',
            zIndex: 100
          }}
        >
          <div className="bg-[#f5f0e6]/95 backdrop-blur-md border border-[#d4c4a8] px-4 py-2 rounded shadow-2xl font-serif text-[#4a3b32] text-xs">
            <div className="flex justify-between gap-6 mb-1">
              <span className="opacity-60">海拔高度</span>
              <span className="font-bold underline decoration-[#8b3a3a] underline-offset-4">{hoverInfo.elevation} m</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="opacity-60">实时坡度</span>
              <span className="font-bold text-[#8b3a3a] italic">{hoverInfo.slope}°</span>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}

interface MarkerProps {
  position: [number, number, number];
  label: string;
  description: string;
  type?: 'water' | 'temple' | 'slope';
}

function MarkerIcon({ type }: { type: 'water' | 'temple' | 'slope' }) {
  if (type === 'temple') {
    return (
      <group>
        {/* 寺庙基座 */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[2, 0.4, 2]} />
          <meshStandardMaterial color="#5c4a3c" />
        </mesh>
        {/* 正殿 */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[1.6, 1.2, 1.6]} />
          <meshStandardMaterial color="#8b3a3a" />
        </mesh>
        {/* 第一层飞檐 */}
        <mesh position={[0, 1.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.8, 0.6, 4]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* 第二层阁楼 */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[1, 0.8, 1]} />
          <meshStandardMaterial color="#8b3a3a" />
        </mesh>
        {/* 顶部塔尖 */}
        <mesh position={[0, 2.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1, 0.8, 4]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    );
  }
  if (type === 'water') {
    return (
      <group>
        {/* 核心水纹 */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.8, 0.08, 16, 32]} />
          <meshStandardMaterial color="#2b5c8f" emissive="#3b82f6" emissiveIntensity={0.8} />
        </mesh>
        {/* 外围扩散 */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <torusGeometry args={[1.2, 0.04, 8, 32]} />
          <meshStandardMaterial color="#2b5c8f" transparent opacity={0.4} />
        </mesh>
        {/* 装饰波浪 */}
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.3]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      {/* 陡坡乱石 */}
      <mesh castShadow position={[-0.4, 0, 0.2]} rotation={[0.2, 0.5, 0]}>
        <octahedronGeometry args={[0.7]} />
        <meshStandardMaterial color="#8c715a" roughness={1} />
      </mesh>
      <mesh castShadow position={[0.4, 0.3, -0.1]} rotation={[-0.2, -0.5, 0.4]}>
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#a67c52" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 0.8, 0]} rotation={[0.5, 0, -0.2]}>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color="#d48d3b" emissive="#d48d3b" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

export function LocationMarker({ position, label, description, type = 'temple' }: MarkerProps) {
  const colorMap = {
    water: '#2b5c8f',
    temple: '#8b3a3a',
    slope: '#d48d3b'
  };
  const color = colorMap[type];

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <MarkerIcon type={type} />
        <Html
          position={[0, 3, 0]}
          center
          distanceFactor={22}
          className="pointer-events-none z-10"
        >
          <div className="flex flex-col items-center">
            <div 
              className="px-5 py-3 rounded-sm bg-[#f5f0e6]/95 backdrop-blur-md text-[#333] font-serif whitespace-nowrap border-l-4 shadow-2xl"
              style={{ borderLeftColor: color }}
            >
              <div className="font-bold text-2xl tracking-widest" style={{ color }}>{label}</div>
              <div className="text-xs opacity-70 mt-2 max-w-[220px] whitespace-normal text-justify leading-relaxed font-sans font-medium text-center">
                {description}
              </div>
            </div>
            <div className="w-1 h-8 bg-gradient-to-b from-[#8b3a3a]/50 to-transparent mt-1" />
          </div>
        </Html>
      </Float>
      
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 4]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
