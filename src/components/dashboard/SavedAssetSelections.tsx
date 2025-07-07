import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAssetSelection } from '@/types/userData';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';

interface SavedAssetSelectionsProps {
  className?: string;
}

const SavedAssetSelections: React.FC<SavedAssetSelectionsProps> = ({ className }) => {
  const { assetSelections, loading, error } = useUserAssetSelections();

  console.log('🎯 SavedAssetSelections render:', {
    selectionsCount: assetSelections.length,
    loading,
    error,
    selections: assetSelections
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Selected Assets</CardTitle>
          <CardDescription>Loading your asset selections...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Selected Assets</CardTitle>
          <CardDescription>Error loading asset selections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Failed to load your asset selections: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assetSelections.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Selected Assets</CardTitle>
          <CardDescription>Assets you've chosen to monetize</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No assets selected yet. Complete a property analysis to select assets.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Deduplicate asset selections - keep only the most recent selection for each asset type
  const uniqueAssetSelections = assetSelections.reduce((acc, selection) => {
    const existingIndex = acc.findIndex(existing => 
      existing.asset_type.toLowerCase() === selection.asset_type.toLowerCase()
    );
    
    if (existingIndex === -1) {
      // Asset type not found, add it
      acc.push(selection);
    } else {
      // Asset type exists, keep the more recent one
      const existingDate = new Date(acc[existingIndex].selected_at);
      const currentDate = new Date(selection.selected_at);
      
      if (currentDate > existingDate) {
        acc[existingIndex] = selection;
      }
    }
    
    return acc;
  }, [] as typeof assetSelections);

  const totalMonthlyRevenue = uniqueAssetSelections.reduce((sum, selection) => sum + (selection.monthly_revenue || 0), 0);
  const totalSetupCost = uniqueAssetSelections.reduce((sum, selection) => sum + (selection.setup_cost || 0), 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Your Selected Assets
          <Badge variant="secondary">{uniqueAssetSelections.length} Assets</Badge>
        </CardTitle>
        <CardDescription>
          Assets you've chosen to monetize • ${totalMonthlyRevenue}/month potential • ${totalSetupCost} setup cost
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {uniqueAssetSelections.map((selection, index) => (
            <motion.div
              key={selection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border rounded-lg bg-card/50"
            >
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{selection.asset_type}</h4>
                <p className="text-sm text-muted-foreground">
                  Selected on {new Date(selection.selected_at).toLocaleDateString()}
                </p>
                {selection.asset_data && Object.keys(selection.asset_data).length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Additional data: {JSON.stringify(selection.asset_data)}
                  </div>
                )}
              </div>
              <div className="text-right space-y-1">
                <div className="font-medium text-green-600">
                  ${selection.monthly_revenue}/month
                </div>
                {selection.setup_cost > 0 && (
                  <div className="text-sm text-muted-foreground">
                    ${selection.setup_cost} setup
                  </div>
                )}
                {selection.roi_months && (
                  <div className="text-xs text-muted-foreground">
                    {selection.roi_months} month ROI
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedAssetSelections;