
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
    
    console.log("🔍 Checking for Google Maps API key...");
    console.log("📍 Request origin:", origin || req.headers.get("Origin") || "unknown");
    console.log("🔑 API key configured:", !!apiKey);
    
    if (!apiKey) {
      console.error("❌ GOOGLE_MAPS_API_KEY environment variable not set");
      throw new Error("Google Maps API key not configured in Supabase Edge Function Secrets");
    }
    
    // Get the current hostname (for domain allowlisting purposes)
    const hostname = origin || req.headers.get("Origin") || "https://tiptop-app.com";
    console.log("✅ Returning API key for origin:", hostname);

    // Return a success response with the API key and domain information
    return new Response(
      JSON.stringify({
        apiKey,
        domain: hostname,
        instructions: "This key should be used with the origin domain in API requests",
        configured: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in get-google-maps-key function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to get Google Maps API key",
        fallbackAvailable: true,
        message: "Please check that GOOGLE_MAPS_API_KEY is set in Supabase Edge Function Secrets",
        configured: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
