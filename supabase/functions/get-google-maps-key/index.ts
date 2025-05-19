
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
    const { origin, referrer } = await req.json();
    
    // Get the Google Maps API key from environment variables
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!apiKey) {
      throw new Error("Google Maps API key not configured");
    }
    
    // Log request information for debugging
    console.log("Key request from:", origin);
    console.log("Referrer:", referrer || "Not provided");

    // Here you can implement additional validation if needed
    // For example, check if the origin is from your allowed domains
    const allowedDomains = [
      "localhost",
      "127.0.0.1",
      "lovable.dev",
      "tiptop.com",
      "tiptop-app.com"
    ];
    
    const isAllowed = origin && allowedDomains.some(domain => 
      origin.includes(domain)
    );
    
    if (!isAllowed) {
      console.warn(`Request from unauthorized origin: ${origin}`);
      // Still return the key but log the warning for monitoring
    }
    
    return new Response(
      JSON.stringify({
        apiKey,
        validatedOrigin: isAllowed ? origin : null
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
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
