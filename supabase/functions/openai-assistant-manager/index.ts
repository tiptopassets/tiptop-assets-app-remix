
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables with validation
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const EXISTING_ASSISTANT_ID = Deno.env.get('OPENAI_ASSISTANT_ID');

// Validate environment on startup
if (!OPENAI_API_KEY) {
  console.error('❌ [STARTUP] OPENAI_API_KEY is missing');
}
if (!SUPABASE_URL) {
  console.error('❌ [STARTUP] SUPABASE_URL is missing');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ [STARTUP] SUPABASE_SERVICE_ROLE_KEY is missing');
}
if (!EXISTING_ASSISTANT_ID) {
  console.error('❌ [STARTUP] OPENAI_ASSISTANT_ID is missing');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔄 [${requestId}] Request started: ${req.method} ${req.url}`);

  try {
    // Enhanced environment validation
    if (!OPENAI_API_KEY) {
      console.error(`❌ [${requestId}] OpenAI API key not configured`);
      return errorResponse('OpenAI API key not configured', 500, requestId);
    }

    if (!EXISTING_ASSISTANT_ID) {
      console.error(`❌ [${requestId}] OpenAI Assistant ID not configured`);
      return errorResponse('OpenAI Assistant ID not configured in environment variables', 500, requestId);
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`❌ [${requestId}] Supabase configuration missing`);
      return errorResponse('Database configuration missing', 500, requestId);
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error(`❌ [${requestId}] Invalid JSON in request:`, error.message);
      return errorResponse('Invalid JSON in request body', 400, requestId);
    }

    if (!requestBody?.action) {
      console.error(`❌ [${requestId}] Missing required field: action`);
      return errorResponse('Missing required field: action', 400, requestId);
    }

    const { action, data } = requestBody;
    console.log(`🎯 [${requestId}] Action: ${action}`, data ? 'with data' : 'no data');

    // Initialize Supabase client with error handling
    let supabase;
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      console.log(`✅ [${requestId}] Supabase client initialized`);
    } catch (error) {
      console.error(`❌ [${requestId}] Failed to initialize Supabase:`, error.message);
      return errorResponse('Database connection failed', 500, requestId);
    }

    // Route to action handlers with timeout
    const actionTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Action timeout after 30 seconds')), 30000)
    );

    let result;
    try {
      switch (action) {
        case 'get_assistant':
          result = await Promise.race([getAssistant(requestId), actionTimeout]);
          break;
        case 'create_thread':
          result = await Promise.race([createThread(data, supabase, requestId), actionTimeout]);
          break;
        case 'send_message':
          result = await Promise.race([sendMessage(data, supabase, requestId), actionTimeout]);
          break;
        case 'run_assistant':
          result = await Promise.race([runAssistant(data, requestId), actionTimeout]);
          break;
        case 'get_run_status':
          result = await Promise.race([getRunStatus(data, requestId), actionTimeout]);
          break;
        case 'submit_tool_outputs':
          result = await Promise.race([submitToolOutputs(data, supabase, requestId), actionTimeout]);
          break;
        case 'test_connection':
          result = await Promise.race([testConnection(supabase, requestId), actionTimeout]);
          break;
        default:
          console.error(`❌ [${requestId}] Unknown action: ${action}`);
          return errorResponse(`Unknown action: ${action}`, 400, requestId);
      }
      
      console.log(`✅ [${requestId}] Action completed successfully`);
      return result;
    } catch (error) {
      if (error.message === 'Action timeout after 30 seconds') {
        console.error(`⏰ [${requestId}] Action timed out`);
        return errorResponse('Request timeout', 408, requestId);
      }
      throw error;
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Unhandled error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return errorResponse(error.message || 'Internal server error', 500, requestId);
  }
});

function errorResponse(message: string, status: number, requestId?: string) {
  const errorId = requestId || crypto.randomUUID().substring(0, 8);
  console.error(`❌ [${errorId}] Returning error: ${status} - ${message}`);
  return new Response(JSON.stringify({ 
    error: message,
    success: false,
    requestId: errorId,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function successResponse(data: any, requestId?: string) {
  const successId = requestId || crypto.randomUUID().substring(0, 8);
  console.log(`✅ [${successId}] Returning success response`);
  return new Response(JSON.stringify({ 
    success: true,
    requestId: successId,
    timestamp: new Date().toISOString(),
    ...data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function openAIRequest(endpoint: string, options: any, requestId: string) {
  console.log(`🤖 [${requestId}] OpenAI request: ${endpoint}`);
  
  try {
    const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    console.log(`🤖 [${requestId}] OpenAI response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      console.error(`❌ [${requestId}] OpenAI API error:`, {
        status: response.status,
        error: errorData
      });
      
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ [${requestId}] OpenAI request successful`);
    return data;
  } catch (error) {
    console.error(`❌ [${requestId}] OpenAI request failed:`, error.message);
    throw error;
  }
}

async function getAssistant(requestId: string) {
  console.log(`🤖 [${requestId}] Getting assistant: ${EXISTING_ASSISTANT_ID}`);
  
  if (!EXISTING_ASSISTANT_ID) {
    console.error(`❌ [${requestId}] Assistant ID not configured`);
    throw new Error('OpenAI Assistant ID not configured in environment variables');
  }
  
  try {
    // Test the assistant exists by trying to retrieve it
    const assistant = await openAIRequest(`assistants/${EXISTING_ASSISTANT_ID}`, {
      method: 'GET'
    }, requestId);
    
    console.log(`✅ [${requestId}] Assistant verified: ${EXISTING_ASSISTANT_ID}`, {
      name: assistant.name,
      model: assistant.model,
      instructions: assistant.instructions ? 'has instructions' : 'no instructions'
    });
    
    return successResponse({ assistant: { id: EXISTING_ASSISTANT_ID, name: assistant.name } }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Assistant verification failed:`, error.message);
    
    // Enhanced error message for assistant not found
    if (error.message.includes('404') || error.message.includes('not found')) {
      throw new Error(`Assistant with ID ${EXISTING_ASSISTANT_ID} not found in your OpenAI account. Please check the assistant ID or create a new assistant.`);
    }
    
    throw new Error(`Assistant verification failed: ${error.message}`);
  }
}

