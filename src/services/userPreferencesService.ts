
import { supabase } from '@/integrations/supabase/client';
import { UserDashboardPreferences } from '@/types/userData';

export const loadUserPreferences = async (userId: string): Promise<UserDashboardPreferences | null> => {
  try {
    console.log('🔄 Loading user preferences for:', userId);
    
    const { data, error } = await supabase
      .from('user_dashboard_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error loading user preferences:', error);
      throw error;
    }
    
    console.log('✅ Loaded user preferences:', !!data);
    return data;
  } catch (err) {
    console.error('❌ Error in loadUserPreferences:', err);
    throw err;
  }
};

export const saveUserPreferences = async (
  userId: string,
  preferences: Partial<UserDashboardPreferences>
): Promise<string | null> => {
  try {
    console.log('💾 Saving user preferences for:', userId);
    
    const { data, error } = await supabase
      .from('user_dashboard_preferences')
      .upsert({
        user_id: userId,
        ...preferences
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving user preferences:', error);
      throw error;
    }
    
    console.log('✅ Saved user preferences:', data.id);
    return data.id;
  } catch (err) {
    console.error('❌ Error in saveUserPreferences:', err);
    throw err;
  }
};
