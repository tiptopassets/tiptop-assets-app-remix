import React from 'react';
import { AnalysisResults } from '@/types/analysis';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ExternalLink, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAssetsCards } from './MobileAssetsCards';

export interface AssetsTableProps {
  analysisResults: AnalysisResults;
  isAssetConfigured?: (assetType: string) => boolean;
  analysisId?: string;
}

export const AssetsTable = ({ analysisResults, isAssetConfigured, analysisId }: AssetsTableProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleStartConfiguration = (assetType: string) => {
    // Navigate to the Enhanced Onboarding Chatbot with both analysis ID and asset-specific context
    const params = new URLSearchParams();
    if (analysisId) {
      params.set('analysisId', analysisId);
    }
    params.set('asset', assetType.toLowerCase());
    navigate(`/dashboard/onboarding?${params.toString()}`);
  };

  const handleExploreMoreAssets = () => {
    navigate('/dashboard/add-asset');
  };

  const assets = [
    {
      name: 'Rooftop Solar',
      type: 'rooftop',
      potential: analysisResults.rooftop?.revenue > 0,
      area: `${analysisResults.rooftop?.area || 0} sq ft`,
      monthlyRevenue: `$${analysisResults.rooftop?.revenue || 0}`,
      setupCost: `$${analysisResults.rooftop?.providers?.[0]?.setupCost || 'N/A'}`,
    },
    {
      name: 'Garden/Yard Space',
      type: 'garden',
      potential: analysisResults.garden?.opportunity !== 'Low',
      area: `${analysisResults.garden?.area || 0} sq ft`,
      monthlyRevenue: `$${analysisResults.garden?.revenue || 0}`,
      setupCost: `$${analysisResults.garden?.providers?.[0]?.setupCost || 'N/A'}`,
    },
    {
      name: 'Parking Spaces',
      type: 'parking',
      potential: analysisResults.parking?.spaces > 0,
      area: `${analysisResults.parking?.spaces || 0} spaces`,
      monthlyRevenue: `$${analysisResults.parking?.revenue || 0}`,
      setupCost: `$${analysisResults.parking?.providers?.[0]?.setupCost || 'N/A'}`,
    }
  ];

  // Add pool if it's present
  if (analysisResults.pool && analysisResults.pool.present) {
    assets.push({
      name: 'Swimming Pool',
      type: 'pool',
      potential: true,
      area: `${analysisResults.pool.area || 0} sq ft`,
      monthlyRevenue: `$${analysisResults.pool.revenue || 0}`,
      setupCost: `$${analysisResults.pool.providers?.[0]?.setupCost || 'N/A'}`,
    });
  }

  // Add internet bandwidth sharing if available
  if (analysisResults.bandwidth && analysisResults.bandwidth.available > 0) {
    assets.push({
      name: 'Internet Bandwidth',
      type: 'bandwidth',
      potential: true,
      area: `${analysisResults.bandwidth.available} Mbps`,
      monthlyRevenue: `$${analysisResults.bandwidth.revenue || 0}`,
      setupCost: 'Minimal',
    });
  }

  // Add EV charging if potential exists
  if (analysisResults.parking?.evChargerPotential) {
    assets.push({
      name: 'EV Charging',
      type: 'ev_charging',
      potential: true,
      area: 'Available',
      monthlyRevenue: `$${Math.round(analysisResults.parking.revenue * 1.5) || 0}`,
      setupCost: '$1,200-$2,000',
    });
  }

  const totalMonthlyRevenue = assets.reduce((sum, asset) => {
    const revenue = parseFloat(asset.monthlyRevenue.replace('$', '')) || 0;
    return sum + revenue;
  }, 0);

  // Use mobile cards on small screens
  if (isMobile) {
    return <MobileAssetsCards analysisResults={analysisResults} isAssetConfigured={isAssetConfigured} analysisId={analysisId} />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Type</TableHead>
            <TableHead>Potential</TableHead>
            <TableHead>Size/Quantity</TableHead>
            <TableHead>Monthly Revenue</TableHead>
            <TableHead>Setup Cost</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset, index) => {
            const isConfigured = isAssetConfigured ? isAssetConfigured(asset.type) : false;
            
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>
                  {asset.potential ? 
                    <Check className="h-5 w-5 text-green-500" /> : 
                    <X className="h-5 w-5 text-red-500" />}
                </TableCell>
                <TableCell>{asset.area}</TableCell>
                <TableCell>{asset.monthlyRevenue}</TableCell>
                <TableCell>{asset.setupCost}</TableCell>
                <TableCell>
                  {!asset.potential ? (
                    <Badge variant="secondary">Not Available</Badge>
                  ) : isConfigured ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Selected
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-tiptop-purple hover:bg-purple-600 text-white text-xs px-3 py-1 h-7"
                      onClick={() => handleStartConfiguration(asset.type)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Start Now
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={4} className="font-bold text-right">Total Monthly Potential</TableCell>
            <TableCell className="font-bold text-green-600">${totalMonthlyRevenue}</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow className="border-t-2 border-gray-200">
            <TableCell colSpan={6} className="text-center py-4">
              <Button
                onClick={handleExploreMoreAssets}
                className="bg-tiptop-purple hover:bg-purple-600 text-white px-6 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Explore More Assets
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
