
import React from 'react';
import { AnalysisResults } from '@/types/analysis';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';

export interface AssetsTableProps {
  analysisResults: AnalysisResults;
}

export const AssetsTable = ({ analysisResults }: AssetsTableProps) => {
  const assets = [
    {
      name: 'Rooftop Solar',
      potential: analysisResults.rooftop?.revenue > 0,
      area: `${analysisResults.rooftop?.area || 0} sq ft`,
      monthlyRevenue: `$${analysisResults.rooftop?.revenue || 0}`,
      setupCost: `$${analysisResults.rooftop?.providers?.[0]?.setupCost || 'N/A'}`,
    },
    {
      name: 'Garden/Yard Space',
      potential: analysisResults.garden?.opportunity !== 'Low',
      area: `${analysisResults.garden?.area || 0} sq ft`,
      monthlyRevenue: `$${analysisResults.garden?.revenue || 0}`,
      setupCost: `$${analysisResults.garden?.providers?.[0]?.setupCost || 'N/A'}`,
    },
    {
      name: 'Parking Spaces',
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

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Type</TableHead>
            <TableHead>Potential</TableHead>
            <TableHead>Size/Quantity</TableHead>
            <TableHead>Monthly Revenue</TableHead>
            <TableHead>Setup Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset, index) => (
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
            </TableRow>
          ))}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={3} className="font-bold text-right">Total Monthly Potential</TableCell>
            <TableCell className="font-bold text-green-600">${totalMonthlyRevenue}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
