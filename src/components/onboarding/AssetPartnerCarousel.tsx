import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star } from 'lucide-react';
import { PartnerIntegrationService } from '@/services/partnerIntegrationService';
import { useAuth } from '@/contexts/AuthContext';

interface AssetPartnerCarouselProps {
  selectedAssets: Array<{
    asset_type: string;
    asset_data: any;
  }>;
  onPartnerClick?: (platformId: string, assetType: string) => void;
}

const AssetPartnerCarousel = ({ selectedAssets, onPartnerClick }: AssetPartnerCarouselProps) => {
  const { user } = useAuth();

  // Helper function to safely handle toLowerCase
  const safeToLowerCase = (str: string | undefined | null): string => {
    if (!str || typeof str !== 'string') return 'asset';
    return str.toLowerCase();
  };

  // Helper function to get display name for asset
  const getAssetDisplayName = (assetType: string): string => {
    const cleanType = safeToLowerCase(assetType);
    const displayNames: Record<string, string> = {
      'internet': 'Internet Bandwidth Sharing',
      'bandwidth': 'Internet Bandwidth Sharing',
      'wifi': 'Internet Bandwidth Sharing',
      'pool': 'Swimming Pool',
      'swimming_pool': 'Swimming Pool',
      'parking': 'Parking Space',
      'driveway': 'Parking Space',
      'storage': 'Storage Space',
      'garage': 'Storage Space',
      'basement': 'Storage Space'
    };
    return displayNames[cleanType] || cleanType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get partner platforms for each asset
  const getPartnersForAsset = (assetType: string) => {
    const cleanType = safeToLowerCase(assetType);
    let platforms = PartnerIntegrationService.getPlatformsByAsset(cleanType);
    
    // Special handling for parking - show both SpotHero and Neighbor, prioritize Neighbor
    if (cleanType.includes('parking') || cleanType.includes('driveway')) {
      const neighbor = PartnerIntegrationService.getPlatformById('neighbor');
      const spothero = PartnerIntegrationService.getPlatformById('spothero');
      
      if (neighbor && spothero) {
        // Prioritize Neighbor by giving it priority 1
        return [
          { ...neighbor, priority: 1 },
          { ...spothero, priority: 2 }
        ].sort((a, b) => (a.priority || 999) - (b.priority || 999));
      }
    }
    
    return platforms;
  };

  const handlePartnerClick = (platformId: string, assetType: string) => {
    PartnerIntegrationService.openReferralLink(platformId, user?.id);
    onPartnerClick?.(platformId, assetType);
  };

  // Don't render if no selected assets
  if (!selectedAssets || selectedAssets.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className="mb-2">
        <p className="text-xs text-muted-foreground">Ready to start earning? Click to set up:</p>
      </div>
      
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {selectedAssets.map((selection, index) => {
          const assetType = selection.asset_type;
          const displayName = getAssetDisplayName(assetType);
          const partners = getPartnersForAsset(assetType);
          
          return partners.map((partner, partnerIndex) => (
            <motion.div
              key={`${index}-${partnerIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (index * partners.length + partnerIndex) * 0.1 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePartnerClick(partner.id, assetType)}
                className="h-auto p-2 flex flex-col items-start bg-white hover:bg-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-200"
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-medium text-primary">
                    {displayName}
                  </span>
                  {partner.priority === 1 && (
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {partner.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                
                <Badge variant="secondary" className="mt-1 text-xs h-4">
                  ${partner.earningRange.min}-${partner.earningRange.max}/month
                </Badge>
              </Button>
            </motion.div>
          ));
        })}
      </div>
    </motion.div>
  );
};

export default AssetPartnerCarousel;