async function createThread(data: any, supabase: any, requestId: string) {
  console.log(`🧵 [${requestId}] Creating thread...`);
  
  try {
    const userId = data?.metadata?.userId;
    const isAuthenticated = userId && userId !== 'anonymous';
    
    console.log(`🧵 [${requestId}] User type: ${isAuthenticated ? 'authenticated' : 'anonymous'}`);
    console.log(`🧵 [${requestId}] Metadata:`, data?.metadata);

    // Create OpenAI thread
    const thread = await openAIRequest('threads', {
      method: 'POST',
      body: JSON.stringify({
        metadata: data?.metadata || {}
      })
    }, requestId);

    const threadId = thread.id;
    console.log(`✅ [${requestId}] OpenAI thread created: ${threadId}`);

    // Create onboarding record for authenticated users
    if (isAuthenticated) {
      try {
        console.log(`💾 [${requestId}] Creating onboarding record for user: ${userId}`);
        
        const onboardingData = {
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
            user_context: data?.metadata || {},
            created_at: new Date().toISOString()
          }
        };

        console.log(`💾 [${requestId}] Inserting onboarding data:`, {
          id: onboardingData.id,
          user_id: onboardingData.user_id,
          selected_option: onboardingData.selected_option,
          status: onboardingData.status
        });

        const { data: insertData, error: insertError } = await supabase
          .from('user_onboarding')
          .insert(onboardingData)
          .select();

        if (insertError) {
          console.error(`❌ [${requestId}] Database insert failed:`, {
            error: insertError,
            code: insertError.code,
            message: insertError.message,
            details: insertError.details
          });
          
          // Don't fail the thread creation if DB insert fails
          console.warn(`⚠️ [${requestId}] Continuing without DB record`);
        } else {
          console.log(`✅ [${requestId}] Onboarding record created successfully:`, insertData);
        }
      } catch (dbError) {
        console.error(`❌ [${requestId}] Database operation error:`, dbError);
        // Continue without failing the thread creation
        console.warn(`⚠️ [${requestId}] Continuing without DB record`);
      }
    }

    return successResponse({ thread }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Thread creation failed:`, error.message);
    throw new Error(`Thread creation failed: ${error.message}`);
  }
}

async function sendMessage(data: any, supabase: any, requestId: string) {
  const { threadId, message, userId, userContext } = data;

  console.log(`💬 [${requestId}] Sending message to thread: ${threadId}`);

  if (!threadId || !message?.trim()) {
    throw new Error('threadId and message are required');
  }

  try {
    const isAuthenticated = userId && userId !== 'anonymous';
    console.log(`💬 [${requestId}] User: ${isAuthenticated ? 'authenticated' : 'anonymous'}`);

    // Enhance message with context
    let contextualMessage = message;
    if (userContext?.propertyData) {
      const propertyInfo = `\n\n[Property Context: ${userContext.propertyData.address}, Revenue Potential: $${userContext.propertyData.totalMonthlyRevenue}/month, Assets: ${userContext.propertyData.availableAssets?.length || 0}]`;
      contextualMessage += propertyInfo;
      console.log(`💬 [${requestId}] Added property context`);
    }

    const messageData = await openAIRequest(`threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content: contextualMessage
      })
    }, requestId);

    console.log(`✅ [${requestId}] Message sent to OpenAI: ${messageData.id}`);

    // Save to database for authenticated users (non-blocking)
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
        console.log(`✅ [${requestId}] Message saved to database`);
      } catch (dbError) {
        console.warn(`⚠️ [${requestId}] Failed to save message to DB:`, dbError.message);
      }
    }

    return successResponse({ message: messageData }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Send message failed:`, error.message);
    throw new Error(`Send message failed: ${error.message}`);
  }
}

async function runAssistant(data: any, requestId: string) {
  const { threadId, assistantId, userId } = data;

  console.log(`🏃 [${requestId}] Running assistant: ${assistantId} on thread: ${threadId}`);

  if (!threadId || !assistantId) {
    throw new Error('threadId and assistantId are required');
  }

  try {
    const run = await openAIRequest(`threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: assistantId
      })
    }, requestId);

    console.log(`✅ [${requestId}] Assistant run started: ${run.id}`);
    return successResponse({ run }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Run assistant failed:`, error.message);
    throw new Error(`Run assistant failed: ${error.message}`);
  }
}

async function getRunStatus(data: any, requestId: string) {
  const { threadId, runId } = data;

  if (!threadId || !runId) {
    throw new Error('threadId and runId are required');
  }

  try {
    console.log(`📊 [${requestId}] Checking run status: ${runId}`);
    
    const run = await openAIRequest(`threads/${threadId}/runs/${runId}`, {
      method: 'GET'
    }, requestId);

    console.log(`📊 [${requestId}] Run status: ${run.status}`);

    let messages = null;
    if (run.status === 'completed') {
      console.log(`📚 [${requestId}] Run completed, fetching messages`);
      const messagesData = await openAIRequest(`threads/${threadId}/messages`, {
        method: 'GET'
      }, requestId);
      messages = messagesData.data;
      console.log(`📚 [${requestId}] Retrieved ${messages?.length || 0} messages`);
    }

    return successResponse({ run, messages }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Get run status failed:`, error.message);
    throw new Error(`Get run status failed: ${error.message}`);
  }
}

