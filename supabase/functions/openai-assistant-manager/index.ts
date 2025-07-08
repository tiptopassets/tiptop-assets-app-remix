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
      throw new Error('OpenAI API key not configured');
    }

    const { action, data } = await req.json();
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('🤖 Assistant Manager action:', action);

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
      // Don't create new assistant programmatically, just return the ID
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
    // Fallback to just using the hardcoded ID
    console.log('✅ Using hardcoded assistant ID as fallback:', EXISTING_ASSISTANT_ID);
    
    return new Response(JSON.stringify({ 
      success: true,
      assistant: { id: EXISTING_ASSISTANT_ID }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function createNewAssistant() {
  console.log('🤖 Creating new assistant with updated functions');
  
  const systemPrompt = `You are an AI assistant for Tiptop, a platform that helps homeowners monetize their property assets (rooftops, parking spaces, pools, internet bandwidth, storage, etc.).

Your role is to guide users through asset monetization and partner onboarding in a conversational, helpful way.

PARTNER INTEGRATION FOCUS:
You now have access to detailed partner information and can provide step-by-step onboarding guidance for:
- **Swimply**: Pool rentals ($150-800/month) - for swimming pools, hot tubs
- **Neighbor.com**: Storage rentals ($50-300/month) - for garages, basements, storage spaces
- **Peerspace**: Event space rentals ($100-500/month) - for unique spaces, meeting rooms
- **SpotHero**: Parking space rentals ($75-400/month) - for driveways, parking spots

CONVERSATION STYLE:
- Be conversational, friendly, and encouraging
- Focus on ONE asset/partner at a time for focused guidance
- Provide specific, actionable steps with document requirements
- Always include referral links and earning estimates
- Track user progress through the onboarding process

AVAILABLE FUNCTIONS:
- getPartnerOnboardingGuide: Get detailed step-by-step guidance for specific partners
- getPartnerRequirements: Get documents and requirements for partner registration
- connectServiceProviders: Connect users with partners using referral links
- trackReferralConversion: Track when users click links or complete registrations
- saveUserResponse: Store progress and user inputs
- collectAddress: Gather property details

Remember: Your goal is to successfully onboard users to our partner platforms while maximizing affiliate earnings through smooth, guided experiences.`;

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
      model: 'gpt-4.1-2025-04-14',
      tools: [
        {
          type: 'function',
          function: {
            name: 'connectServiceProviders',
            description: 'Connect user with relevant service providers with referral links and onboarding guidance',
            parameters: {
              type: 'object',
              properties: {
                assetTypes: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Asset types to find providers for'
                }
              },
              required: ['assetTypes']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'getPartnerRequirements',
            description: 'Get detailed requirements, documents needed, and setup time for a specific partner',
            parameters: {
              type: 'object',
              properties: {
                partnerName: {
                  type: 'string',
                  description: 'Name of the partner platform (e.g., SpotHero, Neighbor.com, Swimply, Peerspace)'
                }
              },
              required: ['partnerName']
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
  console.log('✅ New assistant created:', assistant.id);

  return new Response(JSON.stringify({ 
    success: true,
    assistant 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createThread(data: any, supabase: any) {
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
  const threadId = thread.id;
  console.log('✅ Thread created:', threadId);

  // Create corresponding onboarding record using threadId
  const userId = data.metadata?.userId;
  if (userId) {
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
        console.warn('⚠️ Failed to create onboarding record:', onboardingError);
        // Don't throw here, as the thread is already created
      } else {
        console.log('✅ Onboarding record created for thread:', threadId);
      }
    } catch (error) {
      console.warn('⚠️ Error creating onboarding record:', error);
    }
  }

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
      // First, ensure onboarding record exists
      await ensureOnboardingRecord(threadId, userId, supabase);
      
      // Then save the message
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

// Helper function to ensure onboarding record exists
async function ensureOnboardingRecord(threadId: string, userId: string, supabase: any) {
  try {
    // Check if onboarding record exists
    const { data: existing, error: checkError } = await supabase
      .from('user_onboarding')
      .select('id')
      .eq('id', threadId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // If no record exists, create one
    if (!existing) {
      console.log('📝 Creating missing onboarding record for thread:', threadId);
      const { error: insertError } = await supabase
        .from('user_onboarding')
        .insert({
          id: threadId,
          user_id: userId,
          selected_option: 'concierge',
          status: 'in_progress',
          current_step: 1,
          total_steps: 5,
          chat_history: [],
          completed_assets: [],
          progress_data: {
            assistant_thread_id: threadId,
            created_via: 'openai_assistant_fallback'
          }
        });

      if (insertError) {
        console.error('❌ Failed to create fallback onboarding record:', insertError);
        throw insertError;
      }
      
      console.log('✅ Fallback onboarding record created for thread:', threadId);
    }
  } catch (error) {
    console.error('❌ Error ensuring onboarding record:', error);
    throw error;
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