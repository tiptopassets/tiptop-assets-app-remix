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

  // Normalize partner names for consistent tracking
  const normalizePartnerName = (partnerName: string): string => {
    const nameMap: Record<string, string> = {
      'FlexOffers': 'FlexOffers',
      'Honeygain': 'Honeygain',
      'Tesla Energy': 'Tesla Energy',
      'Tesla Solar': 'Tesla Energy', // Normalize to Tesla Energy
      'Tesla': 'Tesla Energy', // Normalize to Tesla Energy
      'Swimply': 'Swimply',
      'Airbnb': 'Airbnb Unit Rental', // Default to unit rental
      'Booking.com': 'Booking.com',
      'SpotHero': 'SpotHero',
      'Rakuten': 'Rakuten',
      'Kolonia Energy': 'Kolonia Energy',
      'Kolonia': 'Kolonia Energy',
      'Peerspace': 'Peerspace',
      'Neighbor.com': 'Neighbor.com',
      'Neighbor': 'Neighbor.com',
      'Little Free Library': 'Little Free Library'
    };
    
    return nameMap[partnerName] || partnerName;
  };

  const handlePartnerRegistration = async (partner: Partner) => {
    const normalizedName = normalizePartnerName(partner.name);
    
    console.log(`🎯 Tracking click for partner: "${partner.name}" -> normalized: "${normalizedName}"`);
    
    // Track the click with normalized name
    await trackClick(normalizedName, {
      asset: selectedAssets,
      timestamp: new Date().toISOString(),
      original_partner_name: partner.name
    });

    // Generate referral link
    const referralLink = await generateReferralLink(normalizedName, getPartnerUrl(partner.name));
    
    if (referralLink) {
      // Open in new tab
      window.open(referralLink, '_blank');
      
      // Mark as registered after a delay (simulating user completing registration)
      setTimeout(async () => {
        await registerWithPartner(normalizedName, {
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
      'Tesla Solar': 'https://www.tesla.com/solar-panels',
      'Tesla': 'https://www.tesla.com/solar-panels',
      'Swimply': 'https://swimply.com/for-hosts',
      'Airbnb': 'https://www.airbnb.com/host/homes',
      'Airbnb Unit Rental': 'https://www.airbnb.com/host/homes',
      'Airbnb Experience': 'https://www.airbnb.com/experiences',
      'Airbnb Service': 'https://www.airbnb.com/host/services',
      'Booking.com': 'https://partner.booking.com/',
      'SpotHero': 'https://spothero.com/partners',
      'Rakuten': 'https://rakutenadvertising.com',
      'Kolonia Energy': 'https://koloniahouse.com',
      'Kolonia': 'https://koloniahouse.com',
      'Peerspace': 'https://www.peerspace.com/claim/gr-jdO4oxx4LGzq',
      'Neighbor.com': 'http://www.neighbor.com/invited/eduardo-944857?program_version=1',
      'Neighbor': 'http://www.neighbor.com/invited/eduardo-944857?program_version=1',
      'Little Free Library': 'https://littlefreelibrary.org/start/'
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
