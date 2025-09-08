export const performComprehensivePropertyAnalysis = async (
  propertyInfo: any,
  imageAnalysis: any,
  openaiApiKey: string
) => {
  console.log('🔍 Performing comprehensive property analysis using all data sources...');

  const prompt = `Perform comprehensive property type analysis using all available data:

ADDRESS & LOCATION:
- Address: ${propertyInfo.address}
- Coordinates: ${propertyInfo.coordinates ? `${propertyInfo.coordinates.lat}, ${propertyInfo.coordinates.lng}` : 'Not available'}

GOOGLE PLACES DATA:
- Property Types: ${propertyInfo.details?.type ? propertyInfo.details.type.join(', ') : 'Not available'}
- Address Components: ${JSON.stringify(propertyInfo.details?.addressComponents || [])}
- Vicinity: ${propertyInfo.details?.vicinity || 'Not available'}

ENHANCED PROPERTY DATA:
${propertyInfo.enhancedData ? `
- Nearby Places: ${propertyInfo.enhancedData.nearbyPlaces?.slice(0, 10).map((p: any) => `${p.name} (${p.types?.join(', ')})`).join('; ') || 'None'}
- Area Analysis: ${JSON.stringify(propertyInfo.enhancedData.areaAnalysis)}
- Zoning Hints: ${propertyInfo.enhancedData.zoningHints?.join('; ') || 'None'}
- Market Factors: ${JSON.stringify(propertyInfo.enhancedData.marketFactors)}
` : 'Enhanced data not available'}

STREET VIEW ANALYSIS:
${propertyInfo.streetViewAnalysis?.analysis || 'Street view analysis not available'}

SATELLITE/IMAGE ANALYSIS:
${imageAnalysis.summary || imageAnalysis.analysis || 'Image analysis not available'}

INITIAL CLASSIFICATION:
${JSON.stringify(propertyInfo.classification || {})}

Based on ALL available data sources, provide comprehensive property classification:

ANALYSIS REQUIREMENTS:
1. Primary Property Type: Choose from residential, commercial, industrial, vacant_land, mixed_use, institutional, agricultural
2. Detailed Sub-Type: Specific classification (e.g., single_family_home, retail_store, office_building, vacant_commercial_land, etc.)
3. Confidence Score: 0.0-1.0 based on data quality and consistency
4. Property Characteristics: Building details, land features, accessibility
5. Zoning Assessment: Likely zoning and permitted uses
6. Market Context: Location advantages, nearby amenities, commercial potential
7. Access Rights: Individual property control vs shared/managed facilities
8. Revenue Opportunities: All potential monetization streams
9. Restrictions: Zoning, HOA, regulatory, or physical limitations

Return JSON format:
{
  "primaryType": "property_type",
  "subType": "specific_subtype", 
  "confidence": 0.0-1.0,
  "propertyCharacteristics": {
    "buildingType": "description",
    "landArea": "estimated_area",
    "buildingCondition": "assessment",
    "accessType": "individual/shared/managed",
    "uniqueFeatures": ["feature1", "feature2"]
  },
  "zoningAssessment": {
    "likelyZoning": "zoning_type",
    "permittedUses": ["use1", "use2"],
    "developmentPotential": "high/medium/low"
  },
  "marketContext": {
    "locationAdvantages": ["advantage1", "advantage2"],
    "nearbyAmenities": ["amenity1", "amenity2"],
    "commercialPotential": "high/medium/low",
    "touristPotential": "high/medium/low"
  },
  "accessRights": {
    "hasRooftopAccess": boolean,
    "hasLandControl": boolean,
    "hasParkingControl": boolean,
    "hasIndividualControl": boolean
  },
  "revenueOpportunities": [
    {
      "type": "opportunity_type",
      "feasibility": "high/medium/low",
      "estimatedRevenue": "revenue_range",
      "description": "detailed_description"
    }
  ],
  "restrictions": ["restriction1", "restriction2"],
  "dataQuality": {
    "streetViewAvailable": boolean,
    "satelliteImageQuality": "high/medium/low",
    "googleDataComplete": boolean,
    "overallConfidence": 0.0-1.0
  },
  "recommendations": ["recommendation1", "recommendation2"]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a property classification expert. Analyze all available data to provide comprehensive property classification in JSON format. ALWAYS respond with valid JSON only, no additional text.'
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      max_tokens: 600,
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  const rawResponse = data.choices[0]?.message?.content;
  
  if (!rawResponse || rawResponse.trim().length === 0) {
    console.log('⚠️ Empty comprehensive analysis response, using fallback');
    return generateFallbackClassification(propertyInfo);
  }
  
  try {
    const result = JSON.parse(rawResponse);
    console.log('✅ Comprehensive property analysis completed with confidence:', result.confidence);
    return result;
  } catch (error) {
    console.error('Error parsing comprehensive analysis JSON:', error);
    console.log('⚠️ JSON parsing failed, using fallback classification');
    return generateFallbackClassification(propertyInfo);
  }
};

function generateFallbackClassification(propertyInfo: any) {
  return {
    primaryType: propertyInfo.classification?.primaryType || 'residential',
    subType: propertyInfo.classification?.subType || 'single_family_home',
    confidence: 0.6,
    accessRights: {
      hasRooftopAccess: true,
      hasLandControl: true,
      hasParkingControl: true,
      hasIndividualControl: true
    },
    restrictions: [],
    revenueOpportunities: []
  };
}

export const createComprehensiveAnalysisPrompt = (
  propertyInfo: any,
  imageAnalysis: any,
  comprehensiveClassification: any
): string => {
  return `Analyze this property for ALL possible monetization opportunities with comprehensive property type awareness:

COMPREHENSIVE PROPERTY CLASSIFICATION:
- Primary Type: ${comprehensiveClassification.primaryType}
- Sub Type: ${comprehensiveClassification.subType}
- Confidence: ${Math.round((comprehensiveClassification.confidence || 0.5) * 100)}%

PROPERTY DETAILS:
- Address: ${propertyInfo.address}
- Coordinates: ${JSON.stringify(propertyInfo.coordinates)}
- Building Characteristics: ${JSON.stringify(comprehensiveClassification.propertyCharacteristics || {})}

ACCESS RIGHTS & CONTROL:
- Rooftop Access: ${comprehensiveClassification.accessRights?.hasRooftopAccess}
- Land Control: ${comprehensiveClassification.accessRights?.hasLandControl}
- Parking Control: ${comprehensiveClassification.accessRights?.hasParkingControl}
- Individual Control: ${comprehensiveClassification.accessRights?.hasIndividualControl}

MARKET CONTEXT:
- Location Advantages: ${comprehensiveClassification.marketContext?.locationAdvantages?.join(', ') || 'None identified'}
- Commercial Potential: ${comprehensiveClassification.marketContext?.commercialPotential || 'Unknown'}
- Tourist Potential: ${comprehensiveClassification.marketContext?.touristPotential || 'Unknown'}

ZONING ASSESSMENT:
- Likely Zoning: ${comprehensiveClassification.zoningAssessment?.likelyZoning || 'Unknown'}
- Permitted Uses: ${comprehensiveClassification.zoningAssessment?.permittedUses?.join(', ') || 'Standard residential/commercial'}

IDENTIFIED REVENUE OPPORTUNITIES:
${comprehensiveClassification.revenueOpportunities?.map((opp: any) => 
  `- ${opp.type}: ${opp.feasibility} feasibility, ${opp.estimatedRevenue}, ${opp.description}`
).join('\n') || 'Basic opportunities only'}

RESTRICTIONS:
${comprehensiveClassification.restrictions?.join(', ') || 'None identified'}

IMAGE/SATELLITE ANALYSIS:
${imageAnalysis.summary || imageAnalysis.analysis || 'No image analysis available'}

STREET VIEW INSIGHTS:
${propertyInfo.streetViewAnalysis?.analysis || 'No street view analysis available'}

CRITICAL ANALYSIS REQUIREMENTS FOR ${comprehensiveClassification.primaryType.toUpperCase()}:

${comprehensiveClassification.primaryType === 'vacant_land' ? `
VACANT LAND OPPORTUNITIES:
- Solar farm development ($200-500/month per acre)
- Parking lot rental ($50-200/space/month)
- Storage facility development ($30-100/unit/month)
- Agricultural leasing ($50-300/acre/month)
- Event hosting space ($500-2000/event)
- RV/boat storage ($100-300/unit/month)
- Advertising billboards ($300-2000/sign/month)
- Cell tower leasing ($1000-5000/month)
- Tiny home communities ($800-1500/unit/month)
- Produce stands/farmers markets ($200-800/month)
` : ''}

${comprehensiveClassification.primaryType === 'commercial' ? `
COMMERCIAL PROPERTY OPPORTUNITIES:
- Traditional business lease ($15-50/sq ft/year)
- Parking space rental ($50-300/space/month)
- Rooftop solar installation ($100-500/month)
- Rooftop events/dining ($1000-5000/month)
- Digital advertising displays ($500-2000/month)
- Cell tower/antenna leasing ($1000-3000/month)
- Storage unit conversions ($50-150/unit/month)
- EV charging stations ($200-800/month)
- Delivery/logistics hub ($500-2000/month)
- Co-working space subleasing ($200-500/desk/month)
` : ''}

${comprehensiveClassification.primaryType === 'residential' && comprehensiveClassification.accessRights?.hasIndividualControl ? `
SINGLE FAMILY HOME OPPORTUNITIES:
- Rooftop solar installation ($50-200/month)
- Driveway/garage parking rental ($100-400/month)
- Pool rental (Swimply) ($50-200/day)
- Backyard events/gatherings ($200-1000/event)
- Garden/greenhouse space ($30-100/month)
- Storage shed rental ($50-150/month)
- ADU/tiny home rental ($800-2500/month)
- Home office/studio rental ($300-1000/month)
- Equipment/tool rental ($20-100/item/month)
- Internet bandwidth sharing ($25-75/month)
` : ''}

${comprehensiveClassification.primaryType === 'residential' && !comprehensiveClassification.accessRights?.hasIndividualControl ? `
APARTMENT/CONDO OPPORTUNITIES (LIMITED):
- Internet bandwidth sharing ($25-50/month)
- Personal storage rental within unit ($10-30/month)
- Parking space subletting ($50-200/month - if permitted)
- Home office/workspace rental ($200-500/month)
- Equipment sharing with neighbors ($10-50/month)
Note: Most traditional property monetization is NOT available due to shared building ownership
` : ''}

Return comprehensive JSON analysis with realistic revenue estimates based on property type, location, and access rights:

{
  "propertyType": "${comprehensiveClassification.primaryType}",
  "subType": "${comprehensiveClassification.subType}",
  "comprehensiveClassification": {
    "primaryType": "${comprehensiveClassification.primaryType}",
    "confidence": ${comprehensiveClassification.confidence || 0.5},
    "accessRights": ${JSON.stringify(comprehensiveClassification.accessRights || {})},
    "marketPotential": "${comprehensiveClassification.marketContext?.commercialPotential || 'medium'}"
  },
  "rooftop": {
    "area": number,
    "solarCapacity": number,
    "solarPotential": boolean,
    "monthlyRevenue": number,
    "setupCost": number,
    "paybackYears": number,
    "accessRestrictions": "explanation if restricted",
    "usingRealSolarData": false
  },
  "parking": {
    "spaces": number,
    "monthlyRevenuePerSpace": number,
    "totalMonthlyRevenue": number,
    "evChargerPotential": boolean,
    "marketDemand": "high/medium/low",
    "accessRestrictions": "explanation if restricted"
  },
  "land": {
    "area": number,
    "developmentPotential": "high/medium/low",
    "agriculturalPotential": boolean,
    "eventHostingPotential": boolean,
    "monthlyRevenue": number,
    "primaryUse": "description of best use"
  },
  "pool": {
    "present": boolean,
    "monthlyRevenue": number,
    "seasonalVariation": number,
    "hourlyRate": number,
    "accessRestrictions": "explanation if restricted"
  },
  "storage": {
    "available": boolean,
    "type": "garage/basement/unit/external",
    "monthlyRevenue": number,
    "marketDemand": "high/medium/low"
  },
  "internet": {
    "monthlyRevenue": number,
    "bandwidthSharing": boolean,
    "requirements": "technical requirements"
  },
  "specialOpportunities": [
    {
      "type": "opportunity name",
      "monthlyRevenue": number,
      "feasibility": "high/medium/low",
      "description": "detailed description",
      "requirements": ["requirement1", "requirement2"]
    }
  ],
  "totalMonthlyRevenue": number,
  "totalSetupInvestment": number,
  "overallConfidenceScore": 0.0-1.0,
  "keyRecommendations": ["rec1", "rec2"],
  "propertyTypeAdvantages": ["advantage1", "advantage2"],
  "restrictionWarnings": ["warning1", "warning2"]
}`;
};

export const generateComprehensiveOpportunities = (
  results: any,
  comprehensiveClassification: any,
  analysisData: any
) => {
  const opportunities = [];
  const propertyType = comprehensiveClassification.primaryType;
  const hasIndividualControl = comprehensiveClassification.accessRights?.hasIndividualControl;

  console.log(`🎯 Generating opportunities for ${propertyType} with individual control: ${hasIndividualControl}`);

  // Vacant Land Opportunities
  if (propertyType === 'vacant_land') {
    if (results.land?.monthlyRevenue > 0) {
      opportunities.push({
        title: 'Land Development/Leasing',
        icon: 'map',
        monthlyRevenue: results.land.monthlyRevenue,
        description: `Develop or lease your vacant land for ${results.land.primaryUse || 'various commercial uses'}.`,
        setupCost: 5000,
        roi: Math.ceil(5000 / Math.max(results.land.monthlyRevenue, 1))
      });
    }

    if (results.parking?.revenue > 0) {
      opportunities.push({
        title: 'Parking Lot Development',
        icon: 'car',
        monthlyRevenue: results.parking.revenue,
        description: `Convert land to parking facility with ${results.parking.spaces} spaces.`,
        setupCost: results.parking.spaces * 500,
        roi: Math.ceil((results.parking.spaces * 500) / Math.max(results.parking.revenue, 1))
      });
    }
  }

  // Commercial Property Opportunities
  if (propertyType === 'commercial') {
    if (results.rooftop?.revenue > 0) {
      opportunities.push({
        title: 'Commercial Rooftop Solar',
        icon: 'sun',
        monthlyRevenue: results.rooftop.revenue,
        description: `Install commercial-grade solar system on ${results.rooftop.area || 'available'} sq ft rooftop.`,
        setupCost: results.rooftop.setupCost || 25000,
        roi: Math.ceil((results.rooftop.setupCost || 25000) / Math.max(results.rooftop.revenue, 1))
      });
    }

    if (results.parking?.revenue > 0) {
      opportunities.push({
        title: 'Commercial Parking Rental',
        icon: 'car',
        monthlyRevenue: results.parking.revenue,
        description: `Rent commercial parking spaces to employees, customers, and visitors.`,
        setupCost: 1000,
        roi: Math.ceil(1000 / Math.max(results.parking.revenue, 1))
      });
    }
  }

  // Residential with Individual Control
  if (propertyType === 'residential' && hasIndividualControl) {
    if (results.rooftop?.revenue > 0) {
      opportunities.push({
        title: 'Residential Solar Installation',
        icon: 'sun',
        monthlyRevenue: results.rooftop.revenue,
        description: `Install solar panels on your ${results.rooftop.area || 'available'} sq ft roof for clean energy and savings.`,
        setupCost: results.rooftop.setupCost || 15000,
        roi: Math.ceil((results.rooftop.setupCost || 15000) / Math.max(results.rooftop.revenue, 1))
      });
    }

    if (results.parking?.revenue > 0) {
      opportunities.push({
        title: 'Driveway Parking Rental',
        icon: 'car',
        monthlyRevenue: results.parking.revenue,
        description: `Rent your driveway/garage parking to neighbors and commuters.`,
        setupCost: 200,
        roi: Math.ceil(200 / Math.max(results.parking.revenue, 1))
      });
    }

    if (results.pool?.revenue > 0) {
      opportunities.push({
        title: 'Pool Rental (Swimply)',
        icon: 'waves',
        monthlyRevenue: results.pool.revenue,
        description: `Rent your pool by the hour through platforms like Swimply.`,
        setupCost: 300,
        roi: Math.ceil(300 / Math.max(results.pool.revenue, 1))
      });
    }
  }

  // Residential without Individual Control (Apartments/Condos)
  if (propertyType === 'residential' && !hasIndividualControl) {
    if (results.bandwidth?.revenue > 0) {
      opportunities.push({
        title: 'Internet Bandwidth Sharing',
        icon: 'wifi',
        monthlyRevenue: results.bandwidth.revenue,
        description: 'Share unused internet bandwidth for passive income - available for apartment residents.',
        setupCost: 0,
        roi: 0
      });
    }

    if (results.storage?.revenue > 0) {
      opportunities.push({
        title: 'Unit Storage Rental',
        icon: 'storage',
        monthlyRevenue: results.storage.revenue,
        description: 'Rent personal storage space within your unit to neighbors.',
        setupCost: 0,
        roi: 0
      });
    }
  }

  // Universal opportunities (available for all property types)
  if (results.storage?.revenue > 0 && hasIndividualControl) {
    opportunities.push({
      title: 'Storage Space Rental',
      icon: 'storage',
      monthlyRevenue: results.storage.revenue,
      description: 'Rent storage space in garage, basement, or outbuildings.',
      setupCost: 100,
      roi: Math.ceil(100 / Math.max(results.storage.revenue, 1))
    });
  }

  if (results.bandwidth?.revenue > 0) {
    opportunities.push({
      title: 'Internet Bandwidth Sharing',
      icon: 'wifi',
      monthlyRevenue: results.bandwidth.revenue,
      description: 'Share unused internet bandwidth for passive income.',
      setupCost: 0,
      roi: 0
    });
  }

  // Add special opportunities from analysis
  if (analysisData.specialOpportunities?.length > 0) {
    analysisData.specialOpportunities.forEach((special: any) => {
      if (special.monthlyRevenue > 0) {
        opportunities.push({
          title: special.type,
          icon: 'star',
          monthlyRevenue: special.monthlyRevenue,
          description: special.description,
          setupCost: special.setupCost || 500,
          roi: Math.ceil((special.setupCost || 500) / Math.max(special.monthlyRevenue, 1))
        });
      }
    });
  }

  console.log(`✅ Generated ${opportunities.length} opportunities for ${propertyType}`);
  return opportunities.slice(0, 6); // Limit to top 6 opportunities
};