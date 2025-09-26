
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin } = await req.json();
    
    // Get the Google Maps API key from environment variables
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!apiKey) {
      throw new Error("Google Maps API key not configured");
    }
    
    // Get the current hostname (for domain allowlisting purposes)
    const hostname = origin || req.headers.get("Origin") || "https://tiptop-app.com";
    console.log("Request origin:", hostname);

    // Return a success response with the API key and domain information
    return new Response(
      JSON.stringify({
        apiKey,
        domain: hostname,
        instructions: "This key should be used with the origin domain in API requests"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-google-maps-key function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to get Google Maps API key",
        fallbackAvailable: true,
        message: "Using fallback mode with local analysis is recommended."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
