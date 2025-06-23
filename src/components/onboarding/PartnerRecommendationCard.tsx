
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, Loader2, DollarSign, Clock, Star } from 'lucide-react';
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
    if (recommendation.referralLink) {
      onIntegrate(recommendation.partnerName, recommendation.referralLink);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'high': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityStars = (score: number) => {
    const stars = Math.min(Math.floor(score / 2), 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className={`glassmorphism-card border-white/20 ${isCompleted ? 'border-green-500/50 bg-green-500/5' : 'hover:border-tiptop-purple/50'} transition-all duration-300`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                {recommendation.partnerName}
                {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">{recommendation.recommendationReason}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                {getPriorityStars(recommendation.priorityScore)}
              </div>
              <Badge className="text-xs capitalize">
                {recommendation.assetType}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-gray-300">
                  ~${Math.round(recommendation.estimatedMonthlyEarnings)}/month
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500" />
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getComplexityColor(recommendation.setupComplexity)}`}
                >
                  {recommendation.setupComplexity} setup
                </Badge>
              </div>
            </div>

            {/* Action button */}
            <div className="flex gap-2">
              {!isCompleted && (
                <Button
                  onClick={handleIntegrate}
                  disabled={isIntegrating || !recommendation.referralLink}
                  className="flex-1 bg-tiptop-purple hover:bg-purple-700 text-white"
                  size="sm"
                >
                  {isIntegrating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Start Integration
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
                className="border-t border-gray-700 pt-3 mt-3"
              >
                <div className="text-sm text-gray-400 space-y-2">
                  <div>
                    <span className="font-medium text-gray-300">Priority Score:</span> {recommendation.priorityScore}/10
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Asset Match:</span> {recommendation.assetType}
                  </div>
                  {recommendation.referralLink && (
                    <div>
                      <span className="font-medium text-gray-300">Referral Link:</span>
                      <br />
                      <a 
                        href={recommendation.referralLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-tiptop-purple hover:underline break-all text-xs"
                      >
                        {recommendation.referralLink}
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PartnerRecommendationCard;
