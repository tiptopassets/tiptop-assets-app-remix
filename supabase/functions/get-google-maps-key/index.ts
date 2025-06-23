
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`🗺️ get-google-maps-key function called from: ${req.headers.get("Origin") || "unknown"}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("⚡ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let origin = "unknown";
    
    try {
      const body = await req.json();
      origin = body.origin || req.headers.get("Origin") || "https://tiptop-app.com";
    } catch (parseError) {
      console.log("⚠️ Could not parse request body, using header origin");
      origin = req.headers.get("Origin") || "https://tiptop-app.com";
    }
    
    console.log(`📍 Request origin: ${origin}`);
    
    // Get the Google Maps API key from environment variables
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!apiKey) {
      console.error("❌ Google Maps API key not found in environment");
      throw new Error("Google Maps API key not configured");
    }
    
    console.log(`✅ API key found: ${apiKey.substring(0, 10)}...`);
    console.log(`🌐 Returning API key for domain: ${origin}`);

    // Return a success response with the API key and domain information
    return new Response(
      JSON.stringify({
        apiKey,
        domain: origin,
        instructions: "This key should be used with the origin domain in API requests",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Error in get-google-maps-key function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to get Google Maps API key",
        fallbackAvailable: true,
        message: "Using fallback mode with local analysis is recommended.",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
