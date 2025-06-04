
import { AdditionalOpportunity } from '@/types/analysis';

export const additionalOpportunities: AdditionalOpportunity[] = [
  // High Revenue Tier ($100-400/month)
  {
    title: "Event Space Rental",
    icon: "garden",
    monthlyRevenue: 350,
    description: "Transform your space into a venue for parties, meetings, and celebrations.",
    provider: "Peerspace",
    setupCost: 200,
    roi: 1,
    formFields: [
      { type: "number", name: "capacity", label: "Max Capacity (people)", value: 30 },
      { type: "select", name: "spaceType", label: "Space Type", value: "Indoor", options: ["Indoor", "Outdoor", "Both"] },
      { type: "select", name: "amenities", label: "Included Amenities", value: "Basic", options: ["Basic", "Standard", "Premium"] },
      { type: "select", name: "eventTypes", label: "Suitable Event Types", value: "All", options: ["Parties", "Meetings", "Workshops", "All"] }
    ]
  },
  {
    title: "Co-working Space",
    icon: "storage",
    monthlyRevenue: 280,
    description: "Rent out rooms or areas as dedicated workspace for remote workers.",
    provider: "Breather",
    setupCost: 500,
    roi: 2,
    formFields: [
      { type: "number", name: "desks", label: "Number of Desks", value: 4 },
      { type: "select", name: "privacy", label: "Privacy Level", value: "Semi-private", options: ["Open", "Semi-private", "Private"] },
      { type: "select", name: "equipment", label: "Equipment Provided", value: "Basic", options: ["None", "Basic", "Full Setup"] }
    ]
  },
  {
    title: "Photography Studio",
    icon: "storage",
    monthlyRevenue: 220,
    description: "Convert spaces into rental photography or videography studios.",
    provider: "Peerspace",
    setupCost: 300,
    roi: 2,
    formFields: [
      { type: "select", name: "lighting", label: "Lighting Setup", value: "Natural", options: ["Natural", "Basic", "Professional"] },
      { type: "number", name: "spaceSize", label: "Studio Size (sq ft)", value: 200 },
      { type: "select", name: "backdrop", label: "Backdrop Options", value: "Wall", options: ["Wall", "Portable", "Multiple"] }
    ]
  },
  {
    title: "Content Creator Studio",
    icon: "wifi",
    monthlyRevenue: 180,
    description: "Specialized space for YouTubers, podcasters, and content creators.",
    provider: "Peerspace",
    setupCost: 400,
    roi: 3,
    formFields: [
      { type: "select", name: "equipment", label: "Recording Equipment", value: "Audio Only", options: ["Audio Only", "Video Basic", "Full Production"] },
      { type: "select", name: "acoustics", label: "Sound Treatment", value: "Basic", options: ["None", "Basic", "Professional"] },
      { type: "number", name: "capacity", label: "Creator Capacity", value: 2 }
    ]
  },
  {
    title: "Fitness Studio",
    icon: "garden",
    monthlyRevenue: 160,
    description: "Transform garage or basement into rentable fitness space.",
    provider: "Splacer",
    setupCost: 600,
    roi: 4,
    formFields: [
      { type: "select", name: "fitnessType", label: "Fitness Type", value: "General", options: ["Yoga", "Dance", "General", "Martial Arts"] },
      { type: "number", name: "equipment", label: "Equipment Pieces", value: 5 },
      { type: "select", name: "flooring", label: "Flooring Type", value: "Mats", options: ["Carpet", "Mats", "Hardwood", "Rubber"] }
    ]
  },

  // Medium Revenue Tier ($50-150/month)
  {
    title: "Workshop Space",
    icon: "storage",
    monthlyRevenue: 120,
    description: "Shared workshop for DIY projects, crafts, and repairs.",
    setupCost: 300,
    roi: 3,
    formFields: [
      { type: "number", name: "toolsProvided", label: "Tools Provided", value: 10 },
      { type: "select", name: "workspaceType", label: "Workshop Type", value: "General", options: ["Woodworking", "Electronics", "Crafts", "General"] },
      { type: "select", name: "safety", label: "Safety Equipment", value: "Basic", options: ["Basic", "Standard", "Complete"] }
    ]
  },
  {
    title: "Game Room Rental",
    icon: "storage",
    monthlyRevenue: 100,
    description: "Rent out game rooms for parties and entertainment.",
    setupCost: 400,
    roi: 4,
    formFields: [
      { type: "select", name: "gameTypes", label: "Game Types", value: "Mixed", options: ["Video Games", "Board Games", "Pool/Billiards", "Mixed"] },
      { type: "number", name: "capacity", label: "Max Players", value: 8 },
      { type: "select", name: "equipment", label: "Equipment Quality", value: "Standard", options: ["Basic", "Standard", "Premium"] }
    ]
  },
  {
    title: "Music Practice Room",
    icon: "storage",
    monthlyRevenue: 90,
    description: "Soundproofed space for musicians to practice and record.",
    setupCost: 500,
    roi: 6,
    formFields: [
      { type: "select", name: "instruments", label: "Instruments Provided", value: "None", options: ["None", "Basic", "Full Band Setup"] },
      { type: "select", name: "soundproofing", label: "Soundproofing Level", value: "Basic", options: ["None", "Basic", "Professional"] },
      { type: "number", name: "hourlyRate", label: "Hourly Rate ($)", value: 15 }
    ]
  },
  {
    title: "Art Studio Space",
    icon: "storage",
    monthlyRevenue: 85,
    description: "Creative space for artists, painters, and crafters.",
    setupCost: 250,
    roi: 3,
    formFields: [
      { type: "select", name: "artType", label: "Art Focus", value: "General", options: ["Painting", "Sculpture", "Digital", "General"] },
      { type: "select", name: "supplies", label: "Supplies Included", value: "Basic", options: ["None", "Basic", "Complete"] },
      { type: "number", name: "easels", label: "Number of Easels", value: 3 }
    ]
  },
  {
    title: "Meeting Room Rental",
    icon: "storage",
    monthlyRevenue: 75,
    description: "Professional meeting space for small businesses.",
    setupCost: 200,
    roi: 3,
    formFields: [
      { type: "number", name: "seating", label: "Seating Capacity", value: 8 },
      { type: "select", name: "techSetup", label: "Tech Equipment", value: "Basic", options: ["None", "Basic", "Full AV"] },
      { type: "select", name: "catering", label: "Catering Options", value: "None", options: ["None", "Basic", "Full Service"] }
    ]
  },

  // Lower Revenue Tier ($15-80/month)
  {
    title: "Pet Daycare Service",
    icon: "garden",
    monthlyRevenue: 60,
    description: "Supervised pet care in your yard or dedicated space.",
    setupCost: 150,
    roi: 3,
    formFields: [
      { type: "number", name: "petCapacity", label: "Max Pets", value: 5 },
      { type: "select", name: "petTypes", label: "Pet Types", value: "Dogs Only", options: ["Dogs Only", "Cats Only", "Both", "Small Pets"] },
      { type: "select", name: "supervision", label: "Supervision Level", value: "Moderate", options: ["Light", "Moderate", "Full"] }
    ]
  },
  {
    title: "Package Storage Hub",
    icon: "storage",
    monthlyRevenue: 45,
    description: "Secure package receiving and storage for neighbors.",
    setupCost: 100,
    roi: 3,
    formFields: [
      { type: "number", name: "storageCapacity", label: "Package Capacity", value: 20 },
      { type: "select", name: "security", label: "Security Level", value: "Standard", options: ["Basic", "Standard", "High Security"] },
      { type: "select", name: "hours", label: "Access Hours", value: "Business", options: ["24/7", "Extended", "Business"] }
    ]
  },
  {
    title: "Bike Storage & Repair",
    icon: "storage",
    monthlyRevenue: 40,
    description: "Secure bike storage with basic maintenance services.",
    setupCost: 200,
    roi: 5,
    formFields: [
      { type: "number", name: "bikeCapacity", label: "Bike Capacity", value: 8 },
      { type: "select", name: "repairServices", label: "Repair Services", value: "Basic", options: ["Storage Only", "Basic", "Full Service"] },
      { type: "select", name: "security", label: "Security Features", value: "Locked", options: ["Basic", "Locked", "Monitored"] }
    ]
  },
  {
    title: "Tool Library",
    icon: "storage",
    monthlyRevenue: 35,
    description: "Community tool sharing and rental service.",
    setupCost: 300,
    roi: 9,
    formFields: [
      { type: "number", name: "toolCount", label: "Number of Tools", value: 15 },
      { type: "select", name: "toolTypes", label: "Tool Categories", value: "Basic", options: ["Basic Hand Tools", "Power Tools", "Specialized", "Complete"] },
      { type: "select", name: "maintenance", label: "Maintenance Level", value: "Regular", options: ["Basic", "Regular", "Professional"] }
    ]
  },
  {
    title: "Laundry Service",
    icon: "storage",
    monthlyRevenue: 30,
    description: "Shared laundry facilities for apartment residents.",
    setupCost: 800,
    roi: 27,
    formFields: [
      { type: "number", name: "machines", label: "Number of Machines", value: 2 },
      { type: "select", name: "paymentSystem", label: "Payment System", value: "Coin", options: ["Coin", "App-based", "Card"] },
      { type: "select", name: "detergent", label: "Detergent Provided", value: "Optional", options: ["No", "Optional", "Included"] }
    ]
  },
  {
    title: "Smart Charging Station",
    icon: "wifi",
    monthlyRevenue: 25,
    description: "Device charging hub with WiFi access for community use.",
    setupCost: 150,
    roi: 6,
    formFields: [
      { type: "number", name: "chargingPorts", label: "Charging Ports", value: 8 },
      { type: "select", name: "deviceTypes", label: "Supported Devices", value: "Universal", options: ["Phone Only", "Tablets", "Laptops", "Universal"] },
      { type: "select", name: "wifiAccess", label: "WiFi Access", value: "Included", options: ["None", "Basic", "Premium", "Included"] }
    ]
  }
];

