
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

    console.log('Starting intelligent conversation analysis...');

    const prompt = `
You are an expert conversation intelligence system specializing in property monetization and user intent analysis.

ANALYSIS FRAMEWORK:

1. INTENT RECOGNITION (Advanced NLP)
   - Primary Intent: Information Seeking | Action Planning | Problem Solving | Comparison Shopping
   - Secondary Intent: Budget Concerns | Time Constraints | Technical Questions | Partnership Interest
   - Urgency Level: Immediate | Near-term | Long-term | Exploratory
   - Decision Stage: Awareness | Consideration | Evaluation | Ready to Act

2. ASSET DETECTION (Pattern Recognition)
   - Explicit Mentions: Direct asset references (pool, garage, roof, etc.)
   - Implicit Indicators: Contextual clues suggesting asset availability
   - Property Characteristics: Size, type, location indicators
   - Monetization Readiness: Current setup, barriers, opportunities

3. USER PROFILING (Behavioral Analysis)
   - Experience Level: First-time | Some experience | Advanced investor
   - Risk Tolerance: Conservative | Moderate | Aggressive
   - Investment Capacity: Budget indicators, time availability
   - Technical Comfort: DIY capable | Needs guidance | Full-service preferred

4. CONVERSATION INTELLIGENCE (Contextual Awareness)
   - Topic Progression: Track conversation evolution
   - Knowledge Gaps: Identify areas needing education
   - Objection Handling: Address concerns proactively
   - Next Best Action: Optimal conversation flow

USER MESSAGE: "${message}"
CONVERSATION CONTEXT: ${JSON.stringify(context)}
ANALYSIS TYPE: ${analysisType}

RESPONSE REQUIREMENTS:
Generate intelligent, contextually-aware responses that:
1. Address user intent directly and specifically
2. Provide actionable insights and recommendations
3. Guide conversation toward valuable outcomes
4. Demonstrate understanding of user's situation
5. Offer next steps that match user's readiness level

JSON RESPONSE FORMAT:
{
  "response": "Intelligent, contextually-aware response addressing user's specific needs",
  "intentAnalysis": {
    "primaryIntent": "information_seeking|action_planning|problem_solving|comparison_shopping",
    "secondaryIntent": "budget_concerns|time_constraints|technical_questions|partnership_interest",
    "urgencyLevel": "immediate|near_term|long_term|exploratory",
    "decisionStage": "awareness|consideration|evaluation|ready_to_act"
  },
  "detectedAssets": [
    {
      "assetType": "rooftop|parking|pool|internet|storage|garden",
      "confidence": 0.1-1.0,
      "indicators": ["specific mentions or clues"],
      "monetizationPotential": "high|medium|low"
    }
  ],
  "userProfile": {
    "experienceLevel": "first_time|some_experience|advanced_investor",
    "riskTolerance": "conservative|moderate|aggressive",
    "technicalComfort": "diy_capable|needs_guidance|full_service_preferred",
    "investmentCapacity": "limited|moderate|high"
  },
  "suggestedActions": [
    {
      "action": "Specific recommended action",
      "priority": 1-5,
      "reasoning": "Why this action is recommended",
      "nextSteps": ["Detailed steps to take"]
    }
  ],
  "conversationFlow": {
    "suggestedStage": "greeting|discovery|education|recommendation|action_planning",
    "topicProgression": ["Previous topics", "Current focus", "Suggested next topics"],
    "knowledgeGaps": ["Areas where user needs more information"],
    "readinessIndicators": ["Signs user is ready for next step"]
  },
  "personalizedRecommendations": [
    {
      "recommendation": "Specific, actionable recommendation",
      "reasoning": "Why this fits the user's situation",
      "expectedOutcome": "What user can expect",
      "timeframe": "When they can expect results"
    }
  ],
  "riskFactors": ["Potential concerns or obstacles to address"],
  "opportunityScore": 0.1-1.0,
  "confidence": 0.1-1.0
}

CONVERSATION INTELLIGENCE RULES:
1. Always maintain context from previous interactions
2. Provide specific, actionable insights rather than generic advice
3. Adapt communication style to user's experience level
4. Proactively address likely concerns or objections
5. Guide conversation toward valuable outcomes
6. Demonstrate deep understanding of property monetization
7. Offer realistic timelines and expectations
8. Include relevant market insights when appropriate
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
          { role: 'system', content: 'You are an expert conversation intelligence system for property monetization. Provide intelligent, contextually-aware analysis and responses. Always return valid JSON that matches the required schema exactly.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Intelligent conversation analysis completed successfully');
    
    let analysisResult;
    try {
      const responseContent = data.choices[0].message.content;
      
      // Extract JSON from response  
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in conversation analysis response');
      }
    } catch (parseError) {
      console.error('Failed to parse conversation analysis JSON:', parseError);
      // Enhanced fallback response
      analysisResult = {
        response: "I understand you're exploring ways to monetize your property. Based on your question, I'd love to help you identify the most profitable opportunities for your specific situation. Could you tell me more about your property - do you have parking spaces, a pool, or rooftop space that might be suitable for solar panels?",
        intentAnalysis: {
          primaryIntent: "information_seeking",
          secondaryIntent: "partnership_interest", 
          urgencyLevel: "exploratory",
          decisionStage: "awareness"
        },
        detectedAssets: [],
        userProfile: {
          experienceLevel: "first_time",
          riskTolerance: "moderate",
          technicalComfort: "needs_guidance",
          investmentCapacity: "moderate"
        },
        suggestedActions: [
          {
            action: "Conduct property assessment",
            priority: 1,
            reasoning: "Need to understand available assets before recommendations",
            nextSteps: ["Share property details", "Identify available assets", "Discuss monetization goals"]
          }
        ],
        conversationFlow: {
          suggestedStage: "discovery",
          topicProgression: ["Initial inquiry", "Asset identification", "Opportunity evaluation"],
          knowledgeGaps: ["Property characteristics", "Available assets", "Monetization preferences"],
          readinessIndicators: ["Asking specific questions", "Showing interest in next steps"]
        },
        personalizedRecommendations: [
          {
            recommendation: "Start with a comprehensive property analysis",
            reasoning: "Understanding your property's unique characteristics is essential for accurate revenue projections",
            expectedOutcome: "Clear picture of monetization opportunities and potential earnings",
            timeframe: "Results available within minutes"
          }
        ],
        riskFactors: ["Unclear property characteristics", "Unknown local regulations", "Uncertain user goals"],
        opportunityScore: 0.7,
        confidence: 0.6
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in intelligent conversation analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm having trouble processing your message right now, but I'm here to help you explore property monetization opportunities. Could you tell me more about what you're looking to achieve with your property?",
      intentAnalysis: {
        primaryIntent: "information_seeking",
        secondaryIntent: "technical_questions",
        urgencyLevel: "exploratory", 
        decisionStage: "awareness"
      },
      detectedAssets: [],
      suggestedActions: [
        {
          action: "Rephrase question",
          priority: 1,
          reasoning: "Technical issue prevented full analysis",
          nextSteps: ["Try rephrasing your question", "Share specific property details"]
        }
      ],
      confidence: 0.3
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
