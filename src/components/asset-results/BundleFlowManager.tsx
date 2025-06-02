
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { BundleRecommendation } from '@/contexts/ServiceProviders/types';
import BundleRecommendations from '../bundles/BundleRecommendations';
import BundleRegistrationFlow from '../bundles/BundleRegistrationFlow';
import SpacerBlock from './SpacerBlock';

interface BundleFlowManagerProps {
  showBundles: boolean;
  detectedAssets: string[];
  address: string;
  onSkipBundles: () => void;
}

const BundleFlowManager = ({ 
  showBundles, 
  detectedAssets, 
  address, 
  onSkipBundles 
}: BundleFlowManagerProps) => {
  const [selectedBundle, setSelectedBundle] = useState<BundleRecommendation | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelectBundle = (recommendation: BundleRecommendation) => {
    setSelectedBundle(recommendation);
  };

  const handleBundleRegistrationComplete = () => {
    setSelectedBundle(null);
    toast({
      title: "Bundle Registration Complete!",
      description: "You're all set up with your selected bundle",
    });
    navigate('/dashboard');
  };

  // Show bundle registration flow if a bundle is selected
  if (selectedBundle) {
    return (
      <div className="w-full px-4 md:px-0 md:max-w-4xl">
        <SpacerBlock />
        <BundleRegistrationFlow
          selectedBundle={selectedBundle}
          propertyAddress={address}
          onComplete={handleBundleRegistrationComplete}
          onBack={() => setSelectedBundle(null)}
        />
      </div>
    );
  }

  // Show bundle recommendations if enabled and sufficient assets detected
  if (showBundles && detectedAssets.length >= 2) {
    return (
      <div className="w-full px-4 md:px-0 md:max-w-4xl">
        <SpacerBlock />
        <BundleRecommendations
          detectedAssets={detectedAssets}
          onSelectBundle={handleSelectBundle}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <button
            onClick={onSkipBundles}
            className="text-gray-400 hover:text-white underline text-sm"
          >
            Skip bundles and register individually
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default BundleFlowManager;
