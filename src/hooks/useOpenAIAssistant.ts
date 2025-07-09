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
  isInitialized: boolean;
}

interface UserContext {
  propertyData: PropertyAnalysisData | null;
  serviceProviders: any[];
  onboardingProgress: any;
  isLoaded: boolean;
}

// Singleton pattern for initialization control
class AssistantInitializationManager {
  private static instance: AssistantInitializationManager;
  private initializationPromise: Promise<any> | null = null;
  private isInitializing = false;
  private lastInitAttempt = 0;
  private failureCount = 0;
  private readonly COOLDOWN_MS = 5000; // 5 second cooldown between attempts
  private readonly MAX_FAILURES = 3;

  static getInstance(): AssistantInitializationManager {
    if (!AssistantInitializationManager.instance) {
      AssistantInitializationManager.instance = new AssistantInitializationManager();
    }
    return AssistantInitializationManager.instance;
  }

  canInitialize(): boolean {
    const now = Date.now();
    const cooldownPassed = now - this.lastInitAttempt > this.COOLDOWN_MS;
    const underFailureLimit = this.failureCount < this.MAX_FAILURES;
    
    console.log('🔍 [INIT_MANAGER] Can initialize?', {
      isInitializing: this.isInitializing,
      cooldownPassed,
      underFailureLimit,
      failureCount: this.failureCount,
      timeSinceLastAttempt: now - this.lastInitAttempt
    });

    return !this.isInitializing && cooldownPassed && underFailureLimit;
  }

  async initialize(initFunction: () => Promise<any>): Promise<any> {
    if (this.isInitializing && this.initializationPromise) {
      console.log('🔄 [INIT_MANAGER] Reusing existing initialization promise');
      return this.initializationPromise;
    }

    if (!this.canInitialize()) {
      const timeToWait = this.COOLDOWN_MS - (Date.now() - this.lastInitAttempt);
      throw new Error(`Assistant initialization on cooldown. Wait ${Math.ceil(timeToWait / 1000)}s before retrying.`);
    }

    this.isInitializing = true;
    this.lastInitAttempt = Date.now();

    console.log('🚀 [INIT_MANAGER] Starting new initialization attempt', {
      attempt: this.failureCount + 1,
      maxAttempts: this.MAX_FAILURES
    });

    this.initializationPromise = initFunction()
      .then((result) => {
        console.log('✅ [INIT_MANAGER] Initialization successful');
        this.failureCount = 0;
        this.isInitializing = false;
        this.initializationPromise = null;
        return result;
      })
      .catch((error) => {
        console.error('❌ [INIT_MANAGER] Initialization failed:', error);
        this.failureCount++;
        this.isInitializing = false;
        this.initializationPromise = null;
        throw error;
      });

    return this.initializationPromise;
  }

