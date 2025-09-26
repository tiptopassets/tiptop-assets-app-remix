import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_ASSISTANT_ID = Deno.env.get('OPENAI_ASSISTANT_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive API Key Validation
function validateApiKey(requestId: string): { valid: boolean, error?: string } {
  console.log(`🔑 [${requestId}] Validating OpenAI API Key...`);
  
  if (!OPENAI_API_KEY) {
    const error = 'OPENAI_API_KEY environment variable is not set';
    console.error(`❌ [${requestId}] ${error}`);
    return { valid: false, error };
  }
  
  if (!OPENAI_API_KEY.startsWith('sk-')) {
    const error = 'Invalid API key format - should start with "sk-"';
    console.error(`❌ [${requestId}] ${error}`);
    return { valid: false, error };
  }
  
  if (OPENAI_API_KEY.length < 50) {
    const error = `API key appears too short (${OPENAI_API_KEY.length} chars)`;
    console.error(`❌ [${requestId}] ${error}`);
    return { valid: false, error };
  }
  
  console.log(`✅ [${requestId}] API key validation passed`);
  return { valid: true };
}

// Initialize OpenAI SDK
async function initOpenAI(requestId: string) {
  try {
    const OpenAI = (await import('https://deno.land/x/openai@v4.24.0/mod.ts')).default;
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });
    console.log(`✅ [${requestId}] OpenAI SDK initialized`);
    return openai;
  } catch (error) {
    console.error(`❌ [${requestId}] OpenAI SDK initialization failed:`, error instanceof Error ? error.message : 'Unknown error');
    throw new Error(`OpenAI SDK initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const validation = validateApiKey(requestId);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid API key');
    }

    // Parse request body
    const requestBody = await req.json();
    const { action, assistantId } = requestBody;
    console.log(`🎯 [${requestId}] Action: ${action}`);

    let result;
    switch (action) {
      case 'test_connection':
        result = await testOpenAIConnection(requestId);
        break;
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
    console.error(`❌ [${requestId}] Error:`, error instanceof Error ? error.message : 'Unknown error');
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// NEW: Test OpenAI Connection with simple API call
async function testOpenAIConnection(requestId: string) {
  console.log(`🔧 [${requestId}] Testing OpenAI connection...`);
  
  try {
    const openai = await initOpenAI(requestId);
    
    // Test with models endpoint (simple API call)
    const models = await openai.models.list();
    console.log(`✅ [${requestId}] OpenAI connection successful, found ${models.data?.length || 0} models`);
    
    return new Response(JSON.stringify({
      success: true,
      connection: 'success',
      message: 'OpenAI API connection working',
      modelsAvailable: models.data?.length || 0,
      requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`❌ [${requestId}] OpenAI connection failed:`, error instanceof Error ? error.message : 'Unknown error');
    throw new Error(`OpenAI connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function listAssistants(requestId: string) {
  console.log(`📋 [${requestId}] Listing existing assistants via OpenAI SDK...`);
  
  try {
    const openai = await initOpenAI(requestId);
    const assistants = await openai.beta.assistants.list({ limit: 20 });
    
    console.log(`✅ [${requestId}] Found ${assistants.data?.length || 0} assistants`);

    return new Response(JSON.stringify({
      success: true,
      assistants: (assistants.data || []).map((assistant: any) => ({
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
    console.error(`❌ [${requestId}] List assistants failed:`, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function createAssistant(requestId: string) {
  console.log(`🤖 [${requestId}] Creating new OpenAI assistant via SDK...`);
  
  const assistantConfig = {
    name: "Tiptop Property Monetization Assistant",
    model: "gpt-4.1-2025-04-14", // Updated to latest recommended model
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
        type: "function" as const,
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
        type: "function" as const,
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
        type: "function" as const,
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
        type: "function" as const,
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
        type: "function" as const,
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
    const openai = await initOpenAI(requestId);
    const assistant = await openai.beta.assistants.create(assistantConfig);

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
      nextSteps: [
        "1. Copy the assistant ID above",
        "2. Go to your Supabase dashboard > Settings > Edge Functions",
        "3. Update OPENAI_ASSISTANT_ID secret with this ID",
        "4. Test the assistant connection"
      ],
      requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Create assistant failed:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any).status,
      code: (error as any).code
    });
    
    // Provide specific error messages for common issues
    if ((error as any).status === 401) {
      throw new Error('OpenAI API key is invalid or missing permissions for Assistant API');
    } else if ((error as any).status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error instanceof Error && error.message.includes('insufficient_quota')) {
      throw new Error('Insufficient quota. Please check your OpenAI billing and ensure you have credits for Assistant API usage.');
    }
    
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