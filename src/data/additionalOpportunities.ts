
import { AdditionalOpportunity } from '@/types/analysis';

export const additionalOpportunities: AdditionalOpportunity[] = [
  // High Revenue Tier ($200+ /month)
  {
    title: "Airbnb Rental",
    icon: "storage",
    monthlyRevenue: 1200,
    description: "Rent out your property or unit on Airbnb for consistent income.",
    provider: "Airbnb",
    referralLink: "https://www.airbnb.com/rp/eduardos73?p=stay&s=67&unique_share_id=b4245d92-dcf3-4666-9450-d809ab89e897",
    setupCost: 2500,
    roi: 2,
    formFields: [
      { type: "select", name: "unitType", label: "Property Type", value: "Studio", options: ["Studio", "1 Bedroom", "2 Bedroom"] },
      { type: "select", name: "amenities", label: "Included Amenities", value: "Basic", options: ["Basic", "Standard", "Luxury"] },
      { type: "select", name: "availability", label: "Availability", value: "Full-time", options: ["Weekends", "Part-time", "Full-time"] }
    ]
  },
  {
    title: "Rent Your Pool",
    icon: "swimming-pool",
    monthlyRevenue: 450,
    description: "Transform your pool into a revenue stream by renting it out by the hour.",
    provider: "Swimply",
    setupCost: 0,
    roi: 1,
    formFields: [
      { type: "number", name: "capacity", label: "Max Capacity (people)", value: 8 },
      { type: "select", name: "amenities", label: "Pool Amenities", value: "Basic", options: ["Basic", "Standard", "Premium"] },
      { type: "select", name: "availability", label: "Rental Hours", value: "Weekends", options: ["Weekends", "Evenings", "Full Day"] }
    ]
  },
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
    title: "Event Space Rental (Large)",
    icon: "storage",
    monthlyRevenue: 320,
    description: "Rent out large rooms for events, meetings, and celebrations.",
    provider: "Eventbrite",
    setupCost: 200,
    roi: 1,
    formFields: [
      { type: "number", name: "capacity", label: "Max Capacity (people)", value: 50 },
      { type: "select", name: "insurance", label: "Event Insurance", value: "Basic", options: ["Basic", "Comprehensive"] },
      { type: "select", name: "setup", label: "Event Setup", value: "Client", options: ["Client", "Included", "Optional"] }
    ]
  },
  {
    title: "EV Charging Station",
    icon: "ev-charger",
    monthlyRevenue: 300,
    description: "Install and rent out electric vehicle charging stations.",
    provider: "ChargePoint",
    setupCost: 1500,
    roi: 5,
    formFields: [
      { type: "select", name: "chargerType", label: "Charger Type", value: "Level 2", options: ["Level 1", "Level 2", "DC Fast"] },
      { type: "number", name: "parkingSpots", label: "Parking Spots", value: 2 },
      { type: "select", name: "electricalUpgrade", label: "Electrical Upgrade", value: "Required", options: ["Required", "Optional", "Not Needed"] }
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
    title: "Childcare Services",
    icon: "garden",
    monthlyRevenue: 280,
    description: "Provide professional childcare services from your home.",
    provider: "Care.com",
    setupCost: 150,
    roi: 1,
    formFields: [
      { type: "number", name: "childCapacity", label: "Max Children", value: 4 },
      { type: "select", name: "ageRange", label: "Age Range", value: "All Ages", options: ["Infants", "Toddlers", "School Age", "All Ages"] },
      { type: "select", name: "certification", label: "Certification Level", value: "Basic", options: ["Basic", "CPR Certified", "Professional"] }
    ]
  },
  {
    title: "Home Gym Rental",
    icon: "storage",
    monthlyRevenue: 220,
    description: "Rent out your home gym space for personal training sessions.",
    provider: "Gympass",
    setupCost: 800,
    roi: 4,
    formFields: [
      { type: "select", name: "equipment", label: "Equipment Level", value: "Basic", options: ["Basic", "Intermediate", "Professional"] },
      { type: "number", name: "capacity", label: "Max Users", value: 3 },
      { type: "select", name: "hours", label: "Available Hours", value: "Evenings", options: ["Mornings", "Evenings", "Weekends", "All Day"] }
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

  // Medium Revenue Tier ($100-199/month)
  {
    title: "Dog Boarding",
    icon: "garden",
    monthlyRevenue: 180,
    description: "Provide dog boarding services in your fenced yard.",
    provider: "Rover",
    setupCost: 100,
    roi: 1,
    formFields: [
      { type: "number", name: "dogCapacity", label: "Max Dogs", value: 3 },
      { type: "select", name: "yardSize", label: "Yard Size", value: "Medium", options: ["Small", "Medium", "Large"] },
      { type: "select", name: "experience", label: "Experience Level", value: "Beginner", options: ["Beginner", "Experienced", "Professional"] }
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
    title: "Music Lessons",
    icon: "storage",
    monthlyRevenue: 160,
    description: "Teach music lessons from your home studio space.",
    setupCost: 0,
    roi: 1,
    formFields: [
      { type: "select", name: "instrument", label: "Primary Instrument", value: "Piano", options: ["Piano", "Guitar", "Drums", "Voice", "Multiple"] },
      { type: "select", name: "studentLevel", label: "Student Level", value: "Beginner", options: ["Beginner", "Intermediate", "Advanced", "All Levels"] },
      { type: "number", name: "hoursPerWeek", label: "Teaching Hours/Week", value: 5 }
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
  {
    title: "Art Studio Space",
    icon: "art",
    monthlyRevenue: 150,
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
    title: "Gaming Server Hosting",
    icon: "wifi",
    monthlyRevenue: 150,
    description: "Host gaming servers for online communities.",
    provider: "GameServers",
    setupCost: 150,
    roi: 3,
    formFields: [
      { type: "select", name: "gameType", label: "Game Type", value: "Minecraft", options: ["Minecraft", "CS:GO", "Rust", "Multiple"] },
      { type: "number", name: "players", label: "Max Players", value: 20 },
      { type: "select", name: "serverType", label: "Server Type", value: "Shared", options: ["Shared", "Dedicated", "VPS"] }
    ]
  },
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
    title: "Package Storage",
    icon: "storage",
    monthlyRevenue: 120,
    description: "Secure package receiving and storage for neighbors.",
    provider: "Stashbee",
    setupCost: 50,
    roi: 1,
    formFields: [
      { type: "number", name: "storageCapacity", label: "Package Capacity", value: 20 },
      { type: "select", name: "security", label: "Security Level", value: "Standard", options: ["Basic", "Standard", "High Security"] },
      { type: "select", name: "hours", label: "Access Hours", value: "Business", options: ["24/7", "Extended", "Business"] }
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
    title: "Home Security Monitoring",
    icon: "wifi",
    monthlyRevenue: 95,
    description: "Provide home security monitoring services using smart cameras.",
    provider: "Nest Aware",
    setupCost: 300,
    roi: 3,
    formFields: [
      { type: "number", name: "cameras", label: "Number of Cameras", value: 4 },
      { type: "select", name: "coverage", label: "Coverage Area", value: "Full Property", options: ["Entry Points", "Partial", "Full Property"] },
      { type: "select", name: "monitoring", label: "Monitoring Level", value: "24/7", options: ["Business Hours", "Extended", "24/7"] }
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
    title: "Garden Produce Sales",
    icon: "garden",
    monthlyRevenue: 85,
    description: "Sell fresh produce from your garden at local markets.",
    provider: "Local Markets",
    setupCost: 200,
    roi: 3,
    formFields: [
      { type: "select", name: "produceType", label: "Produce Type", value: "Vegetables", options: ["Vegetables", "Fruits", "Herbs", "Mixed"] },
      { type: "select", name: "certification", label: "Organic Certification", value: "No", options: ["No", "In Progress", "Certified"] },
      { type: "number", name: "gardenSize", label: "Garden Size (sq ft)", value: 100 }
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
  {
    title: "Grocery Pickup Point",
    icon: "storage",
    monthlyRevenue: 75,
    description: "Serve as a grocery pickup point for delivery services.",
    provider: "Instacart",
    setupCost: 0,
    roi: 1,
    formFields: [
      { type: "select", name: "storageType", label: "Storage Type", value: "Refrigerated", options: ["Dry", "Refrigerated", "Both"] },
      { type: "number", name: "capacity", label: "Order Capacity", value: 10 },
      { type: "select", name: "availability", label: "Pickup Hours", value: "Business", options: ["Business", "Extended", "24/7"] }
    ]
  },

  // Lower Revenue Tier ($25-74/month)
  {
    title: "Composting Service",
    icon: "garden",
    monthlyRevenue: 55,
    description: "Provide composting services for your local community.",
    provider: "Local Composting",
    setupCost: 100,
    roi: 2,
    formFields: [
      { type: "select", name: "compostType", label: "Composting Method", value: "Bin", options: ["Bin", "Tumbler", "Pile", "Vermicomposting"] },
      { type: "number", name: "capacity", label: "Weekly Capacity (lbs)", value: 50 },
      { type: "select", name: "pickup", label: "Pickup Schedule", value: "Weekly", options: ["Bi-weekly", "Weekly", "On-demand"] }
    ]
  },
  {
    title: "Gift Wrapping Service",
    icon: "storage",
    monthlyRevenue: 45,
    description: "Seasonal gift wrapping service for holidays and special occasions.",
    setupCost: 75,
    roi: 2,
    formFields: [
      { type: "select", name: "season", label: "Service Season", value: "Holiday", options: ["Holiday", "Year-round", "Special Events"] },
      { type: "select", name: "complexity", label: "Wrapping Complexity", value: "Standard", options: ["Basic", "Standard", "Premium"] },
      { type: "number", name: "capacity", label: "Gifts per Week", value: 20 }
    ]
  },
  {
    title: "Bike Repair Station",
    icon: "storage",
    monthlyRevenue: 40,
    description: "Community bike repair station with tools and expertise.",
    provider: "Local Community",
    setupCost: 200,
    roi: 5,
    formFields: [
      { type: "select", name: "services", label: "Repair Services", value: "Basic", options: ["Basic", "Advanced", "Full Service"] },
      { type: "number", name: "tools", label: "Tool Set Size", value: 15 },
      { type: "select", name: "expertise", label: "Repair Expertise", value: "Intermediate", options: ["Beginner", "Intermediate", "Expert"] }
    ]
  },
  {
    title: "Internet Bandwidth Sharing",
    icon: "wifi",
    monthlyRevenue: 35,
    description: "Share unused internet bandwidth for passive income.",
    provider: "Honeygain",
    setupCost: 0,
    roi: 1,
    formFields: [
      { type: "select", name: "speed", label: "Internet Speed", value: "High", options: ["Medium", "High", "Very High"] },
      { type: "number", name: "devices", label: "Connected Devices", value: 3 },
      { type: "select", name: "dataLimit", label: "Data Limit", value: "Unlimited", options: ["Limited", "High", "Unlimited"] }
    ]
  },
  {
    title: "Coffee Bean Roasting",
    icon: "storage",
    monthlyRevenue: 35,
    description: "Roast and sell coffee beans to local cafes and customers.",
    provider: "Local Sales",
    setupCost: 300,
    roi: 8,
    formFields: [
      { type: "select", name: "roasterSize", label: "Roaster Size", value: "Small", options: ["Small", "Medium", "Large"] },
      { type: "select", name: "beanType", label: "Bean Types", value: "Single Origin", options: ["Single Origin", "Blends", "Both"] },
      { type: "number", name: "weeklyCapacity", label: "Weekly Capacity (lbs)", value: 10 }
    ]
  },
  {
    title: "Tool Library",
    icon: "storage",
    monthlyRevenue: 30,
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
    title: "Book Library Sharing",
    icon: "storage",
    monthlyRevenue: 25,
    description: "Little Free Library for community book sharing.",
    provider: "Little Free Library",
    setupCost: 75,
    roi: 3,
    formFields: [
      { type: "number", name: "bookCapacity", label: "Book Capacity", value: 50 },
      { type: "select", name: "genres", label: "Book Genres", value: "Mixed", options: ["Children", "Fiction", "Non-fiction", "Mixed"] },
      { type: "select", name: "location", label: "Library Location", value: "Front Yard", options: ["Front Yard", "Community", "School"] }
    ]
  }
];

export const getOpportunitiesByRevenueTier = () => {
  const high = additionalOpportunities.filter(opp => opp.monthlyRevenue >= 200);
  const medium = additionalOpportunities.filter(opp => opp.monthlyRevenue >= 75 && opp.monthlyRevenue < 200);
  const low = additionalOpportunities.filter(opp => opp.monthlyRevenue < 75);
  
  return { high, medium, low };
};

export const getOpportunitiesByCategory = () => {
  const spaceRentals = additionalOpportunities.filter(opp => 
    ['Airbnb Rental', 'Event Space Rental', 'Event Space Rental (Large)', 'Co-working Space', 'Photography Studio', 'Content Creator Studio', 'Fitness Studio', 'Art Studio Space', 'Home Gym Rental', 'Game Room Rental', 'Music Practice Room', 'Meeting Room Rental'].includes(opp.title)
  );
  
  const petServices = additionalOpportunities.filter(opp => 
    ['Dog Boarding', 'Childcare Services'].includes(opp.title)
  );
  
  const logistics = additionalOpportunities.filter(opp => 
    ['Package Storage', 'Bike Repair Station', 'Tool Library', 'Grocery Pickup Point'].includes(opp.title)
  );
  
  const community = additionalOpportunities.filter(opp => 
    ['Workshop Space', 'Book Library Sharing', 'Composting Service', 'Coffee Bean Roasting'].includes(opp.title)
  );
  
  const tech = additionalOpportunities.filter(opp => 
    ['EV Charging Station', 'Internet Bandwidth Sharing', 'Gaming Server Hosting', 'Home Security Monitoring'].includes(opp.title)
  );
  
  const homeServices = additionalOpportunities.filter(opp => 
    ['Rent Your Pool', 'Music Lessons', 'Gift Wrapping Service', 'Garden Produce Sales'].includes(opp.title)
  );
  
  return { spaceRentals, petServices, logistics, community, tech, homeServices };
};
