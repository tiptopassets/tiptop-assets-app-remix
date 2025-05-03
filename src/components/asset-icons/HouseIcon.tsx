import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { loadImage, removeBackground } from '@/utils/imageUtils';

const HouseIcon = () => {
  const [imageUrl, setImageUrl] = useState('/lovable-uploads/16aed391-2f58-4689-9ed3-43da2bdc31b7.png');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        console.log('Loading house image for background removal...');
        const imageElement = await loadImage('/lovable-uploads/16aed391-2f58-4689-9ed3-43da2bdc31b7.png');
        const processedImageUrl = await removeBackground(imageElement);
        console.log('Background removed successfully');
        setImageUrl(processedImageUrl);
      } catch (error) {
        console.error('Failed to process image:', error);
        // Keep the original image on error
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, []);

  return (
    <motion.div 
      className="absolute animate-float"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {isProcessing ? (
        <div className="h-40 w-40 flex items-center justify-center">
          <div className="animate-pulse bg-purple-400/20 h-40 w-40 rounded-full backdrop-blur-xl flex items-center justify-center">
            <span className="text-white/80">Processing...</span>
          </div>
        </div>
      ) : (
        <img 
          src={imageUrl} 
          alt="3D House"
          className="h-40 object-contain drop-shadow-2xl"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(155, 135, 245, 0.5))',
          }}
        />
      )}
    </motion.div>
  );
};

export default HouseIcon;
