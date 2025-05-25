
import React from 'react';

interface FlexOffersSectionProps {
  hasFlexOffers: boolean;
  flexoffersSubId: string | null;
}

const FlexOffersSection: React.FC<FlexOffersSectionProps> = ({ hasFlexOffers, flexoffersSubId }) => {
  if (!hasFlexOffers) {
    return null;
  }
  
  return (
    <div className="mt-4 p-3 bg-violet-50 rounded-md">
      <h4 className="text-sm font-medium mb-1">FlexOffers Integration</h4>
      {flexoffersSubId ? (
        <div className="text-xs text-gray-600">
          <p>Your Sub-Affiliate ID: <span className="font-mono bg-gray-100 px-1 rounded">{flexoffersSubId}</span></p>
          <p className="mt-1">Use this ID when creating affiliate links or when receiving postbacks.</p>
        </div>
      ) : (
        <p className="text-xs text-gray-600">FlexOffers integration set up. Contact support to get your sub-affiliate ID.</p>
      )}
    </div>
  );
};

export default FlexOffersSection;
