
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCalls?: any[];
  toolOutputs?: any[];
}

interface UserContext {
  propertyData: PropertyAnalysisData | null;
  serviceProviders: any[];
  onboardingProgress: any;
  isLoaded: boolean;
}

type AssistantState = 
  | 'idle'
  | 'loading_context'
  | 'initializing'
  | 'ready'
  | 'chatting'
  | 'error';

export const useOpenAIAssistant = (propertyData: PropertyAnalysisData | null) => {
  const { user } = useAuth();
  
  // Core State
  const [state, setState] = useState<AssistantState>('idle');
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserContext>({
    propertyData: null,
    serviceProviders: [],
    onboardingProgress: null,
    isLoaded: false
  });

  // Refs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializationRef = useRef<boolean>(false);

  // Computed states
  const isLoading = state === 'loading_context' || state === 'initializing';
  const isProcessing = state === 'chatting';
  const isReady = state === 'ready';
  const isInitialized = assistantId !== null && threadId !== null;
  const authError = error?.includes('auth') || error?.includes('sign in');

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Step 1: Load User Context
  const loadUserContext = useCallback(async (): Promise<UserContext> => {
    console.log('📊 [ASSISTANT] Loading user context...');
    
    try {
      // Load service providers (always available)
      const { data: providers } = await supabase
        .from('enhanced_service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      let onboarding = null;
      
      // Load onboarding progress only for authenticated users
      if (user?.id) {
        const { data: onboardingData } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        onboarding = onboardingData;
      }

      const contextData = {
        propertyData: propertyData,
        serviceProviders: providers || [],
        onboardingProgress: onboarding,
        isLoaded: true
      };

      setUserContext(contextData);
      console.log('✅ [ASSISTANT] Context loaded:', {
        providersCount: contextData.serviceProviders.length,
        hasOnboarding: !!contextData.onboardingProgress,
        hasPropertyData: !!contextData.propertyData
      });

      return contextData;
    } catch (error) {
      console.error('❌ [ASSISTANT] Context loading failed:', error);
      // Return fallback context
      const fallbackContext = {
        propertyData: propertyData,
        serviceProviders: [],
        onboardingProgress: null,
        isLoaded: true
      };
      setUserContext(fallbackContext);
      return fallbackContext;
    }
  }, [user?.id, propertyData]);

  // Step 2: Initialize Assistant
  const initializeAssistant = useCallback(async () => {
    if (initializationRef.current || state !== 'idle') {
      console.log('🛑 [ASSISTANT] Already initializing or not idle');
      return;
    }

    initializationRef.current = true;
    console.log('🚀 [ASSISTANT] Starting initialization...');

    try {
      // Step 1: Load Context
      setState('loading_context');
      const context = await loadUserContext();

      // Step 2: Initialize Assistant
      setState('initializing');
      setError(null);

      // Create assistant session
      const { data: assistantData, error: assistantError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: { action: 'get_assistant' }
      });

      if (assistantError) {
        throw new Error(`Assistant setup failed: ${assistantError.message}`);
      }

      const newAssistantId = assistantData.assistant.id;
      console.log('✅ [ASSISTANT] Got assistant:', newAssistantId);

      // Create thread
      const threadMetadata = {
        userId: user?.id || 'anonymous',
        propertyAddress: context.propertyData?.address || 'not_provided',
        analysisId: context.propertyData?.analysisId || 'not_provided',
        totalRevenue: context.propertyData?.totalMonthlyRevenue || 0,
        partnersAvailable: context.serviceProviders.length,
        timestamp: new Date().toISOString()
      };

      const { data: threadData, error: threadError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'create_thread',
          data: { metadata: threadMetadata }
        }
      });

      if (threadError) {
        if (threadError.message?.includes('auth')) {
          throw new Error('Please sign in to use the AI assistant with full functionality');
        }
        throw new Error(`Thread creation failed: ${threadError.message}`);
      }

      const newThreadId = threadData.thread.id;
      console.log('✅ [ASSISTANT] Thread created:', newThreadId);

      // Set state
      setAssistantId(newAssistantId);
      setThreadId(newThreadId);
      setState('ready');

      // Add welcome message
      const welcomeMessage = generateWelcomeMessage(context);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);

      console.log('🎉 [ASSISTANT] Initialization complete');

    } catch (error) {
      console.error('❌ [ASSISTANT] Initialization failed:', error);
      setState('error');
      setError(error.message || 'Failed to initialize assistant');
    } finally {
      initializationRef.current = false;
    }
  }, [user?.id, loadUserContext, state]);

  // Generate welcome message
  const generateWelcomeMessage = useCallback((context: UserContext) => {
    if (!context.propertyData) {
      return "Hi! I'm your AI assistant for property monetization. I'm here to help you explore ways to earn money from your property assets and connect you with the right partners. How can I assist you today?";
    }

    const { address, totalMonthlyRevenue, availableAssets } = context.propertyData;
    const topAssets = availableAssets.filter(a => a.hasRevenuePotential || a.monthlyRevenue > 0).slice(0, 3);

    if (topAssets.length === 0 && totalMonthlyRevenue === 0) {
      return `Hi! I've reviewed your property at **${address}**. While our initial analysis shows limited immediate monetization opportunities, I'm here to help you explore other options and connect you with partners who can help unlock your property's potential. What specific areas are you most interested in exploring?`;
    }

    const assetList = topAssets.map(asset => `**${asset.name}** ($${asset.monthlyRevenue}/month)`).join(', ');
    const partnersAvailable = context.serviceProviders.length;
    
    return `Hi! I'm your AI assistant and I've analyzed your property at **${address}**! 🏠

I found great monetization opportunities including: ${assetList}. Your total earning potential is **$${totalMonthlyRevenue}/month**.

I have access to **${partnersAvailable} partner services** that can help you set up these opportunities. I can guide you through the entire onboarding process, from initial setup to connecting with the right partners.

Would you like to start with a specific asset, or would you prefer me to recommend the best partner matches for your property?`;
  }, []);

  // Auto-initialize when mounted
  useEffect(() => {
    if (state === 'idle') {
      initializeAssistant();
    }
  }, [initializeAssistant, state]);

  // Send Message
  const sendMessage = useCallback(async (message: string) => {
    if (!assistantId || !threadId || state !== 'ready') {
      console.warn('⚠️ [MESSAGE] Cannot send message - assistant not ready');
      return;
    }

    console.log('💬 [MESSAGE] Sending:', message);
    setState('chatting');
    setError(null);

    // Add user message
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message
      const { data: messageData, error: messageError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'send_message',
          data: {
            threadId,
            message,
            userId: user?.id || 'anonymous',
            userContext
          }
        }
      });

      if (messageError) throw messageError;

      // Run assistant
      const { data: runData, error: runError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'run_assistant',
          data: {
            threadId,
            assistantId,
            userId: user?.id || 'anonymous'
          }
        }
      });

      if (runError) throw runError;

      // Poll for completion
      pollForCompletion(runData.run.id);

    } catch (error) {
      console.error('❌ [MESSAGE] Send failed:', error);
      setState('ready');
      setError(error.message || 'Failed to send message');
    }
  }, [assistantId, threadId, state, user?.id, userContext]);

  // Poll for completion
  const pollForCompletion = useCallback((runId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setState('ready');
        setError('Response timeout - please try again');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('openai-assistant-manager', {
          body: {
            action: 'get_run_status',
            data: { threadId, runId }
          }
        });

        if (error) throw error;

        const { run, messages: newMessages } = data;
        console.log('📊 [POLL] Run status:', run.status);

        if (run.status === 'completed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          if (newMessages) {
            const assistantMessages = newMessages
              .filter((msg: any) => msg.role === 'assistant')
              .map((msg: any) => ({
                id: msg.id,
                role: 'assistant' as const,
                content: msg.content[0]?.text?.value || '',
                timestamp: new Date(msg.created_at * 1000)
              }));

            setMessages(prev => [...prev, ...assistantMessages]);
          }

          setState('ready');

        } else if (run.status === 'requires_action') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          await handleRequiredActions(run, runId);

        } else if (run.status === 'failed' || run.status === 'cancelled') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setState('ready');
          setError(`Run ${run.status}: ${run.last_error?.message || 'Unknown error'}`);
        }

      } catch (error) {
        console.error('❌ [POLL] Error:', error);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setState('ready');
        setError('Communication error - please try again');
      }
    }, 2000);
  }, [threadId]);

  // Handle required actions
  const handleRequiredActions = useCallback(async (run: any, runId: string) => {
    console.log('🔧 [ACTIONS] Handling required actions');

    if (run.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      
      // Add processing message
      setMessages(prev => [...prev, {
        id: `tool_calls_${runId}`,
        role: 'assistant',
        content: 'I\'m processing your request and gathering the necessary information...',
        timestamp: new Date(),
        functionCalls: toolCalls
      }]);

      const toolOutputs = toolCalls.map((toolCall: any) => ({
        tool_call_id: toolCall.id,
        function_name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments)
      }));

      try {
        const { data, error } = await supabase.functions.invoke('openai-assistant-manager', {
          body: {
            action: 'submit_tool_outputs',
            data: {
              threadId,
              runId,
              toolOutputs,
              userId: user?.id || 'anonymous'
            }
          }
        });

        if (error) throw error;
        pollForCompletion(data.run.id);

      } catch (error) {
        console.error('❌ [ACTIONS] Failed:', error);
        setState('ready');
        setError('Failed to process function calls');
      }
    }
  }, [threadId, user?.id, pollForCompletion]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    if (state === 'error') {
      setState('idle');
    }
  }, [state]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    setAssistantId(null);
    setThreadId(null);
    setMessages([]);
    setError(null);
    setState('idle');
    setUserContext({
      propertyData: null,
      serviceProviders: [],
      onboardingProgress: null,
      isLoaded: false
    });
    
    initializationRef.current = false;
  }, []);

  return {
    // State
    assistantId,
    threadId,
    runId: null, // Not tracking run ID in this simplified version
    isLoading,
    isProcessing,
    messages,
    error,
    authError,
    isInitialized,
    userContext,
    
    // Actions
    initializeAssistant,
    sendMessage,
    clearError,
    resetConversation,
    
    // Computed
    isReady: isReady && isInitialized
  };
};
