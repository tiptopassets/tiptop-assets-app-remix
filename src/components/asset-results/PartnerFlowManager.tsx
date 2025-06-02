
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PartnerRegistrationFlow from '@/components/enhanced-analysis/PartnerRegistrationFlow';
import SpacerBlock from './SpacerBlock';

interface PartnerFlowManagerProps {
  selectedAssets: string[];
  showPartnerRegistration: boolean;
  onComplete: () => void;
}

const PartnerFlowManager = ({ 
  selectedAssets, 
  showPartnerRegistration, 
  onComplete 
}: PartnerFlowManagerProps) => {
  const [recommendedPartners, setRecommendedPartners] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generatePartnerRecommendations = (assets: string[]) => {
    const partnerMap: Record<string, any> = {
      'Solar Panels': {
        name: 'Tesla Energy',
        description: 'Leading solar panel installation and energy solutions',
        category: 'Solar',
        estimatedEarnings: '$200-500/month',
        setupTime: '2-4 weeks',
        difficulty: 'Medium'
      },
      'Parking Space Rental': {
        name: 'SpotHero',
        description: 'Monetize your parking spaces with hourly/daily rentals',
        category: 'Parking',
        estimatedEarnings: '$100-300/month',
        setupTime: '1-2 days',
        difficulty: 'Easy'
      },
      'Internet Bandwidth Sharing': {
        name: 'Honeygain',
        description: 'Earn passive income by sharing your unused internet',
        category: 'Internet',
        estimatedEarnings: '$20-50/month',
        setupTime: '5 minutes',
        difficulty: 'Easy'
      },
      'Pool Rental': {
        name: 'Swimply',
        description: 'Rent out your pool by the hour to local swimmers',
        category: 'Pool',
        estimatedEarnings: '$300-800/month',
        setupTime: '1 week',
        difficulty: 'Medium'
      }
    };

    return assets.map(asset => partnerMap[asset]).filter(Boolean);
  };

  const handlePartnerRegistrationComplete = () => {
    onComplete();
    toast({
      title: "Registration Complete!",
      description: "You're all set up with your selected partners",
    });
    navigate('/dashboard');
  };

  if (!showPartnerRegistration) return null;

  return (
    <div className="w-full px-4 md:px-0 md:max-w-4xl">
      <SpacerBlock />
      <PartnerRegistrationFlow
        selectedAssets={selectedAssets}
        recommendedPartners={generatePartnerRecommendations(selectedAssets)}
        onComplete={handlePartnerRegistrationComplete}
      />
    </div>
  );
};

export default PartnerFlowManager;
