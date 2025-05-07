
import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PresentationControls } from '@react-three/drei';
import { Loader, ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';
import { useModelGeneration } from '@/contexts/ModelGenerationContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    return () => {
      // Cleanup function to avoid memory leaks
      if (url) {
        useGLTF.preload(url);
      }
    };
  }, [url]);

  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}

const HomeModelViewer = () => {
  const { status, progress, modelUrl, currentTaskId } = useModelGeneration();
  const [isVisible, setIsVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [enableAutoRotate, setEnableAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const isGenerating = status === 'generating';
  const isComplete = status === 'completed';
  
  // Determine if we should show the component
  useEffect(() => {
    if (isGenerating || isComplete) {
      setIsVisible(true);
    }
  }, [isGenerating, isComplete]);
  
  // Format task ID for display
  const formattedTaskId = currentTaskId ? 
    `${currentTaskId.substring(0, 8)}...${currentTaskId.substring(currentTaskId.length - 8)}` : 
    null;
  
  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Handle rotation toggle
  const handleRotateToggle = () => {
    setEnableAutoRotate(prev => !prev);
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto mt-8 mb-12 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 relative"
    >
      <div className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {isGenerating ? "Generating 3D Model..." : "Property 3D Model"}
          </h2>
          <p className="text-sm text-gray-400">
            {isGenerating 
              ? "Please wait while we create your property model" 
              : "Interactive 3D view of your property"}
          </p>
          {currentTaskId && (
            <p className="text-xs text-gray-500 mt-1">
              Task ID: {formattedTaskId}
            </p>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsVisible(false)} 
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Progress bar for generation */}
      {isGenerating && (
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Loader className="h-5 w-5 animate-spin text-tiptop-purple" />
            <p className="text-sm text-gray-300">Generating your 3D property model</p>
          </div>
          <Progress value={progress} className="h-1.5 bg-gray-800" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Processing images</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
      
      {/* 3D Model Display */}
      {isComplete && modelUrl && (
        <div className="relative h-[50vh] md:h-[60vh]">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <PresentationControls
              global
              zoom={zoomLevel}
              rotation={[0, -Math.PI / 4, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
              config={{ mass: 1, tension: 170, friction: 26 }}
              snap={{ mass: 4, tension: 170, friction: 26 }}
              speed={1.5}>
              <Model url={modelUrl} />
            </PresentationControls>
            <Environment preset="city" />
          </Canvas>
          
          {/* Controls overlay */}
          {showControls && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRotateToggle}
                className={enableAutoRotate ? "bg-tiptop-purple/50 text-white" : ""}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
            Click and drag to rotate • Scroll to zoom
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HomeModelViewer;
