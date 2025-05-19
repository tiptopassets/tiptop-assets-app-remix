
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

    // Return a success response with the API key and usage instructions
    return new Response(
      JSON.stringify({
        apiKey,
        instructions: "This key should be used with proper referrer restrictions in the client"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-google-maps-key function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to get Google Maps API key",
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
