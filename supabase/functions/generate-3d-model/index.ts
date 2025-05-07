
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

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
    const body = await req.json();
    const { satelliteImage, streetViewImage, taskId } = body;

    // Create a Supabase client with the Auth context from the request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );

    // Get the Meshy API key from Supabase secrets
    const meshyApiKey = Deno.env.get("MESHY_API_KEY");
    
    if (!meshyApiKey) {
      console.error("Meshy API key not configured");
      throw new Error("Meshy API key not configured");
    }

    // If taskId is provided, check task status
    if (taskId) {
      console.log("Checking status for task:", taskId);
      const taskStatusResponse = await fetch(`https://api.meshy.ai/v1/tasks/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${meshyApiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!taskStatusResponse.ok) {
        const errorData = await taskStatusResponse.json();
        throw new Error(`Meshy API returned error: ${JSON.stringify(errorData)}`);
      }

      const statusData = await taskStatusResponse.json();
      console.log("Task status:", statusData);
      
      return new Response(
        JSON.stringify({
          success: true,
          status: statusData.status,
          progress: statusData.progress,
          modelUrl: statusData.model_url || null,
          taskId: statusData.id
        }),
        {
          headers: corsHeaders,
          status: 200,
        }
      );
    }

    // For new task creation
    if (!satelliteImage) {
      console.error("No satellite image provided for 3D model generation");
      return new Response(
        JSON.stringify({
          success: false,
          error: "No satellite image available for 3D model generation",
        }),
        {
          headers: corsHeaders,
          status: 400,
        }
      );
    }

    let requestBody, meshyEndpoint;
    
    // Choose API endpoint based on available images
    if (satelliteImage && streetViewImage) {
      // Use multi-image endpoint when both images are available
      console.log("Using multi-image Meshy API endpoint");
      meshyEndpoint = "https://api.meshy.ai/v1/multi-view-to-3d";
      requestBody = {
        images: [satelliteImage, streetViewImage],
        imageType: "aerial",
        outputFormat: "glb",
      };
    } else {
      // Use single image endpoint when only satellite image is available
      console.log("Using single-image Meshy API endpoint");
      meshyEndpoint = "https://api.meshy.ai/v1/image-to-3d";
      requestBody = {
        image: satelliteImage,
        imageType: "aerial",
        outputFormat: "glb",
      };
    }
      
    // Make request to Meshy API to create a task
    console.log("Creating Meshy task...");
    const meshyResponse = await fetch(meshyEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${meshyApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!meshyResponse.ok) {
      const errorData = await meshyResponse.json();
      console.error("Meshy API error:", errorData);
      throw new Error(`Meshy API returned error: ${JSON.stringify(errorData)}`);
    }

    const meshyData = await meshyResponse.json();
    console.log("Meshy task created successfully:", meshyData);
      
    return new Response(
      JSON.stringify({
        success: true,
        taskId: meshyData.id,
        status: meshyData.status,
        progress: meshyData.progress || 0,
        modelUrl: null,
        message: "3D model generation task created successfully",
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
        error: error.message || "An unknown error occurred",
      }),
      {
        headers: corsHeaders,
        status: 500,
      }
    );
  }
});
