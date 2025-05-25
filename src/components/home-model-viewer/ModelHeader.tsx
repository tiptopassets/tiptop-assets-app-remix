
import React from 'react';
import { Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelHeaderProps {
  address: string;
}

const ModelHeader: React.FC<ModelHeaderProps> = ({ address }) => {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-white">
        Property Analysis Complete
      </h2>
      <p className="text-sm text-gray-400">{address}</p>
    </div>
  );
};

export default ModelHeader;
