
import { useState, useCallback } from 'react';
import { LocalChatService, ChatMessage } from '@/services/localChatService';
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

export const useLocalChat = (propertyData: PropertyAnalysisData | null) => {
  const [chatService] = useState(() => new LocalChatService(propertyData));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Process the message through our local chat service
      const response = await chatService.processMessage(userMessage);
      
      // Update messages state with the latest from the service
      setMessages([...chatService.getMessages()]);
      
      console.log('💬 [LOCAL CHAT] Message processed:', {
        userMessage,
        response: response.substring(0, 100) + '...',
        messageCount: chatService.getMessages().length
      });
      
    } catch (err) {
      console.error('❌ [LOCAL CHAT] Error processing message:', err);
      setError(err instanceof Error ? err.message : 'Failed to process message');
    } finally {
      setIsLoading(false);
    }
  }, [chatService, isLoading]);

  const clearChat = useCallback(() => {
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
