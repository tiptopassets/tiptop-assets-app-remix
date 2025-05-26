
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AnalysisResults } from '@/types/analysis';
import { useToast } from '@/hooks/use-toast';

interface PropertyAnalysisData {
  address: string;
  coordinates: google.maps.LatLngLiteral | null;
  analysisResults: AnalysisResults;
  propertyType: string;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
}

export const usePropertyPersistence = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<PropertyAnalysisData[]>([]);

  // Save analysis to localStorage
  const saveToLocalStorage = useCallback((data: PropertyAnalysisData) => {
    try {
      localStorage.setItem('tiptop_current_analysis', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  // Load analysis from localStorage
  const loadFromLocalStorage = useCallback((): PropertyAnalysisData | null => {
    try {
      const stored = localStorage.getItem('tiptop_current_analysis');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, []);

  // Save analysis to database (for logged-in users)
  const saveToDatabase = useCallback(async (data: PropertyAnalysisData) => {
    if (!user) return null;

    try {
      setIsLoading(true);
      
      // Direct insert to property_analyses table
      const { data: result, error } = await supabase
        .from('property_analyses')
        .insert({
          user_id: user.id,
          property_address: data.address,
          coordinates: data.coordinates as any,
          analysis_results: data.analysisResults as any,
          property_type: data.propertyType,
          total_monthly_revenue: data.totalMonthlyRevenue,
          total_opportunities: data.totalOpportunities
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Failed to save analysis to database:', error);
      toast({
        title: "Save Failed",
        description: "Could not save analysis to your account",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Load user's saved analyses from database
  const loadFromDatabase = useCallback(async () => {
    if (!user) return [];

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('property_analyses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const analyses = data.map(item => ({
        address: item.property_address,
        coordinates: item.coordinates as unknown as google.maps.LatLngLiteral | null,
        analysisResults: item.analysis_results as unknown as AnalysisResults,
        propertyType: item.property_type || 'Unknown',
        totalMonthlyRevenue: Number(item.total_monthly_revenue) || 0,
        totalOpportunities: item.total_opportunities || 0
      }));

      setSavedAnalyses(analyses);
      return analyses;
    } catch (error) {
      console.error('Failed to load analyses from database:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get current analysis (from state, localStorage, or database)
  const getCurrentAnalysis = useCallback(async (): Promise<PropertyAnalysisData | null> => {
    // First try localStorage
    const localData = loadFromLocalStorage();
    if (localData) return localData;

    // Then try database for logged-in users
    if (user) {
      const dbAnalyses = await loadFromDatabase();
      return dbAnalyses.length > 0 ? dbAnalyses[0] : null;
    }

    return null;
  }, [user, loadFromLocalStorage, loadFromDatabase]);

  // Save analysis (to both localStorage and database)
  const saveAnalysis = useCallback(async (data: PropertyAnalysisData) => {
    // Always save to localStorage
    saveToLocalStorage(data);

    // Save to database if user is logged in
    if (user) {
      await saveToDatabase(data);
      // Refresh the saved analyses list
      await loadFromDatabase();
    }
  }, [user, saveToLocalStorage, saveToDatabase, loadFromDatabase]);

  // Load saved analyses on component mount
  useEffect(() => {
    if (user) {
      loadFromDatabase();
    }
  }, [user, loadFromDatabase]);

  return {
    isLoading,
    savedAnalyses,
    saveAnalysis,
    getCurrentAnalysis,
    loadFromDatabase,
    saveToLocalStorage,
    loadFromLocalStorage
  };
};
