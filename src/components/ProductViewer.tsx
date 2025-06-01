
import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import * as THREE from 'three';

// Sample 3D Product Model Component
const SampleProduct = () => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Main product body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 0.8, 2, 32]} />
        <meshStandardMaterial 
          color={hovered ? "#9b87f5" : "#6366f1"} 
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      
      {/* Product top */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.6, 32, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#d6bcfa" : "#a855f7"} 
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      
      {/* Product details */}
      <mesh position={[0, -0.5, 0]}>
        <torusGeometry args={[0.9, 0.1, 16, 100]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.2, 32]} />
        <meshStandardMaterial 
          color="#374151" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// Loading fallback
const Loader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">Loading 3D Model...</p>
    </div>
  </div>
);

const ProductViewer = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-tiptop-purple">3D Product Viewer</h1>
            <p className="text-gray-400 mt-1">Interactive 3D model demonstration</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-tiptop-purple border-tiptop-purple">
              React Three Fiber
            </Badge>
            <Badge variant="outline" className="text-green-400 border-green-400">
              Interactive
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative h-[600px] bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden"
            >
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[5, 2, 5]} />
                
                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <directionalLight 
                  position={[10, 10, 5]} 
                  intensity={1}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <pointLight position={[-10, 0, -20]} intensity={0.5} color="#9b87f5" />
                <pointLight position={[0, -10, 0]} intensity={0.3} color="#fbbf24" />

                {/* Environment */}
                <Environment preset="studio" />

                {/* Controls */}
                <OrbitControls
                  key={resetTrigger}
                  autoRotate={autoRotate}
                  autoRotateSpeed={1}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={3}
                  maxDistance={20}
                />

                {/* 3D Model */}
                <Suspense fallback={null}>
                  <SampleProduct />
                </Suspense>

                {/* Ground */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                  <planeGeometry args={[20, 20]} />
                  <meshStandardMaterial color="#1f2937" transparent opacity={0.5} />
                </mesh>
              </Canvas>

              {/* Loading overlay */}
              <Suspense fallback={<Loader />}>
                <div />
              </Suspense>

              {/* Controls overlay */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <RotateCcw size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`bg-black/50 border-white/20 text-white hover:bg-black/70 ${autoRotate ? 'bg-tiptop-purple/30' : ''}`}
                >
                  <Maximize size={16} />
                </Button>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-sm">
                <p className="text-gray-300">
                  🖱️ Click & drag to rotate • 🖱️ Scroll to zoom • 🖱️ Right-click & drag to pan
                </p>
              </div>
            </motion.div>
          </div>

          {/* Product Info Panel */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 p-6"
            >
              <h2 className="text-xl font-bold mb-4 text-tiptop-purple">Product Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Model Name</label>
                  <p className="text-white font-medium">Sample 3D Product</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Dimensions</label>
                  <p className="text-white">2.4 × 2.4 × 2.4 units</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Material</label>
                  <p className="text-white">Metallic finish with gold accents</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Features</label>
                  <ul className="text-white text-sm space-y-1">
                    <li>• Animated rotation</li>
                    <li>• Interactive hover effects</li>
                    <li>• Realistic lighting</li>
                    <li>• Multiple materials</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 p-6"
            >
              <h3 className="text-lg font-bold mb-4 text-tiptop-purple">Viewer Controls</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Auto Rotate</span>
                  <Button
                    size="sm"
                    variant={autoRotate ? "default" : "outline"}
                    onClick={() => setAutoRotate(!autoRotate)}
                    className="text-xs"
                  >
                    {autoRotate ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Reset View</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    className="text-xs"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 p-6"
            >
              <h3 className="text-lg font-bold mb-4 text-tiptop-purple">Technical Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Framework:</span>
                  <span className="text-white">React Three Fiber</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Renderer:</span>
                  <span className="text-white">WebGL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Polygons:</span>
                  <span className="text-white">~2,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Performance:</span>
                  <span className="text-green-400">60 FPS</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewer;
