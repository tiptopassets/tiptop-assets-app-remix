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
const OPENAI_ASSISTANT_ID = Deno.env.get('OPENAI_ASSISTANT_ID');

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
if (!OPENAI_ASSISTANT_ID) {
  console.error('❌ [STARTUP] OPENAI_ASSISTANT_ID is missing');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔄 [${requestId}] Request started: ${req.method} ${req.url}`);

  try {
    // Enhanced environment validation with detailed error codes
    const validationResult = validateEnvironment(requestId);
    if (!validationResult.success) {
      return errorResponse(validationResult.error, validationResult.code, requestId);
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

    // Route to action handlers with timeout and structured error handling
    const actionTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Action timeout after 30 seconds')), 30000)
    );

    let result;
    try {
      switch (action) {
        case 'test_assistant_setup':
          result = await Promise.race([testAssistantSetup(supabase, requestId), actionTimeout]);
          break;
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

function validateEnvironment(requestId: string) {
  if (!OPENAI_API_KEY) {
    console.error(`❌ [${requestId}] OpenAI API key not configured`);
    return { success: false, error: 'OpenAI API key not configured', code: 500 };
  }

  if (!OPENAI_ASSISTANT_ID) {
    console.error(`❌ [${requestId}] OpenAI Assistant ID not configured`);
    return { success: false, error: 'OpenAI Assistant ID not configured in environment variables', code: 500 };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(`❌ [${requestId}] Supabase configuration missing`);
    return { success: false, error: 'Database configuration missing', code: 500 };
  }

  return { success: true };
}

function errorResponse(message: string, status: number, requestId?: string) {
  const errorId = requestId || crypto.randomUUID().substring(0, 8);
  console.error(`❌ [${errorId}] Returning error: ${status} - ${message}`);
  return new Response(JSON.stringify({ 
    error: message,
    success: false,
    requestId: errorId,
    timestamp: new Date().toISOString(),
    errorCode: status
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

async function testAssistantSetup(supabase: any, requestId: string) {
  console.log(`🔧 [${requestId}] Testing assistant setup...`);
  
  const results = {
    environment: {
      hasOpenAIKey: !!OPENAI_API_KEY,
      hasAssistantId: !!OPENAI_ASSISTANT_ID,
      hasSupabaseConfig: !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    },
    tests: {
      openai: false,
      assistant: false,
      database: false
    },
    errors: []
  };

  // Test OpenAI connection
  try {
    await openAIRequest('models', { method: 'GET' }, requestId);
    results.tests.openai = true;
    console.log(`✅ [${requestId}] OpenAI connection: OK`);
  } catch (error) {
    results.errors.push(`OpenAI: ${error.message}`);
    console.error(`❌ [${requestId}] OpenAI connection: FAILED`);
  }

  // Test assistant
  try {
    if (!OPENAI_ASSISTANT_ID) {
      throw new Error('Assistant ID not configured');
    }
    const assistant = await openAIRequest(`assistants/${OPENAI_ASSISTANT_ID}`, { method: 'GET' }, requestId);
    results.tests.assistant = true;
    console.log(`✅ [${requestId}] Assistant verified: ${assistant.name}`);
  } catch (error) {
    results.errors.push(`Assistant: ${error.message}`);
    console.error(`❌ [${requestId}] Assistant verification: FAILED`);
  }

  // Test database
  try {
    const { data, error } = await supabase.from('enhanced_service_providers').select('count').limit(1);
    if (error) throw error;
    results.tests.database = true;
    console.log(`✅ [${requestId}] Database connection: OK`);
  } catch (error) {
    results.errors.push(`Database: ${error.message}`);
    console.error(`❌ [${requestId}] Database connection: FAILED`);
  }

  return successResponse(results, requestId);
}

async function getAssistant(requestId: string) {
  console.log(`🤖 [${requestId}] Getting assistant: ${OPENAI_ASSISTANT_ID}`);
  
  if (!OPENAI_ASSISTANT_ID) {
    console.error(`❌ [${requestId}] Assistant ID not configured`);
    throw new Error('OpenAI Assistant ID not configured in environment variables');
  }
  
  try {
    const assistant = await openAIRequest(`assistants/${OPENAI_ASSISTANT_ID}`, {
      method: 'GET'
    }, requestId);
    
    console.log(`✅ [${requestId}] Assistant verified: ${OPENAI_ASSISTANT_ID}`, {
      name: assistant.name,
      model: assistant.model,
      instructions: assistant.instructions ? 'has instructions' : 'no instructions'
    });
    
    return successResponse({ assistant: { id: OPENAI_ASSISTANT_ID, name: assistant.name } }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Assistant verification failed:`, error.message);
    
    if (error.message.includes('404') || error.message.includes('not found')) {
      throw new Error(`Assistant with ID ${OPENAI_ASSISTANT_ID} not found in your OpenAI account. Please check the assistant ID or create a new assistant.`);
    }
    
    throw new Error(`Assistant verification failed: ${error.message}`);
  }
}

