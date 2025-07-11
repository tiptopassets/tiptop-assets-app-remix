
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
    if (recommendation.referral_link) {
      onIntegrate(recommendation.partner_name, recommendation.referral_link);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'hard': return 'text-red-500 bg-red-500/10';
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
      className="w-80 flex-shrink-0"
    >
      <Card className={`glassmorphism-card border-white/20 h-auto ${isCompleted ? 'border-green-500/50 bg-green-500/5' : 'hover:border-tiptop-purple/50'} transition-all duration-300`}>
        <CardHeader className="pb-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-1 text-base">
                {recommendation.partner_name}
                {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
              </CardTitle>
              <div className="flex items-center gap-1">
                {getPriorityStars(recommendation.priority_score)}
              </div>
            </div>
            <Badge className="text-xs capitalize w-fit">
              {recommendation.asset_type}
            </Badge>
            <p className="text-gray-400 text-xs leading-tight">{recommendation.recommendation_reason}</p>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Key metrics - stacked vertically */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="w-3 h-3 text-green-500" />
              <span className="text-gray-300">
                ~${Math.round(recommendation.estimated_monthly_earnings)}/month
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3 h-3 text-blue-500" />
              <Badge 
                variant="outline" 
                className={`text-xs ${getComplexityColor(recommendation.setup_complexity)}`}
              >
                {recommendation.setup_complexity} setup
              </Badge>
            </div>
          </div>

          {/* Action buttons - stacked vertically */}
          <div className="space-y-2">
            {!isCompleted && (
              <Button
                onClick={handleIntegrate}
                disabled={isIntegrating || !recommendation.referral_link}
                className="w-full bg-tiptop-purple hover:bg-purple-700 text-white"
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
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
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
              <div className="text-xs text-gray-400 space-y-2">
                <div>
                  <span className="font-medium text-gray-300">Priority Score:</span> {recommendation.priority_score}/10
                </div>
                <div>
                  <span className="font-medium text-gray-300">Asset Match:</span> {recommendation.asset_type}
                </div>
                {recommendation.referral_link && (
                  <div>
                    <span className="font-medium text-gray-300">Referral Link:</span>
                    <br />
                    <a 
                      href={recommendation.referral_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-tiptop-purple hover:underline break-all text-xs"
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
