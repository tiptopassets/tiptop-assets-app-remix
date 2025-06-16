
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface ConversationContext {
  detectedAssets: string[];
  userPreferences: Record<string, any>;
  conversationStage: 'greeting' | 'discovery' | 'recommendation' | 'setup' | 'completion';
  userProfile: {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    primaryGoals: string[];
    propertyType: string;
  };
}

interface AnalysisRequest {
  message: string;
  context: ConversationContext;
  analysisType: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, context, analysisType }: AnalysisRequest = await req.json();

    console.log("Analyzing conversation:", { message, analysisType });

    // Analyze the user message for asset detection
    const detectedAssets = analyzeForAssets(message);
    const conversationStage = determineConversationStage(message, context);
    const userProfileUpdates = extractUserProfileInfo(message);
    const response = generateResponse(message, context, detectedAssets);

    const result = {
      response,
      detectedAssets,
      suggestedActions: generateSuggestedActions(conversationStage, detectedAssets),
      confidence: calculateConfidence(message, detectedAssets),
      suggestedStage: conversationStage,
      userProfileUpdates
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: corsHeaders,
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in analyze-conversation function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unknown error occurred",
        response: "I understand you're interested in monetizing your property. Could you tell me more about what assets you have available?",
        detectedAssets: [],
        suggestedActions: ['Ask about rooftop space', 'Ask about parking', 'Ask about internet speed'],
        confidence: 0.5
      }),
      {
        headers: corsHeaders,
        status: 500,
      }
    );
  }
});

function analyzeForAssets(message: string): string[] {
  const assetKeywords = {
    'rooftop': ['roof', 'rooftop', 'solar', 'panels', 'top of house', 'flat roof'],
    'parking': ['parking', 'driveway', 'garage', 'car space', 'vehicle', 'park'],
    'internet': ['internet', 'wifi', 'broadband', 'connection', 'bandwidth', 'speed'],
    'pool': ['pool', 'swimming', 'spa', 'hot tub', 'jacuzzi'],
    'storage': ['storage', 'basement', 'attic', 'shed', 'warehouse', 'space'],
    'garden': ['garden', 'yard', 'outdoor space', 'backyard', 'lawn', 'landscape'],
    'ev_charging': ['electric vehicle', 'ev', 'tesla', 'charging', 'electric car']
  };

  const detectedAssets: string[] = [];
  const lowerMessage = message.toLowerCase();

  for (const [asset, keywords] of Object.entries(assetKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedAssets.push(asset);
    }
  }

  return detectedAssets;
}

function determineConversationStage(message: string, context: ConversationContext): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for greeting patterns
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('start')) {
    return 'greeting';
  }
  
  // Check for property description patterns
  if (lowerMessage.includes('have') || lowerMessage.includes('own') || lowerMessage.includes('property')) {
    return 'discovery';
  }
  
  // Check for interest in recommendations
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('best')) {
    return 'recommendation';
  }
  
  // Check for setup intentions
  if (lowerMessage.includes('setup') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
    return 'setup';
  }
  
  // Default to current stage or discovery
  return context.conversationStage === 'greeting' ? 'discovery' : context.conversationStage;
}

function extractUserProfileInfo(message: string): Record<string, any> {
  const updates: Record<string, any> = {};
  const lowerMessage = message.toLowerCase();
  
  // Detect experience level
  if (lowerMessage.includes('new') || lowerMessage.includes('beginner') || lowerMessage.includes('first time')) {
    updates.experienceLevel = 'beginner';
  } else if (lowerMessage.includes('experienced') || lowerMessage.includes('advanced')) {
    updates.experienceLevel = 'advanced';
  }
  
  // Detect property type
  if (lowerMessage.includes('house') || lowerMessage.includes('home')) {
    updates.propertyType = 'house';
  } else if (lowerMessage.includes('apartment') || lowerMessage.includes('condo')) {
    updates.propertyType = 'apartment';
  } else if (lowerMessage.includes('commercial') || lowerMessage.includes('office')) {
    updates.propertyType = 'commercial';
  }
  
  return updates;
}

function generateResponse(message: string, context: ConversationContext, detectedAssets: string[]): string {
  const lowerMessage = message.toLowerCase();
  
  // Generate contextual responses based on detected assets
  if (detectedAssets.length > 0) {
    const assetNames = detectedAssets.map(asset => asset.replace('_', ' ')).join(', ');
    return `Great! I can see you have ${assetNames} that could be monetized. Let me analyze the potential opportunities for each of these assets. What's most important to you - maximizing income, minimal setup effort, or passive income generation?`;
  }
  
  // Handle different conversation stages
  if (context.conversationStage === 'greeting') {
    return "Hi! I'm here to help you discover income opportunities from your property. To get started, could you tell me about your property type and any specific features you'd like to monetize?";
  }
  
  if (lowerMessage.includes('income') || lowerMessage.includes('money') || lowerMessage.includes('earn')) {
    return "I understand you want to generate income from your property! To provide the best recommendations, could you describe your property and any specific assets like rooftop space, parking, high-speed internet, or outdoor areas?";
  }
  
  // Default helpful response
  return "I'd love to help you explore monetization opportunities for your property. Could you share more details about your property type and any specific features you have available?";
}

function generateSuggestedActions(stage: string, detectedAssets: string[]): string[] {
  const actionMap: Record<string, string[]> = {
    greeting: [
      "I have a house with a rooftop",
      "I own an apartment with parking",
      "I have high-speed internet to share"
    ],
    discovery: [
      "Tell me about solar potential",
      "How can I monetize my parking space?",
      "What are my internet sharing options?"
    ],
    recommendation: [
      "What's the highest earning opportunity?",
      "Which option has the lowest setup cost?",
      "Show me passive income options"
    ],
    setup: [
      "Help me get started with setup",
      "Connect me with service providers",
      "What documents do I need?"
    ]
  };
  
  // Return stage-specific actions or discovery actions as default
  return actionMap[stage] || actionMap.discovery;
}

function calculateConfidence(message: string, detectedAssets: string[]): number {
  let confidence = 0.6; // Base confidence
  
  // Increase confidence based on detected assets
  confidence += detectedAssets.length * 0.1;
  
  // Increase confidence for specific property mentions
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('sqft') || lowerMessage.includes('square feet')) {
    confidence += 0.1;
  }
  
  if (lowerMessage.includes('location') || lowerMessage.includes('address')) {
    confidence += 0.1;
  }
  
  // Cap confidence at 0.95
  return Math.min(confidence, 0.95);
}
