
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
  | 'testing_connection'
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

  // Control refs to prevent race conditions
  const initializationRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  // Computed states
  const isLoading = state === 'testing_connection' || state === 'loading_context' || state === 'initializing';
  const isProcessing = state === 'chatting';
  const isReady = state === 'ready';
  const isInitialized = assistantId !== null && threadId !== null;

  // Cleanup on unmount
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

  // Enhanced context loading with error handling
  const loadUserContext = useCallback(async (): Promise<UserContext> => {
    console.log('📊 [ASSISTANT] Loading user context...');
    
    try {
      // Load service providers
      const { data: providers, error: providersError } = await supabase
        .from('enhanced_service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (providersError) {
        console.warn('⚠️ [ASSISTANT] Providers load failed:', providersError.message);
      }

      let onboarding = null;
      
      // Load onboarding progress for authenticated users
      if (user?.id) {
        try {
          const { data: onboardingData, error: onboardingError } = await supabase
            .from('user_onboarding')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (onboardingError) {
            console.warn('⚠️ [ASSISTANT] Onboarding load failed:', onboardingError.message);
          } else {
            onboarding = onboardingData;
          }
        } catch (error: any) {
          console.warn('⚠️ [ASSISTANT] Onboarding query failed:', error.message);
        }
      }

      const contextData = {
        propertyData,
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
      // Return fallback context
      const fallbackContext = {
        propertyData,
        serviceProviders: [],
        onboardingProgress: null,
        isLoaded: true
      };
      setUserContext(fallbackContext);
      return fallbackContext;
    }
  }, [user?.id, propertyData]);

  // Test basic OpenAI connectivity
  const testOpenAIConnection = useCallback(async () => {
    console.log('🔧 [ASSISTANT] Testing OpenAI connection...');
    
    try {
      const { data: connectionTest, error: connectionError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: { action: 'test_connection' }
      });

      if (connectionError) {
        console.error('❌ [ASSISTANT] Connection test failed:', connectionError);
        throw new Error(`Connection test failed: ${connectionError.message}`);
      }

      if (!connectionTest.success) {
        console.error('❌ [ASSISTANT] Connection test failed:', connectionTest);
        throw new Error(`OpenAI connection failed: ${connectionTest.error}`);
      }

      console.log('✅ [ASSISTANT] OpenAI connection successful');
      return true;
    } catch (error: any) {
      console.error('❌ [ASSISTANT] OpenAI connection test failed:', error);
      throw error;
    }
  }, []);

  // FIXED: Assistant initialization with race condition prevention
  const initializeAssistant = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializationRef.current) {
      console.log('🛑 [ASSISTANT] Initialization already in progress');
      return;
    }

    if (state !== 'idle') {
      console.log('🛑 [ASSISTANT] Not idle, current state:', state);
      return;
    }

    initializationRef.current = true;
    console.log('🚀 [ASSISTANT] Starting initialization...');

    // Create new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setState('testing_connection');
      setError(null);
      
      // Step 1: Test basic OpenAI connectivity
      await testOpenAIConnection();

      // Step 2: Test setup
      console.log('🔧 [ASSISTANT] Testing setup...');
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
        
        throw new Error(`Service issues: ${failedTests.join(', ')} failed`);
      }

      console.log('✅ [ASSISTANT] Setup tests passed');

      // Step 3: Load context
      setState('loading_context');
      const context = await loadUserContext();

      // Step 4: Get assistant
      setState('initializing');
      
      console.log('🤖 [ASSISTANT] Getting assistant...');
      const { data: assistantData, error: assistantError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: { action: 'get_assistant' }
      });

      if (assistantError) {
        console.error('❌ [ASSISTANT] Assistant get failed:', assistantError);
        throw new Error(`Assistant get failed: ${assistantError.message}`);
      }

      if (!assistantData.success) {
        console.error('❌ [ASSISTANT] Assistant get failed:', assistantData);
        throw new Error(`Assistant get failed: ${assistantData.error}`);
      }

      const newAssistantId = assistantData.assistant.id;
      console.log('✅ [ASSISTANT] Got assistant:', newAssistantId);

      // Step 5: Create thread
      const threadMetadata = {
        userId: user?.id || 'anonymous',
        propertyAddress: context.propertyData?.address || 'not_provided',
        analysisId: context.propertyData?.analysisId || 'not_provided',
        totalRevenue: context.propertyData?.totalMonthlyRevenue || 0,
        partnersAvailable: context.serviceProviders.length,
        timestamp: new Date().toISOString()
      };

      console.log('🧵 [ASSISTANT] Creating thread...', {
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
        throw new Error(`Thread creation failed: ${threadError.message}`);
      }

      if (!threadData.success) {
        console.error('❌ [ASSISTANT] Thread creation failed:', threadData);
        throw new Error(`Thread creation failed: ${threadData.error}`);
      }

      const newThreadId = threadData.thread.id;
      console.log('✅ [ASSISTANT] Thread created:', newThreadId);

      // Step 6: Set state and show welcome
      setAssistantId(newAssistantId);
      setThreadId(newThreadId);
      setState('ready');
      retryCountRef.current = 0;

      // Generate welcome message
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
      
      // Implement retry logic
      if (retryCountRef.current < maxRetries && !error.message.includes('Assistant ID not configured')) {
        retryCountRef.current++;
        console.log(`🔄 [ASSISTANT] Retrying (${retryCountRef.current}/${maxRetries})`);
        
        setState('reconnecting');
        setTimeout(() => {
          initializationRef.current = false;
          initializeAssistant();
        }, 2000 * retryCountRef.current);
        return;
      }
      
      setState('error');
      
      // Enhanced error messaging
      let errorMessage = error.message || 'Failed to initialize assistant';
      
      if (errorMessage.includes('Connection test failed')) {
        errorMessage += '\n\nThis usually means:\n• OpenAI API key is missing or invalid\n• Network connectivity issues\n• OpenAI service temporarily unavailable';
      } else if (errorMessage.includes('Service issues')) {
        errorMessage += '\n\nThis usually means:\n• OpenAI API key is missing\n• Assistant ID not configured\n• Service temporarily unavailable';
      } else if (errorMessage.includes('Thread creation failed')) {
        errorMessage += '\n\nPlease check your network connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      initializationRef.current = false;
    }
  }, [user?.id, loadUserContext, state, testOpenAIConnection]);

  const generateWelcomeMessage = useCallback((context: UserContext) => {
    if (!context.propertyData) {
      return `Hi! I'm your AI assistant for property monetization. I help you explore ways to earn money from your property and connect with the right partners.

${!user ? '💡 **Tip:** Sign in to save progress and access full features.' : ''}

How can I help you today?`;
    }

    const { address, totalMonthlyRevenue, availableAssets } = context.propertyData;
    const topAssets = availableAssets.filter(a => a.hasRevenuePotential || a.monthlyRevenue > 0).slice(0, 3);

    if (topAssets.length === 0 && totalMonthlyRevenue === 0) {
      return `Hi! I've reviewed your property at **${address}**.

While our analysis shows limited immediate opportunities, I can help you explore other options and connect with partners to unlock your property's potential.

${!user ? '💡 **Tip:** Sign in to save progress and access full features.' : ''}

What areas would you like to explore?`;
    }

    const assetList = topAssets.map(asset => `• **${asset.name}** - $${asset.monthlyRevenue}/month`).join('\n');
    const partnersAvailable = context.serviceProviders.length;
    
    return `Hi! I've analyzed your property at **${address}**! 🏠

**Your Opportunities:**
${assetList}

**Total Potential:** $${totalMonthlyRevenue}/month

I have access to **${partnersAvailable} partner services** to help you set up these opportunities.

${!user ? '💡 **Tip:** Sign in to save progress and access full features.' : ''}

Would you like to start with a specific asset or get partner recommendations?`;
  }, [user]);

  // Auto-initialize when idle
  useEffect(() => {
    if (state === 'idle' && !initializationRef.current) {
      const timer = setTimeout(() => {
        initializeAssistant();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initializeAssistant, state]);

  // Enhanced send message with proper OpenAI workflow
  const sendMessage = useCallback(async (message: string) => {
    if (!assistantId || !threadId || state !== 'ready') {
      console.warn('⚠️ [MESSAGE] Cannot send - not ready:', {
        assistantId: !!assistantId,
        threadId: !!threadId,
        state
      });
      return;
    }

    console.log('💬 [MESSAGE] Starting OpenAI workflow...');
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
      // STEP 2: Send message to thread
      console.log('📝 [MESSAGE] Step 2: Adding message to thread...');
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

      if (messageError) {
        console.error('❌ [MESSAGE] Step 2 failed:', messageError);
        throw messageError;
      }

      if (!messageData.success) {
        console.error('❌ [MESSAGE] Step 2 failed:', messageData);
        throw new Error(messageData.error || 'Failed to add message');
      }

      console.log('✅ [MESSAGE] Step 2 complete');

      // STEP 3: Create run with assistant
      console.log('🏃 [MESSAGE] Step 3: Creating run...');
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

      if (runError) {
        console.error('❌ [MESSAGE] Step 3 failed:', runError);
        throw runError;
      }

      if (!runData.success) {
        console.error('❌ [MESSAGE] Step 3 failed:', runData);
        throw new Error(runData.error || 'Failed to create run');
      }

      console.log('✅ [MESSAGE] Step 3 complete');

      // STEP 4: Poll for completion
      console.log('📊 [MESSAGE] Step 4: Polling for completion...');
      pollForCompletion(runData.run.id);

    } catch (error: any) {
      console.error('❌ [MESSAGE] OpenAI workflow failed:', error);
      setState('ready');
      
      let errorMessage = error.message || 'Failed to send message';
      if (errorMessage.includes('Thread creation failed')) {
        errorMessage = 'Connection lost. Please refresh and try again.';
      }
      
      setError(errorMessage);
    }
  }, [assistantId, threadId, state, user?.id, userContext]);

  // Enhanced polling with better error handling
  const pollForCompletion = useCallback((runId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    let attempts = 0;
    const maxAttempts = 60;
    let pollInterval = 1000;

    const poll = async () => {
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
        console.log(`📊 [POLL] Run status (${attempts}):`, run.status);

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
                content: msg.content[0]?.text?.value || 'Sorry, I encountered an issue.',
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
          setError(`AI processing ${run.status}: ${run.last_error?.message || 'Please try again'}`);
          
        } else if (run.status === 'in_progress' || run.status === 'queued') {
          // Continue polling with backoff
          pollInterval = Math.min(pollInterval * 1.2, 5000);
        }

      } catch (error: any) {
        console.error('❌ [POLL] Error:', error);
        
        if (attempts > maxAttempts / 2) {
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
    poll();
  }, [threadId]);

  // Handle required actions
  const handleRequiredActions = useCallback(async (run: any, runId: string) => {
    console.log('🔧 [ACTIONS] Handling required actions');

    if (run.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      
      setMessages(prev => [...prev, {
        id: `tool_calls_${runId}`,
        role: 'assistant',
        content: `Processing your request using ${toolCalls.length} tools...`,
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
        
        // Continue polling
        pollForCompletion(data.run.id);

      } catch (error: any) {
        console.error('❌ [ACTIONS] Failed:', error);
        setState('ready');
        setError('Failed to process request. Please try again.');
      }
    }
  }, [threadId, user?.id, pollForCompletion]);

  // Clear error and retry
  const clearError = useCallback(() => {
    console.log('🔧 [ASSISTANT] Clearing error and retrying...');
    setError(null);
    if (state === 'error') {
      setState('idle');
      retryCountRef.current = 0;
      setTimeout(() => {
        initializeAssistant();
      }, 500);
    }
  }, [state, initializeAssistant]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    console.log('🔄 [ASSISTANT] Resetting conversation...');
    
    // Cleanup
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
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
    authError: error?.includes('auth') || error?.includes('sign in'),
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
