
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, DollarSign } from 'lucide-react';
import * as THREE from 'three';

// 3D House Component
function House3D() {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* House Base */}
      <Box args={[4, 2, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8B7355" />
      </Box>
      {/* Roof */}
      <Box args={[4.5, 0.5, 3.5]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      {/* Door */}
      <Box args={[0.6, 1.2, 0.1]} position={[0, -0.4, 1.55]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      {/* Windows */}
      <Box args={[0.8, 0.8, 0.1]} position={[-1, 0.2, 1.55]}>
        <meshStandardMaterial color="#87CEEB" />
      </Box>
      <Box args={[0.8, 0.8, 0.1]} position={[1, 0.2, 1.55]}>
        <meshStandardMaterial color="#87CEEB" />
      </Box>
    </group>
  );
}

// Floating Asset Component
function FloatingAsset({ 
  position, 
  isActive, 
  assetType, 
  onClick,
  revenue 
}: { 
  position: [number, number, number];
  isActive: boolean;
  assetType: string;
  onClick: () => void;
  revenue: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
      if (isActive) {
        meshRef.current.rotation.y += 0.02;
      }
    }
  });

  const getAssetColor = () => {
    if (isActive) return '#9b87f5';
    return hovered ? '#6b46c1' : '#4a4a4a';
  };

  const getAssetShape = () => {
    switch (assetType) {
      case 'solar':
        return <Box args={[1, 0.1, 1]} />;
      case 'parking':
        return <Box args={[0.8, 0.2, 1.2]} />;
      case 'garden':
        return <Cylinder args={[0.5, 0.5, 0.3]} />;
      case 'pool':
        return <Cylinder args={[0.8, 0.8, 0.2]} />;
      default:
        return <Sphere args={[0.5]} />;
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getAssetShape()}
        <meshStandardMaterial 
          color={getAssetColor()} 
          emissive={isActive ? '#9b87f5' : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
      {isActive && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          +${revenue}/mo
        </Text>
      )}
    </group>
  );
}

