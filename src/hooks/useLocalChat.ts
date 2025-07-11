
import { useState, useCallback } from 'react';
import { LocalChatService, ChatMessage } from '@/services/localChatService';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

export const useLocalChat = (propertyData: PropertyAnalysisData | null) => {
  const [chatService] = useState(() => new LocalChatService(propertyData));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    console.log('📨 [USE_LOCAL_CHAT] sendMessage called with:', userMessage);
    
    if (!userMessage.trim() || isLoading) {
      console.log('⚠️ [USE_LOCAL_CHAT] Message rejected - empty or loading');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [USE_LOCAL_CHAT] Processing message through chat service...');
      // Process the message through our local chat service
      const response = await chatService.processMessage(userMessage);
      
      // Update messages state with the latest from the service
      const updatedMessages = chatService.getMessages();
      setMessages([...updatedMessages]);
      
      console.log('✅ [USE_LOCAL_CHAT] Message processed successfully:', {
        userMessage,
        response: response.substring(0, 100) + '...',
        messageCount: updatedMessages.length,
        totalMessages: updatedMessages.length
      });
      
    } catch (err) {
      console.error('❌ [USE_LOCAL_CHAT] Error processing message:', err);
      setError(err instanceof Error ? err.message : 'Failed to process message');
    } finally {
      setIsLoading(false);
    }
  }, [chatService, isLoading]);

  const clearChat = useCallback(() => {
    console.log('🧹 [USE_LOCAL_CHAT] Clearing chat');
    setMessages([]);
    setError(null);
    // Create a new chat service instance to reset state
    chatService.getMessages().length = 0;
  }, [chatService]);

  const getContext = useCallback(() => {
    return chatService.getContext();
  }, [chatService]);

  const updateContext = useCallback((updates: any) => {
    chatService.updateContext(updates);
  }, [chatService]);

  console.log('🔍 [USE_LOCAL_CHAT] Current state:', {
    messageCount: messages.length,
    isLoading,
    hasError: !!error,
    sendMessageReady: !!sendMessage
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    getContext,
    updateContext
  };
};
