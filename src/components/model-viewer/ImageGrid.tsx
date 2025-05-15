
import React from 'react';
import ImageViewer from './ImageViewer';
import { PropertyImages } from '@/contexts/ModelGeneration/types';

interface ImageGridProps {
  propertyImages: PropertyImages;
}

const ImageGrid = ({ propertyImages }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Satellite Image */}
      {propertyImages.satellite && (
        <ImageViewer
          imageUrl={propertyImages.satellite}
          title="Satellite View"
          description="Aerial view of your property"
          altText="Satellite view of property"
        />
      )}
      
      {/* Street View Image */}
      {propertyImages.streetView && (
        <ImageViewer
          imageUrl={propertyImages.streetView}
          title="Street View"
          description="View from the street"
          altText="Street view of property"
        />
      )}
    </div>
  );
};

export default ImageGrid;
