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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const { action, data } = await req.json();
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('🤖 Assistant Manager action:', action);

    switch (action) {
      case 'create_assistant':
        return await createAssistant(data);
      case 'create_thread':
        return await createThread(data);
      case 'send_message':
        return await sendMessage(data, supabase);
      case 'run_assistant':
        return await runAssistant(data, supabase);
      case 'get_run_status':
        return await getRunStatus(data);
      case 'submit_tool_outputs':
        return await submitToolOutputs(data, supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('❌ Assistant Manager error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createAssistant(data: any) {
  const { propertyData } = data;
  
  const systemPrompt = `You are an AI assistant for Tiptop, a platform that helps homeowners monetize their property assets (rooftops, parking spaces, pools, internet bandwidth, storage, etc.).

Your role is to guide users through asset monetization in a conversational, helpful way.

CONTEXT:
${propertyData ? `
- User's property: ${propertyData.address}
- Available assets: ${propertyData.availableAssets?.map((a: any) => `${a.name} ($${a.monthlyRevenue}/month)`).join(', ')}
- Total potential: $${propertyData.totalMonthlyRevenue}/month
- Analysis ID: ${propertyData.analysisId}
` : 'No property data available yet.'}

CONVERSATION STYLE:
- Be conversational, friendly, and encouraging
- Ask one question at a time to avoid overwhelming users
- Explain monetization opportunities in simple terms
- Focus on practical next steps and actionable advice
- Use the user's property data to provide personalized recommendations

AVAILABLE FUNCTIONS:
- collectAddress: Gather property address and location details
- suggestAssetOpportunities: Recommend specific monetization options
- saveUserResponse: Store structured user inputs to database
- connectServiceProviders: Link users with relevant partners

GUIDELINES:
1. Start by understanding what the user wants to achieve
2. Guide them through asset selection based on their property analysis
3. Collect necessary information step-by-step (photos, preferences, etc.)
4. Provide realistic earning estimates and timelines
5. Connect them with appropriate service providers when ready
6. Save all important data using the available functions

Remember: Your goal is to help users successfully monetize their assets while providing excellent customer experience.`;

  const response = await fetch('https://api.openai.com/v1/assistants', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      name: 'Tiptop Asset Monetization Assistant',
      instructions: systemPrompt,
      model: 'gpt-4o',
      tools: [
        {
          type: 'function',
          function: {
            name: 'collectAddress',
            description: 'Collect and validate user property address information',
            parameters: {
              type: 'object',
              properties: {
                address: { type: 'string', description: 'Full property address' },
                coordinates: { 
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' }
                  }
                },
                propertyType: { type: 'string', description: 'Type of property (house, apartment, etc.)' }
              },
              required: ['address']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'suggestAssetOpportunities',
            description: 'Suggest specific asset monetization opportunities based on user property and preferences',
            parameters: {
              type: 'object',
              properties: {
                selectedAssets: { 
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of asset types user is interested in'
                },
                userPreferences: {
                  type: 'object',
                  properties: {
                    timeCommitment: { type: 'string' },
                    riskTolerance: { type: 'string' },
                    earningGoals: { type: 'number' }
                  }
                }
              },
              required: ['selectedAssets']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'saveUserResponse',
            description: 'Save structured user responses and progress data',
            parameters: {
              type: 'object',
              properties: {
                responseType: { type: 'string', description: 'Type of response (asset_selection, preferences, contact_info, etc.)' },
                responseData: { type: 'object', description: 'Structured response data' },
                analysisId: { type: 'string', description: 'Property analysis ID to associate with' },
                stepCompleted: { type: 'string', description: 'Journey step that was completed' }
              },
              required: ['responseType', 'responseData']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'connectServiceProviders',
            description: 'Connect user with relevant service providers based on their asset selections',
            parameters: {
              type: 'object',
              properties: {
                assetTypes: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Asset types to find providers for'
                },
                userLocation: { type: 'string', description: 'User location for local providers' },
                setupPreference: { type: 'string', enum: ['diy', 'guided', 'full_service'] }
              },
              required: ['assetTypes']
            }
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create assistant: ${errorData.error?.message || 'Unknown error'}`);
  }

  const assistant = await response.json();
  console.log('✅ Assistant created:', assistant.id);

  return new Response(JSON.stringify({ 
    success: true,
    assistant 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createThread(data: any) {
  const response = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      metadata: data.metadata || {}
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create thread: ${errorData.error?.message || 'Unknown error'}`);
  }

  const thread = await response.json();
  console.log('✅ Thread created:', thread.id);

  return new Response(JSON.stringify({ 
    success: true,
    thread 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendMessage(data: any, supabase: any) {
  const { threadId, message, userId } = data;

  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      role: 'user',
      content: message
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to send message: ${errorData.error?.message || 'Unknown error'}`);
  }

  const messageData = await response.json();
  
  // Save message to Supabase if user is authenticated
  if (userId && threadId) {
    try {
      await supabase.from('onboarding_messages').insert({
        onboarding_id: threadId,
        role: 'user',
        content: message,
        metadata: { messageId: messageData.id }
      });
    } catch (error) {
      console.warn('Failed to save user message to DB:', error);
    }
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: messageData 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function runAssistant(data: any, supabase: any) {
  const { threadId, assistantId, userId } = data;

  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      assistant_id: assistantId
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to run assistant: ${errorData.error?.message || 'Unknown error'}`);
  }

  const run = await response.json();
  console.log('✅ Assistant run started:', run.id);

  return new Response(JSON.stringify({ 
    success: true,
    run 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getRunStatus(data: any) {
  const { threadId, runId } = data;

  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get run status: ${errorData.error?.message || 'Unknown error'}`);
  }

  const run = await response.json();

  // If run is completed, get the latest messages
  let messages = null;
  if (run.status === 'completed') {
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (messagesResponse.ok) {
      const messagesData = await messagesResponse.json();
      messages = messagesData.data;
    }
  }

  return new Response(JSON.stringify({ 
    success: true,
    run,
    messages 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function submitToolOutputs(data: any, supabase: any) {
  const { threadId, runId, toolOutputs, userId } = data;

  // Process each tool call and generate appropriate outputs
  const processedOutputs = await Promise.all(
    toolOutputs.map(async (output: any) => {
      const { tool_call_id, function_name, arguments: functionArgs } = output;
      
      try {
        let result;
        
        switch (function_name) {
          case 'collectAddress':
            result = await handleCollectAddress(functionArgs, userId, supabase);
            break;
          case 'suggestAssetOpportunities':
            result = await handleSuggestAssetOpportunities(functionArgs, userId, supabase);
            break;
          case 'saveUserResponse':
            result = await handleSaveUserResponse(functionArgs, userId, supabase);
            break;
          case 'connectServiceProviders':
            result = await handleConnectServiceProviders(functionArgs, userId, supabase);
            break;
          default:
            result = { error: `Unknown function: ${function_name}` };
        }

        return {
          tool_call_id,
          output: JSON.stringify(result)
        };
      } catch (error) {
        console.error(`Error processing ${function_name}:`, error);
        return {
          tool_call_id,
          output: JSON.stringify({ error: error.message })
        };
      }
    })
  );

  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      tool_outputs: processedOutputs
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to submit tool outputs: ${errorData.error?.message || 'Unknown error'}`);
  }

  const run = await response.json();

  return new Response(JSON.stringify({ 
    success: true,
    run 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Tool function handlers
async function handleCollectAddress(args: any, userId: string, supabase: any) {
  console.log('🏠 Collecting address:', args);
  
  if (userId) {
    try {
      // Save or update user address
      const { error } = await supabase.from('user_addresses').upsert({
        user_id: userId,
        address: args.address,
        coordinates: args.coordinates,
        formatted_address: args.address,
        is_primary: true
      });

      if (error) throw error;

      return { 
        success: true, 
        message: 'Address saved successfully',
        address: args.address 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  return { 
    success: true, 
    message: 'Address collected (user not authenticated)',
    address: args.address 
  };
}

async function handleSuggestAssetOpportunities(args: any, userId: string, supabase: any) {
  console.log('💡 Suggesting asset opportunities:', args);
  
  // Get enhanced service providers for the selected assets
  if (args.selectedAssets && args.selectedAssets.length > 0) {
    try {
      const { data: providers, error } = await supabase
        .from('enhanced_service_providers')
        .select('*')
        .in('asset_types', args.selectedAssets)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        selectedAssets: args.selectedAssets,
        availableProviders: providers || [],
        recommendations: providers?.map((p: any) => ({
          name: p.name,
          assetTypes: p.asset_types,
          description: p.description,
          earningsRange: `$${p.avg_monthly_earnings_low}-${p.avg_monthly_earnings_high}`,
          setupInstructions: p.setup_instructions
        })) || []
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  return { 
    success: true, 
    message: 'No specific assets selected for recommendations' 
  };
}

async function handleSaveUserResponse(args: any, userId: string, supabase: any) {
  console.log('💾 Saving user response:', args);
  
  if (userId) {
    try {
      // Update user onboarding data
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: userId,
          onboarding_data: {
            [args.responseType]: args.responseData,
            last_updated: new Date().toISOString(),
            step_completed: args.stepCompleted
          }
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      // Also save to journey tracking if analysis ID provided
      if (args.analysisId && args.stepCompleted) {
        await supabase.rpc('update_journey_step', {
          p_session_id: `assistant_${userId}`,
          p_step: args.stepCompleted,
          p_data: args.responseData
        });
      }

      return { 
        success: true, 
        message: 'Response saved successfully',
        responseType: args.responseType 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  return { 
    success: true, 
    message: 'Response collected (user not authenticated)' 
  };
}

async function handleConnectServiceProviders(args: any, userId: string, supabase: any) {
  console.log('🤝 Connecting service providers:', args);
  
  try {
    const { data: providers, error } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .overlaps('asset_types', args.assetTypes)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;

    const connections = providers?.map((provider: any) => ({
      id: provider.id,
      name: provider.name,
      description: provider.description,
      assetTypes: provider.asset_types.filter((type: string) => args.assetTypes.includes(type)),
      referralLink: provider.referral_link_template,
      setupInstructions: provider.setup_instructions,
      averageEarnings: `$${provider.avg_monthly_earnings_low}-${provider.avg_monthly_earnings_high}/month`
    })) || [];

    // Save provider connections for the user
    if (userId && connections.length > 0) {
      const connectionRecords = connections.map((connection: any) => ({
        user_id: userId,
        supplier_name: connection.name,
        asset_type: connection.assetTypes[0], // Primary asset type
        connection_status: 'recommended',
        referral_link: connection.referralLink,
        supplier_data: {
          provider_id: connection.id,
          all_asset_types: connection.assetTypes,
          setup_preference: args.setupPreference || 'guided'
        }
      }));

      await supabase.from('user_supplier_connections').upsert(connectionRecords);
    }

    return {
      success: true,
      providers: connections,
      totalProviders: connections.length,
      assetTypes: args.assetTypes
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}