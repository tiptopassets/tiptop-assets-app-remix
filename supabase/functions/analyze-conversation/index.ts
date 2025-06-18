
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const { message, context, analysisType } = await req.json();

    console.log('Analyzing conversation with OpenAI...');

    const prompt = `
You are an AI conversation analyst specializing in property monetization. Analyze this user message and provide intelligent responses.

User Message: "${message}"
Current Context: ${JSON.stringify(context)}
Analysis Type: ${analysisType}

Analyze the message for:
1. Asset mentions (rooftop, parking, pool, internet, storage, garden)
2. User intent and goals
3. Experience level indicators
4. Property type hints

Respond with JSON:
{
  "response": "Your helpful response to the user",
  "detectedAssets": ["array", "of", "detected", "assets"],
  "suggestedActions": ["array", "of", "suggested", "follow-up", "questions"],
  "suggestedStage": "greeting|discovery|recommendation|setup",
  "userProfileUpdates": {
    "experienceLevel": "beginner|intermediate|advanced",
    "primaryGoals": ["goal1", "goal2"],
    "propertyType": "type if detected"
  },
  "confidence": 0.8
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a property monetization conversation analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Conversation analysis completed successfully');
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      // Fallback response
      analysisResult = {
        response: "I understand you're interested in monetizing your property. Could you tell me more about what assets you have available?",
        detectedAssets: [],
        suggestedActions: ['Ask about rooftop space', 'Ask about parking', 'Ask about internet speed'],
        suggestedStage: 'discovery',
        userProfileUpdates: {},
        confidence: 0.5
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-conversation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm having trouble processing your message right now. Could you try rephrasing your question?",
      detectedAssets: [],
      suggestedActions: ['Tell me about your property', 'What are you looking to monetize?'],
      confidence: 0.3
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