// FIXED: Thread creation without assistant_id parameter (not supported by OpenAI API)
async function createThread(data: any, supabase: any, requestId: string) {
  console.log(`🧵 [${requestId}] Creating thread...`);
  
  try {
    // Validate required fields
    if (!OPENAI_ASSISTANT_ID) {
      throw new Error('Assistant ID not configured in environment variables');
    }

    const userId = data?.metadata?.userId;
    const propertyAddress = data?.metadata?.propertyAddress;
    const analysisId = data?.metadata?.analysisId;
    const partnersAvailable = data?.metadata?.partnersAvailable;

    console.log(`🧪 [${requestId}] Creating thread for assistant:`, OPENAI_ASSISTANT_ID);
    console.log(`🧪 [${requestId}] Metadata:`, {
      userId: userId || 'anonymous',
      propertyAddress: propertyAddress || 'not_provided',
      analysisId: analysisId || 'not_provided',
      partnersAvailable: partnersAvailable || 0
    });

    // Prepare clean metadata (no undefined values)
    const cleanMetadata: Record<string, string> = {};
    
    if (userId && userId !== 'anonymous') {
      cleanMetadata.userId = String(userId);
    }
    if (propertyAddress && propertyAddress !== 'not_provided') {
      cleanMetadata.propertyAddress = String(propertyAddress);
    }
    if (analysisId && analysisId !== 'not_provided') {
      cleanMetadata.analysisId = String(analysisId);
    }
    if (partnersAvailable !== undefined && partnersAvailable !== null) {
      cleanMetadata.partnersAvailable = String(partnersAvailable);
    }

    console.log(`🧪 [${requestId}] Clean metadata for OpenAI:`, cleanMetadata);

    // ⭐ CRITICAL FIX: Create thread WITHOUT assistant_id (OpenAI API doesn't support this parameter)
    const threadPayload = {
      metadata: cleanMetadata
    };

    console.log(`🔥 [${requestId}] Thread creation payload:`, threadPayload);

    const thread = await openAIRequest('threads', {
      method: 'POST',
      body: JSON.stringify(threadPayload)
    }, requestId);

    const threadId = thread.id;
    console.log(`✅ [${requestId}] OpenAI thread created: ${threadId}`);
    console.log(`🔗 [${requestId}] Will be linked to assistant: ${OPENAI_ASSISTANT_ID} when runs are created`);

    // ⭐ Verify thread creation
    try {
      const verifyThread = await openAIRequest(`threads/${threadId}`, {
        method: 'GET'
      }, requestId);
      
      console.log(`🔍 [${requestId}] Thread verification:`, {
        threadId: verifyThread.id,
        hasMetadata: !!verifyThread.metadata,
        metadataKeys: Object.keys(verifyThread.metadata || {}),
        createdAt: verifyThread.created_at
      });
    } catch (verifyError) {
      console.warn(`⚠️ [${requestId}] Thread verification failed but continuing:`, verifyError.message);
    }

    // Optional: Create onboarding record (non-blocking)
    if (userId && userId !== 'anonymous') {
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
            assistant_id: OPENAI_ASSISTANT_ID,
            created_via: 'openai_assistant',
            user_context: data?.metadata || {},
            created_at: new Date().toISOString()
          }
        };

        const { error: insertError } = await supabase
          .from('user_onboarding')
          .insert(onboardingData);

        if (insertError) {
          console.warn(`⚠️ [${requestId}] Onboarding record failed but continuing:`, insertError.message);
        } else {
          console.log(`✅ [${requestId}] Onboarding record created successfully`);
        }
      } catch (dbError) {
        console.warn(`⚠️ [${requestId}] Database operation failed but continuing:`, dbError.message);
      }
    }

    return successResponse({ 
      thread: {
        ...thread,
        assistant_will_be_linked: OPENAI_ASSISTANT_ID,
        linkage_method: 'via_runs'
      }
    }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Thread creation failed:`, error.message);
    
    // Enhanced error messaging for OpenAI API errors
    let errorMessage = error.message || 'Thread creation failed';
    if (errorMessage.includes('assistant_id')) {
      errorMessage = 'OpenAI API rejected thread creation with assistant_id parameter. This is now fixed.';
    }
    
    throw new Error(`Thread creation failed: ${errorMessage}`);
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
  const { threadId, assistantId } = data;

  console.log(`🏃 [${requestId}] Running assistant: ${assistantId || OPENAI_ASSISTANT_ID} on thread: ${threadId}`);

  if (!threadId) {
    throw new Error('threadId is required');
  }

  // Use the configured assistant ID if not provided
  const actualAssistantId = assistantId || OPENAI_ASSISTANT_ID;
  
  if (!actualAssistantId) {
    throw new Error('Assistant ID not configured');
  }

  try {
    const run = await openAIRequest(`threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: actualAssistantId
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
            case 'get_property_analysis':
              result = await handleGetPropertyAnalysis(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'get_service_providers':
              result = await handleGetServiceProviders(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'get_user_preferences':
              result = await handleGetUserPreferences(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'create_recommendation':
              result = await handleCreateRecommendation(functionArgs, userId, supabase, isAuthenticated, requestId);
              break;
            case 'update_user_progress':
              result = await handleUpdateUserProgress(functionArgs, userId, supabase, isAuthenticated, requestId);
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
    if (!OPENAI_ASSISTANT_ID) {
      throw new Error('Assistant ID not configured in environment variables');
    }
    const assistant = await openAIRequest(`assistants/${OPENAI_ASSISTANT_ID}`, { method: 'GET' }, requestId);
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
      hasAssistantId: !!OPENAI_ASSISTANT_ID,
      assistantId: OPENAI_ASSISTANT_ID
    }
  }, requestId);
}

