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

// Use existing assistant ID instead of creating new ones
const EXISTING_ASSISTANT_ID = 'asst_LAfMRhVWnpiQwGgZhSykzRtJ';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('❌ Request parsing error:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, data } = requestBody;
    console.log('🤖 Assistant Manager action:', action, 'Data keys:', data ? Object.keys(data) : 'none');

    if (!action) {
      return new Response(JSON.stringify({ 
        error: 'Missing required field: action',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    switch (action) {
      case 'get_assistant':
        return await getExistingAssistant();
      case 'create_thread':
        return await createThread(data, supabase);
      case 'send_message':
        return await sendMessage(data, supabase);
      case 'run_assistant':
        return await runAssistant(data, supabase);
      case 'get_run_status':
        return await getRunStatus(data);
      case 'submit_tool_outputs':
        return await submitToolOutputs(data, supabase);
      default:
        return new Response(JSON.stringify({ 
          error: `Unknown action: ${action}`,
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('❌ Assistant Manager error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getExistingAssistant() {
  try {
    // First, try to retrieve the existing assistant to check if it exists
    const response = await fetch(`https://api.openai.com/v1/assistants/${EXISTING_ASSISTANT_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      console.log('❌ Existing assistant not found, falling back to simple assistant setup');
      console.log('✅ Using hardcoded assistant ID for now:', EXISTING_ASSISTANT_ID);
    }

    console.log('✅ Using existing assistant:', EXISTING_ASSISTANT_ID);

    return new Response(JSON.stringify({ 
      success: true,
      assistant: { id: EXISTING_ASSISTANT_ID }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error accessing existing assistant:', error);
    console.log('✅ Using hardcoded assistant ID as fallback:', EXISTING_ASSISTANT_ID);
    
    return new Response(JSON.stringify({ 
      success: true,
      assistant: { id: EXISTING_ASSISTANT_ID }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function createThread(data: any, supabase: any) {
  try {
    // Validate userId is provided
    const userId = data?.metadata?.userId;
    if (!userId) {
      console.error('❌ [AUTH] No userId provided for thread creation');
      return new Response(JSON.stringify({ 
        error: 'Authentication required - userId missing',
        success: false 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ [AUTH] Creating thread for authenticated user:', userId);

    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        metadata: data?.metadata || {}
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI thread creation failed:', errorData);
      return new Response(JSON.stringify({ 
        error: `Failed to create thread: ${errorData.error?.message || 'Unknown error'}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const thread = await response.json();
    const threadId = thread.id;
    console.log('✅ Thread created:', threadId);

    // Create corresponding onboarding record using threadId
    try {
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .insert({
          id: threadId, // Use OpenAI thread ID as the onboarding ID
          user_id: userId,
          selected_option: 'concierge', // Default to concierge for AI assistant
          status: 'in_progress',
          current_step: 1,
          total_steps: 5,
          chat_history: [],
          completed_assets: [],
          progress_data: {
            assistant_thread_id: threadId,
            created_via: 'openai_assistant'
          }
        });

      if (onboardingError) {
        console.error('❌ [DB] Failed to create onboarding record:', onboardingError);
        // Continue - don't fail the thread creation if DB operation fails
        console.warn('⚠️ [DB] Thread created but onboarding record creation failed');
      } else {
        console.log('✅ [DB] Onboarding record created for thread:', threadId);
      }
    } catch (error) {
      console.error('❌ [DB] Error creating onboarding record:', error);
      // Continue - don't fail the thread creation if DB operation fails
    }

    return new Response(JSON.stringify({ 
      success: true,
      thread 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Create thread error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create thread',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function sendMessage(data: any, supabase: any) {
  console.log('🔍 [DEBUG] sendMessage called with data keys:', data ? Object.keys(data) : 'none');
  
  // Validate required fields
  if (!data) {
    console.error('❌ No data provided to sendMessage');
    return new Response(JSON.stringify({ 
      error: 'Missing request data',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { threadId, message, userId } = data;

  // Validate authentication first
  if (!userId) {
    console.error('❌ [AUTH] No userId provided for message sending');
    return new Response(JSON.stringify({ 
      error: 'Authentication required - userId missing',
      success: false 
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate threadId
  if (!threadId) {
    console.error('❌ threadId is missing or null');
    return new Response(JSON.stringify({ 
      error: 'threadId is required for sending messages',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate message
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    console.error('❌ message is missing, empty, or invalid');
    return new Response(JSON.stringify({ 
      error: 'A valid message is required',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('🔍 [DEBUG] Validated input - threadId:', threadId, 'messageLength:', message.length, 'userId:', userId);

  try {
    // Step 1: Send message to OpenAI first
    console.log('📤 [DEBUG] Sending message to OpenAI API');
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
      console.error('❌ OpenAI API error:', errorData);
      return new Response(JSON.stringify({ 
        error: `Failed to send message to OpenAI: ${errorData.error?.message || 'Unknown error'}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const messageData = await response.json();
    console.log('✅ OpenAI message sent successfully, ID:', messageData.id);
    
    // Step 2: Save message to database (graceful failure)
    console.log('🔍 [DEBUG] Starting database save operation');
    try {
      // Use the database function to insert the message
      console.log('🔍 [DEBUG] Calling insert_onboarding_message function...');
      const { data: insertResult, error: insertError } = await supabase.rpc('insert_onboarding_message', {
        p_onboarding_id: threadId,
        p_role: 'user',
        p_content: message,
        p_metadata: { 
          messageId: messageData.id,
          timestamp: new Date().toISOString(),
          userId: userId
        }
      });
      
      if (insertError) {
        console.error('❌ [DEBUG] Database insert error:', insertError);
        // Don't fail the request - let the OpenAI operation succeed even if DB save fails
        console.warn('⚠️ [DEBUG] Message saved to OpenAI but failed to save to database');
      } else {
        console.log('✅ [DEBUG] Message saved to database successfully:', insertResult);
      }
      
    } catch (dbError) {
      console.error('❌ [DEBUG] Database operation failed:', {
        error: dbError.message,
        threadId,
        userId
      });
      
      // Don't fail the request - let OpenAI operation succeed even if DB fails
      console.warn('⚠️ [DEBUG] Continuing despite database error');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: messageData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [DEBUG] sendMessage error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send message',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function runAssistant(data: any, supabase: any) {
  // Validate required fields
  if (!data) {
    return new Response(JSON.stringify({ 
      error: 'Missing request data',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { threadId, assistantId, userId } = data;

  // Validate authentication
  if (!userId) {
    console.error('❌ [AUTH] No userId provided for assistant run');
    return new Response(JSON.stringify({ 
      error: 'Authentication required - userId missing',
      success: false 
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!threadId) {
    return new Response(JSON.stringify({ 
      error: 'threadId is required',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!assistantId) {
    return new Response(JSON.stringify({ 
      error: 'assistantId is required',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
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
      console.error('❌ Run assistant failed:', errorData);
      return new Response(JSON.stringify({ 
        error: `Failed to run assistant: ${errorData.error?.message || 'Unknown error'}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const run = await response.json();
    console.log('✅ Assistant run started:', run.id);

    return new Response(JSON.stringify({ 
      success: true,
      run 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ runAssistant error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to run assistant',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function getRunStatus(data: any) {
  // Validate required fields
  if (!data) {
    return new Response(JSON.stringify({ 
      error: 'Missing request data',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { threadId, runId } = data;

  if (!threadId || !runId) {
    return new Response(JSON.stringify({ 
      error: 'threadId and runId are required',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Get run status failed:', errorData);
      return new Response(JSON.stringify({ 
        error: `Failed to get run status: ${errorData.error?.message || 'Unknown error'}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
  } catch (error) {
    console.error('❌ getRunStatus error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to get run status',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function submitToolOutputs(data: any, supabase: any) {
  // Validate required fields
  if (!data) {
    return new Response(JSON.stringify({ 
      error: 'Missing request data',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { threadId, runId, toolOutputs, userId } = data;

  // Validate authentication
  if (!userId) {
    console.error('❌ [AUTH] No userId provided for tool outputs');
    return new Response(JSON.stringify({ 
      error: 'Authentication required - userId missing',
      success: false 
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!threadId || !runId) {
    return new Response(JSON.stringify({ 
      error: 'threadId and runId are required',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('🔧 Processing tool outputs:', {
    threadId,
    runId,
    toolOutputsCount: toolOutputs?.length,
    userId,
    toolOutputs: toolOutputs?.map((t: any) => ({ 
      tool_call_id: t.tool_call_id, 
      function_name: t.function_name 
    }))
  });

  // Ensure toolOutputs is an array and not empty
  if (!Array.isArray(toolOutputs) || toolOutputs.length === 0) {
    console.warn('⚠️ No tool outputs provided or invalid format');
    return new Response(JSON.stringify({ 
      success: false,
      error: 'No tool outputs provided'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Process each tool call and generate appropriate outputs
    const processedOutputs = await Promise.all(
      toolOutputs.map(async (output: any) => {
        const { tool_call_id, function_name, arguments: functionArgs } = output;
        
        console.log(`🛠️ Processing function: ${function_name}`, { tool_call_id, functionArgs });
        
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
            case 'getPartnerOnboardingGuide':
              result = await handleGetPartnerOnboardingGuide(functionArgs, userId, supabase);
              break;
            case 'getPartnerRequirements':
              result = await handleGetPartnerRequirements(functionArgs, userId, supabase);
              break;
            case 'connectServiceProviders':
              result = await handleConnectServiceProviders(functionArgs, userId, supabase);
              break;
            case 'trackReferralConversion':
              result = await handleTrackReferralConversion(functionArgs, userId, supabase);
              break;
            default:
              result = { error: `Unknown function: ${function_name}` };
          }

          console.log(`✅ Function ${function_name} result:`, result);

          return {
            tool_call_id,
            output: JSON.stringify(result)
          };
        } catch (error) {
          console.error(`❌ Error processing ${function_name}:`, error);
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
      console.error('❌ Submit tool outputs failed:', errorData);
      return new Response(JSON.stringify({ 
        error: `Failed to submit tool outputs: ${errorData.error?.message || 'Unknown error'}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const run = await response.json();

    return new Response(JSON.stringify({ 
      success: true,
      run 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ submitToolOutputs error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to submit tool outputs',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
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

async function handleGetPartnerOnboardingGuide(args: any, userId: string, supabase: any) {
  console.log('📋 Getting partner onboarding guide:', args);
  
  try {
    const { data: provider, error } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('name', args.partnerName)
      .single();

    if (error) throw error;

    if (!provider) {
      return {
        success: false,
        error: `Partner ${args.partnerName} not found`
      };
    }

    // Get detailed setup requirements
    const { data: requirements, error: reqError } = await supabase
      .from('provider_setup_requirements')
      .select('*')
      .eq('provider_id', provider.id)
      .order('requirement_key');

    if (reqError) throw reqError;

    const setupSteps = requirements?.map((req: any) => req.requirement_value) || [];
    const setupRequirements = JSON.parse(provider.setup_requirements || '{}');

    return {
      success: true,
      partner: provider.name,
      assetType: args.assetType,
      description: provider.description,
      setupSteps,
      documentsNeeded: setupRequirements.documents || [],
      requirements: setupRequirements.requirements || [],
      setupTime: setupRequirements.setup_time || 'Not specified',
      approvalTime: setupRequirements.approval_time || 'Not specified',
      instructions: provider.setup_instructions,
      referralLink: provider.referral_link_template,
      earningsRange: `$${provider.avg_monthly_earnings_low}-${provider.avg_monthly_earnings_high}/month`
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

async function handleGetPartnerRequirements(args: any, userId: string, supabase: any) {
  console.log('📝 Getting partner requirements:', args);
  
  try {
    const { data: provider, error } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('name', args.partnerName)
      .single();

    if (error) throw error;

    if (!provider) {
      return {
        success: false,
        error: `Partner ${args.partnerName} not found`
      };
    }

    const setupRequirements = JSON.parse(provider.setup_requirements || '{}');

    return {
      success: true,
      partner: provider.name,
      documents: setupRequirements.documents || [],
      requirements: setupRequirements.requirements || [],
      setupTime: setupRequirements.setup_time || 'Not specified',
      approvalTime: setupRequirements.approval_time || 'Not specified',
      supportedAssets: provider.asset_types || [],
      earningsEstimate: `$${provider.avg_monthly_earnings_low}-${provider.avg_monthly_earnings_high}/month`
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

async function handleTrackReferralConversion(args: any, userId: string, supabase: any) {
  console.log('📊 Tracking referral conversion:', args);
  
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID required for tracking'
      };
    }

    // Create or update partner integration progress
    const { data, error } = await supabase
      .from('partner_integration_progress')
      .upsert({
        user_id: userId,
        partner_name: args.partnerName,
        integration_status: args.action === 'registration_completed' ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,partner_name'
      });

    if (error) throw error;

    // Track in affiliate earnings if this is a completed conversion
    if (args.action === 'registration_completed') {
      await supabase.from('affiliate_earnings').insert({
        user_id: userId,
        provider_name: args.partnerName,
        service_type: 'referral',
        status: 'pending',
        earnings_amount: 0, // Will be updated when actual commission is received
        metadata: {
          conversion_date: new Date().toISOString(),
          tracked_from: 'chatbot_assistant'
        }
      });
    }

    return {
      success: true,
      message: `${args.action} tracked for ${args.partnerName}`,
      action: args.action,
      partner: args.partnerName
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
