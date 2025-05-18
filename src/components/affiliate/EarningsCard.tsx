
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AffiliateEarning } from '@/hooks/useAffiliateEarnings';

interface EarningsCardProps {
  earnings: AffiliateEarning[];
  lastUpdated: string;
}

const EarningsCard: React.FC<EarningsCardProps> = ({ earnings, lastUpdated }) => {
  // Calculate total earnings
  const totalEarnings = earnings.reduce((sum, earning) => sum + (earning.earnings || 0), 0);
  
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">Total Earnings: ${totalEarnings.toFixed(2)}</p>
      <p className="text-sm text-gray-500">Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'N/A'}</p>
      
      {/* Show earnings breakdown by service */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Earnings By Service</h4>
        <div className="space-y-2">
          {earnings.length > 0 ? (
            earnings.map(earning => (
              <div key={earning.id} className="flex justify-between items-center py-1 border-b border-gray-100">
                <span>{earning.service}</span>
                <span className="font-medium">${earning.earnings.toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No earnings data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsCard;
