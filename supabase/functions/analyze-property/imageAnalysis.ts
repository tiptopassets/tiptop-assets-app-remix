
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
            
            IMPORTANT INSTRUCTIONS FOR MEASUREMENTS:
            1. Provide all measurements in square feet with high precision
            2. For each measurement, include a confidence score (0-100%)
            3. Use visible reference points to calibrate your measurements
            4. Include explicit calculations - explain how you arrived at each measurement
            5. If a measurement is uncertain, provide a reasonable range (min-max)
            6. Be extremely realistic - do not exaggerate dimensions
            
            KEY FEATURES TO ANALYZE AND MEASURE:
            1. Roof analysis:
               - Total roof area in square feet (measured precisely)
               - Roof type (flat, pitched, etc.)
               - Unshaded roof area suitable for solar panels
               - Roof orientation (N/S/E/W facing sections)
               - Solar potential score (0-100%)
            
            2. Parking spaces:
               - Exact count of visible parking spaces
               - Dimensions of each parking space
               - Total parking area in square feet
               - Whether spaces appear to be in-demand (urban/suburban context)
               - EV charging potential (proximity to building electrical)
            
            3. Garden/yard:
               - Total garden/yard area in square feet
               - Usable flat area for urban farming
               - Existing landscaping features
               - Sun exposure assessment (full sun, partial, shade)
               - Urban farming potential score (0-100%)
            
            4. Swimming pool (if present):
               - Pool dimensions (length, width, estimated depth)
               - Total pool area in square feet
               - Pool type (in-ground or above-ground)
               - Pool condition assessment
               - Surrounding deck/patio area
            
            5. Other monetizable features:
               - Accessory dwelling units or potential for them
               - Storage areas (garages, sheds, etc.)
               - Special features (water features, outdoor entertainment areas)
            
            For each feature, provide measurement methodology, confidence score, and assumptions made during analysis.`
          },
          { 
            role: 'user', 
            content: [
              { 
                type: 'text', 
                text: `Analyze this satellite image of a property located at ${address}. Focus on extracting accurate measurements with high confidence:

                1) Measure the total roof size in square feet and assess solar potential based on orientation and shading
                2) Count and measure all visible parking spaces, reporting exact dimensions
                3) Measure the garden/yard area in square feet and assess urban farming potential  
                4) Identify and measure any swimming pool or other monetizable features
                5) For ALL measurements, provide your calculation methodology and a confidence score
                
                Report your findings in a structured format with separate sections for each feature. Be extremely precise with measurements - don't inflate or estimate without clearly stating assumptions.` 
              },
              { 
                type: 'image_url', 
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 2000
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
 * Extracts structured data from the vision analysis text with confidence scores
 */
function extractVisionAnalysis(visionContent: string): ImageAnalysis {
  try {
    // Extract roof size estimate from text using regex
    const roofSizeMatch = visionContent.match(/roof\s*(?:size|area)?\s*[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i);
    const roofSize = roofSizeMatch ? parseFloat(roofSizeMatch[1].replace(/,/g, '')) : null;
    
    // Extract roof size confidence
    const roofSizeConfidenceMatch = visionContent.match(/roof\s*(?:size|area).*?confidence(?:\s*score)?(?:\s*:)?\s*(?:is|of)?\s*([0-9]+)%/i);
    const roofSizeConfidence = roofSizeConfidenceMatch ? parseInt(roofSizeConfidenceMatch[1]) : null;
    
    // Extract roof type
    const roofTypeMatch = visionContent.match(/roof\s*(?:type|style|is)?[^a-zA-Z]*(flat|pitched|gabled|hip|shed|mansard|gambrel|butterfly|dome|pyramid|skillion)/i);
    const roofType = roofTypeMatch ? roofTypeMatch[1].toLowerCase() : null;
    
    // Extract solar potential area
    const solarAreaMatch = visionContent.match(/(?:solar|unshaded)\s*(?:panel)?\s*(?:potential|suitable)?\s*(?:roof)?\s*(?:area|space)[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i);
    const solarArea = solarAreaMatch ? parseFloat(solarAreaMatch[1].replace(/,/g, '')) : null;
    
    // Extract solar potential
    const solarPotentialMatch = visionContent.match(/solar\s*(?:potential|capacity|suitability)[^a-zA-Z]*(excellent|good|moderate|poor|high|medium|low|[0-9]+%)/i);
    const solarPotentialRaw = solarPotentialMatch ? solarPotentialMatch[1].toLowerCase() : null;
    
    // Convert text-based solar potential to a numeric score
    let solarPotentialScore = null;
    if (solarPotentialRaw) {
      if (solarPotentialRaw.includes('%')) {
        solarPotentialScore = parseInt(solarPotentialRaw);
      } else {
        const potentialMap: Record<string, number> = {
          'excellent': 90, 'high': 80, 'good': 70, 
          'moderate': 50, 'medium': 50, 'low': 30, 'poor': 20
        };
        solarPotentialScore = potentialMap[solarPotentialRaw] || null;
      }
    }
    
    // Extract roof orientation
    const orientationMatch = visionContent.match(/(?:roof|solar)\s*orientation[^a-zA-Z]*(north|south|east|west|northeast|northwest|southeast|southwest|n|s|e|w|ne|nw|se|sw)(?:\s*-?\s*facing)?/i);
    const roofOrientation = orientationMatch ? orientationMatch[1].toLowerCase() : null;
    
    // Extract parking spaces estimate
    const parkingMatch = visionContent.match(/(?:parking|park|car)\s*(?:spaces?|spots?)?[^0-9]*([0-9]+)/i);
    const parkingSpaces = parkingMatch ? parseInt(parkingMatch[1]) : null;
    
    // Extract parking space dimensions
    const parkingDimensionsMatch = visionContent.match(/(?:parking|park|car)\s*(?:spaces?|spots?)?.*?dimensions?[^0-9]*([0-9.]+)\s*(?:x|by)\s*([0-9.]+)(?:\s*(?:ft|feet))?/i);
    const parkingLength = parkingDimensionsMatch ? parseFloat(parkingDimensionsMatch[1]) : null;
    const parkingWidth = parkingDimensionsMatch ? parseFloat(parkingDimensionsMatch[2]) : null;
    
    // Extract parking confidence
    const parkingConfidenceMatch = visionContent.match(/parking.*?confidence(?:\s*score)?(?:\s*:)?\s*(?:is|of)?\s*([0-9]+)%/i);
    const parkingConfidence = parkingConfidenceMatch ? parseInt(parkingConfidenceMatch[1]) : null;
    
    // Extract garden/yard area
    const gardenMatch = visionContent.match(/(?:garden|yard|outdoor)[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i);
    const gardenArea = gardenMatch ? parseFloat(gardenMatch[1].replace(/,/g, '')) : null;
    
    // Extract garden area confidence
    const gardenConfidenceMatch = visionContent.match(/(?:garden|yard|outdoor).*?confidence(?:\s*score)?(?:\s*:)?\s*(?:is|of)?\s*([0-9]+)%/i);
    const gardenConfidence = gardenConfidenceMatch ? parseInt(gardenConfidenceMatch[1]) : null;
    
    // Extract garden potential
    const gardenPotentialMatch = visionContent.match(/(?:garden|farming|yard)\s*(?:potential|suitability)[^a-zA-Z]*(excellent|good|moderate|poor|high|medium|low|[0-9]+%)/i);
    const gardenPotentialRaw = gardenPotentialMatch ? gardenPotentialMatch[1].toLowerCase() : null;
    
    // Convert text-based garden potential to a numeric score
    let gardenPotentialScore = null;
    if (gardenPotentialRaw) {
      if (gardenPotentialRaw.includes('%')) {
        gardenPotentialScore = parseInt(gardenPotentialRaw);
      } else {
        const potentialMap: Record<string, number> = {
          'excellent': 90, 'high': 80, 'good': 70, 
          'moderate': 50, 'medium': 50, 'low': 30, 'poor': 20
        };
        gardenPotentialScore = potentialMap[gardenPotentialRaw] || null;
      }
    }
    
    // Extract pool information
    const poolPresentMatch = visionContent.match(/(?:swimming|pool)[^a-zA-Z]*(present|visible|identified|detected|exists|yes)/i);
    const poolPresent = !!poolPresentMatch;
    
    // Extract pool size if present
    const poolSizeMatch = poolPresent ? visionContent.match(/pool\s*(?:size|area|dimensions)?[^0-9]*([0-9,.]+)\s*(?:sq\s*(?:ft|feet)|square\s*feet)/i) : null;
    const poolSize = poolSizeMatch ? parseFloat(poolSizeMatch[1].replace(/,/g, '')) : null;
    
    // Extract pool dimensions
    const poolDimensionsMatch = poolPresent ? visionContent.match(/pool.*?dimensions?[^0-9]*([0-9.]+)\s*(?:x|by)\s*([0-9.]+)(?:\s*(?:ft|feet))?/i) : null;
    const poolLength = poolDimensionsMatch ? parseFloat(poolDimensionsMatch[1]) : null;
    const poolWidth = poolDimensionsMatch ? parseFloat(poolDimensionsMatch[2]) : null;
    
    // Extract pool confidence
    const poolConfidenceMatch = poolPresent ? visionContent.match(/pool.*?confidence(?:\s*score)?(?:\s*:)?\s*(?:is|of)?\s*([0-9]+)%/i) : null;
    const poolConfidence = poolConfidenceMatch ? parseInt(poolConfidenceMatch[1]) : null;
    
    // Extract pool type
    const poolTypeMatch = poolPresent ? visionContent.match(/pool\s*(?:type|is)[^a-zA-Z]*(in-ground|inground|above-ground|aboveground)/i) : null;
    const poolType = poolTypeMatch ? poolTypeMatch[1].toLowerCase() : null;
    
    // Extract overall reliability statement
    const reliabilityMatch = visionContent.match(/reliability of (?:these|the) measurements[^0-9.]*([0-9.]+)%/i);
    const overallReliability = reliabilityMatch ? parseFloat(reliabilityMatch[1]) : null;
    
    // Validate and normalize the extracted data (ensure values fall within reasonable ranges)
    const validatedData = {
      roofSize: validateMeasurement(roofSize, 100, 10000),
      roofType,
      roofOrientation,
      solarArea: validateMeasurement(solarArea, 0, roofSize || 10000),
      solarPotential: solarPotentialRaw,
      solarPotentialScore: validateScore(solarPotentialScore),
      roofSizeConfidence: validateScore(roofSizeConfidence),
      parkingSpaces: validateCount(parkingSpaces, 0, 20),
      parkingLength: validateMeasurement(parkingLength, 5, 30),
      parkingWidth: validateMeasurement(parkingWidth, 5, 20),
      parkingConfidence: validateScore(parkingConfidence),
      gardenArea: validateMeasurement(gardenArea, 0, 50000),
      gardenPotential: gardenPotentialRaw,
      gardenPotentialScore: validateScore(gardenPotentialScore),
      gardenConfidence: validateScore(gardenConfidence),
      poolPresent,
      poolSize: validateMeasurement(poolSize, 0, 2000),
      poolLength: validateMeasurement(poolLength, 0, 100),
      poolWidth: validateMeasurement(poolWidth, 0, 100),
      poolType,
      poolConfidence: validateScore(poolConfidence),
      overallReliability: validateScore(overallReliability),
      measurementMethodology: extractMeasurementMethodology(visionContent),
      fullAnalysis: visionContent
    };
    
    return validatedData;
  } catch (e) {
    console.error('Error parsing vision analysis:', e);
    return { fullAnalysis: visionContent };
  }
}

/**
 * Validate a measurement to ensure it falls within a reasonable range
 */
function validateMeasurement(value: number | null, min: number, max: number): number | null {
  if (value === null) return null;
  if (isNaN(value)) return null;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Validate a count to ensure it falls within a reasonable range
 */
function validateCount(value: number | null, min: number, max: number): number | null {
  if (value === null) return null;
  if (isNaN(value)) return null;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Validate a score to ensure it falls within 0-100 range
 */
function validateScore(value: number | null): number | null {
  if (value === null) return null;
  if (isNaN(value)) return null;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

/**
 * Extract the methodology used to measure the property
 */
function extractMeasurementMethodology(content: string): string | null {
  // Look for methodology descriptions
  const methodologyMatch = content.match(/(?:measurement|calculation|analysis)(?:\s+methodology|method|approach)[^.]*(?:\.|$)/i);
  if (methodologyMatch) {
    return methodologyMatch[0].trim();
  }
  return null;
}
