
import { supabase } from '@/integrations/supabase/client';
import { UserDashboardPreferences } from '@/types/userData';

export const loadUserPreferences = async (userId: string): Promise<UserDashboardPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('user_dashboard_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.error('Error loading user preferences:', err);
    throw err;
  }
};
