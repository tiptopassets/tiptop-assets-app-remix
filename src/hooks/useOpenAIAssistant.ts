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
  | 'error'
  | 'reconnecting';

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

  // Refs for cleanup and control
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializationRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  // Computed states
  const isLoading = state === 'loading_context' || state === 'initializing';
  const isProcessing = state === 'chatting';
  const isReady = state === 'ready';
  const isInitialized = assistantId !== null && threadId !== null;
  const authError = error?.includes('auth') || error?.includes('sign in');

  // Enhanced cleanup
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Enhanced context loading with better error handling
  const loadUserContext = useCallback(async (): Promise<UserContext> => {
    console.log('📊 [ASSISTANT] Loading user context...');
    
    try {
      // Load service providers (always available)
      const { data: providers, error: providersError } = await supabase
        .from('enhanced_service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (providersError) {
        console.warn('⚠️ [ASSISTANT] Failed to load providers:', providersError.message);
      }

      let onboarding = null;
      
      // Load onboarding progress only for authenticated users
      if (user?.id) {
        try {
          const { data: onboardingData, error: onboardingError } = await supabase
            .from('user_onboarding')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (onboardingError) {
            console.warn('⚠️ [ASSISTANT] Failed to load onboarding:', onboardingError.message);
          } else {
            onboarding = onboardingData;
          }
        } catch (onboardingError: any) {
          console.warn('⚠️ [ASSISTANT] Onboarding query failed:', onboardingError.message);
        }
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
        hasPropertyData: !!contextData.propertyData,
        userType: user?.id ? 'authenticated' : 'anonymous'
      });

      return contextData;
    } catch (error: any) {
      console.error('❌ [ASSISTANT] Context loading failed:', error);
      // Return fallback context to prevent total failure
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

  // ENHANCED: Assistant initialization with comprehensive error handling
  const initializeAssistant = useCallback(async () => {
    if (initializationRef.current || state !== 'idle') {
      console.log('🛑 [ASSISTANT] Already initializing or not idle, state:', state);
      return;
    }

    initializationRef.current = true;
    console.log('🚀 [ASSISTANT] Starting initialization...');

    // Create new abort controller for this initialization
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Step 1: Test assistant setup first
      setState('loading_context');
      setError(null);
      
      console.log('🔧 [ASSISTANT] Testing assistant setup...');
      const { data: setupTest, error: setupError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: { action: 'test_assistant_setup' }
      });

      if (setupError) {
        console.error('❌ [ASSISTANT] Setup test failed:', setupError);
        throw new Error(`Setup test failed: ${setupError.message}`);
      }

      if (!setupTest.success) {
        console.error('❌ [ASSISTANT] Setup tests failed:', setupTest);
        const failedTests = [];
        if (!setupTest.tests?.openai) failedTests.push('OpenAI API');
        if (!setupTest.tests?.database) failedTests.push('Database');
        if (!setupTest.tests?.assistant) failedTests.push('AI Assistant');
        
        throw new Error(`Service connectivity issues: ${failedTests.join(', ')} failed. ${setupTest.errors?.join('; ') || 'Unknown errors occurred'}`);
      }

      console.log('✅ [ASSISTANT] Setup tests passed');

      // Step 2: Load context
      const context = await loadUserContext();

      // Step 3: Initialize assistant
      setState('initializing');
      
      console.log('🤖 [ASSISTANT] Getting assistant...');
      const { data: assistantData, error: assistantError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: { action: 'get_assistant' }
      });

      if (assistantError) {
        console.error('❌ [ASSISTANT] Assistant setup failed:', assistantError);
        throw new Error(`Assistant setup failed: ${assistantError.message}`);
      }

      if (!assistantData.success) {
        console.error('❌ [ASSISTANT] Assistant setup failed:', assistantData);
        throw new Error(`Assistant setup failed: ${assistantData.error || 'Unknown error'}`);
      }

      const newAssistantId = assistantData.assistant.id;
      console.log('✅ [ASSISTANT] Got assistant:', newAssistantId);

      // Step 4: Create thread with enhanced metadata
      const threadMetadata = {
        userId: user?.id || 'anonymous',
        propertyAddress: context.propertyData?.address || 'not_provided',
        analysisId: context.propertyData?.analysisId || 'not_provided',
        totalRevenue: context.propertyData?.totalMonthlyRevenue || 0,
        partnersAvailable: context.serviceProviders.length,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.log('🧵 [ASSISTANT] Creating thread with metadata:', {
        userId: threadMetadata.userId,
        propertyAddress: threadMetadata.propertyAddress,
        partnersAvailable: threadMetadata.partnersAvailable
      });

      const { data: threadData, error: threadError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'create_thread',
          data: { metadata: threadMetadata }
        }
      });

      if (threadError) {
        console.error('❌ [ASSISTANT] Thread creation failed:', threadError);
        throw new Error(`Thread creation failed: ${threadError.message}. Please check the console for more details.`);
      }

      if (!threadData.success) {
        console.error('❌ [ASSISTANT] Thread creation failed:', threadData);
        throw new Error(`Thread creation failed: ${threadData.error || 'Unknown error occurred during thread creation'}`);
      }

      const newThreadId = threadData.thread.id;
      console.log('✅ [ASSISTANT] Thread created:', newThreadId);

      // Step 5: Set state and show welcome message
      setAssistantId(newAssistantId);
      setThreadId(newThreadId);
      setState('ready');
      retryCountRef.current = 0; // Reset retry count on success

      // Add enhanced welcome message
      const welcomeMessage = generateWelcomeMessage(context);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);

      console.log('🎉 [ASSISTANT] Initialization complete');

    } catch (error: any) {
      console.error('❌ [ASSISTANT] Initialization failed:', error);
      
      // Implement retry logic for certain errors
      if (retryCountRef.current < maxRetries && !error.message.includes('Assistant ID not configured')) {
        retryCountRef.current++;
        console.log(`🔄 [ASSISTANT] Retrying initialization (${retryCountRef.current}/${maxRetries})`);
        
        setState('reconnecting');
        setTimeout(() => {
          initializationRef.current = false;
          initializeAssistant();
        }, 2000 * retryCountRef.current); // Exponential backoff
        return;
      }
      
      setState('error');
      
      // Enhanced error messaging
      let errorMessage = error.message || 'Failed to initialize assistant';
      
      if (errorMessage.includes('Setup test failed') || errorMessage.includes('Service connectivity issues')) {
        errorMessage += '\n\nThis usually means:\n• OpenAI API key is missing or invalid\n• Assistant ID is not configured\n• Database connection issues\n• Service temporarily unavailable';
      } else if (errorMessage.includes('Thread creation failed')) {
        errorMessage += '\n\nPlease check:\n• Network connection\n• OpenAI API status\n• Try refreshing the page';
      } else if (errorMessage.includes('Assistant setup failed')) {
        errorMessage += '\n\nThe AI assistant configuration may be incorrect or unavailable.';
      }
      
      setError(errorMessage);
    } finally {
      initializationRef.current = false;
    }
  }, [user?.id, loadUserContext, state]);

  const generateWelcomeMessage = useCallback((context: UserContext) => {
    if (!context.propertyData) {
      return `Hi! I'm your AI assistant for property monetization. I'm here to help you explore ways to earn money from your property assets and connect you with the right partners.

${!user ? '💡 **Tip:** Sign in to save your progress and access full partner integration features.' : ''}

How can I assist you today?`;
    }

    const { address, totalMonthlyRevenue, availableAssets } = context.propertyData;
    const topAssets = availableAssets.filter(a => a.hasRevenuePotential || a.monthlyRevenue > 0).slice(0, 3);

    if (topAssets.length === 0 && totalMonthlyRevenue === 0) {
      return `Hi! I've reviewed your property at **${address}**.

While our initial analysis shows limited immediate monetization opportunities, I'm here to help you explore other options and connect you with partners who can help unlock your property's potential.

${!user ? '💡 **Tip:** Sign in to save your progress and access full partner integration features.' : ''}

What specific areas are you most interested in exploring?`;
    }

    const assetList = topAssets.map(asset => `• **${asset.name}** - $${asset.monthlyRevenue}/month potential`).join('\n');
    const partnersAvailable = context.serviceProviders.length;
    
    return `Hi! I'm your AI assistant and I've analyzed your property at **${address}**! 🏠

**Your Monetization Opportunities:**
${assetList}

**Total Earning Potential:** $${totalMonthlyRevenue}/month

I have access to **${partnersAvailable} partner services** that can help you set up these opportunities. I can guide you through the entire process, from initial setup to connecting with the right partners.

${!user ? '💡 **Tip:** Sign in to save your progress and access full partner integration features.' : ''}

Would you like to start with a specific asset, or would you prefer me to recommend the best partner matches for your property?`;
  }, [user]);

  // Auto-initialize when component mounts with retry logic
  useEffect(() => {
    if (state === 'idle') {
      // Small delay to allow component to settle
      const timer = setTimeout(() => {
        initializeAssistant();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initializeAssistant, state]);

  // Enhanced send message with better error handling and retry logic
  const sendMessage = useCallback(async (message: string) => {
    if (!assistantId || !threadId || state !== 'ready') {
      console.warn('⚠️ [MESSAGE] Cannot send message - assistant not ready:', {
        assistantId: !!assistantId,
        threadId: !!threadId,
        state
      });
      return;
    }

    console.log('💬 [MESSAGE] Sending:', message.substring(0, 100) + '...');
    setState('chatting');
    setError(null);

    // Add user message immediately
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message with enhanced context
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

      // Run assistant using the correct assistant ID
      const { data: runData, error: runError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'run_assistant',
          data: {
            threadId,
            assistantId, // Use the stored assistant ID
            userId: user?.id || 'anonymous'
          }
        }
      });

      if (runError) throw runError;

      // Start polling for completion
      pollForCompletion(runData.run.id);

    } catch (error: any) {
      console.error('❌ [MESSAGE] Send failed:', error);
      setState('ready');
      
      let errorMessage = error.message || 'Failed to send message';
      if (errorMessage.includes('Thread creation failed')) {
        errorMessage = 'Connection lost. Please refresh the page and try again.';
      }
      
      setError(errorMessage);
    }
  }, [assistantId, threadId, state, user?.id, userContext]);

  // Enhanced polling with exponential backoff
  const pollForCompletion = useCallback((runId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    let attempts = 0;
    let pollInterval = 1000; // Start with 1 second
    const maxAttempts = 60; // 60 attempts max (about 2 minutes with exponential backoff)

    const poll = async () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setState('ready');
        setError('Response timeout - the AI is taking too long to respond. Please try again.');
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
        console.log(`📊 [POLL] Run status (attempt ${attempts}):`, run.status);

        if (run.status === 'completed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          if (newMessages && newMessages.length > 0) {
            const assistantMessages = newMessages
              .filter((msg: any) => msg.role === 'assistant')
              .map((msg: any) => ({
                id: msg.id,
                role: 'assistant' as const,
                content: msg.content[0]?.text?.value || 'Sorry, I encountered an issue processing that request.',
                timestamp: new Date(msg.created_at * 1000)
              }));

            if (assistantMessages.length > 0) {
              setMessages(prev => [...prev, ...assistantMessages]);
            }
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
          setError(`AI processing ${run.status}: ${run.last_error?.message || 'Please try again.'}`);
          
        } else if (run.status === 'in_progress' || run.status === 'queued') {
          // Continue polling with exponential backoff
          pollInterval = Math.min(pollInterval * 1.2, 5000); // Max 5 seconds
        }

      } catch (error: any) {
        console.error('❌ [POLL] Error:', error);
        
        // Don't fail immediately on polling errors, but do increment attempts
        if (attempts % 5 === 0) { // Every 5 attempts, log a warning
          console.warn(`⚠️ [POLL] ${attempts} failed attempts, continuing...`);
        }
        
        if (attempts > maxAttempts / 2) { // After half the max attempts, fail
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setState('ready');
          setError('Connection issues - please try again');
        }
      }
    };

    // Start polling
    pollIntervalRef.current = setInterval(poll, pollInterval);
    poll(); // Initial poll
  }, [threadId]);

  // Enhanced action handling
  const handleRequiredActions = useCallback(async (run: any, runId: string) => {
    console.log('🔧 [ACTIONS] Handling required actions');

    if (run.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      
      // Add processing message with more detail
      setMessages(prev => [...prev, {
        id: `tool_calls_${runId}`,
        role: 'assistant',
        content: `I'm processing your request and gathering information from ${toolCalls.length} different sources. This may take a moment...`,
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
        
        // Continue polling with the new run
        pollForCompletion(data.run.id);

      } catch (error: any) {
        console.error('❌ [ACTIONS] Failed:', error);
        setState('ready');
        setError('Failed to process your request. Please try again.');
      }
    }
  }, [threadId, user?.id, pollForCompletion]);

  // ENHANCED: Error clearing with better retry logic
  const clearError = useCallback(() => {
    console.log('🔧 [ASSISTANT] Clearing error and retrying...');
    setError(null);
    if (state === 'error') {
      setState('idle');
      retryCountRef.current = 0; // Reset retry count
      // Auto-retry initialization
      setTimeout(() => {
        initializeAssistant();
      }, 500);
    }
  }, [state, initializeAssistant]);

  // Enhanced reset with cleanup and retry logic
  const resetConversation = useCallback(() => {
    console.log('🔄 [ASSISTANT] Resetting conversation...');
    
    // Clean up polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Clean up abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Reset state
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
    retryCountRef.current = 0;
    
    // Auto-restart
    setTimeout(() => {
      initializeAssistant();
    }, 500);
  }, [initializeAssistant]);

  return {
    // State
    assistantId,
    threadId,
    runId: null,
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
    isReady: isReady && isInitialized,
    isReconnecting: state === 'reconnecting'
  };
};
