import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Assistant {
  id: string;
  name: string;
  model: string;
  instructions: string;
  created_at: number;
}

export const OpenAIAssistantManager = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAssistant, setNewAssistant] = useState<any>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Assistant ID copied to clipboard",
    });
  };

  const listExistingAssistants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching existing assistants...');
      const { data, error } = await supabase.functions.invoke('create-openai-assistant', {
        body: { action: 'list_assistants' }
      });

      if (error) {
        throw new Error(`Failed to list assistants: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(`API error: ${data.error}`);
      }

      setAssistants(data.assistants || []);
      console.log(`✅ Found ${data.assistants?.length || 0} assistants`);
    } catch (err: any) {
      console.error('❌ List assistants failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewAssistant = async () => {
    setIsLoading(true);
    setError(null);
    setNewAssistant(null);
    
    try {
      console.log('🤖 Creating new assistant...');
      const { data, error } = await supabase.functions.invoke('create-openai-assistant', {
        body: { action: 'create_assistant' }
      });

      if (error) {
        throw new Error(`Failed to create assistant: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(`API error: ${data.error}`);
      }

      setNewAssistant(data.assistant);
      console.log('✅ Assistant created:', data.assistant.id);
      
      toast({
        title: "Success!",
        description: "New OpenAI Assistant created successfully",
      });
    } catch (err: any) {
      console.error('❌ Create assistant failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 OpenAI Assistant Manager
          </CardTitle>
          <CardDescription>
            Manage your OpenAI Assistants and configure the Assistant ID for Tiptop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={listExistingAssistants} 
              disabled={isLoading}
              variant="outline"
            >
              📋 List Existing Assistants
            </Button>
            <Button 
              onClick={createNewAssistant} 
              disabled={isLoading}
            >
              ➕ Create New Assistant
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {newAssistant && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">✅ New Assistant Created Successfully!</div>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span>Assistant ID: {newAssistant.id}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(newAssistant.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <strong>Next Steps:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Copy the Assistant ID above</li>
                      <li>Go to your Supabase Dashboard → Project Settings → Edge Functions</li>
                      <li>Update the <code className="bg-gray-200 px-1 rounded">OPENAI_ASSISTANT_ID</code> secret</li>
                      <li>Set the value to: <code className="bg-gray-200 px-1 rounded">{newAssistant.id}</code></li>
                      <li>Test the connection again</li>
                    </ol>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('https://supabase.com/dashboard/project/c3e86759-bc9b-4ded-b526-625118919672/settings/functions', '_blank')}
                    className="mt-2"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Supabase Settings
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {assistants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Assistants ({assistants.length})</CardTitle>
            <CardDescription>
              Choose an existing assistant or create a new one optimized for Tiptop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assistants.map((assistant) => (
                <div key={assistant.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{assistant.name}</h3>
                        <Badge variant="outline">{assistant.model}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {assistant.instructions}
                      </div>
                      <div className="font-mono text-xs text-gray-600">
                        ID: {assistant.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(assistant.created_at * 1000).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(assistant.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="font-semibold">Configuration Steps:</div>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Create or choose an OpenAI Assistant above</li>
              <li>Copy the Assistant ID</li>
              <li>Update the <code className="bg-gray-200 px-1 rounded">OPENAI_ASSISTANT_ID</code> secret in Supabase</li>
              <li>Test the connection using the Connection Test tool</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};