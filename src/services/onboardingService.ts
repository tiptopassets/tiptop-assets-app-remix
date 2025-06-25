
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingData {
  id: string;
  user_id: string;
  current_step: string;
  status: 'active' | 'completed' | 'paused';
  completed_assets: string[];
  progress_data: {
    communicationStyle?: 'formal' | 'casual';
    primaryGoals?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    propertyInfo?: {
      address?: string;
      propertyType?: string;
      interestedServices?: string[];
    };
  };
  selected_option: 'manual' | 'concierge';
  total_steps: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingMessage {
  id: string;
  onboarding_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
}

export const getOnboardingData = async (userId: string): Promise<OnboardingData | null> => {
  try {
    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data) return null;

    // Transform database data to OnboardingData interface
    const onboardingData = data.onboarding_data as any || {};
    
    return {
      id: data.id,
      user_id: data.user_id,
      current_step: onboardingData.current_step || 'welcome',
      status: onboardingData.status || 'active',
      completed_assets: onboardingData.completed_assets || [],
      progress_data: onboardingData.progress_data || {},
      selected_option: onboardingData.selected_option || 'manual',
      total_steps: onboardingData.total_steps || 5,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return null;
  }
};

export const saveOnboardingData = async (userId: string, data: Partial<OnboardingData>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_onboarding')
      .upsert({
        user_id: userId,
        onboarding_data: {
          current_step: data.current_step,
          status: data.status,
          completed_assets: data.completed_assets,
          progress_data: data.progress_data,
          selected_option: data.selected_option,
          total_steps: data.total_steps
        },
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    throw error;
  }
};

export const createOnboarding = async (userId: string, selectedOption: 'manual' | 'concierge'): Promise<OnboardingData> => {
  const newOnboardingData: Partial<OnboardingData> = {
    current_step: 'welcome',
    status: 'active',
    completed_assets: [],
    progress_data: {},
    selected_option: selectedOption,
    total_steps: 5
  };

  await saveOnboardingData(userId, newOnboardingData);
  
  const savedData = await getOnboardingData(userId);
  if (!savedData) {
    throw new Error('Failed to create onboarding data');
  }
  
  return savedData;
};

export const getOnboarding = async (userId: string): Promise<OnboardingData | null> => {
  return getOnboardingData(userId);
};

export const updateOnboardingProgress = async (
  id: string, 
  updates: Partial<Pick<OnboardingData, 'current_step' | 'status' | 'completed_assets' | 'progress_data'>>
): Promise<OnboardingData | null> => {
  try {
    // First get the current data
    const { data: currentData, error: fetchError } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentData) {
      console.error('Error fetching current onboarding data:', fetchError);
      return null;
    }

    const currentOnboardingData = currentData.onboarding_data as any || {};
    
    // Merge updates with current data
    const updatedOnboardingData = {
      ...currentOnboardingData,
      ...updates
    };

    const { error } = await supabase
      .from('user_onboarding')
      .update({
        onboarding_data: updatedOnboardingData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    // Return updated data
    return getOnboardingData(currentData.user_id);
  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    return null;
  }
};

export const addOnboardingMessage = async (
  onboardingId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
): Promise<OnboardingMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('onboarding_messages')
      .insert({
        onboarding_id: onboardingId,
        role,
        content,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding onboarding message:', error);
    return null;
  }
};

export const getOnboardingMessages = async (onboardingId: string): Promise<OnboardingMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('onboarding_messages')
      .select('*')
      .eq('onboarding_id', onboardingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching onboarding messages:', error);
    return [];
  }
};

export const updateOnboardingStep = async (userId: string, step: string): Promise<void> => {
  try {
    const currentData = await getOnboardingData(userId);
    if (!currentData) return;

    await updateOnboardingProgress(currentData.id, {
      current_step: step,
      completed_assets: [
        ...currentData.completed_assets,
        step
      ].filter((value, index, self) => self.indexOf(value) === index)
    });
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    throw error;
  }
};

export const completeOnboarding = async (userId: string): Promise<void> => {
  try {
    const currentData = await getOnboardingData(userId);
    if (!currentData) return;

    await updateOnboardingProgress(currentData.id, {
      current_step: 'completed',
      status: 'completed'
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};
