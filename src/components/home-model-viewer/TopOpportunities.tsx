
import React from 'react';
import { AnalysisResults as PropertyAnalysis } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface TopOpportunitiesProps {
  analysisResults: PropertyAnalysis;
}

const TopOpportunities = ({ analysisResults }: TopOpportunitiesProps) => {
  if (!analysisResults.topOpportunities || analysisResults.topOpportunities.length === 0) {
    return null;
  }
  
  const renderConfidenceBadge = (score: number | null | undefined) => {
    if (!score) return null;
    
    let badgeClass = '';
    
    if (score >= 80) {
      badgeClass = 'bg-green-500/20 text-green-300 border-green-500/30';
    } else if (score >= 60) {
      badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    } else {
      badgeClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-xs ${badgeClass} ml-2`}>
            {score}% confidence
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 text-white">
          <p>This estimate has a {score}% confidence score based on available measurements</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium text-white mb-2">Top Income Opportunities</h3>
      <div className="space-y-2">
        {analysisResults.topOpportunities.slice(0, 3).map((opp, index) => (
          <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-tiptop-purple font-medium">{opp.title}</span>
                {renderConfidenceBadge(opp.confidenceScore)}
              </div>
              
              <div className="text-xs text-gray-300 mt-1">
                {opp.description}
              </div>
              
              {opp.provider && (
                <div className="text-xs text-gray-400 flex items-center mt-1">
                  via {opp.provider}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-2">
                        <InfoCircledIcon className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white">
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Provider details:</p>
                          {opp.setupCost !== undefined && (
                            <p className="text-xs">Setup cost: ${opp.setupCost}</p>
                          )}
                          {opp.roi !== undefined && (
                            <p className="text-xs">ROI: {opp.roi} months</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
            
            <div className="text-right ml-4">
              <div className="text-sm text-green-400 font-medium">${opp.monthlyRevenue}/mo</div>
              {opp.setupCost !== undefined && opp.setupCost > 0 && (
                <div className="text-xs text-gray-400">${opp.setupCost} setup</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {analysisResults.topOpportunities.length > 3 && (
        <div className="text-center mt-2">
          <span className="text-xs text-tiptop-purple cursor-pointer hover:underline">
            +{analysisResults.topOpportunities.length - 3} more opportunities
          </span>
        </div>
      )}
    </div>
  );
};

export default TopOpportunities;
