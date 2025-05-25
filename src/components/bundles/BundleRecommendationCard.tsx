
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BundleRecommendation } from '@/contexts/ServiceProviders/types';
import { Sparkles, Users, DollarSign, Wrench } from 'lucide-react';

interface BundleRecommendationCardProps {
  recommendation: BundleRecommendation;
  onSelectBundle: (recommendation: BundleRecommendation) => void;
  index: number;
}

const BundleRecommendationCard: React.FC<BundleRecommendationCardProps> = ({
  recommendation,
  onSelectBundle,
  index
}) => {
  const { bundle, providers, totalEarnings, matchingAssets, setupCost } = recommendation;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="glass-effect border-tiptop-purple/20 hover:border-tiptop-purple/40 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-tiptop-purple" />
              {bundle.name}
            </CardTitle>
            {index === 0 && (
              <Badge variant="secondary" className="bg-tiptop-purple text-white">
                Recommended
              </Badge>
            )}
          </div>
          <p className="text-gray-300 text-sm">{bundle.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Earnings Potential */}
          <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">Monthly Earnings</span>
            </div>
            <div className="text-green-400 font-bold">
              ${totalEarnings.low} - ${totalEarnings.high}
            </div>
          </div>

          {/* Setup Cost */}
          {setupCost > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-medium">Setup Cost</span>
              </div>
              <div className="text-yellow-400 font-bold">${setupCost}</div>
            </div>
          )}

          {/* Matching Assets */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-medium text-sm">Your Assets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchingAssets.map(asset => (
                <Badge key={asset} variant="outline" className="text-tiptop-purple border-tiptop-purple/30">
                  {asset.replace('_', ' ').charAt(0).toUpperCase() + asset.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Providers */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-white font-medium text-sm">
                {providers.length} Service Providers
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {providers.slice(0, 4).map(provider => (
                <div key={provider.id} className="text-xs text-gray-300 p-2 bg-white/5 rounded">
                  {provider.name}
                </div>
              ))}
              {providers.length > 4 && (
                <div className="text-xs text-gray-400 p-2 bg-white/5 rounded text-center">
                  +{providers.length - 4} more
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={() => onSelectBundle(recommendation)}
            className="w-full bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90"
          >
            Select This Bundle
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BundleRecommendationCard;
