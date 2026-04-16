import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Html } from '@react-three/drei';
import { Terrain, LocationMarker } from './components/Terrain';
import { Overlay } from './components/Overlay';
import gsap from 'gsap';
import * as THREE from 'three';

const LOCATIONS: Record<string, { target: [number, number, number], position: [number, number, number] }> = {
  hilly: { target: [0, 5, 0], position: [20, 50, 60] },
  slope: { target: [0, 7, -5], position: [20, 30, 15] },
  huangniban: { target: [0, 7, -5], position: [20, 30, 15] },
  river: { target: [-40, -1, 40], position: [-60, 30, 80] },
};

export default function App() {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const handlePoemSelect = (id: string) => {
    const loc = LOCATIONS[id];
    if (!loc || !controlsRef.current || !cameraRef.current) return;

    // Animate target
    gsap.to(controlsRef.current.target, {
      x: loc.target[0],
      y: loc.target[1],
      z: loc.target[2],
      duration: 2,
      ease: 'power3.inOut',
    });

    // Animate camera position
    gsap.to(cameraRef.current.position, {
      x: loc.position[0],
      y: loc.position[1],
      z: loc.position[2],
      duration: 2,
      ease: 'power3.inOut',
      onUpdate: () => {
        controlsRef.current.update();
      },
    });
  };

  return (
    <div className="relative w-full h-screen bg-[#e8dcc7] overflow-hidden">
      {/* 3D Scene */}
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={['#e8dcc7']} />
        <fog attach="fog" args={['#e8dcc7', 40, 150]} />
        
        <Suspense fallback={
          <Html center>
            <div className="text-[#8b3a3a] font-serif text-xl whitespace-nowrap bg-[#f5f0e6]/80 px-6 py-3 rounded-sm backdrop-blur-md border border-[#d4c4a8]">
              正在展开山河画卷...
            </div>
          </Html>
        }>
          <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 50, 70]} fov={45} />
          <OrbitControls 
            ref={controlsRef}
            enableDamping 
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={30}
            maxDistance={150}
          />
          
          {/* Lighting - Softer, warmer light for traditional painting feel */}
          <ambientLight intensity={1.0} color="#fff4e6" />
          <directionalLight 
            position={[100, 100, 50]} 
            intensity={1.5} 
            color="#ffe8cc"
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <pointLight position={[-40, 40, 40]} intensity={0.5} color="#2c5a69" />

          {/* Terrain & River */}
          <Terrain />

          {/* Markers */}
          {/* 长江 */}
          <LocationMarker 
            position={[-40, -2.8, 40]} 
            label="长江" 
            description="黄州西南大动脉，江水混茫，波涛拍岸。其势如虹，确立了黄州宏大的地理坐标。"
            type="water"
          />

          {/* 定慧院原址 - 位于江边丘陵 */}
          <LocationMarker 
            position={[-15, 4, 10]} 
            label="定慧院" 
            description="苏轼初贬黄州寓居之所。此地近江，地势低平，乱山环绕，环境幽僻。"
            type="temple"
          />
          
          {/* 承天寺原址 - 位于冈垄之上 */}
          <LocationMarker 
            position={[20, 15, -20]} 
            label="承天寺" 
            description="《记承天寺夜游》发生地。位于城北冈垄高处，视野开阔，月色清绝。"
            type="temple"
          />

          {/* 黄泥坂 - 陡坡 */}
          <LocationMarker 
            position={[0, 7, -5]} 
            label="黄泥坂" 
            description="连接东坡与城区的著名险坡。“历黄泥之长坂”，坡度极陡，石头不平。"
            type="slope"
          />

          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.3} 
            scale={100} 
            blur={2.5} 
            far={10} 
            color="#4a3b32"
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <Overlay onPoemSelect={handlePoemSelect} />
    </div>
  );
}
