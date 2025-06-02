
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAssetSelection = () => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAssetToggle = (assetTitle: string) => {
    setSelectedAssets(prev => {
      if (prev.includes(assetTitle)) {
        return prev.filter(title => title !== assetTitle);
      } else {
        return [...prev, assetTitle];
      }
    });
  };

  const validateSelection = () => {
    if (selectedAssets.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one asset to continue",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return {
    selectedAssets,
    setSelectedAssets,
    handleAssetToggle,
    validateSelection
  };
};
