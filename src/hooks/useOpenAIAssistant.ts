import { useState, useCallback, useRef } from 'react';
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
    error: null
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeAssistant = useCallback(async () => {
    console.log('🤖 Initializing OpenAI Assistant...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create assistant
      const { data: assistantData, error: assistantError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'create_assistant',
          data: { propertyData }
        }
      });

      if (assistantError) throw assistantError;

      const assistantId = assistantData.assistant.id;
      console.log('✅ Assistant created:', assistantId);

      // Create thread
      const { data: threadData, error: threadError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'create_thread',
          data: {
            metadata: {
              userId: user?.id,
              propertyAddress: propertyData?.address,
              analysisId: propertyData?.analysisId
            }
          }
        }
      });

      if (threadError) throw threadError;

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
          content: generateWelcomeMessage(),
          timestamp: new Date()
        }]
      }));

      return { assistantId, threadId };
    } catch (error) {
      console.error('❌ Failed to initialize assistant:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to initialize assistant'
      }));
      throw error;
    }
  }, [propertyData, user?.id]);

  const generateWelcomeMessage = useCallback(() => {
    if (!propertyData) {
      return "Hi! I'm your AI assistant for property monetization. I'm here to help you explore ways to earn money from your property assets. How can I assist you today?";
    }

    const { address, totalMonthlyRevenue, availableAssets } = propertyData;
    const topAssets = availableAssets.filter(a => a.hasRevenuePotential).slice(0, 3);

    if (topAssets.length === 0) {
      return `Hi! I've reviewed your property at **${address}**. While I don't see immediate monetization opportunities in our current analysis, I'm here to help you explore other options. What specific areas of your property are you most interested in monetizing?`;
    }

    const assetList = topAssets.map(asset => `**${asset.name}** ($${asset.monthlyRevenue}/month)`).join(', ');
    
    return `Hi! I'm your AI assistant and I've analyzed your property at **${address}**! 🏠

I found great monetization opportunities including: ${assetList}. Your total earning potential is **$${totalMonthlyRevenue}/month**.

I'm here to guide you through setting up these assets step-by-step. You can click on any asset badge in the sidebar to start its specific setup, or ask me any questions about the monetization process!`;
  }, [propertyData]);

  const sendMessage = useCallback(async (message: string) => {
    if (!state.assistantId || !state.threadId || state.isProcessing) return;

    console.log('💬 Sending message to assistant:', message);
    setState(prev => ({ 
      ...prev, 
      isProcessing: true,
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
            userId: user?.id
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
            userId: user?.id
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
        error: error.message || 'Failed to send message'
      }));
    }
  }, [state.assistantId, state.threadId, state.isProcessing, user?.id]);

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
          error: error.message || 'Polling failed'
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
              userId: user?.id
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
    setState(prev => ({ ...prev, error: null }));
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
      error: null
    });
  }, []);

  return {
    ...state,
    initializeAssistant,
    sendMessage,
    clearError,
    resetConversation,
    isReady: !!state.assistantId && !!state.threadId
  };
};