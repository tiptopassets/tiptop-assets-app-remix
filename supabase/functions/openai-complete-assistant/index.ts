import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpenAIError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

serve(async (req) => {
  console.log('🚀 OpenAI Complete Assistant function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Read and validate environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('✅ OpenAI API Key loaded');

    // 2. Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('❌ Invalid JSON in request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, assistantId, threadId } = requestBody;

    // 3. Validate and sanitize message input
    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message input:', typeof message);
      return new Response(
        JSON.stringify({ error: 'Message must be a non-empty string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedMessage = message.trim();
    if (!sanitizedMessage) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty after trimming' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('✅ Message validated and sanitized');

    const openAIHeaders = {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    };

    let finalAssistantId = assistantId;
    let finalThreadId = threadId;

    // 4. Create or retrieve assistant
    if (!finalAssistantId) {
      console.log('🤖 Creating new assistant...');
      try {
        const assistantResponse = await fetch('https://api.openai.com/v1/assistants', {
          method: 'POST',
          headers: openAIHeaders,
          body: JSON.stringify({
            name: "Property Analysis Assistant",
            instructions: "You are a helpful assistant that helps users analyze property assets and monetization opportunities. Be conversational and helpful.",
            model: "gpt-4o-mini",
            tools: []
          })
        });

        if (!assistantResponse.ok) {
          const errorData = await assistantResponse.json() as OpenAIError;
          console.error('❌ Assistant creation failed:', assistantResponse.status, errorData);
          throw new Error(`Assistant creation failed: ${errorData.error?.message || 'Unknown error'}`);
        }

        const assistantData = await assistantResponse.json();
        finalAssistantId = assistantData.id;
        console.log('✅ Assistant created:', finalAssistantId);
      } catch (error) {
        console.error('❌ Error creating assistant:', error);
        return new Response(
          JSON.stringify({ error: `Failed to create assistant: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('🤖 Using existing assistant:', finalAssistantId);
    }

    // 5. Create or use existing thread
    if (!finalThreadId) {
      console.log('🧵 Creating new thread...');
      try {
        const threadResponse = await fetch('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: openAIHeaders,
          body: JSON.stringify({
            metadata: {
              created_at: new Date().toISOString(),
              purpose: 'property_analysis_chat'
            }
          })
        });

        if (!threadResponse.ok) {
          const errorData = await threadResponse.json() as OpenAIError;
          console.error('❌ Thread creation failed:', threadResponse.status, errorData);
          throw new Error(`Thread creation failed: ${errorData.error?.message || 'Unknown error'}`);
        }

        const threadData = await threadResponse.json();
        finalThreadId = threadData.id;
        console.log('✅ Thread created:', finalThreadId);
      } catch (error) {
        console.error('❌ Error creating thread:', error);
        return new Response(
          JSON.stringify({ error: `Failed to create thread: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('🧵 Using existing thread:', finalThreadId);
    }

    // 6. Add message to thread
    console.log('💬 Adding message to thread...');
    try {
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${finalThreadId}/messages`, {
        method: 'POST',
        headers: openAIHeaders,
        body: JSON.stringify({
          role: 'user',
          content: sanitizedMessage
        })
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json() as OpenAIError;
        console.error('❌ Message creation failed:', messageResponse.status, errorData);
        throw new Error(`Message creation failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const messageData = await messageResponse.json();
      console.log('✅ Message added to thread:', messageData.id);
    } catch (error) {
      console.error('❌ Error adding message:', error);
      return new Response(
        JSON.stringify({ error: `Failed to add message: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Create and run the assistant
    console.log('🏃 Creating run...');
    let runId;
    try {
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${finalThreadId}/runs`, {
        method: 'POST',
        headers: openAIHeaders,
        body: JSON.stringify({
          assistant_id: finalAssistantId,
          instructions: "Be helpful and conversational. Provide detailed responses about property analysis and monetization opportunities."
        })
      });

      if (!runResponse.ok) {
        const errorData = await runResponse.json() as OpenAIError;
        console.error('❌ Run creation failed:', runResponse.status, errorData);
        throw new Error(`Run creation failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const runData = await runResponse.json();
      runId = runData.id;
      console.log('✅ Run created:', runId);
    } catch (error) {
      console.error('❌ Error creating run:', error);
      return new Response(
        JSON.stringify({ error: `Failed to create run: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Poll for run completion
    console.log('⏱️ Polling for run completion...');
    const maxAttempts = 30; // 30 attempts with 2-second intervals = 60 seconds max
    let attempts = 0;
    let runStatus = 'queued';

    while (attempts < maxAttempts && !['completed', 'failed', 'cancelled', 'expired'].includes(runStatus)) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;

      try {
        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${finalThreadId}/runs/${runId}`, {
          headers: openAIHeaders
        });

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json() as OpenAIError;
          console.error('❌ Run status check failed:', statusResponse.status, errorData);
          throw new Error(`Run status check failed: ${errorData.error?.message || 'Unknown error'}`);
        }

        const statusData = await statusResponse.json();
        runStatus = statusData.status;
        console.log(`🔄 Run status (attempt ${attempts}):`, runStatus);

        if (runStatus === 'failed') {
          throw new Error(`Run failed: ${statusData.last_error?.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Error checking run status:', error);
        return new Response(
          JSON.stringify({ error: `Failed to check run status: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (runStatus !== 'completed') {
      console.error('❌ Run did not complete in time. Final status:', runStatus);
      return new Response(
        JSON.stringify({ error: `Run did not complete in time. Status: ${runStatus}` }),
        { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Retrieve the assistant's response
    console.log('📝 Retrieving assistant response...');
    try {
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${finalThreadId}/messages`, {
        headers: openAIHeaders
      });

      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json() as OpenAIError;
        console.error('❌ Messages retrieval failed:', messagesResponse.status, errorData);
        throw new Error(`Messages retrieval failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const messagesData = await messagesResponse.json();
      const assistantMessages = messagesData.data.filter((msg: any) => msg.role === 'assistant');

      if (assistantMessages.length === 0) {
        throw new Error('No assistant response found');
      }

      const latestResponse = assistantMessages[0];
      const responseText = latestResponse.content[0]?.text?.value || 'No response text found';

      console.log('✅ Assistant response retrieved successfully');

      // 10. Return successful response
      return new Response(
        JSON.stringify({
          success: true,
          response: responseText,
          assistantId: finalAssistantId,
          threadId: finalThreadId,
          runId: runId,
          metadata: {
            attempts: attempts,
            finalStatus: runStatus,
            timestamp: new Date().toISOString()
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (error) {
      console.error('❌ Error retrieving response:', error);
      return new Response(
        JSON.stringify({ error: `Failed to retrieve response: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Unexpected error in OpenAI Complete Assistant function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});