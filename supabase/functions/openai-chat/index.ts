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
    
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const assistantId = "asst_T2zeBwTBYib2AaAmYVY9Oz6L";

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
      
      // Add message to thread
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // Poll for completion
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      
      while (runStatus.status === "in_progress" || runStatus.status === "queued") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
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
      } else {
        console.error("Run failed:", runStatus);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Run failed with status: ${runStatus.status}` 
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
        error: error.message 
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});