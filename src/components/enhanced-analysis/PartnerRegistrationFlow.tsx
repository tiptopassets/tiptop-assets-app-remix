import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAffiliateIntegration } from '@/hooks/useAffiliateIntegration';
import { ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackAndOpenReferral } from '@/services/clickTrackingService';

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

  // Enhanced partner name normalization with comprehensive mapping
  const normalizePartnerName = (partnerName: string): string => {
    const nameMap: Record<string, string> = {
      // Tesla variations
      'Tesla Energy': 'Tesla Energy',
      'Tesla Solar': 'Tesla Energy',
      'Tesla': 'Tesla Energy',
      
      // Airbnb variations - map to specific services
      'Airbnb': 'Airbnb Unit Rental', // Default to unit rental
      'Airbnb Unit Rental': 'Airbnb Unit Rental',
      'Airbnb Experience': 'Airbnb Experience',
      'Airbnb Service': 'Airbnb Service',
      
      // Kolonia variations
      'Kolonia Energy': 'Kolonia Energy',
      'Kolonia House': 'Kolonia Energy',
      'Kolonia': 'Kolonia Energy',
      
      // Other partners - maintain exact names
      'Honeygain': 'Honeygain',
      'Swimply': 'Swimply',
      'Peerspace': 'Peerspace',
      'Neighbor.com': 'Neighbor.com',
      'Neighbor': 'Neighbor.com',
      'SpotHero': 'SpotHero',
      'Turo': 'Turo',
      'ChargePoint': 'ChargePoint',
      'EVgo': 'EVgo',
      'Little Free Library': 'Little Free Library',
      
      // Legacy mappings for backwards compatibility
      'FlexOffers': 'FlexOffers',
      'Booking.com': 'Booking.com',
      'Rakuten': 'Rakuten'
    };
    
    const normalized = nameMap[partnerName] || partnerName;
    console.log(`🏷️ Partner name normalization: "${partnerName}" -> "${normalized}"`);
    return normalized;
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
      await trackAndOpenReferral({
        provider: normalizedName,
        url: referralLink,
        source: 'partner_registration_flow',
        extra: { assets: selectedAssets }
      });
      
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
      // Tesla
      'Tesla Energy': 'https://www.tesla.com/solar-panels',
      'Tesla Solar': 'https://www.tesla.com/solar-panels',
      'Tesla': 'https://www.tesla.com/solar-panels',
      
      // Airbnb
      'Airbnb': 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9',
      'Airbnb Unit Rental': 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9',
      'Airbnb Experience': 'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a',
      'Airbnb Service': 'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b',
      
      // Kolonia
      'Kolonia Energy': 'https://koloniahouse.com',
      'Kolonia House': 'https://koloniahouse.com',
      'Kolonia': 'https://koloniahouse.com',
      
      // Other partners
      'Honeygain': 'https://r.honeygain.me/EDUARCE2A5',
      'Swimply': 'https://swimply.com/referral?ref=MjQ0MTUyMw==&r=g&utm_medium=referral&utm_source=link&utm_campaign=2441523',
      'Peerspace': 'https://www.peerspace.com/claim/gr-jdO4oxx4LGzq',
      'Neighbor.com': 'http://www.neighbor.com/invited/eduardo-944857?program_version=1',
      'Neighbor': 'http://www.neighbor.com/invited/eduardo-944857?program_version=1',
      'SpotHero': 'https://spothero.com/partners',
      'Turo': 'https://turo.com/us/en/list-your-car',
      'ChargePoint': 'https://www.chargepoint.com/businesses/property-managers/',
      'EVgo': 'https://www.evgo.com/partners/',
      'Little Free Library': 'https://littlefreelibrary.org/start/',
      
      // Legacy partners
      'FlexOffers': 'https://www.flexoffers.com/affiliate-programs',
      'Booking.com': 'https://partner.booking.com/',
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