// Enhanced tool function handlers for property monetization
async function handleGetPropertyAnalysis(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`🏠 [${requestId}] Getting property analysis:`, args?.analysisId || args?.address);
  
  try {
    let query = supabase.from('user_property_analyses').select('*');
    
    if (args.analysisId) {
      query = query.eq('id', args.analysisId);
    } else if (args.address) {
      query = query.ilike('analysis_results->propertyAddress', `%${args.address}%`);
    }
    
    if (isAuthenticated) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.limit(1).maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      return { success: false, message: 'Property analysis not found' };
    }
    
    return {
      success: true,
      analysis: data.analysis_results,
      address: data.analysis_results?.propertyAddress,
      totalRevenue: data.analysis_results?.totalMonthlyRevenue || 0,
      opportunities: data.analysis_results?.availableAssets?.length || 0
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetServiceProviders(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`🤝 [${requestId}] Getting service providers:`, args?.assetTypes);
  
  try {
    let query = supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    
    if (args.assetTypes && Array.isArray(args.assetTypes)) {
      query = query.overlaps('asset_types', args.assetTypes);
    }
    
    const { data: providers, error } = await query;
    
    if (error) throw error;
    
    const formattedProviders = providers?.map((provider: any) => ({
      id: provider.id,
      name: provider.name,
      description: provider.description,
      assetTypes: provider.asset_types,
      earningsRange: `$${provider.avg_monthly_earnings_low}-${provider.avg_monthly_earnings_high}/month`,
      setupInstructions: provider.setup_instructions,
      referralLink: provider.referral_link_template,
      requiresAuth: !isAuthenticated ? 'Sign in to access partner connections' : null
    })) || [];
    
    return {
      success: true,
      providers: formattedProviders,
      totalProviders: formattedProviders.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetUserPreferences(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`👤 [${requestId}] Getting user preferences:`, userId);
  
  if (!isAuthenticated) {
    return { success: false, message: 'Sign in required to access preferences' };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return {
      success: true,
      preferences: data?.onboarding_data || {},
      selectedOption: data?.selected_option,
      currentStep: data?.current_step,
      completedAssets: data?.completed_assets || []
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleCreateRecommendation(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`💡 [${requestId}] Creating recommendation:`, args?.assetType);
  
  try {
    const recommendation = {
      assetType: args.assetType,
      recommendation: args.recommendation,
      estimatedEarnings: args.estimatedEarnings,
      nextSteps: args.nextSteps || [],
      partnersRecommended: args.partnersRecommended || [],
      timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      recommendation,
      message: `Recommendation created for ${args.assetType}`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleUpdateUserProgress(args: any, userId: string, supabase: any, isAuthenticated: boolean, requestId: string) {
  console.log(`📊 [${requestId}] Updating user progress:`, args?.step);
  
  if (!isAuthenticated) {
    return { success: false, message: 'Sign in required to track progress' };
  }
  
  try {
    const { error } = await supabase
      .from('user_onboarding')
      .upsert({
        user_id: userId,
        current_step: args.step,
        progress_data: {
          ...args.progressData,
          last_updated: new Date().toISOString()
        }
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });
    
    if (error) throw error;
    
    return {
      success: true,
      message: `Progress updated to step: ${args.step}`,
      currentStep: args.step
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
