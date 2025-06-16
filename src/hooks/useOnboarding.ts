
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createOnboarding, 
  getOnboarding, 
  updateOnboardingProgress,
  addOnboardingMessage,
  getOnboardingMessages,
  OnboardingData,
  OnboardingMessage
} from '@/services/onboardingService';
import { toast } from '@/hooks/use-toast';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing onboarding data when user is available
  useEffect(() => {
    if (user?.id) {
      loadOnboardingData();
    }
  }, [user?.id]);

  // Load messages when onboarding data is available
  useEffect(() => {
    if (onboardingData?.id) {
      loadMessages();
    }
  }, [onboardingData?.id]);

  const loadOnboardingData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getOnboarding(user.id);
      setOnboardingData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load onboarding data';
      setError(errorMessage);
      console.error('Failed to load onboarding data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!onboardingData?.id) return;
    
    try {
      const messageData = await getOnboardingMessages(onboardingData.id);
      setMessages(messageData);
    } catch (err) {
      console.error('Failed to load messages:', err);
      // Don't set error state for messages as it's not critical
    }
  };

  const startOnboarding = async (selectedOption: 'manual' | 'concierge') => {
    if (!user?.id) {
      const errorMessage = 'Please log in to start onboarding';
      setError(errorMessage);
      toast({
        title: 'Authentication Required',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await createOnboarding(user.id, selectedOption);
      setOnboardingData(data);
      setMessages([]); // Reset messages for new session
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start onboarding';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<Pick<OnboardingData, 'current_step' | 'status' | 'completed_assets' | 'progress_data'>>) => {
    if (!onboardingData?.id) return null;

    try {
      const updatedData = await updateOnboardingProgress(onboardingData.id, updates);
      if (updatedData) {
        setOnboardingData(updatedData);
      }
      return updatedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update progress';
      setError(errorMessage);
      console.error('Failed to update progress:', err);
      return null;
    }
  };

  const addMessage = async (role: 'user' | 'assistant' | 'system', content: string, metadata?: any) => {
    if (!onboardingData?.id) return null;

    try {
      const message = await addOnboardingMessage(onboardingData.id, role, content, metadata);
      if (message) {
        setMessages(prev => [...prev, message]);
      }
      return message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add message';
      setError(errorMessage);
      console.error('Failed to add message:', err);
      return null;
    }
  };

  const clearError = () => setError(null);

  return {
    onboardingData,
    messages,
    loading,
    error,
    startOnboarding,
    updateProgress,
    addMessage,
    loadOnboardingData,
    clearError,
    isAuthenticated: !!user,
  };
};