// Money Flow Animation Component
function MoneyFlow({ from, to, isActive }: { from: [number, number, number], to: [number, number, number], isActive: boolean }) {
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (particlesRef.current && isActive) {
      particlesRef.current.children.forEach((child, i) => {
        const progress = (state.clock.elapsedTime + i * 0.5) % 2 / 2;
        const fromVec = new THREE.Vector3(...from);
        const toVec = new THREE.Vector3(...to);
        const mesh = child as THREE.Mesh;
        if (mesh.position) {
          mesh.position.lerpVectors(fromVec, toVec, progress);
          mesh.scale.setScalar(Math.sin(progress * Math.PI) * 0.5 + 0.5);
        }
      });
    }
  });

  if (!isActive) return null;

  return (
    <group ref={particlesRef}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

const GameifiedProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeAssets, setActiveAssets] = useState<Set<string>>(new Set());
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [coins, setCoins] = useState(1000); // Starting coins

  // Get analysis data from location state or fallback
  const analysisData = location.state?.analysisResults || {
    rooftop: { revenue: 150, area: 1200 },
    parking: { revenue: 200, spaces: 2 },
    garden: { revenue: 100, area: 500 },
    pool: { revenue: 300, present: true }
  };

  const address = location.state?.address || "Sample Property";

  const assets = [
    {
      id: 'solar',
      type: 'solar',
      position: [-3, 2, -2] as [number, number, number],
      revenue: analysisData.rooftop?.revenue || 150,
      cost: 500,
      name: 'Solar Panels'
    },
    {
      id: 'parking',
      type: 'parking',
      position: [3, 1, -2] as [number, number, number],
      revenue: analysisData.parking?.revenue || 200,
      cost: 300,
      name: 'Parking Space'
    },
    {
      id: 'garden',
      type: 'garden',
      position: [-3, 1, 2] as [number, number, number],
      revenue: analysisData.garden?.revenue || 100,
      cost: 200,
      name: 'Garden Space'
    },
    {
      id: 'pool',
      type: 'pool',
      position: [3, 1, 2] as [number, number, number],
      revenue: analysisData.pool?.revenue || 300,
      cost: 800,
      name: 'Pool Rental'
    }
  ];

  const activateAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset || activeAssets.has(assetId) || coins < asset.cost) return;

    setActiveAssets(prev => new Set([...prev, assetId]));
    setTotalRevenue(prev => prev + asset.revenue);
    setCoins(prev => prev - asset.cost);
  };

  useEffect(() => {
    // Simulate passive income generation
    const interval = setInterval(() => {
      if (activeAssets.size > 0) {
        const passiveIncome = Array.from(activeAssets).reduce((sum, assetId) => {
          const asset = assets.find(a => a.id === assetId);
          return sum + (asset?.revenue || 0);
        }, 0) / 10; // Scaled down for demo
        
        setCoins(prev => prev + passiveIncome);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAssets]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-600/20 animate-pulse"></div>
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center border-b border-purple-800/50">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-purple-800/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Property Command Center
            </h1>
            <p className="text-gray-400 text-sm">{address}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-600 text-white px-4 py-2">
            <DollarSign className="h-4 w-4 mr-1" />
            ${totalRevenue}/month
          </Badge>
          <Badge className="bg-yellow-600 text-white px-4 py-2">
            <Zap className="h-4 w-4 mr-1" />
            {Math.floor(coins)} Coins
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [8, 6, 8], fov: 60 }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9b87f5" />
            
            <House3D />
            
            {assets.map((asset) => (
              <group key={asset.id}>
                <FloatingAsset
                  position={asset.position}
                  isActive={activeAssets.has(asset.id)}
                  assetType={asset.type}
                  onClick={() => activateAsset(asset.id)}
                  revenue={asset.revenue}
                />
                <MoneyFlow
                  from={asset.position}
                  to={[0, 2, 0]}
                  isActive={activeAssets.has(asset.id)}
                />
              </group>
            ))}
            
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={15}
            />
          </Canvas>

          {/* Instructions Overlay */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-purple-400">How to Play</h3>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Click on floating assets to activate them</li>
              <li>• Each asset generates passive income</li>
              <li>• Use coins to unlock more assets</li>
              <li>• Rotate and zoom to explore your property</li>
            </ul>
          </div>
        </div>

        {/* Asset Panel */}
        <div className="w-80 bg-black/50 backdrop-blur-sm border-l border-purple-800/50 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 text-purple-400">Asset Management</h2>
          
          <div className="space-y-4">
            {assets.map((asset) => {
              const isActive = activeAssets.has(asset.id);
              const canAfford = coins >= asset.cost;
              
              return (
                <motion.div
                  key={asset.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-purple-600/20 border-purple-400' 
                      : canAfford
                        ? 'bg-gray-800/50 border-gray-600 hover:border-purple-400 cursor-pointer'
                        : 'bg-gray-900/50 border-gray-700 opacity-50'
                  }`}
                  onClick={() => !isActive && canAfford && activateAsset(asset.id)}
                  whileHover={!isActive && canAfford ? { scale: 1.02 } : {}}
                  whileTap={!isActive && canAfford ? { scale: 0.98 } : {}}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{asset.name}</h3>
                    {isActive && <Badge className="bg-green-600">Active</Badge>}
                  </div>
                  <div className="text-sm text-gray-400 mb-3">
                    Revenue: ${asset.revenue}/month
                  </div>
                  {!isActive && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cost: {asset.cost} coins</span>
                      {!canAfford && <span className="text-red-400 text-xs">Insufficient coins</span>}
                    </div>
                  )}
                  {isActive && (
                    <div className="text-green-400 text-sm">
                      ✓ Generating passive income
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-8 p-4 bg-purple-600/10 rounded-lg border border-purple-600/30">
            <h3 className="font-semibold mb-3">Portfolio Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Active Assets:</span>
                <span>{activeAssets.size}/{assets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Revenue:</span>
                <span className="text-green-400">${totalRevenue}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Coins:</span>
                <span className="text-yellow-400">{Math.floor(coins)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameifiedProperty;
