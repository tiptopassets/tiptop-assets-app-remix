import { supabase } from '@/integrations/supabase/client';

// Generate unique session ID for anonymous users
export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2);
  return `session_${timestamp}_${randomStr}`;
};

// Get or create session ID
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('anonymous_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('anonymous_session_id', sessionId);
  }
  return sessionId;
};

// Clear session data (call when user authenticates)
export const clearSessionData = (): void => {
  localStorage.removeItem('anonymous_session_id');
};

// Link session data to authenticated user
export const linkSessionToUser = async (userId: string): Promise<number> => {
  try {
    const sessionId = localStorage.getItem('anonymous_session_id');
    if (!sessionId) {
      console.log('No session ID found to link');
      return 0;
    }

    console.log('🔗 Linking session data to user:', { sessionId, userId });

    // Call the database function to link session to user
    const { data, error } = await supabase.rpc('link_session_to_user', {
      p_session_id: sessionId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error linking session to user:', error);
      throw error;
    }

    console.log('✅ Successfully linked', data, 'selections to user');
    
    // Clear session data after successful linking
    clearSessionData();
    
    return data || 0;
  } catch (error) {
    console.error('Failed to link session to user:', error);
    throw error;
  }
};

// Store analysis ID for current session (both authenticated and anonymous users)
export const storeAnalysisIdForSession = (analysisId: string): void => {
  localStorage.setItem('currentAnalysisId', analysisId);
  console.log('💾 Stored analysis ID for session:', analysisId);
};

// Get stored analysis ID for current session
export const getStoredAnalysisId = (): string | null => {
  return localStorage.getItem('currentAnalysisId');
};

// Update asset selections with analysis ID when it becomes available
export const updateAssetSelectionsWithAnalysisId = async (
  sessionId: string,
  analysisId: string
): Promise<number> => {
  try {
    console.log('🔗 Updating asset selections with analysis ID:', { sessionId, analysisId });

    const { data, error } = await supabase.rpc('update_asset_selections_with_analysis', {
      p_session_id: sessionId,
      p_analysis_id: analysisId
    });

    if (error) {
      console.error('Error updating asset selections with analysis ID:', error);
      throw error;
    }

    console.log('✅ Updated', data, 'asset selections with analysis ID');
    return data || 0;
  } catch (error) {
    console.error('Failed to update asset selections with analysis ID:', error);
    throw error;
  }
};

// Save asset selection for anonymous or authenticated users
export const saveAssetSelectionAnonymous = async (
  assetType: string,
  assetData: any,
  monthlyRevenue: number,
  setupCost: number = 0,
  roiMonths?: number,
  analysisId?: string,
  userId?: string
): Promise<string | null> => {
  try {
    // Always create a session ID for linking purposes, even for authenticated users
    const sessionId = getSessionId();
    
    // Try to get analysis ID from localStorage if not provided
    if (!analysisId) {
      analysisId = getStoredAnalysisId();
      console.log('🔍 Retrieved analysis ID from localStorage:', analysisId);
    } else {
      // Store the analysis ID for future use
      storeAnalysisIdForSession(analysisId);
    }
    
    console.log('💾 Saving asset selection:', {
      assetType,
      monthlyRevenue,
      analysisId,
      userId,
      sessionId,
      isAnonymous: !userId
    });

    const insertData = {
      user_id: userId || null,
      session_id: sessionId,
      analysis_id: analysisId || null, // Now nullable
      asset_type: assetType,
      asset_data: assetData || {},
      monthly_revenue: monthlyRevenue || 0,
      setup_cost: setupCost || 0,
      roi_months: roiMonths,
      status: 'selected'
    };

    console.log('📊 Insert data:', insertData);

    const { data, error } = await supabase
      .from('user_asset_selections')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('💥 Supabase error:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from insert operation');
    }
    
    console.log('✅ Asset selection saved with ID:', data.id);
    
    // If we don't have an analysis ID yet, try to update later when it becomes available
    if (!analysisId && sessionId) {
      console.log('📝 Asset selection saved without analysis ID, will update when available');
    }
    
    return data.id;
  } catch (err) {
    console.error('❌ Error saving asset selection:', err);
    throw err;
  }
};

// Load asset selections for session or user, optionally filtered by analysisId
export const loadAssetSelections = async (userId?: string, analysisId?: string): Promise<any[]> => {
  try {
    const sessionId = !userId ? localStorage.getItem('anonymous_session_id') : null;
    
    console.log('📥 Loading asset selections:', { userId, analysisId, sessionId });
    
    let query = supabase.from('user_asset_selections').select('*');
    
    if (userId) {
      // For authenticated users, only show their selections
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      // For anonymous users, only show session selections without user_id
      query = query.eq('session_id', sessionId).is('user_id', null);
    } else {
      console.warn('⚠️ No userId or sessionId available for loading selections');
      return [];
    }
    
    // Additional filter by analysis_id if provided
    if (analysisId) {
      query = query.eq('analysis_id', analysisId);
      console.log('🔍 Filtering by analysis_id:', analysisId);
    }
    
    const { data, error } = await query.order('selected_at', { ascending: false });

    if (error) {
      console.error('❌ Error loading asset selections:', error);
      throw error;
    }
    
    console.log('✅ Loaded asset selections:', data?.length || 0, 'items');
    return data || [];
  } catch (err) {
    console.error('Error loading asset selections:', err);
    return [];
  }
};

// Repair orphaned user selections by linking them to an analysis ID
export const repairOrphanedUserSelections = async (
  userId: string,
  analysisId: string
): Promise<number> => {
  try {
    console.log('🔧 Repairing orphaned user selections:', { userId, analysisId });

    const { data, error } = await supabase
      .from('user_asset_selections')
      .update({ analysis_id: analysisId })
      .eq('user_id', userId)
      .is('analysis_id', null)
      .select();

    if (error) {
      console.error('Error repairing orphaned user selections:', error);
      throw error;
    }

    const repairedCount = data?.length || 0;
    console.log('✅ Repaired', repairedCount, 'orphaned user selections');
    return repairedCount;
  } catch (error) {
    console.error('Failed to repair orphaned user selections:', error);
    throw error;
  }
};