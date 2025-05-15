
import { useEffect } from 'react';
import { useModelGeneration } from '@/contexts/ModelGenerationContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const ModelViewer = () => {
  const { propertyImages, status } = useModelGeneration();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect if no images are available
    if (status !== 'completed' || (!propertyImages.satellite && !propertyImages.streetView)) {
      toast({
        title: "No Property Images Available",
        description: "Please complete the property analysis first",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [status, propertyImages, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-tiptop-purple">Property Images</h1>
          <p className="text-sm text-gray-400">View captured images of your property</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Satellite Image */}
          {propertyImages.satellite && (
            <div className="bg-black/40 rounded-xl overflow-hidden border border-white/10 relative">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-semibold">Satellite View</h2>
                <p className="text-sm text-gray-400">Aerial view of your property</p>
              </div>
              <div className="aspect-ratio-1/1 h-[40vh]">
                <img 
                  src={propertyImages.satellite} 
                  alt="Satellite view of property"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          )}
          
          {/* Street View Image */}
          {propertyImages.streetView && (
            <div className="bg-black/40 rounded-xl overflow-hidden border border-white/10 relative">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-semibold">Street View</h2>
                <p className="text-sm text-gray-400">View from the street</p>
              </div>
              <div className="aspect-ratio-16/9 h-[40vh]">
                <img 
                  src={propertyImages.streetView} 
                  alt="Street view of property"
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="mt-8 flex justify-center">
          <Button 
            variant="outline" 
            className="w-full max-w-md"
            onClick={() => navigate('/dashboard')}
          >
            View Property Assets
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;
