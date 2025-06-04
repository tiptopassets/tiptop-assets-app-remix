
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getMarketData } from '@/utils/marketDataService';

interface MarketPricingEngineProps {
  coordinates: google.maps.LatLngLiteral;
  propertyType: string;
}

const MarketPricingEngine = ({ coordinates, propertyType }: MarketPricingEngineProps) => {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, [coordinates, propertyType]);

  const fetchMarketData = async () => {
    setLoading(true);
    
    console.log('🏢 MarketPricingEngine fetching data for:', {
      coordinates,
      propertyType
    });
    
    // Use the centralized market data service for consistent pricing
    setTimeout(() => {
      const data = getMarketData(coordinates);
      console.log('📊 MarketPricingEngine received data:', data);
      setMarketData(data);
      setLoading(false);
    }, 1500);
  };

  const getTrendIcon = () => {
    if (!marketData) return null;
    
    switch (marketData.marketTrend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!marketData) return null;

  return (
    <div className="p-4 bg-blue-50 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-blue-900">Local Market Insights</h4>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className="text-xs text-gray-600">
            {Math.round(marketData.confidence * 100)}% confidence
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-gray-600">Avg. Rent</p>
          <p className="text-sm font-semibold text-blue-800">${marketData.averageRent}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Solar Savings</p>
          <p className="text-sm font-semibold text-green-600">${marketData.solarSavings}/mo</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Parking Rate</p>
          <p className="text-sm font-semibold text-purple-600">${marketData.parkingRates}/day</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-600">
        Market trends show {marketData.marketTrend === 'up' ? 'increasing' : marketData.marketTrend === 'down' ? 'decreasing' : 'stable'} 
        {' '}demand for monetization opportunities in this area.
      </p>
      
      <div className="text-xs text-gray-500 italic mt-2 p-2 bg-white/50 rounded">
        <strong>Data Source:</strong> Authoritative parking rates calculated using location-based market analysis
        <br />
        <strong>Coordinates:</strong> {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
      </div>
    </div>
  );
};

export default MarketPricingEngine;
