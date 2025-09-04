import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { autoRecoverUserData } from '@/services/dataRecoveryService';

export interface UserProperty {
  id: string;
  address: string;
  formattedAddress?: string;
  coordinates?: any;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  analysisResults: any;
  createdAt: string;
  satelliteImageUrl?: string;
}

export const useUserProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<UserProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProperties = useCallback(async () => {
    if (!user) {
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🏠 [USER-PROPERTIES] Fetching all analyses for user:', user.id);
      
      // Use the new unified RPC function to get all user analyses
      const { data: analysisData, error: analysisError } = await supabase.rpc('get_user_all_analyses', {
        p_user_id: user.id
      });

      if (analysisError) {
        console.error('❌ [USER-PROPERTIES] RPC error:', analysisError);
        throw analysisError;
      }

      if (!analysisData || analysisData.length === 0) {
        console.log('📭 [USER-PROPERTIES] No properties found');
        setProperties([]);
        setSelectedPropertyId(null);
        setLoading(false);
        return;
      }

      // Convert the unified data to UserProperty format
      const properties: UserProperty[] = analysisData.map((analysis) => {
        const address = analysis.property_address || 'Unknown Address';
        
        return {
          id: analysis.id,
          address,
          formattedAddress: analysis.property_address,
          coordinates: analysis.coordinates,
          totalMonthlyRevenue: analysis.total_monthly_revenue || 0,
          totalOpportunities: analysis.total_opportunities || 0,
          analysisResults: analysis.analysis_results,
          createdAt: analysis.created_at,
          satelliteImageUrl: analysis.satellite_image_url
        };
      });
      
      console.log('✅ [USER-PROPERTIES] Loaded properties from unified source:', {
        count: properties.length,
        properties: properties.map(p => ({
          id: p.id,
          address: p.address,
          revenue: p.totalMonthlyRevenue,
          opportunities: p.totalOpportunities,
          source: analysisData.find(a => a.id === p.id)?.source_table
        }))
      });

      setProperties(properties);
      
      // Select the most recent property by default
      if (properties.length > 0 && !selectedPropertyId) {
        console.log('🏠 [USER-PROPERTIES] Auto-selecting most recent property:', properties[0].id);
        setSelectedPropertyId(properties[0].id);
      }

    } catch (err) {
      console.error('❌ [USER-PROPERTIES] Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedPropertyId]);

  useEffect(() => {
    fetchUserProperties();
  }, [fetchUserProperties]);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || null;
  
  const selectProperty = useCallback((propertyId: string) => {
    console.log('🏠 [USER-PROPERTIES] Switching to property:', propertyId);
    setSelectedPropertyId(propertyId);
  }, []);

  return {
    properties,
    selectedProperty,
    selectedPropertyId,
    selectProperty,
    loading,
    error,
    refetch: fetchUserProperties,
    propertiesCount: properties.length
  };
};