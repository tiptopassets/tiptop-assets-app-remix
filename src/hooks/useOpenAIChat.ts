import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseOpenAIChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

export const useOpenAIChat = (): UseOpenAIChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  const initializeThread = async () => {
    if (threadId) return threadId;

    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { action: 'create_thread' }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setThreadId(data.threadId);
      return data.threadId;
    } catch (err) {
      console.error('Failed to create thread:', err);
      throw err;
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to local state immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: message.trim(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Get or create thread
      const currentThreadId = await initializeThread();

      // Send message to OpenAI
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          action: 'send_message', 
          message: message.trim(),
          threadId: currentThreadId
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Add assistant response to local state
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setThreadId(null);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
};