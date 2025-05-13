
import { useState, useEffect } from 'react';
import { useModelGeneration } from '@/contexts/ModelGenerationContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, X, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PresentationControls } from '@react-three/drei';

function Model({ url, lightIntensity = 0.5 }: { url: string; lightIntensity?: number }) {
  const { scene } = useGLTF(url);
  
  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}

const ModelViewer = () => {
  const { modelUrl, status, propertyImages } = useModelGeneration();
  const navigate = useNavigate();
  const [lightIntensity, setLightIntensity] = useState(50);
  const [viewMode, setViewMode] = useState<'satellite' | 'streetView'>('satellite');
  const [enableAutoRotate, setEnableAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  useEffect(() => {
    // Redirect if no model is available
    if (status !== 'completed' || !modelUrl) {
      toast({
        title: "No 3D Model Available",
        description: "Please complete the property analysis first",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [status, modelUrl, navigate]);

  // Handle reset view button click
  const handleResetView = () => {
    setZoomLevel(1);
    toast({
      title: "View Reset",
      description: "Camera position has been reset to default"
    });
  };

  // Toggle between satellite and street view based models
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'satellite' ? 'streetView' : 'satellite');
    toast({
      title: `Switched to ${viewMode === 'satellite' ? 'Street View' : 'Satellite'} Model`
    });
  };

  // Handle light intensity change
  const handleLightChange = (value: number[]) => {
    setLightIntensity(value[0]);
  };
  
  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Handle download model button click
  const handleDownload = () => {
    if (!modelUrl) return;
    
    // Create a download link
    const link = document.createElement('a');
    link.href = modelUrl;
    link.download = 'property-3d-model.glb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your 3D model file is being downloaded"
    });
  };

  // Calculate light intensity for Three.js (0-1 scale)
  const calculatedLightIntensity = lightIntensity / 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-tiptop-purple">3D Property Model</h1>
          <p className="text-sm text-gray-400">Interactive visualization of your property</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="text-gray-300 hover:text-white"
        >
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 pb-20 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 3D Model Canvas - Left side on desktop, top on mobile */}
          <div className="md:col-span-2 bg-black/40 rounded-xl overflow-hidden border border-white/10 h-[60vh] md:h-[80vh] relative">
            {modelUrl ? (
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={calculatedLightIntensity} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={calculatedLightIntensity * 1.5} />
                <PresentationControls
                  global
                  zoom={zoomLevel}
                  rotation={[0, -Math.PI / 4, 0]}
                  polar={[-Math.PI / 4, Math.PI / 4]}
                  azimuth={[-Math.PI / 4, Math.PI / 4]}
                  config={{ mass: 1, tension: 170, friction: 26 }}
                  snap={{ mass: 4, tension: 170, friction: 26 }}
                  speed={1.5}>
                  <Model url={modelUrl} lightIntensity={calculatedLightIntensity} />
                </PresentationControls>
                <Environment preset="city" />
              </Canvas>
            ) : (
              // Fallback to image if model isn't available
              <img 
                src={viewMode === 'satellite' ? propertyImages.satellite : propertyImages.streetView} 
                alt="Property Model"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Control overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setEnableAutoRotate(prev => !prev)}
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
            
            <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Click and drag to rotate • Scroll to zoom
            </div>
          </div>

          {/* Controls - Right side on desktop, bottom on mobile */}
          <div className="bg-black/40 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Model Controls</h2>
            
            {/* Light intensity slider */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">Light Intensity</label>
              <Slider
                defaultValue={[lightIntensity]}
                max={100}
                step={1}
                onValueChange={handleLightChange}
                className="mb-1"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            
            {/* Auto-rotate toggle */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">Auto-Rotate</label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={enableAutoRotate ? "default" : "outline"}
                  onClick={() => setEnableAutoRotate(true)}
                  className={enableAutoRotate ? "bg-tiptop-purple hover:bg-tiptop-purple/90" : ""}
                >
                  On
                </Button>
                <Button 
                  variant={!enableAutoRotate ? "default" : "outline"}
                  onClick={() => setEnableAutoRotate(false)}
                  className={!enableAutoRotate ? "bg-tiptop-purple hover:bg-tiptop-purple/90" : ""}
                >
                  Off
                </Button>
              </div>
            </div>
            
            {/* View mode toggle - only when we have both satellite and street view */}
            {propertyImages.satellite && propertyImages.streetView && (
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">View Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={viewMode === 'satellite' ? "default" : "outline"}
                    onClick={() => setViewMode('satellite')}
                    className={viewMode === 'satellite' ? "bg-tiptop-purple hover:bg-tiptop-purple/90" : ""}
                  >
                    Satellite
                  </Button>
                  <Button 
                    variant={viewMode === 'streetView' ? "default" : "outline"}
                    onClick={() => setViewMode('streetView')}
                    className={viewMode === 'streetView' ? "bg-tiptop-purple hover:bg-tiptop-purple/90" : ""}
                  >
                    Street View
                  </Button>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-tiptop-purple hover:bg-tiptop-purple/90"
                onClick={handleDownload}
                disabled={!modelUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Model
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                View Property Assets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;
