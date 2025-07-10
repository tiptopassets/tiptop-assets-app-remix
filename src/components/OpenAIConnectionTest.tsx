import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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

    // Test 1: Basic OpenAI Connection
    updateResult('OpenAI Connection', 'pending');
    try {
      console.log('🔧 Testing OpenAI connection...');
      const { data: connectionTest, error: connectionError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: { action: 'test_connection' }
      });

      if (connectionError) {
        throw new Error(`Connection test failed: ${connectionError.message}`);
      }

      if (!connectionTest.success) {
        throw new Error(`OpenAI connection failed: ${connectionTest.error}`);
      }

      updateResult('OpenAI Connection', 'success', `Connected successfully. Models available: ${connectionTest.modelsAvailable}`, connectionTest);
    } catch (error: any) {
      updateResult('OpenAI Connection', 'error', error.message);
    }

    // Test 2: Assistant Setup
    updateResult('Assistant Setup', 'pending');
    try {
      console.log('🔧 Testing assistant setup...');
      const { data: setupTest, error: setupError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: { action: 'test_assistant_setup' }
      });

      if (setupError) {
        throw new Error(`Setup test failed: ${setupError.message}`);
      }

      if (!setupTest.success) {
        const failedTests = [];
        if (!setupTest.tests?.openai) failedTests.push('OpenAI API');
        if (!setupTest.tests?.database) failedTests.push('Database');
        if (!setupTest.tests?.assistant) failedTests.push('AI Assistant');
        throw new Error(`Service issues: ${failedTests.join(', ')} failed`);
      }

      updateResult('Assistant Setup', 'success', 'All setup tests passed', setupTest);
    } catch (error: any) {
      updateResult('Assistant Setup', 'error', error.message);
    }

    // Test 3: Get Assistant
    updateResult('Get Assistant', 'pending');
    try {
      console.log('🔧 Getting assistant...');
      const { data: assistantData, error: assistantError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: { action: 'get_assistant' }
      });

      if (assistantError) {
        throw new Error(`Assistant get failed: ${assistantError.message}`);
      }

      if (!assistantData.success) {
        throw new Error(`Assistant get failed: ${assistantData.error}`);
      }

      updateResult('Get Assistant', 'success', `Assistant retrieved: ${assistantData.assistant.name} (${assistantData.assistant.model})`, assistantData);
    } catch (error: any) {
      updateResult('Get Assistant', 'error', error.message);
    }

    // Test 4: Create Thread (following OpenAI documentation - threads are created independently)
    updateResult('Create Thread', 'pending');
    try {
      console.log('🧵 Creating thread...');
      const { data: threadData, error: threadError } = await supabase.functions.invoke('openai-assistant-manager', {
        body: {
          action: 'create_thread',
          data: { 
            metadata: {
              userId: 'test_user',
              testRun: true,
              timestamp: new Date().toISOString()
            }
          }
        }
      });

      if (threadError) {
        throw new Error(`Thread creation failed: ${threadError.message}`);
      }

      if (!threadData?.success || !threadData?.thread?.id) {
        throw new Error(`Thread creation failed: ${threadData?.error || 'Invalid response'}`);
      }

      updateResult('Create Thread', 'success', `Thread created: ${threadData.thread.id}`, threadData);

      // Test 5: Add Message to Thread
      updateResult('Add Message', 'pending');
      try {
        console.log('💬 Adding message to thread...');
        const { data: messageData, error: messageError } = await supabase.functions.invoke('openai-assistant-manager', {
          body: {
            action: 'send_message',
            data: {
              threadId: threadData.thread.id,
              message: 'Hello! This is a test message to verify the OpenAI Assistant API integration.',
              userId: 'test_user'
            }
          }
        });

        if (messageError) {
          throw new Error(`Message sending failed: ${messageError.message}`);
        }

        if (!messageData.success) {
          throw new Error(`Message sending failed: ${messageData.error}`);
        }

        updateResult('Add Message', 'success', `Message added successfully`, messageData);
      } catch (error: any) {
        updateResult('Add Message', 'error', error.message);
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
  );
};