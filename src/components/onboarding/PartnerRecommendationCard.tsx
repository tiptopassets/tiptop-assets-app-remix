
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, Loader2, DollarSign, Clock, Wifi, Check, Car, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PartnerRecommendation } from '@/services/partnerRecommendationService';

interface PartnerRecommendationCardProps {
  recommendation: PartnerRecommendation;
  onIntegrate: (partnerName: string, referralLink: string) => Promise<void>;
  isIntegrating: boolean;
  isCompleted: boolean;
}

const PartnerRecommendationCard: React.FC<PartnerRecommendationCardProps> = ({
  recommendation,
  onIntegrate,
  isIntegrating,
  isCompleted
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleIntegrate = () => {
    if (recommendation.referral_link) {
      onIntegrate(recommendation.partner_name, recommendation.referral_link);
    }
  };

  const getSetupTimeInMinutes = (complexity: string) => {
    switch (complexity) {
      case 'easy': return '15-20 min';
      case 'medium': return '30-60 min';
      case 'hard': return '2-3 hours';
      default: return '30 min';
    }
  };

  const getAssetDisplayName = (assetType: string) => {
    const assetMap: { [key: string]: string } = {
      'internet': 'Internet',
      'bandwidth': 'Bandwidth',
      'wifi': 'WiFi',
      'pool': 'Pool',
      'swimming_pool': 'Pool',
      'parking': 'Parking',
      'driveway': 'Parking',
      'storage': 'Storage',
      'garage': 'Garage',
      'basement': 'Basement',
      'event_space': 'Event Space',
      'creative_space': 'Creative Space',
      'unique_space': 'Unique Space',
      'garden': 'Garden',
      'yard': 'Yard',
      'outdoor_space': 'Outdoor Space',
      'home_gym': 'Home Gym',
      'gym': 'Gym',
      'general': 'General'
    };
    return assetMap[assetType] || assetType.charAt(0).toUpperCase() + assetType.slice(1);
  };

  const getAssetIcon = (assetType: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'internet': <Wifi className="w-3 h-3" />,
      'bandwidth': <Wifi className="w-3 h-3" />,
      'wifi': <Wifi className="w-3 h-3" />,
      'parking': <Car className="w-3 h-3" />,
      'driveway': <Car className="w-3 h-3" />,
      'storage': <Home className="w-3 h-3" />,
      'garage': <Home className="w-3 h-3" />,
      'basement': <Home className="w-3 h-3" />,
      'general': <Home className="w-3 h-3" />
    };
    return iconMap[assetType] || <Home className="w-3 h-3" />;
  };

  // Get key requirements based on partner name (simplified version)
  const getKeyRequirements = (partnerName: string) => {
    const requirementsMap: { [key: string]: string[] } = {
      'Grass.io': ['Stable internet (10+ Mbps)', '24/7 device running', 'Unlimited data plan'],
      'Honeygain': ['Residential IP address', 'Multiple devices supported', '10GB+ monthly bandwidth'],
      'Swimply': ['Pool insurance required', 'Safety equipment', 'Flexible scheduling'],
      'SpotHero': ['Clear parking access', 'Safe, well-lit area', 'Consistent availability'],
      'Neighbor.com': ['Clean, dry storage', 'Secure access method', 'Space measurements'],
      'Peerspace': ['Unique/attractive space', 'Professional photos', 'Basic amenities'],
      'Sniffspot': ['Secure, fenced area', 'Dog-safe environment', 'Water access'],
      'Giggster': ['Photo/video friendly', 'Good lighting', 'Parking available']
    };
    return requirementsMap[partnerName] || ['Basic requirements apply', 'Setup verification needed'];
  };

  const keyRequirements = getKeyRequirements(recommendation.partner_name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex-shrink-0"
    >
      <Card className={`h-full border-2 ${isCompleted ? 'border-green-500/50 bg-green-500/5' : 'border-gray-200 dark:border-gray-700 hover:border-tiptop-purple/50'} transition-all duration-300 bg-white dark:bg-gray-800 md:max-w-sm`}>
        <CardHeader className="pb-2 md:pb-1">
          <div className="space-y-2 md:space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white font-bold flex items-center gap-1 text-sm md:text-xs">
                {recommendation.partner_name}
                {isCompleted && <CheckCircle className="w-3 h-3 text-green-500" />}
              </CardTitle>
            </div>
            <Badge className="text-xs md:text-[10px] capitalize w-fit bg-tiptop-purple/20 text-tiptop-purple border-tiptop-purple/30">
              {getAssetIcon(recommendation.asset_type)}
              <span className="ml-1">{getAssetDisplayName(recommendation.asset_type)}</span>
            </Badge>
            <p className="text-gray-700 dark:text-gray-300 text-xs md:text-[10px] leading-tight line-clamp-2">
              {recommendation.recommendation_reason}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-2 md:space-y-1">
          {/* Monthly income */}
          <div className="flex items-center gap-2 text-xs md:text-[10px]">
            <DollarSign className="w-3 h-3 md:w-2.5 md:h-2.5 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">Monthly Income:</span>
            <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-400/30 bg-green-400/10 text-xs md:text-[10px]">
              ~${Math.round(recommendation.estimated_monthly_earnings)}
            </Badge>
          </div>

          {/* Setup time */}
          <div className="flex items-center gap-2 text-xs md:text-[10px]">
            <Clock className="w-3 h-3 md:w-2.5 md:h-2.5 text-blue-500 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">Setup time:</span>
            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-400/30 bg-blue-400/10 text-xs md:text-[10px]">
              {getSetupTimeInMinutes(recommendation.setup_complexity)}
            </Badge>
          </div>

          {/* Key requirements */}
          <div className="space-y-1">
            <span className="text-gray-700 dark:text-gray-300 text-xs md:text-[10px] font-medium">Key Requirements:</span>
            <div className="space-y-0.5">
              {keyRequirements.slice(0, 2).map((req, index) => (
                <div key={index} className="flex items-start gap-1.5 text-xs md:text-[10px]">
                  <Check className="w-3 h-3 md:w-2.5 md:h-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-1.5 md:space-y-1">
            {!isCompleted && (
              <Button
                onClick={handleIntegrate}
                disabled={isIntegrating || !recommendation.referral_link}
                className="w-full bg-tiptop-purple hover:bg-purple-700 text-white font-medium"
                size="sm"
              >
                {isIntegrating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Start Integration
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs md:text-[10px]"
            >
              {isExpanded ? 'Less' : 'Details'}
            </Button>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-300 dark:border-gray-700 pt-2 mt-2"
            >
              <div className="text-xs md:text-[10px] text-gray-600 dark:text-gray-400 space-y-1.5">
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-300">Priority Score:</span> {recommendation.priority_score}/10
                </div>
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-300">All Requirements:</span>
                  <div className="mt-1 space-y-0.5">
                    {keyRequirements.map((req, index) => (
                      <div key={index} className="flex items-start gap-1.5">
                        <Check className="w-2.5 h-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {recommendation.referral_link && (
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-300">Referral Link:</span>
                    <br />
                    <a 
                      href={recommendation.referral_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-tiptop-purple hover:underline break-all text-[10px]"
                    >
                      {recommendation.referral_link}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PartnerRecommendationCard;
