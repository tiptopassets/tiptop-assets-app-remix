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
      
      console.log('🏠 [USER-PROPERTIES] Fetching all properties for user:', user.id);
      
      // Run auto-recovery first
      await autoRecoverUserData(user.id);

      // Fetch all property analyses for the user
      const { data: analysisData, error: analysisError } = await supabase
        .from('user_property_analyses')
        .select(`
          id,
          analysis_results,
          total_monthly_revenue,
          total_opportunities,
          coordinates,
          satellite_image_url,
          created_at,
          address_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (analysisError) {
        throw analysisError;
      }

      if (!analysisData || analysisData.length === 0) {
        console.log('📭 [USER-PROPERTIES] No properties found');
        setProperties([]);
        setSelectedPropertyId(null);
        setLoading(false);
        return;
      }

      // Fetch address data for each analysis
      const propertyPromises = analysisData.map(async (analysis) => {
        let address = 'Unknown Address';
        let formattedAddress = undefined;

        if (analysis.address_id) {
          const { data: addressData } = await supabase
            .from('user_addresses')
            .select('address, formatted_address')
            .eq('id', analysis.address_id)
            .maybeSingle();
          
          if (addressData) {
            address = addressData.formatted_address || addressData.address || 'Unknown Address';
            formattedAddress = addressData.formatted_address;
          }
        }

        // Extract address from analysis results if not found in addresses table
        if (address === 'Unknown Address' && analysis.analysis_results && 
            typeof analysis.analysis_results === 'object' && 
            !Array.isArray(analysis.analysis_results) &&
            (analysis.analysis_results as any).propertyAddress) {
          address = (analysis.analysis_results as any).propertyAddress;
        }

        return {
          id: analysis.id,
          address,
          formattedAddress,
          coordinates: analysis.coordinates,
          totalMonthlyRevenue: analysis.total_monthly_revenue || 0,
          totalOpportunities: analysis.total_opportunities || 0,
          analysisResults: analysis.analysis_results,
          createdAt: analysis.created_at,
          satelliteImageUrl: analysis.satellite_image_url
        } as UserProperty;
      });

      const properties = await Promise.all(propertyPromises);
      
      console.log('✅ [USER-PROPERTIES] Loaded properties:', {
        count: properties.length,
        properties: properties.map(p => ({
          id: p.id,
          address: p.address,
          revenue: p.totalMonthlyRevenue,
          opportunities: p.totalOpportunities
        }))
      });

      setProperties(properties);
      
      // Select the most recent property by default
      if (properties.length > 0 && !selectedPropertyId) {
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