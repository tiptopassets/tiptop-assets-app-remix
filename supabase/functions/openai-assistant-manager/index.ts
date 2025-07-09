
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
const EXISTING_ASSISTANT_ID = 'asst_LAfMRhVWnpiQwGgZhSykzRtJ';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return errorResponse('OpenAI API key not configured', 500);
    }

    const requestBody = await req.json().catch(() => null);
    if (!requestBody?.action) {
      return errorResponse('Missing required field: action', 400);
    }

    const { action, data } = requestBody;
    console.log('🤖 [MANAGER] Action:', action);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    switch (action) {
      case 'get_assistant':
        return await getAssistant();
      case 'create_thread':
        return await createThread(data, supabase);
      case 'send_message':
        return await sendMessage(data, supabase);
      case 'run_assistant':
        return await runAssistant(data);
      case 'get_run_status':
        return await getRunStatus(data);
      case 'submit_tool_outputs':
        return await submitToolOutputs(data, supabase);
      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (error) {
    console.error('❌ [MANAGER] Error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ 
    error: message,
    success: false 
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function successResponse(data: any) {
  return new Response(JSON.stringify({ 
    success: true,
    ...data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function openAIRequest(endpoint: string, options: any) {
  const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
  }

  return response.json();
}

async function getAssistant() {
  console.log('✅ [ASSISTANT] Using existing assistant:', EXISTING_ASSISTANT_ID);
  return successResponse({ assistant: { id: EXISTING_ASSISTANT_ID } });
}

async function createThread(data: any, supabase: any) {
  try {
    const userId = data?.metadata?.userId;
    const isAuthenticated = userId && userId !== 'anonymous';
    
    console.log(`🧵 [THREAD] Creating for ${isAuthenticated ? 'authenticated' : 'anonymous'} user`);

    const thread = await openAIRequest('threads', {
      method: 'POST',
      body: JSON.stringify({
        metadata: data?.metadata || {}
      })
    });

    const threadId = thread.id;
    console.log('✅ [THREAD] Created:', threadId);

    // Create onboarding record for authenticated users
    if (isAuthenticated) {
      try {
        await supabase.from('user_onboarding').insert({
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
            created_via: 'openai_assistant',
            user_context: data?.metadata || {}
          }
        });
        console.log('✅ [DB] Onboarding record created');
      } catch (error) {
        console.warn('⚠️ [DB] Onboarding record creation failed:', error);
      }
    }

    return successResponse({ thread });
  } catch (error) {
    console.error('❌ [THREAD] Creation failed:', error);
    throw error;
  }
}

async function sendMessage(data: any, supabase: any) {
  const { threadId, message, userId, userContext } = data;

  if (!threadId || !message?.trim()) {
    throw new Error('threadId and message are required');
  }

  const isAuthenticated = userId && userId !== 'anonymous';
  console.log(`💬 [MESSAGE] Sending for ${isAuthenticated ? 'authenticated' : 'anonymous'} user`);

  try {
    // Enhance message with context
    let contextualMessage = message;
    if (userContext?.propertyData) {
      const propertyInfo = `\n\n[Property Context: ${userContext.propertyData.address}, Revenue Potential: $${userContext.propertyData.totalMonthlyRevenue}/month, Assets: ${userContext.propertyData.availableAssets?.length || 0}]`;
      contextualMessage += propertyInfo;
    }

    const messageData = await openAIRequest(`threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content: contextualMessage
      })
    });

    console.log('✅ [MESSAGE] Sent to OpenAI:', messageData.id);

    // Save to database for authenticated users
    if (isAuthenticated) {
      try {
        await supabase.rpc('insert_onboarding_message', {
          p_onboarding_id: threadId,
          p_role: 'user',
          p_content: message,
          p_metadata: { 
            messageId: messageData.id,
            timestamp: new Date().toISOString(),
            userId: userId,
            hasContext: !!userContext
          }
        });
        console.log('✅ [DB] Message saved');
      } catch (error) {
        console.warn('⚠️ [DB] Message save failed:', error);
      }
    }

    return successResponse({ message: messageData });
  } catch (error) {
    console.error('❌ [MESSAGE] Send failed:', error);
    throw error;
  }
}

async function runAssistant(data: any) {
  const { threadId, assistantId, userId } = data;

  if (!threadId || !assistantId) {
    throw new Error('threadId and assistantId are required');
  }

  const isAuthenticated = userId && userId !== 'anonymous';
  console.log(`🏃 [RUN] Starting for ${isAuthenticated ? 'authenticated' : 'anonymous'} user`);

  try {
    const run = await openAIRequest(`threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    console.log('✅ [RUN] Started:', run.id);
    return successResponse({ run });
  } catch (error) {
    console.error('❌ [RUN] Start failed:', error);
    throw error;
  }
}

async function getRunStatus(data: any) {
  const { threadId, runId } = data;

  if (!threadId || !runId) {
    throw new Error('threadId and runId are required');
  }

  try {
    const run = await openAIRequest(`threads/${threadId}/runs/${runId}`, {
      method: 'GET'
    });

    let messages = null;
    if (run.status === 'completed') {
      const messagesData = await openAIRequest(`threads/${threadId}/messages`, {
        method: 'GET'
      });
      messages = messagesData.data;
    }

    return successResponse({ run, messages });
  } catch (error) {
    console.error('❌ [RUN] Status check failed:', error);
    throw error;
  }
}

async function submitToolOutputs(data: any, supabase: any) {
  const { threadId, runId, toolOutputs, userId } = data;

  if (!threadId || !runId || !Array.isArray(toolOutputs)) {
    throw new Error('threadId, runId, and toolOutputs are required');
  }

  const isAuthenticated = userId && userId !== 'anonymous';
  console.log(`🔧 [TOOLS] Processing ${toolOutputs.length} outputs for ${isAuthenticated ? 'authenticated' : 'anonymous'} user`);

  try {
    const processedOutputs = await Promise.all(
      toolOutputs.map(async (output: any) => {
        const { tool_call_id, function_name, arguments: functionArgs } = output;
        
        console.log(`🛠️ [TOOLS] Processing: ${function_name}`);
        
        try {
          let result;
          
          switch (function_name) {
            case 'collectAddress':
              result = await handleCollectAddress(functionArgs, userId, supabase, isAuthenticated);
              break;
            case 'suggestAssetOpportunities':
              result = await handleSuggestAssetOpportunities(functionArgs, userId, supabase, isAuthenticated);
              break;
            case 'saveUserResponse':
              result = await handleSaveUserResponse(functionArgs, userId, supabase, isAuthenticated);
              break;
            case 'getPartnerOnboardingGuide':
              result = await handleGetPartnerOnboardingGuide(functionArgs, userId, supabase, isAuthenticated);
              break;
            case 'getPartnerRequirements':
              result = await handleGetPartnerRequirements(functionArgs, userId, supabase, isAuthenticated);
              break;
            case 'connectServiceProviders':
              result = await handleConnectServiceProviders(functionArgs, userId, supabase, isAuthenticated);
              break;
            case 'trackReferralConversion':
              result = await handleTrackReferralConversion(functionArgs, userId, supabase, isAuthenticated);
              break;
            default:
              result = { error: `Unknown function: ${function_name}` };
          }

          console.log(`✅ [TOOLS] ${function_name} completed`);
          return {
            tool_call_id,
            output: JSON.stringify(result)
          };
        } catch (error) {
          console.error(`❌ [TOOLS] ${function_name} failed:`, error);
          return {
            tool_call_id,
            output: JSON.stringify({ error: error.message })
          };
        }
      })
    );

    const run = await openAIRequest(`threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
      method: 'POST',
      body: JSON.stringify({
        tool_outputs: processedOutputs
      })
    });

    return successResponse({ run });
  } catch (error) {
    console.error('❌ [TOOLS] Submission failed:', error);
    throw error;
  }
}

// Tool function handlers
async function handleCollectAddress(args: any, userId: string, supabase: any, isAuthenticated: boolean) {
  console.log('🏠 [TOOL] Collecting address:', args);
  
  if (isAuthenticated) {
    try {
      await supabase.from('user_addresses').upsert({
        user_id: userId,
        address: args.address,
        coordinates: args.coordinates,
        formatted_address: args.address,
        is_primary: true
      });

      return { 
        success: true, 
        message: 'Address saved successfully',
        address: args.address 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  return { 
    success: true, 
    message: 'Address collected (sign in to save permanently)',
    address: args.address 
  };
}

async function handleSuggestAssetOpportunities(args: any, userId: string, supabase: any, isAuthenticated: boolean) {
  console.log('💡 [TOOL] Suggesting asset opportunities:', args);
  
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
          setupInstructions: p.setup_instructions,
          requiresAuth: !isAuthenticated ? 'Sign in to access partner connections' : null
        })) || []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, message: 'No specific assets selected for recommendations' };
}

async function handleSaveUserResponse(args: any, userId: string, supabase: any, isAuthenticated: boolean) {
  console.log('💾 [TOOL] Saving user response:', args);
  
  if (isAuthenticated) {
    try {
      await supabase.from('user_onboarding').upsert({
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

      return { 
        success: true, 
        message: 'Response saved successfully',
        responseType: args.responseType 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, message: 'Response collected (sign in to save permanently)' };
}

async function handleConnectServiceProviders(args: any, userId: string, supabase: any, isAuthenticated: boolean) {
  console.log('🤝 [TOOL] Connecting service providers:', args);
  
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
      averageEarnings: `$${provider.avg_monthly_earnings_low}-${provider.avg_monthly_earnings_high}/month`,
      requiresAuth: !isAuthenticated ? 'Sign in to save connections and track progress with partners' : null
    })) || [];

    return {
      success: true,
      providers: connections,
      totalProviders: connections.length,
      assetTypes: args.assetTypes,
      authMessage: !isAuthenticated ? 'Sign in to save connections and track your progress with partners' : null
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetPartnerOnboardingGuide(args: any, userId: string, supabase: any, isAuthenticated: boolean) {
  console.log('📋 [TOOL] Getting partner onboarding guide:', args);
  
  try {
    const { data: provider, error } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('name', args.partnerName)
      .single();

    if (error) throw error;

    if (!provider) {
      return { success: false, error: `Partner ${args.partnerName} not found` };
    }

    const setupRequirements = JSON.parse(provider.setup_requirements || '{}');

    return {
      success: true,
      partner: provider.name,
      assetType: args.assetType,
      description: provider.description,
      instructions: provider.setup_instructions,
      referralLink: provider.referral_link_template,
      earningsRange: `$${provider.avg_monthly_earnings_low}-${provider.avg_monthly_earnings_high}/month`,
      requirements: setupRequirements.requirements || [],
      documentsNeeded: setupRequirements.documents || [],
      setupTime: setupRequirements.setup_time || 'Not specified',
      authMessage: !isAuthenticated ? 'Sign in to track your onboarding progress' : null
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetPartnerRequirements(args: any, userId: string, supabase: any, isAuthenticated: boolean) {
  console.log('📝 [TOOL] Getting partner requirements:', args);
  
  try {
    const { data: provider, error } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('name', args.partnerName)
      .single();

    if (error) throw error;

    if (!provider) {
      return { success: false, error: `Partner ${args.partnerName} not found` };
    }

    const setupRequirements = JSON.parse(provider.setup_requirements || '{}');

    return {
      success: true,
      partner: provider.name,
      documents: setupRequirements.documents || [],
      requirements: setupRequirements.requirements || [],
      setupTime: setupRequirements.setup_time || 'Not specified',
      supportedAssets: provider.asset_types || [],
      earningsEstimate: `$${provider.avg_monthly_earnings_low}-${provider.avg_monthly_earnings_high}/month`,
      authMessage: !isAuthenticated ? 'Sign in to save requirements and track progress' : null
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleTrackReferralConversion(args: any, userId: string, supabase: any, isAuthenticated: boolean) {
  console.log('📊 [TOOL] Tracking referral conversion:', args);
  
  if (!isAuthenticated) {
    return { success: false, error: 'Sign in required to track referral conversions' };
  }

  try {
    await supabase.from('partner_integration_progress').upsert({
      user_id: userId,
      partner_name: args.partnerName,
      integration_status: args.action === 'registration_completed' ? 'completed' : 'in_progress',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,partner_name'
    });

    return {
      success: true,
      message: `${args.action} tracked for ${args.partnerName}`,
      action: args.action,
      partner: args.partnerName
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
