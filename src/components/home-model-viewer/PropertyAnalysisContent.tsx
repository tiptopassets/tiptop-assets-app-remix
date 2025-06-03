
import React, { useState } from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import PropertyTypeDetector from '@/components/property-analysis/PropertyTypeDetector';
import ServiceAvailabilityChecker from '@/components/property-analysis/ServiceAvailabilityChecker';
import MarketPricingEngine from '@/components/property-analysis/MarketPricingEngine';
import PropertyTabsNavigation from './PropertyTabsNavigation';
import OverviewTab from './OverviewTab';
import SolarTab from './SolarTab';
import AssetsTab from './AssetsTab';

interface PropertyAnalysisContentProps {
  analysisResults: PropertyAnalysis;
  showFullAnalysis: boolean;
  coordinates?: google.maps.LatLngLiteral;
  address?: string;
}

const PropertyAnalysisContent = ({ 
  analysisResults, 
  showFullAnalysis,
  coordinates,
  address 
}: PropertyAnalysisContentProps) => {
  const [localAnalysis, setLocalAnalysis] = useState<PropertyAnalysis>(analysisResults);
  const [showManualAdjustment, setShowManualAdjustment] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Handle adjustments to values like parking spaces
  const handleParkingSpacesChange = (value: number[]) => {
    const newSpaces = value[0];
    
    // Update the parking spaces and recalculate the revenue
    const updatedAnalysis = {
      ...localAnalysis,
      parking: {
        ...localAnalysis.parking,
        spaces: newSpaces,
        revenue: calculateParkingRevenue(newSpaces, localAnalysis.parking.rate || 10)
      }
    };
    
    // Update any related top opportunities
    const parkingOpportunityIndex = updatedAnalysis.topOpportunities.findIndex(
      opp => opp.title.toLowerCase().includes('parking')
    );
    
    if (parkingOpportunityIndex >= 0) {
      updatedAnalysis.topOpportunities[parkingOpportunityIndex] = {
        ...updatedAnalysis.topOpportunities[parkingOpportunityIndex],
        monthlyRevenue: updatedAnalysis.parking.revenue,
        description: `Rent out ${newSpaces} parking spaces at $${localAnalysis.parking.rate} per day.`
      };
    }
    
    setLocalAnalysis(updatedAnalysis);
  };
  
  // Calculate parking revenue based on spaces and rate
  const calculateParkingRevenue = (spaces: number, rate: number) => {
    // Assuming average occupancy of 80% and 30 days per month
    return Math.round(spaces * rate * 0.8 * 30);
  };
  
  return (
    <div className="p-4 md:p-6">
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

      {/* Main Analysis Tabs */}
      <PropertyTabsNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <OverviewTab
        localAnalysis={localAnalysis}
        showManualAdjustment={showManualAdjustment}
        setShowManualAdjustment={setShowManualAdjustment}
        handleParkingSpacesChange={handleParkingSpacesChange}
        calculateParkingRevenue={calculateParkingRevenue}
      />
      
      <SolarTab 
        localAnalysis={localAnalysis}
        address={address}
      />
      
      <AssetsTab localAnalysis={localAnalysis} />
    </div>
  );
};

export default PropertyAnalysisContent;
