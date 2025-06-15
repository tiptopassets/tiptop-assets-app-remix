
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';

export interface UserAddress {
  id: string;
  user_id: string;
  address: string;
  formatted_address?: string;
  coordinates?: any;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPropertyAnalysis {
  id: string;
  user_id: string;
  address_id: string;
  analysis_results: AnalysisResults;
  analysis_version: string;
  total_monthly_revenue: number;
  total_opportunities: number;
  property_type?: string;
  coordinates?: any;
  using_real_solar_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAssetSelection {
  id: string;
  user_id: string;
  analysis_id: string;
  asset_type: string;
  asset_data: any;
  monthly_revenue: number;
  setup_cost: number;
  roi_months?: number;
  selected_at: string;
  status: string;
}

export interface UserDashboardPreferences {
  id: string;
  user_id: string;
  primary_address_id?: string;
  dashboard_layout: any;
  notification_settings: any;
  created_at: string;
  updated_at: string;
}

export const useUserData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [analyses, setAnalyses] = useState<UserPropertyAnalysis[]>([]);
  const [assetSelections, setAssetSelections] = useState<UserAssetSelection[]>([]);
  const [dashboardPreferences, setDashboardPreferences] = useState<UserDashboardPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save address to database
  const saveAddress = async (address: string, coordinates?: any, formattedAddress?: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          address,
          formatted_address: formattedAddress || address,
          coordinates,
          is_primary: addresses.length === 0 // First address is primary
        })
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => [...prev, data]);
      return data.id;
    } catch (err) {
      console.error('Error saving address:', err);
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive"
      });
      return null;
    }
  };

  // Save property analysis to database
  const savePropertyAnalysis = async (
    addressId: string, 
    analysisResults: AnalysisResults,
    coordinates?: any
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const totalRevenue = analysisResults.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0);
      
      const { data, error } = await supabase
        .from('user_property_analyses')
        .insert({
          user_id: user.id,
          address_id: addressId,
          analysis_results: analysisResults as any, // Cast to any for Json compatibility
          total_monthly_revenue: totalRevenue,
          total_opportunities: analysisResults.topOpportunities.length,
          property_type: analysisResults.propertyType,
          coordinates,
          using_real_solar_data: analysisResults.rooftop.usingRealSolarData || false
        })
        .select()
        .single();

      if (error) throw error;

      // Convert the response data to match our interface
      const analysisData: UserPropertyAnalysis = {
        ...data,
        analysis_results: data.analysis_results as AnalysisResults
      };

      setAnalyses(prev => [...prev, analysisData]);
      return data.id;
    } catch (err) {
      console.error('Error saving property analysis:', err);
      toast({
        title: "Error",
        description: "Failed to save property analysis",
        variant: "destructive"
      });
      return null;
    }
  };

  // Save asset selection to database
  const saveAssetSelection = async (
    analysisId: string,
    assetType: string,
    assetData: any,
    monthlyRevenue: number,
    setupCost: number = 0,
    roiMonths?: number
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_asset_selections')
        .insert({
          user_id: user.id,
          analysis_id: analysisId,
          asset_type: assetType,
          asset_data: assetData,
          monthly_revenue: monthlyRevenue,
          setup_cost: setupCost,
          roi_months: roiMonths,
          status: 'selected'
        })
        .select()
        .single();

      if (error) throw error;

      setAssetSelections(prev => [...prev, data]);
      return data.id;
    } catch (err) {
      console.error('Error saving asset selection:', err);
      toast({
        title: "Error",
        description: "Failed to save asset selection",
        variant: "destructive"
      });
      return null;
    }
  };

  // Load user data
  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Load addresses
      const { data: addressData, error: addressError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (addressError) throw addressError;
      setAddresses(addressData || []);

      // Load analyses
      const { data: analysisData, error: analysisError } = await supabase
        .from('user_property_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (analysisError) throw analysisError;
      
      // Convert analysis data to match our interface
      const typedAnalysisData: UserPropertyAnalysis[] = (analysisData || []).map(item => ({
        ...item,
        analysis_results: item.analysis_results as AnalysisResults
      }));
      
      setAnalyses(typedAnalysisData);

      // Load asset selections
      const { data: assetData, error: assetError } = await supabase
        .from('user_asset_selections')
        .select('*')
        .eq('user_id', user.id)
        .order('selected_at', { ascending: false });

      if (assetError) throw assetError;
      setAssetSelections(assetData || []);

      // Load dashboard preferences
      const { data: prefData, error: prefError } = await supabase
        .from('user_dashboard_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefError && prefError.code !== 'PGRST116') throw prefError;
      setDashboardPreferences(prefData || null);

    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
      toast({
        title: "Error",
        description: "Failed to load your data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get primary address
  const getPrimaryAddress = (): UserAddress | null => {
    return addresses.find(addr => addr.is_primary) || addresses[0] || null;
  };

  // Get latest analysis
  const getLatestAnalysis = (): UserPropertyAnalysis | null => {
    return analyses[0] || null;
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setAddresses([]);
      setAnalyses([]);
      setAssetSelections([]);
      setDashboardPreferences(null);
    }
  }, [user]);

  return {
    addresses,
    analyses,
    assetSelections,
    dashboardPreferences,
    loading,
    error,
    saveAddress,
    savePropertyAnalysis,
    saveAssetSelection,
    loadUserData,
    getPrimaryAddress,
    getLatestAnalysis
  };
};
