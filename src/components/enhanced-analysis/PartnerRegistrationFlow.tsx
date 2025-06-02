
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAffiliateIntegration } from '@/hooks/useAffiliateIntegration';
import { ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Partner {
  name: string;
  description: string;
  category: string;
  estimatedEarnings: string;
  setupTime: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

interface PartnerRegistrationFlowProps {
  selectedAssets: string[];
  recommendedPartners: Partner[];
  onComplete: () => void;
}

const PartnerRegistrationFlow: React.FC<PartnerRegistrationFlowProps> = ({
  selectedAssets,
  recommendedPartners,
  onComplete
}) => {
  const [registeredPartners, setRegisteredPartners] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const { generateReferralLink, registerWithPartner, trackClick, isLoading } = useAffiliateIntegration();

  const handlePartnerRegistration = async (partner: Partner) => {
    // Track the click
    await trackClick(partner.name, {
      asset: selectedAssets,
      timestamp: new Date().toISOString()
    });

    // Generate referral link
    const referralLink = await generateReferralLink(partner.name, getPartnerUrl(partner.name));
    
    if (referralLink) {
      // Open in new tab
      window.open(referralLink, '_blank');
      
      // Mark as registered after a delay (simulating user completing registration)
      setTimeout(async () => {
        await registerWithPartner(partner.name, {
          assets: selectedAssets,
          registrationMethod: 'direct_link'
        });
        
        setRegisteredPartners(prev => [...prev, partner.name]);
        
        if (registeredPartners.length + 1 === recommendedPartners.length) {
          setTimeout(onComplete, 1000);
        }
      }, 3000);
    }
  };

  const getPartnerUrl = (partnerName: string): string => {
    const urls: Record<string, string> = {
      'FlexOffers': 'https://www.flexoffers.com/affiliate-programs',
      'Honeygain': 'https://dashboard.honeygain.com/ref/TIPTOP',
      'Tesla Energy': 'https://www.tesla.com/solar-panels',
      'Swimply': 'https://swimply.com/for-hosts',
      'Airbnb': 'https://www.airbnb.com/host/homes',
      'Booking.com': 'https://partner.booking.com/',
      'SpotHero': 'https://spothero.com/partners',
      'Rakuten': 'https://rakutenadvertising.com'
    };
    return urls[partnerName] || '#';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Advanced': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Register with Partners</h2>
        <p className="text-gray-400">
          Sign up with these recommended partners to start earning from your property
        </p>
      </div>

      <div className="grid gap-4">
        {recommendedPartners.map((partner, index) => {
          const isRegistered = registeredPartners.includes(partner.name);
          const isActive = currentStep === index;

          return (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-effect border ${isRegistered ? 'border-green-500' : 'border-white/10'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        {partner.name}
                        {isRegistered && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {partner.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-tiptop-purple font-bold">{partner.estimatedEarnings}</div>
                      <div className="text-xs text-gray-400">{partner.setupTime}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">Category: {partner.category}</span>
                      <span className={`text-sm ${getDifficultyColor(partner.difficulty)}`}>
                        {partner.difficulty}
                      </span>
                    </div>
                    
                    {!isRegistered && (
                      <Button
                        onClick={() => handlePartnerRegistration(partner)}
                        disabled={isLoading}
                        className="bg-tiptop-purple hover:bg-purple-700 text-white"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Register <ExternalLink className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          Registered: {registeredPartners.length} / {recommendedPartners.length}
        </p>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-tiptop-purple h-2 rounded-full transition-all duration-300"
            style={{ width: `${(registeredPartners.length / recommendedPartners.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistrationFlow;
