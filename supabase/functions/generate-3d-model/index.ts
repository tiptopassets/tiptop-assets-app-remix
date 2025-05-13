
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
    const { satelliteImage, streetViewImage, taskId, outputFormat = "glb", quality = "standard" } = body;

    // Log request details for debugging (without sensitive data)
    console.log(`Received request: ${taskId ? 'Check Task Status' : 'Create New Task'}`);
    console.log(`Output Format: ${outputFormat}, Quality: ${quality}`);
    
    if (taskId) {
      console.log(`Checking task status for ID: ${taskId}`);
    } else {
      console.log(`Creating new task with satellite image: ${!!satelliteImage}, street view image: ${!!streetViewImage}`);
    }

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

    // Get the Meshy API key from Supabase secrets or use the provided one
    const meshyApiKey = Deno.env.get("MESHY_API_KEY") || "msy_1zRq34WPBQB7tK22mu2hDvdPRO5DskEO0WRR";
    
    if (!meshyApiKey) {
      console.error("Meshy API key not configured");
      throw new Error("Meshy API key not configured in server environment");
    }

    // If taskId is provided, check task status
    if (taskId) {
      console.log("Checking status for task:", taskId);
      const taskStatusResponse = await fetch(`https://api.meshy.ai/v2/tasks/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${meshyApiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!taskStatusResponse.ok) {
        const errorData = await taskStatusResponse.json();
        console.error("Meshy API error while checking task:", errorData);
        throw new Error(`Meshy API error: ${JSON.stringify(errorData)}`);
      }

      const statusData = await taskStatusResponse.json();
      console.log("Task status:", statusData);
      
      return new Response(
        JSON.stringify({
          success: true,
          status: statusData.status,
          progress: statusData.progress,
          modelUrl: statusData.model_url || null,
          taskId: statusData.id,
          error: statusData.error || null
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
          details: "A satellite or aerial image is required to generate a 3D model"
        }),
        {
          headers: corsHeaders,
          status: 400,
        }
      );
    }

    let requestBody: any;
    let meshyEndpoint: string;
    
    // Choose API endpoint based on available images
    if (satelliteImage && streetViewImage) {
      // Use multi-image endpoint when both images are available
      console.log("Using multi-image Meshy API endpoint");
      meshyEndpoint = "https://api.meshy.ai/v2/multi-view-to-3d";
      requestBody = {
        images: [satelliteImage, streetViewImage],
        imageType: "aerial",
        outputFormat: outputFormat,
        quality: quality
      };
    } else {
      // Use single image endpoint when only satellite image is available
      console.log("Using single-image Meshy API endpoint");
      meshyEndpoint = "https://api.meshy.ai/v2/image-to-3d";
      requestBody = {
        image: satelliteImage,
        imageType: "aerial",
        outputFormat: outputFormat,
        quality: quality
      };
    }
      
    // Make request to Meshy API to create a task
    console.log("Creating Meshy task...");
    
    // Add retry logic for better reliability
    let meshyResponse;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        meshyResponse = await fetch(meshyEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${meshyApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
        
        // If successful, break out of retry loop
        if (meshyResponse.ok) break;
        
        // If we get a rate limit error, wait longer before retrying
        if (meshyResponse.status === 429) {
          console.log("Rate limited by Meshy API, waiting before retry");
          await new Promise(resolve => setTimeout(resolve, 2000 * (retries + 1)));
        }
        
        retries++;
        console.log(`Retry attempt ${retries}/${maxRetries}`);
      } catch (error) {
        console.error("Network error on Meshy API request:", error);
        retries++;
        if (retries >= maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    if (!meshyResponse || !meshyResponse.ok) {
      let errorMessage = "Unknown error from Meshy API";
      try {
        const errorData = await meshyResponse?.json();
        console.error("Meshy API error:", errorData);
        errorMessage = `Meshy API error: ${JSON.stringify(errorData)}`;
      } catch (e) {
        console.error("Failed to parse Meshy API error response");
      }
      throw new Error(errorMessage);
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
        details: error.stack || "No additional details available"
      }),
      {
        headers: corsHeaders,
        status: 500,
      }
    );
  }
});
