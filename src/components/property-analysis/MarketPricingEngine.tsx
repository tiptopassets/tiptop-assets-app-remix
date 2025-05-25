
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketData {
  averageRent: number;
  solarSavings: number;
  parkingRates: number;
  marketTrend: 'up' | 'down' | 'stable';
  confidence: number;
}

interface MarketPricingEngineProps {
  coordinates: google.maps.LatLngLiteral;
  propertyType: string;
}

const MarketPricingEngine = ({ coordinates, propertyType }: MarketPricingEngineProps) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, [coordinates, propertyType]);

  const fetchMarketData = async () => {
    setLoading(true);
    
    // Simulate market data fetching
    // In production, this would integrate with real estate APIs
    setTimeout(() => {
      const mockData: MarketData = {
        averageRent: getEstimatedRent(coordinates),
        solarSavings: getEstimatedSolarSavings(coordinates),
        parkingRates: getEstimatedParkingRates(coordinates),
        marketTrend: Math.random() > 0.5 ? 'up' : 'stable',
        confidence: 0.85
      };
      
      setMarketData(mockData);
      setLoading(false);
    }, 1500);
  };

  const getEstimatedRent = (coords: google.maps.LatLngLiteral): number => {
    // Simple market estimation based on location
    // Major cities: higher rent
    const majorCities = [
      { lat: 40.7128, lng: -74.0060, rent: 3500 }, // NYC
      { lat: 34.0522, lng: -118.2437, rent: 2800 }, // LA
      { lat: 37.7749, lng: -122.4194, rent: 4200 }, // SF
      { lat: 41.8781, lng: -87.6298, rent: 2200 }, // Chicago
    ];

    let closestCity = majorCities[0];
    let minDistance = Infinity;

    majorCities.forEach(city => {
      const distance = Math.sqrt(
        Math.pow(coords.lat - city.lat, 2) + Math.pow(coords.lng - city.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    });

    // Adjust rent based on distance from major city
    const distanceFactor = Math.max(0.3, 1 - minDistance * 10);
    return Math.round(closestCity.rent * distanceFactor);
  };

  const getEstimatedSolarSavings = (coords: google.maps.LatLngLiteral): number => {
    // Solar savings based on latitude (sun exposure)
    const latitudeFactor = Math.max(0.5, 1 - Math.abs(coords.lat - 35) / 20);
    return Math.round(150 * latitudeFactor);
  };

  const getEstimatedParkingRates = (coords: google.maps.LatLngLiteral): number => {
    // Parking rates based on urban density estimation
    const urbanDensity = Math.max(0.3, 1 - Math.min(Math.abs(coords.lat - 40), Math.abs(coords.lng + 74)) / 10);
    return Math.round(15 * urbanDensity);
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
    </div>
  );
};

export default MarketPricingEngine;
