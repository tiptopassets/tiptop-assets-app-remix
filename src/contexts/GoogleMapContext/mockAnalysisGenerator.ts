
// Add this at the top where imports are defined
import { AnalysisResults } from './types';

// Update or add this function
export const generateLocalMockAnalysis = (address: string): AnalysisResults => {
  // Try to determine if it's likely a single-family home or apartment based on the address
  const isLikelyApartment = /apt|unit|#|suite|apartment|flat|condo/i.test(address);
  
  // Create appropriate mock data based on likely property type
  const propertyType = isLikelyApartment ? 'apartment' : 'single_family';
  
  // Set parking spaces based on property type
  const parkingSpaces = isLikelyApartment ? 1 : 2;
  
  // Only houses have pools and gardens typically
  const hasPool = !isLikelyApartment && Math.random() > 0.7;
  const gardenSize = isLikelyApartment ? 0 : Math.floor(Math.random() * 800) + 200;
  
  // Generate mock solar potential
  const roofSize = isLikelyApartment ? 
    Math.floor(Math.random() * 300) + 200 : // smaller roof for apartment unit
    Math.floor(Math.random() * 1000) + 800;  // larger for house
    
  const solarPotential = Math.random() > 0.3;
  const solarCapacity = solarPotential ? Math.floor(roofSize / 15) : 0;
  const solarRevenue = solarPotential ? solarCapacity * 120 : 0;
  
  // Calculate parking revenue
  const parkingRate = isLikelyApartment ? 8 : 12;
  const parkingRevenue = parkingSpaces * parkingRate * 30 * 0.8; // 80% occupancy
  
  // Garden revenue if applicable
  const gardenRevenue = gardenSize > 0 ? Math.floor(gardenSize * 0.1) : 0;
  
  // Pool revenue if applicable
  const poolSize = hasPool ? Math.floor(Math.random() * 300) + 200 : 0;
  const poolRevenue = hasPool ? Math.floor(poolSize * 1.2) : 0;
  
  // Internet sharing potential
  const internetRevenue = Math.floor(Math.random() * 30) + 10;
  
  // Generate mock analysis results
  const mockResults: AnalysisResults = {
    propertyType: propertyType,
    amenities: ["Internet"],
    rooftop: {
      area: roofSize,
      type: "flat",
      solarCapacity: solarCapacity,
      solarPotential: solarPotential,
      revenue: solarRevenue,
      providers: [
        {
          name: "SunRun",
          setupCost: solarCapacity * 1000,
          roi: 96,
          url: "https://www.sunrun.com"
        },
        {
          name: "Tesla Solar",
          setupCost: solarCapacity * 1100,
          roi: 108,
          url: "https://www.tesla.com/solarpanels"
        }
      ]
    },
    garden: {
      area: gardenSize,
      opportunity: gardenSize > 500 ? "High" : (gardenSize > 200 ? "Medium" : "Low"),
      revenue: gardenRevenue,
      providers: gardenSize > 0 ? [
        {
          name: "YardYum",
          setupCost: 100,
          roi: 1,
          url: "https://www.yardyum.com"
        }
      ] : []
    },
    parking: {
      spaces: parkingSpaces,
      rate: parkingRate,
      revenue: parkingRevenue,
      evChargerPotential: !isLikelyApartment && Math.random() > 0.5,
      providers: [
        {
          name: "Neighbor",
          setupCost: 0,
          roi: 1,
          url: "https://www.neighbor.com"
        },
        {
          name: "SpotHero",
          setupCost: 0,
          roi: 1,
          url: "https://www.spothero.com"
        }
      ]
    },
    pool: hasPool ? {
      present: true,
      area: poolSize,
      type: "inground",
      revenue: poolRevenue,
      providers: [
        {
          name: "Swimply",
          setupCost: 200,
          fee: 15,
          url: "https://www.swimply.com"
        }
      ]
    } : {
      present: false,
      area: 0,
      type: "",
      revenue: 0,
      providers: []
    },
    storage: isLikelyApartment ? {
      volume: 0,
      revenue: 0,
      providers: []
    } : {
      volume: 200,
      revenue: 80,
      providers: [
        {
          name: "Neighbor",
          setupCost: 0,
          fee: 10,
          url: "https://www.neighbor.com"
        }
      ]
    },
    bandwidth: {
      available: 100,
      revenue: internetRevenue,
      providers: [
        {
          name: "Honeygain",
          setupCost: 0,
          fee: 15,
          url: "https://www.honeygain.com"
        }
      ]
    },
    shortTermRental: isLikelyApartment ? {
      nightlyRate: 0,
      monthlyProjection: 0,
      providers: []
    } : {
      nightlyRate: 120,
      monthlyProjection: 900,
      providers: [
        {
          name: "Airbnb",
          setupCost: 500,
          fee: 15,
          url: "https://www.airbnb.com"
        }
      ]
    },
    permits: [
      isLikelyApartment ? "Check with landlord or HOA for permission" : "Check local zoning laws"
    ],
    restrictions: isLikelyApartment ? 
      "Apartment units typically have restrictions set by landlords or HOAs on modifications and commercial activity." : 
      "Single-family homes may have HOA or municipal restrictions on commercial activities.",
    
    topOpportunities: [
      // Always include solar for houses if there's potential
      ...((!isLikelyApartment && solarPotential) ? [{
        icon: "solar",
        title: "Solar Panel Installation",
        monthlyRevenue: solarRevenue,
        description: `Install solar panels on your ${roofSize} sq ft roof to generate green energy and income.`,
        provider: "SunRun",
        setupCost: solarCapacity * 1000,
        roi: 96,
        formFields: [
          {
            type: "text",
            name: "roofType",
            label: "Roof Type",
            value: "Flat/Pitched"
          }
        ]
      }] : []),
      
      // Parking opportunity
      {
        icon: "parking",
        title: "Parking Space Rental",
        monthlyRevenue: parkingRevenue,
        description: `Rent out ${parkingSpaces} parking spaces for extra income.`,
        provider: "Neighbor",
        setupCost: 0,
        roi: 1,
        formFields: [
          {
            type: "number",
            name: "parkingSpaces",
            label: "Number of Parking Spaces",
            value: parkingSpaces.toString()
          }
        ]
      },
      
      // Internet sharing is always possible
      {
        icon: "internet",
        title: "Internet Bandwidth Sharing",
        monthlyRevenue: internetRevenue,
        description: "Share unused internet bandwidth for passive income.",
        provider: "Honeygain",
        setupCost: 0,
        roi: 1,
        formFields: [
          {
            type: "select",
            name: "internetSpeed",
            label: "Internet Speed",
            value: "100 Mbps",
            options: ["50 Mbps", "100 Mbps", "300 Mbps", "1 Gbps"]
          }
        ]
      },
      
      // Garden opportunity for houses only
      ...(gardenSize > 0 ? [{
        icon: "garden",
        title: "Garden/Yard Rental",
        monthlyRevenue: gardenRevenue,
        description: `Rent out ${gardenSize} sq ft garden space for urban farming.`,
        provider: "YardYum",
        setupCost: 100,
        roi: 1,
        formFields: [
          {
            type: "select",
            name: "gardenType",
            label: "Garden Type",
            value: "Vegetable",
            options: ["Vegetable", "Flower", "Fruit", "Mixed"]
          }
        ]
      }] : []),
      
      // Pool opportunity if present
      ...(hasPool ? [{
        icon: "pool",
        title: "Swimming Pool Rental",
        monthlyRevenue: poolRevenue,
        description: `Rent out your ${poolSize} sq ft pool during swim season.`,
        provider: "Swimply",
        setupCost: 200,
        roi: 2,
        formFields: [
          {
            type: "select",
            name: "poolAvailability",
            label: "Pool Availability",
            value: "Weekends",
            options: ["Weekdays", "Weekends", "Evenings", "Full-time"]
          }
        ]
      }] : []),
      
      // Storage for houses
      ...(!isLikelyApartment ? [{
        icon: "storage",
        title: "Storage Space Rental",
        monthlyRevenue: 80,
        description: "Rent out extra storage space in your garage or basement.",
        provider: "Neighbor",
        setupCost: 0,
        roi: 1,
        formFields: [
          {
            type: "number",
            name: "storageVolume",
            label: "Available Storage (cu ft)",
            value: "200"
          }
        ]
      }] : [])
    ],
    imageAnalysisSummary: isLikelyApartment ? 
      "Property appears to be an apartment unit with limited private outdoor space." :
      "Property appears to be a single-family home with standard amenities.",
    propertyValuation: {
      totalMonthlyRevenue: solarRevenue + parkingRevenue + gardenRevenue + poolRevenue + internetRevenue + (isLikelyApartment ? 0 : 80),
      totalAnnualRevenue: (solarRevenue + parkingRevenue + gardenRevenue + poolRevenue + internetRevenue + (isLikelyApartment ? 0 : 80)) * 12,
      totalSetupCosts: (solarPotential ? solarCapacity * 1000 : 0) + (hasPool ? 200 : 0) + (gardenSize > 0 ? 100 : 0),
      averageROI: solarPotential ? 96 : 3,
      bestOpportunity: solarPotential ? "Solar Panel Installation" : "Parking Space Rental"
    }
  };
  
  return mockResults;
};
