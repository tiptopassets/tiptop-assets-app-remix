import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_ASSISTANT_ID = Deno.env.get('OPENAI_ASSISTANT_ID');

console.log('🚀 [STARTUP] Environment check:', {
  hasOpenAIKey: !!OPENAI_API_KEY,
  hasSupabaseUrl: !!SUPABASE_URL,
  hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
  hasAssistantId: !!OPENAI_ASSISTANT_ID
});

interface ValidationResult {
  success: boolean;
  error?: string;
}

function validateEnvironment(): ValidationResult {
  if (!OPENAI_API_KEY) return { success: false, error: 'OPENAI_API_KEY not configured' };
  if (!SUPABASE_URL) return { success: false, error: 'SUPABASE_URL not configured' };
  if (!SUPABASE_SERVICE_ROLE_KEY) return { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' };
  if (!OPENAI_ASSISTANT_ID) return { success: false, error: 'OPENAI_ASSISTANT_ID not configured' };
  return { success: true };
}

function errorResponse(message: string, status: number, requestId: string): Response {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    requestId
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

serve(async (req): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔄 [${requestId}] ${req.method} ${req.url}`);

  try {
    // Environment validation
    const validationResult = validateEnvironment();
    if (!validationResult.success) {
      console.error(`❌ [${requestId}] Environment validation failed:`, validationResult.error);
      return errorResponse(validationResult.error || 'Environment validation failed', 500, requestId);
    }

    // Parse request body
    let requestBody: any;
    try {
      const rawBody = await req.text();
      requestBody = JSON.parse(rawBody);
    } catch (error) {
      console.error(`❌ [${requestId}] JSON parsing failed:`, error instanceof Error ? error.message : 'Unknown error');
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
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase configuration');
      }
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    } catch (error) {
      console.error(`❌ [${requestId}] Supabase initialization failed:`, error instanceof Error ? error.message : 'Unknown error');
      return errorResponse('Database connection failed', 500, requestId);
    }

    // Handle different actions
    switch (action) {
      case 'health_check':
        return await handleHealthCheck(requestId);
      
      case 'test_openai':
        return await testOpenAIConnection(requestId);
      
      case 'get_assistant_info':
        return await getAssistantInfo(requestId);
      
      default:
        return errorResponse(`Unknown action: ${action}`, 400, requestId);
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Unexpected error:`, error instanceof Error ? error.message : 'Unknown error');
    return errorResponse('Internal server error', 500, requestId);
  }
});

async function handleHealthCheck(requestId: string): Promise<Response> {
  console.log(`🏥 [${requestId}] Health check`);
  
  const results = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      hasOpenAIKey: !!OPENAI_API_KEY,
      hasAssistantId: !!OPENAI_ASSISTANT_ID,
      hasSupabase: !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    },
    requestId
  };

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function testOpenAIConnection(requestId: string): Promise<Response> {
  console.log(`🧠 [${requestId}] Testing OpenAI connection`);
  
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown OpenAI error' }));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      connection: 'healthy',
      modelsAvailable: data.data?.length || 0,
      requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`❌ [${requestId}] OpenAI connection test failed:`, error instanceof Error ? error.message : 'Unknown error');
    return errorResponse(
      `OpenAI connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      500, 
      requestId
    );
  }
}

async function getAssistantInfo(requestId: string): Promise<Response> {
  console.log(`🤖 [${requestId}] Getting assistant info`);
  
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    if (!OPENAI_ASSISTANT_ID) {
      throw new Error('OpenAI Assistant ID not configured');
    }

    const response = await fetch(`https://api.openai.com/v1/assistants/${OPENAI_ASSISTANT_ID}`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Assistant API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const assistantData = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      assistant: {
        id: assistantData.id,
        name: assistantData.name,
        model: assistantData.model,
        instructions: assistantData.instructions?.substring(0, 100) + '...',
        toolsCount: assistantData.tools?.length || 0
      },
      requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Assistant info failed:`, error instanceof Error ? error.message : 'Unknown error');
    return errorResponse(
      `Failed to get assistant info: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      500, 
      requestId
    );
  }
}