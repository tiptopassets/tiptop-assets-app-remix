
import React from 'react';
import { PropertyAnalysis } from '@/types/analysis';

interface TopOpportunitiesProps {
  analysisResults: PropertyAnalysis;
}

const TopOpportunities = ({ analysisResults }: TopOpportunitiesProps) => {
  if (!analysisResults.topOpportunities || analysisResults.topOpportunities.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-md font-medium text-white mb-2">Top Opportunities</h3>
      <div className="space-y-2">
        {analysisResults.topOpportunities.slice(0, 3).map((opp, index) => (
          <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
            <div className="flex items-center">
              <span className="text-tiptop-purple font-medium">{opp.title}</span>
              {opp.provider && (
                <span className="text-xs text-gray-400 ml-2">via {opp.provider}</span>
              )}
            </div>
            <div className="flex items-center">
              {opp.setupCost > 0 && (
                <span className="text-xs text-gray-400 mr-2">${opp.setupCost} setup</span>
              )}
              <span className="text-sm text-green-400">${opp.monthlyRevenue}/mo</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopOpportunities;
