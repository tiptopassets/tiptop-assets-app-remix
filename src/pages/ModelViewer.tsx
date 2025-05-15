
import { useEffect } from 'react';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ViewerHeader from '@/components/model-viewer/ViewerHeader';
import ImageGrid from '@/components/model-viewer/ImageGrid';
import ActionButtons from '@/components/model-viewer/ActionButtons';
import './ModelViewer.css';

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
      <ViewerHeader onClose={() => navigate('/dashboard')} />

      {/* Main content */}
      <div className="container mx-auto px-4 pb-20 mt-6">
        <ImageGrid propertyImages={propertyImages} />
        
        {/* Actions */}
        <ActionButtons onViewAssets={() => navigate('/dashboard')} />
      </div>
    </div>
  );
};

export default ModelViewer;
