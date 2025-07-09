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

interface AssistantState {
  assistantId: string | null;
  threadId: string | null;
  runId: string | null;
  isLoading: boolean;
  isProcessing: boolean;
  messages: AssistantMessage[];
  error: string | null;
  authError: boolean;
}

interface UserContext {
  propertyData: PropertyAnalysisData | null;
  serviceProviders: any[];
  onboardingProgress: any;
  isLoaded: boolean;
}

export const useOpenAIAssistant = (propertyData: PropertyAnalysisData | null) => {
  const { user } = useAuth();
  const [state, setState] = useState<AssistantState>({
    assistantId: null,
    threadId: null,
    runId: null,
    isLoading: false,
    isProcessing: false,
    messages: [],
    error: null,
    authError: false
  });

  const [userContext, setUserContext] = useState<UserContext>({
    propertyData: null,
    serviceProviders: [],
    onboardingProgress: null,
    isLoaded: false
  });

  // Store the property data reference to detect changes
  const propertyDataRef = useRef<PropertyAnalysisData | null>(null);
  const initializationAttempted = useRef(false);
  
  // Reset assistant when property data changes
  useEffect(() => {
    const currentPropertyData = propertyData;
    const previousPropertyData = propertyDataRef.current;
    
    // Check if property data has meaningfully changed
    const hasChanged = (
      currentPropertyData?.analysisId !== previousPropertyData?.analysisId ||
      currentPropertyData?.address !== previousPropertyData?.address
    );
    
    if (hasChanged && (state.assistantId || state.threadId)) {
      console.log('🔄 Property data changed, resetting assistant:', {
        previous: { 
          analysisId: previousPropertyData?.analysisId, 
          address: previousPropertyData?.address 
        },
        current: { 
          analysisId: currentPropertyData?.analysisId, 
          address: currentPropertyData?.address 
        }
      });
      
      // Reset everything for new property data
      setState({
        assistantId: null,
        threadId: null,
        runId: null,
        isLoading: false,
        isProcessing: false,
        messages: [],
        error: null,
        authError: false
      });
      
      setUserContext(prev => ({
        ...prev,
        propertyData: currentPropertyData,
        isLoaded: false
      }));
      
      initializationAttempted.current = false;
    }
    
    propertyDataRef.current = currentPropertyData;
  }, [propertyData?.analysisId, propertyData?.address, state.assistantId, state.threadId]);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load user context data with proper timing
  const loadUserContext = useCallback(async () => {
    console.log('🔍 Loading user context data...');

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

      console.log('✅ User context loaded:', {
        providersCount: providers?.length || 0,
        hasOnboarding: !!onboarding,
        hasPropertyData: !!propertyData,
        isLoaded: true
      });

      return contextData;
    } catch (error) {
      console.error('❌ Failed to load user context:', error);
      // Set context as loaded even if some data failed to prevent infinite loading
      setUserContext(prev => ({
        ...prev,
        propertyData: propertyData,
        isLoaded: true
      }));
      return {
        propertyData: propertyData,
        serviceProviders: [],
        onboardingProgress: null,
        isLoaded: true
      };
    }
  }, [user?.id, propertyData]);

  // Load context when dependencies change
  useEffect(() => {
    loadUserContext();
  }, [loadUserContext]);

  const generateWelcomeMessage = useCallback((context: UserContext) => {
    if (!context.propertyData) {
      return "Hi! I'm your AI assistant for property monetization. I'm here to help you explore ways to earn money from your property assets and connect you with the right partners. How can I assist you today?";
    }

    const { address, totalMonthlyRevenue, availableAssets } = context.propertyData;
    
    console.log('🎯 [WELCOME] Generating message with context:', {
      address,
      totalMonthlyRevenue,
      availableAssetsCount: availableAssets.length,
      serviceProvidersCount: context.serviceProviders.length,
      hasOnboarding: !!context.onboardingProgress
    });

    // Get assets with revenue potential
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

  const initializeAssistant = useCallback(async (retryCount = 0) => {
    // Prevent multiple initialization attempts
    if (initializationAttempted.current && retryCount === 0) {
      console.log('🛑 Assistant initialization already attempted');
      return;
    }

    // Wait for user context to be loaded
    if (!userContext.isLoaded) {
      console.log('⏳ Waiting for user context to load...');
      return;
    }

    console.log('🤖 Initializing OpenAI Assistant with context:', {
      address: userContext.propertyData?.address,
      analysisId: userContext.propertyData?.analysisId,
      totalRevenue: userContext.propertyData?.totalMonthlyRevenue,
      assetsCount: userContext.propertyData?.availableAssets?.length,
      partnersCount: userContext.serviceProviders.length,
      userId: user?.id || 'anonymous',
      hasOnboarding: !!userContext.onboardingProgress,
      retryCount
    });

    initializationAttempted.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null, authError: false }));

    try {
      // Get existing assistant
      const { data: assistantData, error: assistantError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'get_assistant'
        }
      });

      if (assistantError) {
        console.error('❌ Assistant retrieval failed:', assistantError);
        throw assistantError;
      }

      const assistantId = assistantData.assistant.id;
      console.log('✅ Using assistant:', assistantId);

      // Create thread with enhanced metadata
      const threadMetadata = {
        userId: user?.id || 'anonymous',
        propertyAddress: userContext.propertyData?.address,
        analysisId: userContext.propertyData?.analysisId,
        totalRevenue: userContext.propertyData?.totalMonthlyRevenue,
        assetsCount: userContext.propertyData?.availableAssets?.length,
        partnersAvailable: userContext.serviceProviders.length,
        timestamp: new Date().toISOString()
      };

      const { data: threadData, error: threadError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'create_thread',
          data: {
            metadata: threadMetadata
          }
        }
      });

      if (threadError) {
        console.error('❌ Thread creation failed:', threadError);
        if (threadError.message?.includes('Authentication required')) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Please sign in to use the AI assistant with full functionality',
            authError: true
          }));
          return;
        }
        throw threadError;
      }

      const threadId = threadData.thread.id;
      console.log('✅ Thread created:', threadId);

      setState(prev => ({
        ...prev,
        assistantId,
        threadId,
        isLoading: false,
        messages: [{
          id: 'welcome',
          role: 'assistant',
          content: generateWelcomeMessage(userContext),
          timestamp: new Date()
        }]
      }));

      return { assistantId, threadId };
    } catch (error) {
      console.error('❌ Failed to initialize assistant:', error);
      
      // Retry logic for temporary failures
      if (retryCount < 2 && !error.message?.includes('auth')) {
        console.log(`🔄 Retrying assistant initialization (attempt ${retryCount + 1})`);
        setTimeout(() => {
          initializationAttempted.current = false;
          initializeAssistant(retryCount + 1);
        }, 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to initialize assistant. Please try again.',
        authError: error.message?.includes('auth') || error.message?.includes('Authentication')
      }));
      throw error;
    }
  }, [userContext, user?.id, generateWelcomeMessage]);

  // Auto-initialize when context is loaded
  useEffect(() => {
    if (userContext.isLoaded && !state.assistantId && !state.isLoading && !initializationAttempted.current) {
      console.log('🚀 Auto-initializing assistant with loaded context');
      initializeAssistant();
    }
  }, [userContext.isLoaded, state.assistantId, state.isLoading, initializeAssistant]);

  const sendMessage = useCallback(async (message: string) => {
    if (!state.assistantId || !state.threadId || state.isProcessing) return;

    console.log('💬 Sending message to assistant:', message);
    setState(prev => ({ 
      ...prev, 
      isProcessing: true,
      error: null,
      messages: [...prev.messages, {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      }]
    }));

    try {
      // Send message to thread
      const { data: messageData, error: messageError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'send_message',
          data: {
            threadId: state.threadId,
            message,
            userId: user?.id || 'anonymous',
            userContext: {
              propertyData: userContext.propertyData,
              serviceProviders: userContext.serviceProviders.slice(0, 10), // Limit context size
              onboardingProgress: userContext.onboardingProgress
            }
          }
        }
      });

      if (messageError) throw messageError;

      // Run assistant
      const { data: runData, error: runError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'run_assistant',
          data: {
            threadId: state.threadId,
            assistantId: state.assistantId,
            userId: user?.id || 'anonymous'
          }
        }
      });

      if (runError) throw runError;

      setState(prev => ({ ...prev, runId: runData.run.id }));

      // Start polling for completion
      pollForCompletion(runData.run.id);

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Failed to send message. Please try again.'
      }));
    }
  }, [state.assistantId, state.threadId, state.isProcessing, user?.id, userContext]);

  const pollForCompletion = useCallback((runId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('openai-assistant-manager', {
          body: {
            action: 'get_run_status',
            data: {
              threadId: state.threadId,
              runId
            }
          }
        });

        if (error) throw error;

        const { run, messages } = data;
        console.log('📊 Run status:', run.status);

        if (run.status === 'completed') {
          // Clear polling
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          // Add assistant messages
          if (messages) {
            const assistantMessages = messages
              .filter((msg: any) => msg.role === 'assistant')
              .map((msg: any) => ({
                id: msg.id,
                role: 'assistant' as const,
                content: msg.content[0]?.text?.value || '',
                timestamp: new Date(msg.created_at * 1000)
              }));

            setState(prev => ({
              ...prev,
              messages: [...prev.messages, ...assistantMessages],
              isProcessing: false,
              runId: null
            }));
          }

        } else if (run.status === 'requires_action') {
          // Handle function calls
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

          setState(prev => ({
            ...prev,
            isProcessing: false,
            error: `Run ${run.status}: ${run.last_error?.message || 'Unknown error'}`
          }));
        }

      } catch (error) {
        console.error('❌ Polling error:', error);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: error.message || 'Communication error. Please try again.'
        }));
      }
    }, 2000);
  }, [state.threadId]);

  const handleRequiredActions = useCallback(async (run: any, runId: string) => {
    console.log('🔧 Handling required actions:', run.required_action);

    if (run.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      
      // Show function calls to user
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: `tool_calls_${runId}`,
          role: 'assistant',
          content: 'I\'m processing your request and gathering the necessary information...',
          timestamp: new Date(),
          functionCalls: toolCalls
        }]
      }));

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
              threadId: state.threadId,
              runId,
              toolOutputs,
              userId: user?.id || 'anonymous'
            }
          }
        });

        if (error) throw error;

        // Continue polling with the updated run
        setState(prev => ({ ...prev, runId: data.run.id }));
        pollForCompletion(data.run.id);

      } catch (error) {
        console.error('❌ Failed to submit tool outputs:', error);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: error.message || 'Failed to process function calls'
        }));
      }
    }
  }, [state.threadId, user?.id, pollForCompletion]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, authError: false }));
  }, []);

  const resetConversation = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    setState({
      assistantId: null,
      threadId: null,
      runId: null,
      isLoading: false,
      isProcessing: false,
      messages: [],
      error: null,
      authError: false
    });
    
    setUserContext(prev => ({ ...prev, isLoaded: false }));
    initializationAttempted.current = false;
  }, []);

  return {
    ...state,
    userContext,
    initializeAssistant,
    sendMessage,
    clearError,
    resetConversation,
    isReady: !!state.assistantId && !!state.threadId
  };
};
