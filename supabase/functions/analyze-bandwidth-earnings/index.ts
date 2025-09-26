
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let networkData;
  try {
    const requestBody = await req.json();
    networkData = requestBody.networkData;
    const requestType = requestBody.requestType || 'earnings_analysis';

    console.log('🤖 AI Bandwidth Earnings Analysis Request:', { networkData, requestType });

    if (requestType === 'market_intelligence') {
      return await handleMarketIntelligence(networkData?.location);
    }

    const prompt = `
You are an expert in internet bandwidth sharing economics and network analysis. Analyze the following network data and provide precise earnings predictions for bandwidth sharing.

Network Data:
- Download Speed: ${networkData.downloadSpeed} Mbps
- Upload Speed: ${networkData.uploadSpeed} Mbps  
- Ping: ${networkData.ping} ms
- Jitter: ${networkData.jitter} ms
- Location: ${networkData.location || 'Not specified'}
- Historical Performance: ${networkData.testHistory ? `${networkData.testHistory.length} speed tests` : 'No history'}

Consider these factors in your analysis:
1. Network quality and reliability (ping, jitter, speed consistency)
2. Geographic location and local market demand
3. Optimal bandwidth allocation for sharing vs personal use
4. Time-based demand patterns and peak earning opportunities
5. Network stability and uptime requirements
6. Competition and market saturation in the area
7. Seasonal variations and market trends

Provide a detailed analysis in the following JSON format:
{
  "monthlyEarnings": {
    "conservative": [number - lowest realistic estimate],
    "average": [number - most likely estimate], 
    "optimistic": [number - best case scenario]
  },
  "confidenceScore": [0-1 confidence in the prediction],
  "reasoning": "[detailed explanation of the analysis and factors considered]",
  "optimizationTips": [
    "[specific actionable recommendations to improve earnings]"
  ],
  "marketFactors": {
    "locationPremium": [multiplier based on location demand],
    "demandLevel": "low|medium|high",
    "competitionLevel": "low|medium|high"
  },
  "bestSharingSchedule": {
    "peakHours": ["time ranges when sharing is most valuable"],
    "offPeakHours": ["time ranges for baseline sharing"],
    "recommendedUptime": [hours per day for optimal earnings]
  }
}

Base your calculations on realistic market rates (typically $0.015-$0.025 per GB) and consider that users typically share 20-30% of their bandwidth safely.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert network economist specializing in bandwidth sharing markets. Provide precise, data-driven earnings analysis.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('🤖 Raw OpenAI Response:', analysisText);

    // Parse the JSON response from OpenAI
    let analysisResult;
    try {
      // Extract JSON from the response (handle potential markdown formatting)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return fallback analysis
      analysisResult = createFallbackAnalysis(networkData);
    }

    console.log('✅ AI Analysis Result:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-bandwidth-earnings function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        fallback: networkData ? createFallbackAnalysis(networkData) : null
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleMarketIntelligence(location?: string) {
  const prompt = `
Provide current market intelligence for internet bandwidth sharing in ${location || 'general market'}:

Analyze:
1. Current market rates per GB for bandwidth sharing
2. Demand trends and growth patterns  
3. Competition analysis and market saturation
4. Seasonal variations in pricing
5. Economic factors affecting demand

Respond in JSON format:
{
  "marketIntelligence": {
    "averageRates": {
      "low": [lowest current rate per GB],
      "medium": [average current rate per GB], 
      "high": [premium rate per GB]
    },
    "demandTrends": [
      "[current market trends and growth patterns]"
    ],
    "competitorAnalysis": "[analysis of market competition and saturation]"
  }
}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a market research analyst specializing in internet infrastructure and bandwidth markets.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Market intelligence error:', error);
    return new Response(JSON.stringify({
      marketIntelligence: {
        averageRates: { low: 0.015, medium: 0.02, high: 0.025 },
        demandTrends: ['Growing demand for decentralized bandwidth sharing'],
        competitorAnalysis: 'Emerging market with moderate competition'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function createFallbackAnalysis(networkData: any) {
  const shareableBandwidth = (networkData?.downloadSpeed || 50) * 0.25;
  const baseEarnings = shareableBandwidth * 0.02 * 30;
  
  return {
    monthlyEarnings: {
      conservative: Math.round(baseEarnings * 0.7 * 100) / 100,
      average: Math.round(baseEarnings * 100) / 100,
      optimistic: Math.round(baseEarnings * 1.4 * 100) / 100,
    },
    confidenceScore: 0.5,
    reasoning: 'Fallback calculation due to AI analysis unavailability. Based on standard bandwidth sharing rates.',
    optimizationTips: [
      'Ensure stable internet connection for consistent sharing',
      'Monitor peak usage times for optimal sharing windows',
      'Consider router placement for better signal strength'
    ],
    marketFactors: {
      locationPremium: 1.0,
      demandLevel: 'medium',
      competitionLevel: 'medium'
    },
    bestSharingSchedule: {
      peakHours: ['19:00-23:00', '12:00-14:00'],
      offPeakHours: ['02:00-06:00', '09:00-11:00'],
      recommendedUptime: 16
    }
  };
}
