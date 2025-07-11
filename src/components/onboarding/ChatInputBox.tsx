
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputBoxProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ChatInputBox = ({ onSendMessage, isLoading, error }: ChatInputBoxProps) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) {
      console.log('⚠️ [CHAT_INPUT] Message rejected - empty or loading');
      return;
    }

    const message = inputMessage.trim();
    console.log('📨 [CHAT_INPUT] Sending message:', message);
    setInputMessage('');

    try {
      await onSendMessage(message);
      console.log('✅ [CHAT_INPUT] Message sent successfully');
    } catch (error) {
      console.error('❌ [CHAT_INPUT] Error sending message:', error);
    }
  }, [inputMessage, isLoading, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  console.log('💬 [CHAT_INPUT] Rendering with:', {
    hasMessage: !!inputMessage.trim(),
    isLoading,
    hasError: !!error,
    canSend: !isLoading && inputMessage.trim()
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-0 right-0 z-[100] px-3 md:px-6"
    >
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <div className="glass-effect backdrop-blur-xl border border-border/20 rounded-2xl p-3 md:p-4 shadow-lg">
            {/* Error Message */}
            {error && (
              <div className="mb-3 text-xs text-red-600 max-w-xs truncate">
                {error}
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2 md:gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your property assets..."
                  disabled={isLoading}
                  className="min-h-[44px] resize-none border-0 bg-background/50 backdrop-blur-sm text-sm md:text-base placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 rounded-xl"
                />
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
                className="h-11 w-11 rounded-xl bg-gradient-to-r from-[hsl(267,83%,60%)] to-[hsl(267,83%,50%)] hover:from-[hsl(267,83%,55%)] hover:to-[hsl(267,83%,45%)] border-0 shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatInputBox;
