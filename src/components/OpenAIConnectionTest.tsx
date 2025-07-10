import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { OpenAIAssistantManager } from './OpenAIAssistantManager';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export const OpenAIConnectionTest = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (name: string, status: TestResult['status'], message?: string, data?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.data = data;
        return [...prev];
      }
      return [...prev, { name, status, message, data }];
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Create Thread (using working openai-chat function)
    updateResult('Create Thread', 'pending');
    try {
      console.log('🧵 Creating thread...');
      const { data: threadData, error: threadError } = await supabase.functions.invoke('openai-chat', {
        body: { action: 'create_thread' }
      });

      if (threadError) {
        throw new Error(`Thread creation failed: ${threadError.message}`);
      }

      if (!threadData?.threadId) {
        throw new Error(`Thread creation failed: No thread ID returned`);
      }

      updateResult('Create Thread', 'success', `Thread created: ${threadData.threadId}`, threadData);

      // Test 2: Send Message to Thread
      updateResult('Send Message', 'pending');
      try {
        console.log('💬 Sending message to thread...');
        const { data: messageData, error: messageError } = await supabase.functions.invoke('openai-chat', {
          body: {
            action: 'send_message',
            threadId: threadData.threadId,
            message: 'Hello! This is a test message to verify the OpenAI Assistant API integration.'
          }
        });

        if (messageError) {
          throw new Error(`Message sending failed: ${messageError.message}`);
        }

        if (!messageData?.response) {
          throw new Error(`Message sending failed: No response received`);
        }

        updateResult('Send Message', 'success', `Assistant responded: ${messageData.response.substring(0, 100)}...`, messageData);
      } catch (error: any) {
        updateResult('Send Message', 'error', error.message);
      }

    } catch (error: any) {
      updateResult('Create Thread', 'error', error.message);
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <Tabs defaultValue="test" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="test">Connection Test</TabsTrigger>
        <TabsTrigger value="manage">Manage Assistants</TabsTrigger>
      </TabsList>
      
      <TabsContent value="test" className="space-y-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>OpenAI & Supabase Connection Test</CardTitle>
            <CardDescription>
              Test the integration between our Supabase Edge Function and OpenAI Assistant API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Tests...' : 'Run Connection Tests'}
            </Button>

            {results.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                {results.map((result) => (
                  <div key={result.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <div>
                        <div className="font-medium">{result.name}</div>
                        {result.message && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {result.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Implementation Notes (Based on OpenAI Docs):</h4>
              <ul className="text-sm space-y-1">
                <li>✅ Threads are created independently without assistant_id</li>
                <li>✅ Assistant is only linked during runs.create()</li>
                <li>✅ Using OpenAI SDK consistently throughout</li>
                <li>✅ Proper error handling and logging</li>
                <li>✅ Following official OpenAI workflow: Thread → Messages → Run → Poll</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="manage">
        <OpenAIAssistantManager />
      </TabsContent>
    </Tabs>
  );
};