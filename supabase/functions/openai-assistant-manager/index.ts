
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

console.log('🚀 [STARTUP] Environment check:', {
  hasOpenAIKey: !!OPENAI_API_KEY,
  hasSupabaseUrl: !!SUPABASE_URL,
  hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
  hasAssistantId: !!OPENAI_ASSISTANT_ID,
  assistantId: OPENAI_ASSISTANT_ID ? `${OPENAI_ASSISTANT_ID.substring(0, 8)}...` : 'missing'
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔄 [${requestId}] ${req.method} ${req.url}`);

  try {
    // Enhanced environment validation
    const validationResult = validateEnvironment(requestId);
    if (!validationResult.success) {
      console.error(`❌ [${requestId}] Environment validation failed:`, validationResult.error);
      return errorResponse(validationResult.error, 500, requestId);
    }

    // Parse request body with better error handling
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log(`📥 [${requestId}] Raw request body:`, rawBody);
      requestBody = JSON.parse(rawBody);
    } catch (error) {
      console.error(`❌ [${requestId}] JSON parsing failed:`, error.message);
      return errorResponse('Invalid JSON in request body', 400, requestId);
    }

    if (!requestBody?.action) {
      console.error(`❌ [${requestId}] Missing action field`);
      return errorResponse('Missing required field: action', 400, requestId);
    }

    const { action, data } = requestBody;
    console.log(`🎯 [${requestId}] Action: ${action}`, data ? Object.keys(data) : 'no data');

    // Initialize Supabase client
    let supabase;
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    } catch (error) {
      console.error(`❌ [${requestId}] Supabase initialization failed:`, error.message);
      return errorResponse('Database connection failed', 500, requestId);
    }

    // Route to action handlers with timeout
    const actionTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Action timeout after 30 seconds')), 30000)
    );

    let result;
    try {
      switch (action) {
        case 'test_connection':
          result = await Promise.race([testOpenAIConnection(requestId), actionTimeout]);
          break;
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
    return errorResponse(`Internal server error: ${error.message}`, 500, requestId);
  }
});

function validateEnvironment(requestId: string) {
  const issues = [];
  
  if (!OPENAI_API_KEY) {
    issues.push('OPENAI_API_KEY is missing');
  } else if (!OPENAI_API_KEY.startsWith('sk-')) {
    issues.push('OPENAI_API_KEY appears invalid (should start with sk-)');
  }

  if (!OPENAI_ASSISTANT_ID) {
    issues.push('OPENAI_ASSISTANT_ID is missing');
  } else if (!OPENAI_ASSISTANT_ID.startsWith('asst_')) {
    issues.push('OPENAI_ASSISTANT_ID appears invalid (should start with asst_)');
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    issues.push('Supabase configuration missing');
  }

  if (issues.length > 0) {
    console.error(`❌ [${requestId}] Environment issues:`, issues);
    return { 
      success: false, 
      error: `Configuration issues: ${issues.join(', ')}`,
      issues 
    };
  }

  return { success: true };
}

function errorResponse(message: string, status: number, requestId?: string) {
  const errorId = requestId || crypto.randomUUID().substring(0, 8);
  const errorData = {
    error: message,
    success: false,
    requestId: errorId,
    timestamp: new Date().toISOString(),
    status
  };
  
  console.error(`❌ [${errorId}] Error response:`, errorData);
  
  return new Response(JSON.stringify(errorData), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function successResponse(data: any, requestId?: string) {
  const successId = requestId || crypto.randomUUID().substring(0, 8);
  const responseData = {
    success: true,
    requestId: successId,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  console.log(`✅ [${successId}] Success response:`, Object.keys(responseData));
  
  return new Response(JSON.stringify(responseData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function openAIRequest(endpoint: string, options: any, requestId: string) {
  console.log(`🤖 [${requestId}] OpenAI request: ${endpoint}`);
  
  try {
    const url = `https://api.openai.com/v1/${endpoint}`;
    const requestOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    console.log(`🤖 [${requestId}] Request URL: ${url}`);
    console.log(`🤖 [${requestId}] Request method: ${requestOptions.method}`);
    if (requestOptions.body) {
      console.log(`🤖 [${requestId}] Request body:`, requestOptions.body);
    }

    const response = await fetch(url, requestOptions);

    console.log(`🤖 [${requestId}] Response status: ${response.status}`);
    console.log(`🤖 [${requestId}] Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [${requestId}] OpenAI API error response:`, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        console.error(`❌ [${requestId}] Failed to parse error response:`, parseError.message);
        errorData = { error: { message: errorText } };
      }
      
      const errorMessage = errorData.error?.message || `OpenAI API error: ${response.status}`;
      console.error(`❌ [${requestId}] OpenAI error:`, errorMessage);
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ [${requestId}] OpenAI request successful`);
    return data;
  } catch (error) {
    console.error(`❌ [${requestId}] OpenAI request failed:`, {
      endpoint,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// NEW: Test basic OpenAI connection
async function testOpenAIConnection(requestId: string) {
  console.log(`🔧 [${requestId}] Testing basic OpenAI connection...`);
  
  try {
    // Test with a simple models endpoint call
    const models = await openAIRequest('models', { method: 'GET' }, requestId);
    console.log(`✅ [${requestId}] OpenAI connection successful, found ${models.data?.length || 0} models`);
    
    return successResponse({
      connection: 'success',
      message: 'OpenAI API connection working',
      modelsAvailable: models.data?.length || 0
    }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] OpenAI connection failed:`, error.message);
    return errorResponse(`OpenAI connection failed: ${error.message}`, 500, requestId);
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
    console.log(`🔧 [${requestId}] Testing OpenAI connection...`);
    await openAIRequest('models', { method: 'GET' }, requestId);
    results.tests.openai = true;
    console.log(`✅ [${requestId}] OpenAI connection: OK`);
  } catch (error) {
    results.errors.push(`OpenAI: ${error.message}`);
    console.error(`❌ [${requestId}] OpenAI connection: FAILED`);
  }

  // Test assistant
  try {
    console.log(`🔧 [${requestId}] Testing assistant...`);
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
    console.log(`🔧 [${requestId}] Testing database...`);
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
    throw new Error('OpenAI Assistant ID not configured');
  }
  
  try {
    const assistant = await openAIRequest(`assistants/${OPENAI_ASSISTANT_ID}`, {
      method: 'GET'
    }, requestId);
    
    console.log(`✅ [${requestId}] Assistant verified:`, {
      id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      hasInstructions: !!assistant.instructions
    });
    
    return successResponse({ 
      assistant: { 
        id: assistant.id, 
        name: assistant.name,
        model: assistant.model
      } 
    }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Assistant verification failed:`, error.message);
    
    if (error.message.includes('404') || error.message.includes('not found')) {
      throw new Error(`Assistant with ID ${OPENAI_ASSISTANT_ID} not found. Please check the assistant ID.`);
    }
    
    throw new Error(`Assistant verification failed: ${error.message}`);
  }
}

// Fixed: Create Thread using OpenAI SDK instead of manual requests
async function createThread(data: any, supabase: any, requestId: string) {
  console.log(`🧵 [${requestId}] Creating thread (OpenAI Step 1)...`);
  
  try {
    const metadata = data?.metadata || {};
    console.log(`📋 [${requestId}] Thread metadata:`, metadata);

    // Clean metadata (remove undefined/null values)
    const cleanMetadata: Record<string, string> = {};
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanMetadata[key] = String(value);
      }
    });

    console.log(`📋 [${requestId}] Clean metadata:`, cleanMetadata);

    // Use OpenAI SDK for thread creation
    const OpenAI = (await import('https://deno.land/x/openai@v4.24.0/mod.ts')).default;
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });

    // Create thread using OpenAI SDK - no assistant_id here
    const threadPayload = Object.keys(cleanMetadata).length > 0 ? { metadata: cleanMetadata } : {};
    console.log(`🚀 [${requestId}] Creating thread with payload:`, threadPayload);

    const thread = await openai.beta.threads.create(threadPayload);

    console.log(`✅ [${requestId}] Thread created successfully:`, {
      id: thread.id,
      object: thread.object,
      created_at: thread.created_at,
      metadata: thread.metadata
    });

    // Optional: Save to database for authenticated users
    const userId = metadata.userId;
    if (userId && userId !== 'anonymous') {
      try {
        console.log(`💾 [${requestId}] Saving onboarding record for user: ${userId}`);
        
        const { error } = await supabase
          .from('user_onboarding')
          .upsert({
            id: thread.id,
            user_id: userId,
            selected_option: 'concierge',
            status: 'in_progress',
            current_step: 1,
            total_steps: 5,
            progress_data: {
              assistant_thread_id: thread.id,
              assistant_id: OPENAI_ASSISTANT_ID,
              created_via: 'openai_assistant',
              metadata: cleanMetadata,
              created_at: new Date().toISOString()
            }
          }, { onConflict: 'id' });

        if (error) {
          console.warn(`⚠️ [${requestId}] Onboarding save failed:`, error.message);
        } else {
          console.log(`✅ [${requestId}] Onboarding record saved`);
        }
      } catch (dbError) {
        console.warn(`⚠️ [${requestId}] Database error:`, dbError.message);
      }
    }

    return successResponse({ thread }, requestId);
    
  } catch (error) {
    console.error(`❌ [${requestId}] Thread creation failed:`, {
      error: error.message,
      stack: error.stack
    });
    
    throw new Error(`Thread creation failed: ${error.message}`);
  }
}

// STEP 2: Add Message to Thread (OpenAI official workflow)
async function sendMessage(data: any, supabase: any, requestId: string) {
  const { threadId, message, userId, userContext } = data;

  console.log(`💬 [${requestId}] STEP 2: Adding message to thread: ${threadId}`);

  if (!threadId || !message?.trim()) {
    throw new Error('threadId and message are required');
  }

  try {
    // Enhance message with context if available
    let contextualMessage = message;
    if (userContext?.propertyData) {
      const contextInfo = `\n\n[Context: Property at ${userContext.propertyData.address}, Revenue: $${userContext.propertyData.totalMonthlyRevenue}/month]`;
      contextualMessage += contextInfo;
      console.log(`💬 [${requestId}] Added context to message`);
    }

    // STEP 2: Add message to thread
    const messageData = await openAIRequest(`threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content: contextualMessage
      })
    }, requestId);

    console.log(`✅ [${requestId}] Message added successfully:`, {
      id: messageData.id,
      role: messageData.role,
      content_length: messageData.content[0]?.text?.value?.length || 0
    });

    // Save to database for authenticated users
    if (userId && userId !== 'anonymous') {
      try {
        await supabase.rpc('insert_onboarding_message', {
          p_onboarding_id: threadId,
          p_role: 'user',
          p_content: message,
          p_metadata: { 
            messageId: messageData.id,
            timestamp: new Date().toISOString(),
            userId: userId
          }
        });
        console.log(`✅ [${requestId}] Message saved to database`);
      } catch (dbError) {
        console.warn(`⚠️ [${requestId}] Database save failed:`, dbError.message);
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
  const actualAssistantId = assistantId || OPENAI_ASSISTANT_ID;

  console.log(`🏃 [${requestId}] STEP 3: Creating run with assistant: ${actualAssistantId}`);

  if (!threadId) {
    throw new Error('threadId is required');
  }

  if (!actualAssistantId) {
    throw new Error('Assistant ID not configured');
  }

  try {
    // STEP 3: Create run with assistant_id
    const run = await openAIRequest(`threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: actualAssistantId
      })
    }, requestId);

    console.log(`✅ [${requestId}] Run created successfully:`, {
      id: run.id,
      status: run.status,
      assistant_id: run.assistant_id,
      thread_id: run.thread_id
    });
    
    return successResponse({ run }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Run creation failed:`, error.message);
    throw new Error(`Run creation failed: ${error.message}`);
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

    console.log(`📊 [${requestId}] Run status:`, {
      id: run.id,
      status: run.status,
      completed_at: run.completed_at,
      failed_at: run.failed_at,
      requires_action: !!run.required_action
    });

    let messages = null;
    if (run.status === 'completed') {
      console.log(`📚 [${requestId}] Fetching messages for completed run`);
      try {
        const messagesData = await openAIRequest(`threads/${threadId}/messages`, {
          method: 'GET'
        }, requestId);
        messages = messagesData.data;
        console.log(`📚 [${requestId}] Retrieved ${messages?.length || 0} messages`);
      } catch (messageError) {
        console.warn(`⚠️ [${requestId}] Failed to fetch messages:`, messageError.message);
      }
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
    const processedOutputs = await Promise.all(
      toolOutputs.map(async (output: any) => {
        const { tool_call_id, function_name, arguments: functionArgs } = output;
        
        console.log(`🛠️ [${requestId}] Processing function: ${function_name}`);
        
        try {
          let result;
          
          switch (function_name) {
            case 'get_property_analysis':
              result = await handleGetPropertyAnalysis(functionArgs, userId, supabase, requestId);
              break;
            case 'get_service_providers':
              result = await handleGetServiceProviders(functionArgs, userId, supabase, requestId);
              break;
            case 'get_user_preferences':
              result = await handleGetUserPreferences(functionArgs, userId, supabase, requestId);
              break;
            case 'create_recommendation':
              result = await handleCreateRecommendation(functionArgs, userId, supabase, requestId);
              break;
            case 'update_user_progress':
              result = await handleUpdateUserProgress(functionArgs, userId, supabase, requestId);
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

    console.log(`✅ [${requestId}] Tool outputs submitted successfully`);
    return successResponse({ run }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] Submit tool outputs failed:`, error.message);
    throw new Error(`Submit tool outputs failed: ${error.message}`);
  }
}

// Tool function handlers
async function handleGetPropertyAnalysis(args: any, userId: string, supabase: any, requestId: string) {
  console.log(`🏠 [${requestId}] Getting property analysis for:`, args);
  
  try {
    let query = supabase.from('user_property_analyses').select('*');
    
    if (args.analysisId) {
      query = query.eq('id', args.analysisId);
    } else if (args.address) {
      query = query.ilike('analysis_results->propertyAddress', `%${args.address}%`);
    }
    
    if (userId && userId !== 'anonymous') {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.limit(1).maybeSingle();
    
    if (error) {
      console.error(`❌ [${requestId}] Property analysis query failed:`, error);
      throw error;
    }
    
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
    console.error(`❌ [${requestId}] Property analysis failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function handleGetServiceProviders(args: any, userId: string, supabase: any, requestId: string) {
  console.log(`🤝 [${requestId}] Getting service providers for:`, args);
  
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
    
    if (error) {
      console.error(`❌ [${requestId}] Provider query failed:`, error);
      throw error;
    }
    
    const formattedProviders = providers?.map((provider: any) => ({
      id: provider.id,
      name: provider.name,
      description: provider.description,
      assetTypes: provider.asset_types,
      earningsRange: `$${provider.avg_monthly_earnings_low}-${provider.avg_monthly_earnings_high}/month`,
      setupRequirements: provider.setup_requirements || {},
      referralLink: provider.referral_link_template,
      priority: provider.priority
    })) || [];
    
    console.log(`✅ [${requestId}] Found ${formattedProviders.length} providers`);
    
    return {
      success: true,
      providers: formattedProviders,
      totalProviders: formattedProviders.length
    };
  } catch (error) {
    console.error(`❌ [${requestId}] Service provider lookup failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function handleGetUserPreferences(args: any, userId: string, supabase: any, requestId: string) {
  console.log(`👤 [${requestId}] Getting user preferences for:`, userId);
  
  if (!userId || userId === 'anonymous') {
    return { success: false, message: 'Authentication required' };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error(`❌ [${requestId}] User preferences query failed:`, error);
      throw error;
    }
    
    return {
      success: true,
      preferences: data?.onboarding_data || {},
      selectedOption: data?.selected_option,
      currentStep: data?.current_step,
      completedAssets: data?.completed_assets || []
    };
  } catch (error) {
    console.error(`❌ [${requestId}] User preferences failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function handleCreateRecommendation(args: any, userId: string, supabase: any, requestId: string) {
  console.log(`💡 [${requestId}] Creating recommendation:`, args);
  
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
}

async function handleUpdateUserProgress(args: any, userId: string, supabase: any, requestId: string) {
  console.log(`📊 [${requestId}] Updating user progress:`, args);
  
  if (!userId || userId === 'anonymous') {
    return { success: false, message: 'Authentication required' };
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
      }, { onConflict: 'user_id' });
    
    if (error) {
      console.error(`❌ [${requestId}] User progress update failed:`, error);
      throw error;
    }
    
    return {
      success: true,
      message: `Progress updated to step: ${args.step}`,
      currentStep: args.step
    };
  } catch (error) {
    console.error(`❌ [${requestId}] User progress update failed:`, error.message);
    return { success: false, error: error.message };
  }
}