export const getOpportunitiesByRevenueTier = () => {
  const high = additionalOpportunities.filter(opp => opp.monthlyRevenue >= 150);
  const medium = additionalOpportunities.filter(opp => opp.monthlyRevenue >= 50 && opp.monthlyRevenue < 150);
  const low = additionalOpportunities.filter(opp => opp.monthlyRevenue < 50);
  
  return { high, medium, low };
};

export const getOpportunitiesByCategory = () => {
  const spaceRentals = additionalOpportunities.filter(opp => 
    ['Event Space Rental', 'Co-working Space', 'Photography Studio', 'Content Creator Studio', 'Fitness Studio', 'Game Room Rental', 'Music Practice Room', 'Art Studio Space', 'Meeting Room Rental'].includes(opp.title)
  );
  
  const petServices = additionalOpportunities.filter(opp => 
    ['Pet Daycare Service'].includes(opp.title)
  );
  
  const logistics = additionalOpportunities.filter(opp => 
    ['Package Storage Hub', 'Bike Storage & Repair'].includes(opp.title)
  );
  
  const community = additionalOpportunities.filter(opp => 
    ['Workshop Space', 'Tool Library', 'Laundry Service'].includes(opp.title)
  );
  
  const tech = additionalOpportunities.filter(opp => 
    ['Smart Charging Station'].includes(opp.title)
  );
  
  return { spaceRentals, petServices, logistics, community, tech };
};
