
import React from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import ServiceProviders from './ServiceProviders';

interface ExpandedAnalysisProps {
  analysisResults: PropertyAnalysis;
  showFullAnalysis: boolean;
}

const ExpandedAnalysis = ({ analysisResults, showFullAnalysis }: ExpandedAnalysisProps) => {
  if (!showFullAnalysis) return null;
  
  return (
    <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
      {/* Service Provider Recommendations */}
      <div className="space-y-3">
        <h3 className="text-md font-medium text-white">Service Provider Recommendations</h3>
        
        {/* Roof/Solar Providers */}
        {analysisResults.rooftop?.providers && analysisResults.rooftop.providers.length > 0 && (
          <ServiceProviders 
            title="Solar Panel Providers" 
            providers={analysisResults.rooftop.providers} 
          />
        )}
        
        {/* Parking Providers */}
        {analysisResults.parking?.providers && analysisResults.parking.providers.length > 0 && (
          <ServiceProviders 
            title="Parking Rental Platforms" 
            providers={analysisResults.parking.providers}
          />
        )}
        
        {/* Pool Providers (if applicable) */}
        {analysisResults.pool?.present && analysisResults.pool?.providers && analysisResults.pool.providers.length > 0 && (
          <ServiceProviders 
            title="Pool Rental Platforms" 
            providers={analysisResults.pool.providers} 
          />
        )}
      </div>
      
      {/* Permits & Restrictions */}
      {(analysisResults.permits?.length > 0 || analysisResults.restrictions) && (
        <div className="mt-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
          <h3 className="font-medium mb-2 text-sm">Important Considerations</h3>
          
          {analysisResults.permits?.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-yellow-200">Required Permits:</p>
              <ul className="list-disc list-inside text-xs text-gray-300">
                {analysisResults.permits.slice(0, 3).map((permit, i) => (
                  <li key={i}>{permit}</li>
                ))}
              </ul>
            </div>
          )}
          
          {analysisResults.restrictions && (
            <div>
              <p className="text-xs font-medium text-yellow-200">Restrictions:</p>
              <p className="text-xs text-gray-300">{analysisResults.restrictions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpandedAnalysis;
