
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // This function now simply returns a success message
    // All Meshy.ai integration code has been removed
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "This endpoint has been deprecated. Property analysis functionality has been updated.",
        status: "completed",
        progress: 100
      }),
      {
        headers: corsHeaders,
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-3d-model function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
        details: "This endpoint has been deprecated"
      }),
      {
        headers: corsHeaders,
        status: 500,
      }
    );
  }
});
