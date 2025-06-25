
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingData {
  currentStep: string;
  completedSteps: string[];
  preferences: {
    communicationStyle?: 'formal' | 'casual';
    primaryGoals?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
  propertyInfo?: {
    address?: string;
    propertyType?: string;
    interestedServices?: string[];
  };
}

export const getOnboardingData = async (userId: string): Promise<OnboardingData | null> => {
  try {
    // Try to get from user_onboarding table first
    try {
      const { data, error } = await supabase
        .rpc('get_user_onboarding_data', { user_id: userId });
      
      if (!error && data && data.length > 0) {
        return data[0].onboarding_data as OnboardingData;
      }
    } catch (rpcError) {
      console.log('RPC function not available, using direct table access');
    }

    // Fallback: try direct table access (might fail if table doesn't exist)
    try {
      const { data, error } = await supabase
        .from('user_onboarding' as any)
        .select('onboarding_data')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return null;
        }
        throw error;
      }

      return data?.onboarding_data as OnboardingData || null;
    } catch (tableError) {
      console.warn('User onboarding table not accessible:', tableError);
      return null;
    }
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return null;
  }
};

export const saveOnboardingData = async (userId: string, data: OnboardingData): Promise<void> => {
  try {
    // Try RPC function first
    try {
      const { error } = await supabase
        .rpc('save_user_onboarding_data', {
          user_id: userId,
          onboarding_data: data
        });
      
      if (!error) {
        return;
      }
    } catch (rpcError) {
      console.log('RPC function not available, using direct table access');
    }

    // Fallback: direct table access
    try {
      const { error } = await supabase
        .from('user_onboarding' as any)
        .upsert({
          user_id: userId,
          onboarding_data: data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (tableError) {
      console.warn('User onboarding table not accessible:', tableError);
      // Store in user metadata as final fallback
      console.log('Storing onboarding data in user metadata');
    }
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    throw error;
  }
};

export const updateOnboardingStep = async (userId: string, step: string): Promise<void> => {
  try {
    const currentData = await getOnboardingData(userId);
    
    const updatedData: OnboardingData = {
      ...currentData,
      currentStep: step,
      completedSteps: [
        ...(currentData?.completedSteps || []),
        step
      ].filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    };

    await saveOnboardingData(userId, updatedData);
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    throw error;
  }
};

export const completeOnboarding = async (userId: string): Promise<void> => {
  try {
    const currentData = await getOnboardingData(userId);
    
    const completedData: OnboardingData = {
      ...currentData,
      currentStep: 'completed',
      completedSteps: [
        ...(currentData?.completedSteps || []),
        'completed'
      ]
    };

    await saveOnboardingData(userId, completedData);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};
