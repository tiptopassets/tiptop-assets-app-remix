
import React from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import PropertyTypeDetector from '@/components/property-analysis/PropertyTypeDetector';
import ServiceAvailabilityChecker from '@/components/property-analysis/ServiceAvailabilityChecker';
import MarketPricingEngine from '@/components/property-analysis/MarketPricingEngine';

interface PropertyInsightsProps {
  localAnalysis: PropertyAnalysis;
  coordinates?: google.maps.LatLngLiteral;
  address?: string;
}

const PropertyInsights = ({ localAnalysis, coordinates, address }: PropertyInsightsProps) => {
  return (
    <>
      {/* Enhanced Property Type Detection */}
      <div className="mb-4">
        <PropertyTypeDetector 
          propertyType={localAnalysis.propertyType} 
          confidence={0.85}
        />
      </div>

      {/* Market Insights */}
      {coordinates && (
        <div className="mb-4">
          <MarketPricingEngine 
            coordinates={coordinates}
            propertyType={localAnalysis.propertyType}
          />
        </div>
      )}

      {/* Service Availability */}
      {coordinates && address && (
        <div className="mb-4">
          <ServiceAvailabilityChecker 
            coordinates={coordinates}
            address={address}
          />
        </div>
      )}
    </>
  );
};

export default PropertyInsights;
