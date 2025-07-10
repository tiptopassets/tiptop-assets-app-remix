import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const SEARCH_API_KEY = Deno.env.get('SEARCH_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, numResults = 3 } = await req.json()

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🔍 [WEB-SEARCH] Searching for: ${query}`)

    // Use a search API (like SerpAPI, ScrapingBee, or Bing Search API)
    const searchUrl = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${numResults}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': SEARCH_API_KEY || '',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ Search API failed:', response.status, response.statusText)
      
      // Return mock data for development
      const mockResults = getMockSearchResults(query)
      return new Response(
        JSON.stringify({ 
          results: mockResults,
          query,
          source: 'mock'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const searchData = await response.json()
    
    // Extract relevant information from search results
    const processedResults = processSearchResults(searchData, query)

    console.log(`✅ [WEB-SEARCH] Found ${processedResults.length} results for: ${query}`)

    return new Response(
      JSON.stringify({ 
        results: processedResults,
        query,
        source: 'bing'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ [WEB-SEARCH] Error:', error)
    
    // Return mock data on error
    const mockResults = getMockSearchResults('default')
    return new Response(
      JSON.stringify({ 
        results: mockResults,
        error: 'Search failed, using cached data',
        source: 'mock'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function processSearchResults(searchData: any, query: string): any[] {
  const results = searchData.webPages?.value || []
  
  return results.slice(0, 3).map((result: any) => ({
    title: result.name,
    url: result.url,
    snippet: result.snippet,
    relevantInfo: extractRequirementsFromSnippet(result.snippet, query)
  }))
}

function extractRequirementsFromSnippet(snippet: string, query: string): string[] {
  // Simple extraction based on common patterns
  const requirements: string[] = []
  
  // Look for lists and requirements patterns
  const patterns = [
    /requirements?[:\s]+([^.]+)/gi,
    /you need[:\s]+([^.]+)/gi,
    /must have[:\s]+([^.]+)/gi,
    /include[:\s]+([^.]+)/gi,
    /provide[:\s]+([^.]+)/gi
  ]
  
  patterns.forEach(pattern => {
    const matches = snippet.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.replace(/requirements?[:\s]+|you need[:\s]+|must have[:\s]+|include[:\s]+|provide[:\s]+/gi, '').trim()
        if (cleaned.length > 10) {
          requirements.push(cleaned)
        }
      })
    }
  })
  
  return requirements.slice(0, 5) // Limit to 5 requirements
}

function getMockSearchResults(query: string): any[] {
  // Mock data for when API is not available
  const platformMockData: Record<string, any[]> = {
    'swimply': [
      {
        title: "How to Host on Swimply - Pool Rental Requirements 2024",
        url: "https://swimply.com/host-requirements",
        snippet: "Pool insurance coverage minimum $1M liability, safety equipment including life ring and first aid kit, professional photos minimum 5 high-quality images, pool maintenance schedule and water testing, clear guest access instructions and parking info, host background check verification 2024 requirement.",
        relevantInfo: [
          "Pool insurance coverage (minimum $1M liability)",
          "Safety equipment (life ring, first aid kit)",
          "Professional photos (minimum 5 images)",
          "Pool maintenance schedule and water testing",
          "Host background check verification"
        ]
      }
    ],
    'spothero': [
      {
        title: "SpotHero Host Requirements - Parking Space Rental 2024",
        url: "https://spothero.com/host-guide",
        snippet: "Clear unobstructed parking space, safe well-lit area with security measures, easy access for renters GPS coordinates provided, precise location details and landmarks, photos of parking space and access route, dynamic pricing enabled for maximum earnings 2024 feature.",
        relevantInfo: [
          "Clear, unobstructed parking space",
          "Safe, well-lit area with security",
          "Easy access with GPS coordinates",
          "Photos of space and access route",
          "Dynamic pricing capabilities"
        ]
      }
    ],
    'neighbor': [
      {
        title: "Neighbor.com Storage Host Requirements 2024 Guide",
        url: "https://neighbor.com/storage-host-guide",
        snippet: "Clean dry storage space climate controlled preferred, secure area with locks and surveillance, easy renter access during business hours, climate considerations and protection noted, clear photos showing space dimensions, insurance verification for high-value items 2024 update.",
        relevantInfo: [
          "Clean, dry storage space (climate controlled preferred)",
          "Secure area with locks and surveillance",
          "Easy renter access during business hours",
          "Clear photos showing dimensions",
          "Insurance verification for high-value items"
        ]
      }
    ],
    'peerspace': [
      {
        title: "Peerspace Host Requirements - Unique Space Rental 2024",
        url: "https://peerspace.com/host-requirements",
        snippet: "Unique photogenic space with professional appeal, basic amenities WiFi parking restrooms, professional-quality photos minimum 10 images, flexible booking availability instant book preferred, clear space descriptions and usage guidelines, virtual tour capability 2024 trending feature.",
        relevantInfo: [
          "Unique, photogenic space with professional appeal",
          "Basic amenities (WiFi, parking, restrooms)",
          "Professional photos (minimum 10 images)",
          "Flexible booking availability",
          "Virtual tour capability"
        ]
      }
    ]
  }
  
  // Find matching platform data
  const lowerQuery = query.toLowerCase()
  for (const [platform, data] of Object.entries(platformMockData)) {
    if (lowerQuery.includes(platform)) {
      return data
    }
  }
  
  // Default mock data
  return [
    {
      title: "General Property Monetization Requirements 2024",
      url: "https://example.com/requirements",
      snippet: "Basic requirements include proper insurance, quality photos, flexible scheduling, and platform verification.",
      relevantInfo: [
        "Property insurance coverage",
        "High-quality photos",
        "Flexible scheduling",
        "Platform verification"
      ]
    }
  ]
}