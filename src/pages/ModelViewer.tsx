
import { useState, useEffect } from 'react';
import { useModelGeneration } from '@/contexts/ModelGenerationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ModelViewer = () => {
  const { modelUrl, status, propertyImages } = useModelGeneration();
  const navigate = useNavigate();
  const [lightIntensity, setLightIntensity] = useState(50);
  const [viewMode, setViewMode] = useState<'satellite' | 'streetView'>('satellite');
  
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

  // In a real implementation, this would handle camera controls for the 3D model
  const handleResetView = () => {
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
            {/* For now, we'll show a placeholder image instead of a real 3D model */}
            <img 
              src={viewMode === 'satellite' ? propertyImages.satellite : propertyImages.streetView} 
              alt="Property Model"
              className="w-full h-full object-cover"
            />
            
            {/* Control overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleResetView()}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" className="zoom-in">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" className="zoom-out">
                <ZoomOut className="h-4 w-4" />
              </Button>
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
            
            {/* View mode toggle */}
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
            
            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full bg-tiptop-purple hover:bg-tiptop-purple/90">
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
