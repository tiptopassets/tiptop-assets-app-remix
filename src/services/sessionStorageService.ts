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
    const sessionId = !userId ? getSessionId() : null;
    
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
      analysis_id: analysisId || null,
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
    return data.id;
  } catch (err) {
    console.error('❌ Error saving asset selection:', err);
    throw err;
  }
};

// Load asset selections for session or user
export const loadAssetSelections = async (userId?: string): Promise<any[]> => {
  try {
    const sessionId = !userId ? localStorage.getItem('anonymous_session_id') : null;
    
    let query = supabase.from('user_asset_selections').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId).is('user_id', null);
    } else {
      return [];
    }
    
    const { data, error } = await query.order('selected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error loading asset selections:', err);
    return [];
  }
};