
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageViewerProps {
  imageUrl: string;
  title: string;
  description: string;
  altText: string;
}

const ImageViewer = ({ imageUrl, title, description, altText }: ImageViewerProps) => {
  return (
    <div className="bg-black/40 rounded-xl overflow-hidden border border-white/10 relative">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="h-[40vh]">
        <img 
          src={imageUrl} 
          alt={altText}
          className="w-full h-full object-cover" 
        />
      </div>
    </div>
  );
};

export default ImageViewer;
