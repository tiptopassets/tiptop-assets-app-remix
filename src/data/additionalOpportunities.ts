
import { AdditionalOpportunity } from '@/types/analysis';
import { 
  Car, Home, Wifi, TreePine, Waves, Package, 
  DogIcon, Camera, Gamepad2, BookOpen, Bike,
  Coffee, Music, Dumbbell, Baby, Paintbrush,
  Wrench, Leaf, Users, ShoppingBag, Gift
} from 'lucide-react';

export const additionalOpportunities: AdditionalOpportunity[] = [
  // High Revenue Tier ($200+/month)
  {
    title: "Rent Your Pool",
    icon: Waves,
    monthlyRevenue: 450,
    provider: "Swimply",
    setupCost: 0,
    roi: "Immediate",
    tier: "high",
    category: "spaceRentals",
    description: "Rent your pool by the hour to neighbors",
    requirements: ["Pool", "Insurance", "Safety equipment"],
    timeCommitment: "2-4 hours/week",
    difficulty: "Easy"
  },
  {
    title: "ADU Rental",
    icon: Home,
    monthlyRevenue: 1200,
    provider: "Airbnb",
    setupCost: 2500,
    roi: "2-3 months",
    tier: "high",
    category: "spaceRentals",
    description: "Convert space into rentable unit",
    requirements: ["Separate entrance", "Kitchen", "Bathroom"],
    timeCommitment: "5-10 hours/week",
    difficulty: "Hard"
  },
  {
    title: "EV Charging Station",
    icon: Car,
    monthlyRevenue: 300,
    provider: "ChargePoint",
    setupCost: 1500,
    roi: "5-6 months",
    tier: "high",
    category: "tech",
    description: "Install EV charger for public use",
    requirements: ["Electrical upgrade", "Parking space", "Permits"],
    timeCommitment: "1-2 hours/week",
    difficulty: "Medium"
  },

  // Medium Revenue Tier ($50-$199/month)
  {
    title: "Dog Boarding",
    icon: DogIcon,
    monthlyRevenue: 180,
    provider: "Rover",
    setupCost: 100,
    roi: "1 month",
    tier: "medium",
    category: "petServices",
    description: "Host dogs in your home",
    requirements: ["Fenced yard", "Pet supplies", "Background check"],
    timeCommitment: "10-15 hours/week",
    difficulty: "Medium"
  },
  {
    title: "Package Storage",
    icon: Package,
    monthlyRevenue: 120,
    provider: "Stashbee",
    setupCost: 50,
    roi: "2 weeks",
    tier: "medium",
    category: "logistics",
    description: "Store packages for neighbors",
    requirements: ["Secure storage space", "Insurance"],
    timeCommitment: "3-5 hours/week",
    difficulty: "Easy"
  },
  {
    title: "Garden Produce Sales",
    icon: TreePine,
    monthlyRevenue: 85,
    provider: "Local Markets",
    setupCost: 200,
    roi: "3-4 months",
    tier: "medium",
    category: "community",
    description: "Sell homegrown vegetables and fruits",
    requirements: ["Garden space", "Organic certification", "Market permit"],
    timeCommitment: "8-12 hours/week",
    difficulty: "Medium"
  },
  {
    title: "Home Security Monitoring",
    icon: Camera,
    monthlyRevenue: 95,
    provider: "Nest Aware",
    setupCost: 300,
    roi: "3-4 months",
    tier: "medium",
    category: "tech",
    description: "Provide security monitoring services",
    requirements: ["Security cameras", "High-speed internet", "Monitoring software"],
    timeCommitment: "2-3 hours/week",
    difficulty: "Medium"
  },

  // Low Revenue Tier (Under $50/month)
  {
    title: "Share Internet Bandwidth",
    icon: Wifi,
    monthlyRevenue: 35,
    provider: "Honeygain",
    setupCost: 0,
    roi: "Immediate",
    tier: "low",
    category: "tech",
    description: "Share unused internet bandwidth",
    requirements: ["Stable internet connection", "Device to run app"],
    timeCommitment: "30 minutes setup",
    difficulty: "Easy"
  },
  {
    title: "Gaming Server Hosting",
    icon: Gamepad2,
    monthlyRevenue: 45,
    provider: "GameServers",
    setupCost: 150,
    roi: "3-4 months",
    tier: "low",
    category: "tech",
    description: "Host gaming servers from home",
    requirements: ["High-speed internet", "Gaming PC", "Server software"],
    timeCommitment: "2-4 hours/week",
    difficulty: "Hard"
  },
  {
    title: "Book Library Sharing",
    icon: BookOpen,
    monthlyRevenue: 25,
    provider: "Little Free Library",
    setupCost: 75,
    roi: "3 months",
    tier: "low",
    category: "community",
    description: "Share books with community",
    requirements: ["Book collection", "Weather-resistant box"],
    timeCommitment: "1-2 hours/week",
    difficulty: "Easy"
  },
  {
    title: "Bike Repair Station",
    icon: Bike,
    monthlyRevenue: 40,
    provider: "Local Community",
    setupCost: 200,
    roi: "5 months",
    tier: "low",
    category: "community",
    description: "Provide bike repair services",
    requirements: ["Basic tools", "Repair knowledge", "Space for repairs"],
    timeCommitment: "3-5 hours/week",
    difficulty: "Medium"
  },
  {
    title: "Coffee Bean Roasting",
    icon: Coffee,
    monthlyRevenue: 35,
    provider: "Local Sales",
    setupCost: 300,
    roi: "8-10 months",
    tier: "low",
    category: "community",
    description: "Roast and sell coffee beans",
    requirements: ["Coffee roaster", "Green beans", "Food permits"],
    timeCommitment: "4-6 hours/week",
    difficulty: "Medium"
  },
  {
    title: "Music Lessons",
    icon: Music,
    monthlyRevenue: 160,
    provider: "Self-employed",
    setupCost: 0,
    roi: "Immediate",
    tier: "medium",
    category: "community",
    description: "Teach music from home studio",
    requirements: ["Musical instrument", "Teaching space", "Music knowledge"],
    timeCommitment: "5-10 hours/week",
    difficulty: "Medium"
  },
  {
    title: "Home Gym Rental",
    icon: Dumbbell,
    monthlyRevenue: 220,
    provider: "Gympass",
    setupCost: 800,
    roi: "4-5 months",
    tier: "medium",
    category: "spaceRentals",
    description: "Rent out home gym equipment",
    requirements: ["Exercise equipment", "Dedicated space", "Insurance"],
    timeCommitment: "3-5 hours/week",
    difficulty: "Easy"
  },
  {
    title: "Childcare Services",
    icon: Baby,
    monthlyRevenue: 280,
    provider: "Care.com",
    setupCost: 150,
    roi: "3 weeks",
    tier: "high",
    category: "community",
    description: "Provide childcare in your home",
    requirements: ["Background check", "First aid certification", "Child-safe environment"],
    timeCommitment: "20-40 hours/week",
    difficulty: "Hard"
  },
  {
    title: "Art Studio Rental",
    icon: Paintbrush,
    monthlyRevenue: 150,
    provider: "Peerspace",
    setupCost: 400,
    roi: "3 months",
    tier: "medium",
    category: "spaceRentals",
    description: "Rent studio space to artists",
    requirements: ["Dedicated space", "Good lighting", "Art supplies"],
    timeCommitment: "2-4 hours/week",
    difficulty: "Easy"
  },
  {
    title: "Tool Library",
    icon: Wrench,
    monthlyRevenue: 30,
    provider: "Community Tool Library",
    setupCost: 250,
    roi: "8 months",
    tier: "low",
    category: "community",
    description: "Lend tools to neighbors",
    requirements: ["Tool collection", "Storage space", "Tracking system"],
    timeCommitment: "2-3 hours/week",
    difficulty: "Easy"
  },
  {
    title: "Composting Service",
    icon: Leaf,
    monthlyRevenue: 55,
    provider: "Local Composting",
    setupCost: 100,
    roi: "2 months",
    tier: "low",
    category: "community",
    description: "Compost organic waste for neighbors",
    requirements: ["Composting setup", "Yard space", "Knowledge of composting"],
    timeCommitment: "3-4 hours/week",
    difficulty: "Medium"
  },
  {
    title: "Event Space Rental",
    icon: Users,
    monthlyRevenue: 320,
    provider: "Eventbrite",
    setupCost: 200,
    roi: "3 weeks",
    tier: "high",
    category: "spaceRentals",
    description: "Rent space for small events",
    requirements: ["Large room", "Tables/chairs", "Event insurance"],
    timeCommitment: "4-8 hours/week",
    difficulty: "Medium"
  },
  {
    title: "Grocery Pickup Point",
    icon: ShoppingBag,
    monthlyRevenue: 75,
    provider: "Instacart",
    setupCost: 0,
    roi: "Immediate",
    tier: "medium",
    category: "logistics",
    description: "Serve as pickup location for groceries",
    requirements: ["Refrigerated storage", "Reliable schedule"],
    timeCommitment: "5-8 hours/week",
    difficulty: "Easy"
  },
  {
    title: "Gift Wrapping Service",
    icon: Gift,
    monthlyRevenue: 45,
    provider: "Seasonal Business",
    setupCost: 75,
    roi: "2 months",
    tier: "low",
    category: "community",
    description: "Offer gift wrapping during holidays",
    requirements: ["Wrapping supplies", "Creative skills", "Seasonal availability"],
    timeCommitment: "10-15 hours/week (seasonal)",
    difficulty: "Easy"
  }
];

// Helper functions to categorize opportunities
export const getOpportunitiesByRevenueTier = () => {
  const high = additionalOpportunities.filter(opp => opp.tier === 'high');
  const medium = additionalOpportunities.filter(opp => opp.tier === 'medium');
  const low = additionalOpportunities.filter(opp => opp.tier === 'low');
  
  return { high, medium, low };
};

export const getOpportunitiesByCategory = () => {
  const spaceRentals = additionalOpportunities.filter(opp => opp.category === 'spaceRentals');
  const petServices = additionalOpportunities.filter(opp => opp.category === 'petServices');
  const logistics = additionalOpportunities.filter(opp => opp.category === 'logistics');
  const community = additionalOpportunities.filter(opp => opp.category === 'community');
  const tech = additionalOpportunities.filter(opp => opp.category === 'tech');
  
  return { spaceRentals, petServices, logistics, community, tech };
};