  reset(): void {
    console.log('🔄 [INIT_MANAGER] Resetting initialization manager');
    this.isInitializing = false;
    this.initializationPromise = null;
    this.failureCount = 0;
    this.lastInitAttempt = 0;
  }
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
    authError: false,
    isInitialized: false
  });

  const [userContext, setUserContext] = useState<UserContext>({
    propertyData: null,
    serviceProviders: [],
    onboardingProgress: null,
    isLoaded: false
  });

  const propertyDataRef = useRef<PropertyAnalysisData | null>(null);
  const initManagerRef = useRef<AssistantInitializationManager>(AssistantInitializationManager.getInstance());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset assistant when property data changes significantly
  useEffect(() => {
    const currentPropertyData = propertyData;
    const previousPropertyData = propertyDataRef.current;
    
    const hasChanged = (
      currentPropertyData?.analysisId !== previousPropertyData?.analysisId ||
      currentPropertyData?.address !== previousPropertyData?.address
    );
    
    if (hasChanged && state.isInitialized) {
      console.log('🔄 [ASSISTANT] Property data changed, resetting assistant:', {
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
        authError: false,
        isInitialized: false
      });
      
      setUserContext(prev => ({
        ...prev,
        propertyData: currentPropertyData,
        isLoaded: false
      }));
      
      initManagerRef.current.reset();
    }
    
    propertyDataRef.current = currentPropertyData;
  }, [propertyData?.analysisId, propertyData?.address, state.isInitialized]);

  // Enhanced context loading with timeout and retry
  const loadUserContext = useCallback(async (): Promise<UserContext> => {
    console.log('🔍 [CONTEXT] Loading user context data...');

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Context loading timeout')), 10000);
    });

    try {
      const contextPromise = (async () => {
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

        return {
          propertyData: propertyData,
          serviceProviders: providers || [],
          onboardingProgress: onboarding,
          isLoaded: true
        };
      })();

      const contextData = await Promise.race([contextPromise, timeoutPromise]);

      setUserContext(contextData);
      console.log('✅ [CONTEXT] User context loaded successfully:', {
        providersCount: contextData.serviceProviders.length,
        hasOnboarding: !!contextData.onboardingProgress,
        hasPropertyData: !!contextData.propertyData,
        isLoaded: contextData.isLoaded
      });

      return contextData;
    } catch (error) {
      console.error('❌ [CONTEXT] Failed to load user context:', error);
      // Set context as loaded even if some data failed to prevent infinite loading
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

  // Load context when dependencies change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUserContext();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
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

  // Enhanced initialization function with comprehensive error handling
  const initializeAssistant = useCallback(async (): Promise<{ assistantId: string; threadId: string } | null> => {
    try {
      console.log('🤖 [ASSISTANT] Starting initialization process...');

      // Validate prerequisites
      if (!userContext.isLoaded) {
        console.log('⏳ [ASSISTANT] Waiting for user context to load...');
        return null;
      }

      if (!initManagerRef.current.canInitialize()) {
        console.log('🛑 [ASSISTANT] Initialization blocked by manager');
        return null;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null, authError: false }));

      const result = await initManagerRef.current.initialize(async () => {
        console.log('🔧 [ASSISTANT] Executing initialization with context:', {
          address: userContext.propertyData?.address,
          analysisId: userContext.propertyData?.analysisId,
          totalRevenue: userContext.propertyData?.totalMonthlyRevenue,
          assetsCount: userContext.propertyData?.availableAssets?.length,
          partnersCount: userContext.serviceProviders.length,
          userId: user?.id || 'anonymous',
          hasOnboarding: !!userContext.onboardingProgress
        });

        // Get existing assistant with timeout
        const assistantPromise = supabase.functions.invoke('openai-assistant-manager', {
          body: { action: 'get_assistant' }
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Assistant retrieval timeout')), 15000);
        });

        const { data: assistantData, error: assistantError } = await Promise.race([
          assistantPromise,
          timeoutPromise
        ]);

        if (assistantError) {
          console.error('❌ [ASSISTANT] Assistant retrieval failed:', assistantError);
          throw new Error(`Assistant setup failed: ${assistantError.message || 'Unknown error'}`);
        }

        const assistantId = assistantData.assistant.id;
        console.log('✅ [ASSISTANT] Using assistant:', assistantId);

        // Create thread with enhanced metadata
        const threadMetadata = {
          userId: user?.id || 'anonymous',
          propertyAddress: userContext.propertyData?.address || 'not_provided',
          analysisId: userContext.propertyData?.analysisId || 'not_provided',
          totalRevenue: userContext.propertyData?.totalMonthlyRevenue || 0,
          assetsCount: userContext.propertyData?.availableAssets?.length || 0,
          partnersAvailable: userContext.serviceProviders.length,
          timestamp: new Date().toISOString(),
          initializationAttempt: initManagerRef.current['failureCount'] + 1
        };

        const threadPromise = supabase.functions.invoke('openai-assistant-manager', {
          body: {
            action: 'create_thread',
            data: { metadata: threadMetadata }
          }
        });

        const { data: threadData, error: threadError } = await Promise.race([
          threadPromise,
          timeoutPromise
        ]);

        if (threadError) {
          console.error('❌ [ASSISTANT] Thread creation failed:', threadError);
          if (threadError.message?.includes('Authentication') || threadError.message?.includes('auth')) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              error: 'Please sign in to use the AI assistant with full functionality',
              authError: true
            }));
            return null;
          }
          throw new Error(`Thread creation failed: ${threadError.message || 'Unknown error'}`);
        }

        const threadId = threadData.thread.id;
        console.log('✅ [ASSISTANT] Thread created:', threadId);

        return { assistantId, threadId };
      });

      if (result) {
        setState(prev => ({
          ...prev,
          assistantId: result.assistantId,
          threadId: result.threadId,
          isLoading: false,
          isInitialized: true,
          messages: [{
            id: 'welcome',
            role: 'assistant',
            content: generateWelcomeMessage(userContext),
            timestamp: new Date()
          }]
        }));

        console.log('🎉 [ASSISTANT] Initialization completed successfully');
        return result;
      }

      return null;
    } catch (error) {
      console.error('❌ [ASSISTANT] Initialization failed:', error);
      
      const errorMessage = error.message || 'Failed to initialize assistant. Please try again.';
      const isAuthError = errorMessage.includes('auth') || errorMessage.includes('Authentication');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        authError: isAuthError,
        isInitialized: false
      }));
      
      return null;
    }
  }, [userContext, user?.id, generateWelcomeMessage]);

  // Auto-initialize when context is ready
  useEffect(() => {
    if (userContext.isLoaded && !state.isInitialized && !state.isLoading) {
      console.log('🚀 [ASSISTANT] Auto-initializing with loaded context');
      initializeAssistant();
    }
  }, [userContext.isLoaded, state.isInitialized, state.isLoading, initializeAssistant]);

  // Enhanced message sending with proper error handling
  const sendMessage = useCallback(async (message: string) => {
    if (!state.assistantId || !state.threadId || state.isProcessing) {
      console.warn('⚠️ [MESSAGE] Cannot send message - assistant not ready');
      return;
    }

    console.log('💬 [MESSAGE] Sending message to assistant:', message);
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
      // Send message to thread with timeout
      const messagePromise = supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'send_message',
          data: {
            threadId: state.threadId,
            message,
            userId: user?.id || 'anonymous',
            userContext: {
              propertyData: userContext.propertyData,
              serviceProviders: userContext.serviceProviders.slice(0, 10),
              onboardingProgress: userContext.onboardingProgress
            }
          }
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Message send timeout')), 15000);
      });

      const { data: messageData, error: messageError } = await Promise.race([
        messagePromise,
        timeoutPromise
      ]);

      if (messageError) throw messageError;

      // Run assistant with timeout
      const runPromise = supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'run_assistant',
          data: {
            threadId: state.threadId,
            assistantId: state.assistantId,
            userId: user?.id || 'anonymous'
          }
        }
      });

      const { data: runData, error: runError } = await Promise.race([
        runPromise,
        timeoutPromise
      ]);

      if (runError) throw runError;

      setState(prev => ({ ...prev, runId: runData.run.id }));
      pollForCompletion(runData.run.id);

    } catch (error) {
      console.error('❌ [MESSAGE] Failed to send message:', error);
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
        console.log('📊 [POLL] Run status:', run.status);

        if (run.status === 'completed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

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
        console.error('❌ [POLL] Polling error:', error);
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
    console.log('🔧 [ACTIONS] Handling required actions:', run.required_action);

    if (run.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      
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

        setState(prev => ({ ...prev, runId: data.run.id }));
        pollForCompletion(data.run.id);

      } catch (error) {
        console.error('❌ [ACTIONS] Failed to submit tool outputs:', error);
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
      authError: false,
      isInitialized: false
    });
    
    setUserContext(prev => ({ ...prev, isLoaded: false }));
    initManagerRef.current.reset();
  }, []);

  return {
    ...state,
    userContext,
    initializeAssistant,
    sendMessage,
    clearError,
    resetConversation,
    isReady: state.isInitialized && !!state.assistantId && !!state.threadId
  };
};
