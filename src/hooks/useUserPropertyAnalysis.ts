
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getRecentAnalysisId, autoRecoverUserData } from '@/services/dataRecoveryService';
import { safeAssetName, safeAssetType } from '@/utils/safeAssetUtils';

export interface AssetInfo {
  type: string;
  name: string;
  monthlyRevenue: number;
  setupCost: number;
  description: string;
  hasRevenuePotential: boolean;
  isConfigured: boolean;
  area?: number;
}

export interface PropertyAnalysisData {
  analysisId: string;
  address: string;
  coordinates?: any;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  availableAssets: AssetInfo[];
  selectedAssets?: string[]; // Add selectedAssets property
  analysisResults: any;
}

export const useUserPropertyAnalysis = (targetAnalysisId?: string) => {
  const { user } = useAuth();
  const [propertyData, setPropertyData] = useState<PropertyAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPropertyData(null);
      setLoading(false);
      return;
    }

    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [PROPERTY-ANALYSIS] Fetching data for user:', user.id);
        console.log('🎯 [PROPERTY-ANALYSIS] Target analysis ID:', targetAnalysisId);

        // Run auto-recovery first
        await autoRecoverUserData(user.id);

        // Determine which analysis to fetch
        let analysisId = targetAnalysisId;
        
        if (!analysisId) {
          // Get the most recent analysis
          analysisId = await getRecentAnalysisId(user.id);
          console.log('📊 [PROPERTY-ANALYSIS] Using recent analysis ID:', analysisId);
        }

        if (!analysisId) {
          console.log('❌ [PROPERTY-ANALYSIS] No analysis ID found');
          setPropertyData(null);
          setLoading(false);
          return;
        }

        // Fetch analysis data with address information
        const { data: analysisData, error: analysisError } = await supabase
          .from('user_property_analyses')
          .select(`
            id,
            analysis_results,
            total_monthly_revenue,
            total_opportunities,
            coordinates,
            user_addresses!inner(
              address,
              formatted_address,
              coordinates
            )
          `)
          .eq('id', analysisId)
          .eq('user_id', user.id)
          .single();

        if (analysisError) {
          console.error('❌ [PROPERTY-ANALYSIS] Error fetching analysis:', analysisError);
          throw analysisError;
        }

        if (!analysisData) {
          console.log('❌ [PROPERTY-ANALYSIS] No analysis data found');
          setPropertyData(null);
          setLoading(false);
          return;
        }

        console.log('✅ [PROPERTY-ANALYSIS] Analysis data retrieved:', {
          id: analysisData.id,
          address: analysisData.user_addresses?.address,
          totalRevenue: analysisData.total_monthly_revenue,
          totalOpportunities: analysisData.total_opportunities
        });

        // Process analysis results to extract available assets
        const analysisResults = analysisData.analysis_results;
        const availableAssets: AssetInfo[] = [];

        // Extract assets from analysis results with proper type checking
        if (analysisResults && typeof analysisResults === 'object' && 'topOpportunities' in analysisResults) {
          const topOpportunities = (analysisResults as any).topOpportunities;
          if (Array.isArray(topOpportunities)) {
            for (const opportunity of topOpportunities) {
              // Use safe utility functions to prevent errors
              const safeName = safeAssetName(opportunity.title);
              const safeType = safeAssetType(opportunity.title);
              
              availableAssets.push({
                type: safeType,
                name: safeName,
                monthlyRevenue: opportunity.monthlyRevenue || 0,
                setupCost: opportunity.setupCost || 0,
                description: opportunity.description || `Monetize your ${safeName.toLowerCase()}`,
                hasRevenuePotential: (opportunity.monthlyRevenue || 0) > 0,
                isConfigured: false
              });
            }
          }
        }

        // Fetch user asset selections to populate selectedAssets
        let selectedAssets: string[] = [];
        if (user?.id) {
          const { data: assetSelections } = await supabase
            .from('user_asset_selections')
            .select('asset_type')
            .eq('user_id', user.id)
            .eq('analysis_id', analysisId);
          
          if (assetSelections) {
            selectedAssets = assetSelections.map(selection => selection.asset_type);
          }
        }

        // Ensure we have address information
        const addressInfo = analysisData.user_addresses;
        if (!addressInfo) {
          throw new Error('Address information not found for analysis');
        }

        const propertyData: PropertyAnalysisData = {
          analysisId: analysisData.id,
          address: addressInfo.formatted_address || addressInfo.address,
          coordinates: analysisData.coordinates || addressInfo.coordinates,
          totalMonthlyRevenue: analysisData.total_monthly_revenue || 0,
          totalOpportunities: analysisData.total_opportunities || 0,
          availableAssets,
          selectedAssets,
          analysisResults
        };

        console.log('✅ [PROPERTY-ANALYSIS] Property data processed:', {
          analysisId: propertyData.analysisId,
          address: propertyData.address,
          assetsCount: propertyData.availableAssets.length,
          totalRevenue: propertyData.totalMonthlyRevenue
        });

        setPropertyData(propertyData);

      } catch (err) {
        console.error('❌ [PROPERTY-ANALYSIS] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch property data');
        setPropertyData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [user, targetAnalysisId]);

  return {
    propertyData,
    loading,
    error,
    hasPropertyData: !!propertyData
  };
};
