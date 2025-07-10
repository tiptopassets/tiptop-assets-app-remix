import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate OpenAI API Key
function validateApiKey(requestId: string): boolean {
  console.log(`🔑 [${requestId}] Validating OpenAI API Key...`);
  
  if (!OPENAI_API_KEY) {
    console.error(`❌ [${requestId}] OPENAI_API_KEY environment variable is not set`);
    return false;
  }
  
  if (!OPENAI_API_KEY.startsWith('sk-')) {
    console.error(`❌ [${requestId}] Invalid API key format - should start with 'sk-'`);
    return false;
  }
  
  if (OPENAI_API_KEY.length < 50) {
    console.error(`❌ [${requestId}] API key appears too short (${OPENAI_API_KEY.length} chars)`);
    return false;
  }
  
  console.log(`✅ [${requestId}] API key validation passed`);
  return true;
}

// Make HTTP request to OpenAI API
async function makeOpenAIRequest(requestId: string, endpoint: string, method: string = 'GET', body?: any) {
  const url = `https://api.openai.com/v1${endpoint}`;
  
  console.log(`🌐 [${requestId}] Making ${method} request to: ${url}`);
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Tiptop-Assistant-Manager/1.0'
    }
  };
  
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
    console.log(`📤 [${requestId}] Request body:`, JSON.stringify(body, null, 2));
  }
  
  try {
    const response = await fetch(url, requestOptions);
    console.log(`📡 [${requestId}] Response status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📥 [${requestId}] Raw response length: ${responseText.length} chars`);
    
    if (!response.ok) {
      console.error(`❌ [${requestId}] OpenAI API error:`, {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
    console.log(`✅ [${requestId}] Successfully parsed response`);
    return data;
    
  } catch (error) {
    console.error(`❌ [${requestId}] HTTP request failed:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔄 [${requestId}] ${req.method} ${req.url}`);

  try {
    // Validate API key first
    if (!validateApiKey(requestId)) {
      throw new Error('Invalid or missing OpenAI API key');
    }

    // Parse request body
    const requestBody = await req.json();
    const { action, assistantId } = requestBody;
    console.log(`🎯 [${requestId}] Action: ${action}`);

    let result;
    switch (action) {
      case 'list_assistants':
        result = await listAssistants(requestId);
        break;
      case 'create_assistant':
        result = await createAssistant(requestId);
        break;
      case 'update_assistant_id':
        result = await updateAssistantId(assistantId, requestId);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return result;
  } catch (error) {
    console.error(`❌ [${requestId}] Error:`, error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      requestId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function listAssistants(requestId: string) {
  console.log(`📋 [${requestId}] Listing existing assistants via HTTP...`);
  
  try {
    const data = await makeOpenAIRequest(requestId, '/assistants?limit=20');
    
    console.log(`✅ [${requestId}] Found ${data.data?.length || 0} assistants`);

    return new Response(JSON.stringify({
      success: true,
      assistants: (data.data || []).map((assistant: any) => ({
        id: assistant.id,
        name: assistant.name,
        model: assistant.model,
        instructions: assistant.instructions?.substring(0, 100) + '...',
        created_at: assistant.created_at
      })),
      requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`❌ [${requestId}] List assistants failed:`, error.message);
    throw error;
  }
}

async function createAssistant(requestId: string) {
  console.log(`🤖 [${requestId}] Creating new OpenAI assistant via HTTP...`);
  
  const assistantConfig = {
    name: "Tiptop Property Monetization Assistant",
    model: "gpt-4o-mini", // Using a stable model
    instructions: `You are Tiptop's AI property monetization assistant. Your role is to help users discover and set up income-generating opportunities from their properties.

CORE CAPABILITIES:
- Analyze property data and identify revenue opportunities
- Recommend specific service providers and partners
- Guide users through setup processes
- Provide personalized earnings estimates
- Connect users with relevant affiliate programs

KEY ASSETS YOU WORK WITH:
- Solar panels and renewable energy
- EV charging stations
- Parking spaces and driveways
- Internet/WiFi sharing (Honeygain, PacketStream)
- Storage and spare rooms
- Rooftop space utilization
- Garden and outdoor areas

PERSONALITY:
- Helpful and knowledgeable about property monetization
- Direct and actionable in recommendations
- Enthusiastic about earning opportunities
- Professional but approachable

IMPORTANT:
- Always provide specific next steps
- Include realistic earnings estimates when possible
- Prioritize opportunities based on user's property features
- Connect recommendations to actual service providers in our database`,
    tools: [
      {
        type: "function",
        function: {
          name: "get_property_analysis",
          description: "Retrieve property analysis data for a user",
          parameters: {
            type: "object",
            properties: {
              analysisId: {
                type: "string",
                description: "The analysis ID to retrieve"
              },
              address: {
                type: "string",
                description: "Property address to search for"
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_service_providers",
          description: "Get available service providers for specific asset types",
          parameters: {
            type: "object",
            properties: {
              assetTypes: {
                type: "array",
                items: { type: "string" },
                description: "Array of asset types to find providers for"
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_user_preferences",
          description: "Get user preferences and onboarding data",
          parameters: {
            type: "object",
            properties: {
              userId: {
                type: "string",
                description: "User ID to get preferences for"
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_recommendation",
          description: "Create a monetization recommendation for the user",
          parameters: {
            type: "object",
            properties: {
              assetType: {
                type: "string",
                description: "Type of asset being recommended"
              },
              recommendation: {
                type: "string",
                description: "Detailed recommendation text"
              },
              estimatedEarnings: {
                type: "number",
                description: "Estimated monthly earnings"
              },
              nextSteps: {
                type: "array",
                items: { type: "string" },
                description: "Specific next steps for the user"
              },
              partnersRecommended: {
                type: "array",
                items: { type: "string" },
                description: "Recommended partner service providers"
              }
            },
            required: ["assetType", "recommendation"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_user_progress",
          description: "Update user's onboarding progress",
          parameters: {
            type: "object",
            properties: {
              step: {
                type: "number",
                description: "Current step number"
              },
              progressData: {
                type: "object",
                description: "Progress data to save"
              }
            },
            required: ["step"]
          }
        }
      }
    ]
  };
  
  try {
    const assistant = await makeOpenAIRequest(requestId, '/assistants', 'POST', assistantConfig);

    console.log(`✅ [${requestId}] Assistant created:`, {
      id: assistant.id,
      name: assistant.name,
      model: assistant.model
    });

    return new Response(JSON.stringify({
      success: true,
      assistant: {
        id: assistant.id,
        name: assistant.name,
        model: assistant.model,
        instructions: assistant.instructions,
        tools: assistant.tools
      },
      message: "Assistant created successfully! Please update your Supabase secrets with this Assistant ID.",
      requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Create assistant failed:`, error.message);
    throw error;
  }
}

async function updateAssistantId(assistantId: string, requestId: string) {
  console.log(`💾 [${requestId}] Would update assistant ID to: ${assistantId}`);
  
  return new Response(JSON.stringify({
    success: true,
    message: `To use this assistant, please update the OPENAI_ASSISTANT_ID secret in your Supabase project settings to: ${assistantId}`,
    assistantId,
    instructions: [
      "1. Go to your Supabase dashboard",
      "2. Navigate to Project Settings > Edge Functions",
      "3. Update the OPENAI_ASSISTANT_ID secret",
      "4. Set the value to: " + assistantId,
      "5. Test the connection again"
    ],
    requestId
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}