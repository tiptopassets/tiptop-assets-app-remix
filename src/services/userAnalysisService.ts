
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';
import { UserPropertyAnalysis } from '@/types/userData';

export const savePropertyAnalysis = async (
  userId: string,
  addressId: string,
  analysisResults: AnalysisResults,
  coordinates?: any,
  satelliteImageUrl?: string
): Promise<string | null> => {
  try {
    console.log('💾 [ANALYSIS SAVE] Starting property analysis save:', { 
      userId, 
      addressId, 
      satelliteImageUrl,
      analysisResultsData: {
        propertyType: analysisResults.propertyType,
        topOpportunitiesCount: analysisResults.topOpportunities?.length || 0,
        totalRevenue: analysisResults.topOpportunities?.reduce((sum, opp) => sum + (opp.monthlyRevenue || 0), 0) || 0,
        hasRooftopData: !!analysisResults.rooftop,
        usingRealSolarData: analysisResults.rooftop?.usingRealSolarData || false
      }
    });
    
    if (!userId) {
      throw new Error('User ID is required for analysis save');
    }
    
    if (!addressId) {
      throw new Error('Address ID is required for analysis save');
    }
    
    if (!analysisResults) {
      throw new Error('Analysis results are required for save');
    }

    // Validate analysis results structure
    if (!analysisResults.topOpportunities || !Array.isArray(analysisResults.topOpportunities)) {
      console.warn('⚠️ [ANALYSIS SAVE] Invalid topOpportunities structure, setting to empty array');
      analysisResults.topOpportunities = [];
    }

    const totalRevenue = analysisResults.topOpportunities.reduce((sum, opp) => sum + (opp.monthlyRevenue || 0), 0);
    const totalOpportunities = analysisResults.topOpportunities.length;
    
    // Get session ID for proper linking
    const sessionId = localStorage.getItem('tiptop_session_id') || localStorage.getItem('anonymous_session_id');
    
    // Get property address from various possible sources
    const propertyAddress = (analysisResults as any).propertyAddress || 
                           (analysisResults as any).address || 
                           (analysisResults as any).property_address ||
                           'Property Address';
    
    console.log('📊 [ANALYSIS SAVE] Calling save_property_analysis RPC with:', {
      userId,
      sessionId,
      propertyAddress,
      totalRevenue,
      totalOpportunities,
      propertyType: analysisResults.propertyType,
      hasCoordinates: !!coordinates
    });

    // CRITICAL: Use the RPC function which handles all linking automatically
    const { data, error } = await supabase.rpc('save_property_analysis', {
      p_user_id: userId,
      p_session_id: sessionId,
      p_property_address: propertyAddress,
      p_coordinates: coordinates,
      p_analysis_results: analysisResults as any,
      p_total_monthly_revenue: totalRevenue,
      p_total_opportunities: totalOpportunities,
      p_satellite_image_url: satelliteImageUrl
    });

    if (error) {
      console.error('❌ [ANALYSIS SAVE] RPC function failed:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('✅ [ANALYSIS SAVE] Analysis saved successfully via RPC:', {
      analysisId: data,
      userId,
      sessionId,
      totalRevenue,
      totalOpportunities,
      propertyType: analysisResults.propertyType
    });
    
    return data;
  } catch (err) {
    console.error('❌ [ANALYSIS SAVE] Critical error saving property analysis:', {
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      userId,
      addressId,
      analysisResultsKeys: analysisResults ? Object.keys(analysisResults) : 'null'
    });
    throw err;
  }
};

export const loadUserAnalyses = async (userId: string): Promise<UserPropertyAnalysis[]> => {
  try {
    console.log('📊 [ANALYSIS LOAD] Loading analyses for user:', userId);
    
    if (!userId) {
      console.warn('⚠️ [ANALYSIS LOAD] No user ID provided for loading analyses');
      return [];
    }

    const { data, error } = await supabase
      .from('user_property_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [ANALYSIS LOAD] Error loading analyses:', {
        error: error.message,
        code: error.code,
        details: error.details,
        userId
      });
      throw error;
    }
    
    const typedAnalysisData: UserPropertyAnalysis[] = (data || []).map(item => ({
      ...item,
      analysis_results: item.analysis_results as unknown as AnalysisResults
    }));
    
    console.log('✅ [ANALYSIS LOAD] Successfully loaded analyses:', {
      count: typedAnalysisData.length,
      userId,
      analyses: typedAnalysisData.map(analysis => ({
        id: analysis.id,
        addressId: analysis.address_id,
        totalRevenue: analysis.total_monthly_revenue,
        totalOpportunities: analysis.total_opportunities,
        propertyType: analysis.property_type,
        createdAt: analysis.created_at,
        hasAnalysisResults: !!analysis.analysis_results,
        topOpportunitiesCount: analysis.analysis_results?.topOpportunities?.length || 0
      }))
    });
    
    return typedAnalysisData;
  } catch (err) {
    console.error('❌ [ANALYSIS LOAD] Critical error loading analyses:', {
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      userId
    });
    throw err;
  }
};