async function submitToolOutputs(data: any, supabase: any, requestId: string) {
  const { threadId, runId, toolOutputs, userId } = data;

  console.log(`🔧 [${requestId}] Processing ${toolOutputs?.length || 0} tool outputs`);

  if (!threadId || !runId || !Array.isArray(toolOutputs)) {
    throw new Error('threadId, runId, and toolOutputs are required');
  }

  try {
    const isAuthenticated = userId && userId !== 'anonymous';
    
    const processedOutputs = await Promise.all(
      toolOutputs.map(async (output: any) => {
        const { tool_call_id, function_name, arguments: functionArgs } = output;
        
        console.log(`🛠️ [${requestId}] Processing function: ${function_name}`);
        
        try {
          let result;
          
          switch (function_name) {
            case 'collectAddress':
              result = await handleCollectAddress(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'suggestAssetOpportunities':
              result = await handleSuggestAssetOpportunities(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'saveUserResponse':
              result = await handleSaveUserResponse(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'getPartnerOnboardingGuide':
              result = await handleGetPartnerOnboardingGuide(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'getPartnerRequirements':
              result = await handleGetPartnerRequirements(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'connectServiceProviders':
              result = await handleConnectServiceProviders(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'trackReferralConversion':
              result = await handleTrackReferralConversion(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            default:
              result = { error: `Unknown function: ${function_name}` };
          }

          console.log(`✅ [${requestId}] Function ${function_name} completed`);
          return {
            tool_call_id,
            output: JSON.stringify(result)
          };
        } catch (error) {
          console.error(`❌ [${requestId}] Function ${function_name} failed:`, error.message);
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
    }, requestId);

    console.log(`✅ [${requestId}] Tool outputs submitted`);
    return successResponse({ run }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Submit tool outputs failed:`, error.message);
    throw new Error(`Submit tool outputs failed: ${error.message}`);
  }
}

// Enhanced diagnostic function
async function testConnection(supabase: any, requestId: string) {
  console.log(`🔧 [${requestId}] Running connection tests...`);
  
  const results = {
    openai: false,
    database: false,
    assistant: false,
    errors: []
  };

  // Test OpenAI connection
  try {
    await openAIRequest('models', { method: 'GET' }, requestId);
    results.openai = true;
    console.log(`✅ [${requestId}] OpenAI connection: OK`);
  } catch (error) {
    results.errors.push(`OpenAI: ${error.message}`);
    console.error(`❌ [${requestId}] OpenAI connection: FAILED`);
  }

  // Test database connection
  try {
    const { data, error } = await supabase.from('enhanced_service_providers').select('count').limit(1);
    if (error) throw error;
    results.database = true;
    console.log(`✅ [${requestId}] Database connection: OK`);
  } catch (error) {
    results.errors.push(`Database: ${error.message}`);
    console.error(`❌ [${requestId}] Database connection: FAILED`);
  }

  // Test assistant with the correct ID
  try {
    if (!EXISTING_ASSISTANT_ID) {
      throw new Error('Assistant ID not configured in environment variables');
    }
    const assistant = await openAIRequest(`assistants/${EXISTING_ASSISTANT_ID}`, { method: 'GET' }, requestId);
    results.assistant = true;
    console.log(`✅ [${requestId}] Assistant connection: OK - Found assistant: ${assistant.name}`);
  } catch (error) {
    results.errors.push(`Assistant: ${error.message}`);
    console.error(`❌ [${requestId}] Assistant connection: FAILED`);
  }

  return successResponse({ 
    tests: results,
    environment: {
      hasOpenAIKey: !!OPENAI_API_KEY,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
      hasAssistantId: !!EXISTING_ASSISTANT_ID,
      assistantId: EXISTING_ASSISTANT_ID
    }
  }, requestId);
}

// Tool function handlers with enhanced logging
async function handleCollectAddress(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`🏠 [${requestId}] Collecting address:`, args?.address);
  
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

async function handleSuggestAssetOpportunities(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`💡 [${requestId}] Suggesting asset opportunities:`, args?.selectedAssets);
  
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

async function handleSaveUserResponse(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`💾 [${requestId}] Saving user response:`, args?.responseType);
  
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

async function handleConnectServiceProviders(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`🤝 [${requestId}] Connecting service providers:`, args?.assetTypes);
  
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

async function handleGetPartnerOnboardingGuide(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`📋 [${requestId}] Getting partner onboarding guide:`, args?.partnerName);
  
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

async function handleGetPartnerRequirements(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`📝 [${requestId}] Getting partner requirements:`, args?.partnerName);
  
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

async function handleTrackReferralConversion(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`📊 [${requestId}] Tracking referral conversion:`, args?.partnerName);
  
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
