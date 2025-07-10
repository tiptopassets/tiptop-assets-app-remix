import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('🚀 [ASSISTANT-CREATOR] Environment check:', {
  hasOpenAIKey: !!OPENAI_API_KEY,
  hasSupabaseUrl: !!SUPABASE_URL,
  hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔄 [${requestId}] ${req.method} ${req.url}`);

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
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
  console.log(`📋 [${requestId}] Listing existing assistants...`);
  console.log(`📋 [${requestId}] OpenAI API Key exists: ${!!OPENAI_API_KEY}`);
  console.log(`📋 [${requestId}] OpenAI API Key length: ${OPENAI_API_KEY?.length || 0}`);
  
  try {
    console.log(`📋 [${requestId}] Importing OpenAI SDK...`);
    const OpenAI = (await import('https://deno.land/x/openai@v4.24.0/mod.ts')).default;
    console.log(`📋 [${requestId}] OpenAI SDK imported successfully`);
    
    console.log(`📋 [${requestId}] Creating OpenAI client...`);
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });
    console.log(`📋 [${requestId}] OpenAI client created`);

    console.log(`📋 [${requestId}] Making API call to list assistants...`);
    const assistants = await openai.beta.assistants.list({
      limit: 20
    });
    console.log(`📋 [${requestId}] API call successful`);

    console.log(`✅ [${requestId}] Found ${assistants.data.length} assistants`);

    return new Response(JSON.stringify({
      success: true,
      assistants: assistants.data.map(assistant => ({
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
    console.error(`❌ [${requestId}] List assistants failed:`, error);
    console.error(`❌ [${requestId}] Error details:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

async function createAssistant(requestId: string) {
  console.log(`🤖 [${requestId}] Creating new OpenAI assistant...`);
  console.log(`🤖 [${requestId}] OpenAI API Key exists: ${!!OPENAI_API_KEY}`);
  console.log(`🤖 [${requestId}] OpenAI API Key starts with: ${OPENAI_API_KEY?.substring(0, 7)}...`);
  
  try {
    const OpenAI = (await import('https://deno.land/x/openai@v4.24.0/mod.ts')).default;
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });

    const assistant = await openai.beta.assistants.create({
      name: "Tiptop Property Monetization Assistant",
      model: "gpt-4.1-2025-04-14",
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
    });

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
  
  // Note: We can't directly update Supabase secrets from Edge Functions
  // This would need to be done manually in the Supabase dashboard
  
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