
import { ImageAnalysis } from './types.ts';

const GPT_API_KEY = Deno.env.get('GPT') || '';

/**
 * Analyzes a property image using OpenAI's vision capabilities
 */
export async function analyzeImage(imageUrl: string, address: string): Promise<ImageAnalysis> {
  if (!GPT_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }
  
  console.log('Analyzing satellite image with GPT vision...');
  
  try {
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using GPT-4o with vision capabilities
        messages: [
          { 
            role: 'system', 
            content: `You are a property analysis expert specializing in satellite imagery analysis for monetization opportunities. 
            Analyze satellite images with precision and extract key measurements and features that could be monetized.
            Pay special attention to:
            1. Roof size and type (flat, pitched, etc.) with accurate square footage
            2. Solar panel potential based on roof orientation and shading
            3. Swimming pool dimensions, condition, and type (in-ground or above-ground)
            4. Garden/yard areas suitable for urban farming or rental
            5. Parking spaces count and dimensions
            6. Storage potential areas
            7. Accessibility features for monetization
            
            Provide all measurements in square feet with high precision. For each feature, estimate the monetization potential in dollars per month.`
          },
          { 
            role: 'user', 
            content: [
              { 
                type: 'text', 
                text: `Analyze this satellite image of a property located at ${address}. Extract and measure with high precision:
                
                1) Roof size in square feet and roof type (flat, pitched, etc.)
                2) Solar potential based on roof orientation and shadow patterns
                3) Available parking spaces and their dimensions
                4) Garden/yard area in square feet and its suitability for urban farming
                5) Swimming pool dimensions and type if present
                6) Any other monetizable features you can identify
                
                For each feature, estimate the monthly revenue potential based on industry standards.
                Organize your response in a structured format that's easy to parse.` 
              },
              { 
                type: 'image_url', 
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1500
      })
    });
    
    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      console.error('OpenAI Vision API error:', errorData);
      throw new Error('OpenAI Vision API error');
    }
    
    const visionData = await visionResponse.json();
    if (!visionData.choices || visionData.choices.length === 0) {
      throw new Error('No vision analysis results');
    }
    
    const visionContent = visionData.choices[0].message.content;
    console.log('Vision analysis:', visionContent);
    
    return extractVisionAnalysis(visionContent);
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    throw error;
  }
}

/**
 * Extracts structured data from the vision analysis text
 */
function extractVisionAnalysis(visionContent: string): ImageAnalysis {
  try {
    // Extract roof size estimate from text using regex
    const roofSizeMatch = visionContent.match(/roof\s*(?:size|area)?\s*[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i);
    const roofSize = roofSizeMatch ? parseFloat(roofSizeMatch[1].replace(/,/g, '')) : null;
    
    // Extract roof type
    const roofTypeMatch = visionContent.match(/roof\s*(?:type|style|is)?[^a-zA-Z]*(flat|pitched|gabled|hip|shed|mansard|gambrel|butterfly|dome|pyramid|skillion)/i);
    const roofType = roofTypeMatch ? roofTypeMatch[1].toLowerCase() : null;
    
    // Extract solar potential
    const solarPotentialMatch = visionContent.match(/solar\s*(?:potential|capacity|suitability)[^a-zA-Z]*(excellent|good|moderate|poor|high|medium|low)/i);
    const solarPotential = solarPotentialMatch ? solarPotentialMatch[1].toLowerCase() : null;
    
    // Extract parking spaces estimate
    const parkingMatch = visionContent.match(/(?:parking|park|car)\s*(?:spaces?|spots?)?[^0-9]*([0-9]+)/i);
    const parkingSpaces = parkingMatch ? parseInt(parkingMatch[1]) : null;
    
    // Extract garden/yard area
    const gardenMatch = visionContent.match(/(?:garden|yard|outdoor)[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i);
    const gardenArea = gardenMatch ? parseFloat(gardenMatch[1].replace(/,/g, '')) : null;
    
    // Extract garden potential
    const gardenPotentialMatch = visionContent.match(/garden\s*(?:potential|suitability)[^a-zA-Z]*(excellent|good|moderate|poor|high|medium|low)/i);
    const gardenPotential = gardenPotentialMatch ? gardenPotentialMatch[1].toLowerCase() : null;
    
    // Extract pool information
    const poolPresentMatch = visionContent.match(/(?:swimming|pool)[^a-zA-Z]*(present|visible|identified|detected|exists|yes)/i);
    const poolPresent = !!poolPresentMatch;
    
    // Extract pool size if present
    const poolSizeMatch = poolPresent ? visionContent.match(/pool\s*(?:size|area|dimensions)?[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i) : null;
    const poolSize = poolSizeMatch ? parseFloat(poolSizeMatch[1].replace(/,/g, '')) : null;
    
    // Extract pool type
    const poolTypeMatch = poolPresent ? visionContent.match(/pool\s*(?:type|is)[^a-zA-Z]*(in-ground|inground|above-ground|aboveground)/i) : null;
    const poolType = poolTypeMatch ? poolTypeMatch[1].toLowerCase() : null;
    
    return {
      roofSize,
      roofType,
      solarPotential,
      parkingSpaces,
      gardenArea,
      gardenPotential,
      poolPresent,
      poolSize,
      poolType,
      fullAnalysis: visionContent
    };
  } catch (e) {
    console.error('Error parsing vision analysis:', e);
    return { fullAnalysis: visionContent };
  }
}
