import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, message, threadId } = await req.json();
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error("OPENAI_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "OpenAI API key not configured" 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const assistantId = "asst_T2zeBwTBYib2AaAmYVY9Oz6L";
    
    // Validate assistant exists
    try {
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      console.log(`Assistant validated: ${assistant.name} using model: ${assistant.model}`);
    } catch (error) {
      console.error("Assistant validation failed:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Assistant not found: ${assistantId}` 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    if (action === "create_thread") {
      console.log("Creating new thread...");
      const thread = await openai.beta.threads.create();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          threadId: thread.id 
        }),
        { headers: corsHeaders }
      );
    }

    if (action === "send_message" && threadId && message) {
      console.log(`Sending message to thread ${threadId}:`, message);
      
      try {
        // Add message to thread
        await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content: message,
        });

        // Run the assistant
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: assistantId,
        });

        // Poll for completion with timeout
        let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        let pollCount = 0;
        const maxPolls = 30; // 30 seconds timeout
        
        while ((runStatus.status === "in_progress" || runStatus.status === "queued") && pollCount < maxPolls) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
          pollCount++;
        }

        if (runStatus.status === "completed") {
          // Get messages
          const messages = await openai.beta.threads.messages.list(threadId);
          const lastMessage = messages.data[0];
          
          const content = lastMessage.content[0];
          const responseText = content.type === "text" ? content.text.value : "Sorry, I couldn't process that.";

          return new Response(
            JSON.stringify({ 
              success: true, 
              response: responseText,
              runId: run.id
            }),
            { headers: corsHeaders }
          );
        } else if (runStatus.status === "failed") {
          console.error("Run failed with error:", runStatus.last_error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}` 
            }),
            { headers: corsHeaders, status: 500 }
          );
        } else {
          console.error("Run timed out or unexpected status:", runStatus);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Run timeout or unexpected status: ${runStatus.status}` 
            }),
            { headers: corsHeaders, status: 500 }
          );
        }
      } catch (openaiError) {
        console.error("OpenAI API Error:", openaiError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `OpenAI API Error: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}` 
          }),
          { headers: corsHeaders, status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Invalid action or missing parameters" 
      }),
      { headers: corsHeaders, status: 400 }
    );

  } catch (error) {
    console.error("OpenAI Chat Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});