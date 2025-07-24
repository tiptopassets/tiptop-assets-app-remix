import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { UserAssetSelection } from '@/types/userData';

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('anonymous_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('anonymous_session_id', sessionId);
    console.log('✨ Created a new anonymous session:', sessionId);
  }
  return sessionId;
};

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
    if (userId) {
      // Save to database for authenticated users
      console.log('👤 Saving asset selection to database for user:', userId);
      
      // Call the Supabase function to save the asset selection
      // Note: The saveAssetSelection function in userAssetService.ts should be used here
      // to ensure consistency and proper handling of database operations.
      
      return null; // Return null as the actual saving is done in the userAssetService
    } else {
      // Save to localStorage for anonymous users
      console.log('👤 Saving asset selection to localStorage for anonymous user');
      const sessionId = getOrCreateSessionId();
      let selections: UserAssetSelection[] = [];
      const stored = localStorage.getItem(`asset_selections_${sessionId}`);
      
      if (stored) {
        selections = JSON.parse(stored) as UserAssetSelection[];
      }
      
      const newSelection: UserAssetSelection = {
        id: uuidv4(),
        user_id: 'anonymous',
        asset_type: assetType,
        asset_data: assetData,
        monthly_revenue: monthlyRevenue,
        setup_cost: setupCost,
        roi_months: roiMonths,
        selected_at: new Date().toISOString(),
        status: 'selected',
        analysis_id: analysisId || 'unknown',
        session_id: sessionId
      };
      
      selections.push(newSelection);
      localStorage.setItem(`asset_selections_${sessionId}`, JSON.stringify(selections));
      console.log('✅ Saved asset selection to localStorage:', newSelection);
      return newSelection.id;
    }
  } catch (error) {
    console.error('🚨 Error saving asset selection:', error);
    return null;
  }
};

export const loadAssetSelections = async (userId?: string, analysisId?: string): Promise<UserAssetSelection[]> => {
  try {
    console.log('🔍 Loading asset selections:', { userId, analysisId });

    if (userId) {
      // Load from database for authenticated users
      let query = supabase
        .from('user_asset_selections')
        .select('*')
        .eq('user_id', userId)
        .order('selected_at', { ascending: false });

      // Filter by analysis_id if provided
      if (analysisId) {
        query = query.eq('analysis_id', analysisId);
        console.log('🎯 Filtering by analysis ID:', analysisId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error loading user asset selections:', error);
        throw error;
      }

      console.log('✅ Loaded user asset selections:', {
        count: data?.length || 0,
        analysisId,
        selections: data?.map(s => ({
          id: s.id,
          asset_type: s.asset_type,
          analysis_id: s.analysis_id,
          monthly_revenue: s.monthly_revenue
        }))
      });

      return data || [];
    } else {
      // Load from localStorage for anonymous users (no analysis filtering for anonymous)
      const sessionId = getOrCreateSessionId();
      const stored = localStorage.getItem(`asset_selections_${sessionId}`);
      
      if (!stored) {
        console.log('📭 No anonymous asset selections found');
        return [];
      }

      const selections = JSON.parse(stored) as UserAssetSelection[];
      console.log('✅ Loaded anonymous asset selections:', selections.length);
      
      return selections;
    }
  } catch (error) {
    console.error('❌ Error in loadAssetSelections:', error);
    return [];
  }
};

export const linkSessionToUser = async (userId: string): Promise<number> => {
  try {
    const sessionId = localStorage.getItem('anonymous_session_id');
    if (!sessionId) {
      console.log('ℹ️ No anonymous session ID found');
      return 0;
    }

    console.log('🔗 Linking session data to user:', { userId, sessionId });

    // Fetch anonymous selections from local storage
    const stored = localStorage.getItem(`asset_selections_${sessionId}`);
    if (!stored) {
      console.log('📭 No anonymous asset selections found in local storage');
      return 0;
    }
    const selections = JSON.parse(stored) as UserAssetSelection[];

    if (!selections || selections.length === 0) {
      console.log('📭 No asset selections to migrate from local storage');
      return 0;
    }

    // Prepare the data for insertion into the database
    const insertableSelections = selections.map(selection => ({
      user_id: userId,
      asset_type: selection.asset_type,
      asset_data: selection.asset_data,
      monthly_revenue: selection.monthly_revenue,
      setup_cost: selection.setup_cost,
      roi_months: selection.roi_months,
      status: selection.status,
      analysis_id: selection.analysis_id,
      session_id: selection.session_id
    }));

    // Insert the data into the database
    const { data, error } = await supabase
      .from('user_asset_selections')
      .insert(insertableSelections)
      .select();

    if (error) {
      console.error('❌ Error migrating asset selections to database:', error);
      throw error;
    }

    console.log('✅ Successfully migrated asset selections to database:', data?.length);

    // Clear the local storage
    localStorage.removeItem(`asset_selections_${sessionId}`);
    console.log('🗑️ Cleared anonymous asset selections from local storage');
    localStorage.removeItem('anonymous_session_id');
    console.log('🗑️ Cleared anonymous session ID from local storage');

    return data?.length || 0;
  } catch (error) {
    console.error('❌ Error linking session data to user:', error);
    return 0;
  }
};

export const updateAssetSelectionsWithAnalysisId = async (sessionId: string, analysisId: string): Promise<void> => {
  try {
    console.log('Updating asset selections with analysis ID:', { sessionId, analysisId });

    // Fetch anonymous selections from local storage
    const stored = localStorage.getItem(`asset_selections_${sessionId}`);
    if (!stored) {
      console.log('No anonymous asset selections found in local storage');
      return;
    }
    const selections = JSON.parse(stored) as UserAssetSelection[];

    if (!selections || selections.length === 0) {
      console.log('No asset selections to update in local storage');
      return;
    }

    // Update the analysis_id for each selection
    const updatedSelections = selections.map(selection => ({
      ...selection,
      analysis_id: analysisId
    }));

    // Store the updated selections back in local storage
    localStorage.setItem(`asset_selections_${sessionId}`, JSON.stringify(updatedSelections));
    console.log('Successfully updated asset selections with analysis ID in local storage');
  } catch (error) {
    console.error('Error updating asset selections with analysis ID:', error);
  }
};

export const getStoredAnalysisId = (): string | null => {
  const analysisId = localStorage.getItem('currentAnalysisId');
  console.log('🔍 Retrieved stored analysis ID:', analysisId);
  return analysisId;
};
