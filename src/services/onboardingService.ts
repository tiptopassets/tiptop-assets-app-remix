import { supabase } from '@/integrations/supabase/client';

export interface OnboardingData {
  id: string;
  user_id: string;
  selected_option: 'manual' | 'concierge';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  current_step: number;
  total_steps: number;
  chat_history: any[];
  completed_assets: string[];
  progress_data: any;
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

export const createOnboarding = async (
  userId: string,
  selectedOption: 'manual' | 'concierge'
): Promise<OnboardingData | null> => {
  try {
    console.log('📝 Creating onboarding session:', { userId, selectedOption });
    
    // Mock onboarding creation for now
    const mockOnboarding: OnboardingData = {
      id: `mock-${Date.now()}`,
      user_id: userId,
      selected_option: selectedOption,
      status: 'in_progress',
      current_step: 1,
      total_steps: 5,
      chat_history: [],
      completed_assets: [],
      progress_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Mock onboarding session created:', mockOnboarding.id);
    return mockOnboarding;
  } catch (err) {
    console.error('❌ Error in createOnboarding:', err);
    throw err;
  }
};

export const getOnboarding = async (userId: string): Promise<OnboardingData | null> => {
  try {
    console.log('🔍 Getting onboarding for user:', userId);
    
    // Return null for now (no onboarding found)
    console.log('✅ No onboarding found');
    return null;
  } catch (err) {
    console.error('❌ Error in getOnboarding:', err);
    throw err;
  }
};

export const updateOnboardingProgress = async (
  onboardingId: string,
  updates: Partial<Pick<OnboardingData, 'current_step' | 'status' | 'completed_assets' | 'progress_data'>>
): Promise<OnboardingData | null> => {
  try {
    console.log('🔄 Updating onboarding progress:', { onboardingId, updates });
    
    // Mock update for now
    console.log('✅ Mock onboarding updated successfully');
    return null;
  } catch (err) {
    console.error('❌ Error in updateOnboardingProgress:', err);
    throw err;
  }
};

export const addOnboardingMessage = async (
  onboardingId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
): Promise<OnboardingMessage | null> => {
  try {
    console.log('💬 Adding onboarding message:', { onboardingId, role, content: content.substring(0, 50) + '...' });
    
    // Mock message for now
    const mockMessage: OnboardingMessage = {
      id: `mock-msg-${Date.now()}`,
      onboarding_id: onboardingId,
      role,
      content,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    };

    console.log('✅ Mock message added successfully');
    return mockMessage;
  } catch (err) {
    console.error('❌ Error in addOnboardingMessage:', err);
    throw err;
  }
};

export const getOnboardingMessages = async (onboardingId: string): Promise<OnboardingMessage[]> => {
  try {
    console.log('📨 Getting messages for onboarding:', onboardingId);
    
    // Return empty array for now
    console.log('✅ No messages found');
    return [];
  } catch (err) {
    console.error('❌ Error in getOnboardingMessages:', err);
    throw err;
  }
};