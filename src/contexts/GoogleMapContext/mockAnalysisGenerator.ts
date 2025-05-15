
import { AnalysisResults } from './types';

// Generate local mock analysis for fallback use
export const generateLocalMockAnalysis = (propertyAddress: string): AnalysisResults => {
  // Create a stable pseudo-random number generator based on address string
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };
  
  const addressHash = Math.abs(hashCode(propertyAddress));
  const rand = (min: number, max: number) => Math.floor((addressHash % 1000) / 1000 * (max - min) + min);
  
  // Generate mock data with some deterministic variation based on address
  const mockResults: AnalysisResults = {
    propertyType: addressHash % 3 === 0 ? "Commercial" : "Residential",
    amenities: ["Parking", "Garden", "Storage"],
    rooftop: {
      area: rand(500, 2000),
      solarCapacity: rand(3, 15),
      revenue: rand(80, 300)
    },
    garden: {
      area: rand(200, 1000),
      opportunity: ["Low", "Medium", "High"][rand(0, 3)],
      revenue: rand(30, 150)
    },
    parking: {
      spaces: rand(1, 5),
      rate: rand(5, 20),
      revenue: rand(50, 200)
    },
    pool: {
      present: addressHash % 5 === 0,
      area: rand(0, 400),
      type: "inground",
      revenue: addressHash % 5 === 0 ? rand(100, 300) : 0
    },
    storage: {
      volume: rand(50, 300),
      revenue: rand(40, 120)
    },
    bandwidth: {
      available: rand(50, 200),
      revenue: rand(10, 50)
    },
    shortTermRental: {
      nightlyRate: rand(50, 200),
      monthlyProjection: rand(500, 2500)
    },
    permits: ["Zoning permit", "Business license"],
    restrictions: "Check local regulations before monetizing your property.",
    topOpportunities: [
      {
        icon: "solar",
        title: "Solar Panels",
        monthlyRevenue: rand(80, 250),
        description: "Install solar panels on your rooftop."
      },
      {
        icon: "parking",
        title: "Parking Space",
        monthlyRevenue: rand(50, 200),
        description: "Rent out your parking spaces."
      },
      {
        icon: "storage",
        title: "Storage Space",
        monthlyRevenue: rand(40, 120),
        description: "Offer storage space rental."
      },
      {
        icon: "wifi",
        title: "Internet Sharing",
        monthlyRevenue: rand(10, 50),
        description: "Share your internet bandwidth."
      }
    ],
    imageAnalysisSummary: "This property appears to have good solar potential with an open rooftop area."
  };
  
  return mockResults;
};
