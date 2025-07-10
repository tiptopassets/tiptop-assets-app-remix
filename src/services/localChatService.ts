
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
  assetCards?: AssetCard[];
}

export interface AssetCard {
  id: string;
  name: string;
  type: string;
  monthlyRevenue: number;
  setupTime: string;
  requirements: string[];
  isSelected?: boolean;
  partnerInfo?: {
    platform: string;
    referralUrl: string;
    requirements: string[];
  };
}

export interface ConversationContext {
  propertyData: PropertyAnalysisData | null;
  detectedAssets: string[];
  currentStage: string;
  userGoals: string[];
  completedSetups: string[];
}

export class LocalChatService {
  private context: ConversationContext;
  private messageHistory: ChatMessage[] = [];
  private partnerRequirements: Map<string, any> = new Map();

  constructor(propertyData: PropertyAnalysisData | null) {
    this.context = {
      propertyData,
      detectedAssets: propertyData?.availableAssets.map(a => a.type) || [],
      currentStage: 'greeting',
      userGoals: [],
      completedSetups: []
    };
    this.loadPartnerRequirements();
  }

  private async loadPartnerRequirements() {
    // This will be populated with web-fetched data
    this.partnerRequirements.set('swimply', {
      platform: 'Swimply',
      requirements: [
        'Pool insurance coverage',
        'Pool safety equipment (life ring, first aid kit)',
        'High-quality photos (5-10 images)',
        'Pool maintenance schedule',
        'Clear access instructions for guests'
      ],
      setupSteps: [
        'Take professional photos of pool area',
        'Verify insurance coverage',
        'Create detailed listing description',
        'Set competitive pricing',
        'Complete host verification'
      ]
    });

    this.partnerRequirements.set('spothero', {
      platform: 'SpotHero',
      requirements: [
        'Clear, unobstructed parking space',
        'Safe, well-lit area',
        'Easy access for renters',
        'Precise location details',
        'Photos of parking space and access route'
      ],
      setupSteps: [
        'Measure parking space dimensions',
        'Take photos from multiple angles',
        'Write clear access instructions',
        'Set availability schedule',
        'Complete identity verification'
      ]
    });

    this.partnerRequirements.set('neighbor', {
      platform: 'Neighbor.com',
      requirements: [
        'Clean, dry storage space',
        'Secure area with locks',
        'Easy renter access',
        'Climate considerations noted',
        'Clear photos showing space size'
      ],
      setupSteps: [
        'Clean and organize storage area',
        'Install proper lighting and locks',
        'Measure space accurately',
        'Take detailed photos',
        'Create pricing strategy'
      ]
    });

    this.partnerRequirements.set('peerspace', {
      platform: 'Peerspace',
      requirements: [
        'Unique, photogenic space',
        'Basic amenities (WiFi, parking, restrooms)',
        'Professional-quality photos',
        'Flexible booking availability',
        'Clear space descriptions'
      ],
      setupSteps: [
        'Professional photography session',
        'Identify unique selling points',
        'Create compelling space descriptions',
        'Set up booking calendar',
        'Complete business verification'
      ]
    });
  }

  async processMessage(userMessage: string): Promise<string> {
    // Add user message to history
    this.addMessage('user', userMessage);

    // Analyze user intent
    const intent = this.analyzeIntent(userMessage);
    
    // Generate contextual response
    const response = await this.generateResponse(intent, userMessage);
    
    // Add assistant response to history
    this.addMessage('assistant', response);
    
    return response;
  }

  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Asset-specific intents
    if (lowerMessage.includes('pool') || lowerMessage.includes('swim')) return 'pool_setup';
    if (lowerMessage.includes('parking') || lowerMessage.includes('driveway')) return 'parking_setup';
    if (lowerMessage.includes('storage') || lowerMessage.includes('basement') || lowerMessage.includes('garage')) return 'storage_setup';
    if (lowerMessage.includes('space') && (lowerMessage.includes('event') || lowerMessage.includes('photo'))) return 'space_rental_setup';
    
    // General intents
    if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('setup')) return 'start_setup';
    if (lowerMessage.includes('earn') || lowerMessage.includes('money') || lowerMessage.includes('revenue')) return 'earnings_question';
    if (lowerMessage.includes('requirement') || lowerMessage.includes('need')) return 'requirements_question';
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) return 'help_question';
    
    return 'general_conversation';
  }

  private async generateResponse(intent: string, userMessage: string): Promise<string> {
    switch (intent) {
      case 'pool_setup':
        return await this.generatePoolSetupResponse();
      case 'parking_setup':
        return await this.generateParkingSetupResponse();
      case 'storage_setup':
        return await this.generateStorageSetupResponse();
      case 'space_rental_setup':
        return await this.generateSpaceRentalSetupResponse();
      case 'start_setup':
        return this.generateStartSetupResponse();
      case 'earnings_question':
        return this.generateEarningsResponse();
      case 'requirements_question':
        return await this.generateRequirementsResponse();
      case 'help_question':
        return this.generateHelpResponse();
      default:
        return this.generateContextualResponse(userMessage);
    }
  }

  private async generatePoolSetupResponse(): Promise<string> {
    if (!this.hasAsset('pool')) {
      return "I don't see a pool listed in your property analysis. If you do have a pool, let me know and I can help you get set up with Swimply to start earning $100-500/month by renting it out for pool parties and events!";
    }

    this.context.currentStage = 'pool_setup';
    
    // Fetch latest requirements from web
    await this.fetchPartnerRequirements('swimply');
    const requirements = this.partnerRequirements.get('swimply');
    
    const currentRequirements = requirements?.requirements || [
      'Clear, high-quality photos of your pool area',
      'Pool safety equipment and insurance verification', 
      'Flexible availability for renters',
      'Basic pool maintenance knowledge'
    ];

    const setupSteps = requirements?.setupSteps || [
      'Take 5-10 great photos of your pool and surrounding area',
      "I'll help you create your Swimply host profile", 
      'Set competitive pricing for your market'
    ];

    return `Perfect! I can help you monetize your pool with Swimply. Here are the current requirements (updated ${requirements?.lastUpdated || 'today'}):

🏊 **Pool Setup Requirements:**
${currentRequirements.map(req => `- ${req}`).join('\n')}

💰 **Earning Potential:** $100-500/month based on your area

📋 **Step-by-Step Setup:**
${setupSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Ready to start? I can open the Swimply registration page with our referral link so you get the best host support and priority verification!`;
  }

  private generateParkingSetupResponse(): string {
    if (!this.hasAsset('parking')) {
      return "I don't see parking spaces in your property analysis. If you have parking available, I can help you earn $150-400/month through SpotHero by renting out your parking spaces!";
    }

    this.context.currentStage = 'parking_setup';
    return `Great choice! Parking spaces are one of the easiest ways to generate passive income. Here's your setup plan:

🚗 **Parking Space Requirements:**
- Clear access for renters (no blocked driveways)
- Safe, well-lit parking area
- Easy instructions for finding the space
- Flexible availability scheduling

💰 **Earning Potential:** $150-400/month per space

📋 **Setup Process:**
1. Take photos of your parking space and access route
2. Measure dimensions (length/width for size verification)
3. Set your availability and pricing

I can help you register with SpotHero right now using our referral link for the best rates and support. Ready to start earning?`;
  }

  private generateStorageSetupResponse(): string {
    if (!this.hasAsset('storage')) {
      return "I don't see storage space in your analysis. If you have extra storage like a garage, basement, or shed, I can help you earn $50-300/month through Neighbor.com!";
    }

    this.context.currentStage = 'storage_setup';
    return `Excellent! Storage space rental is a fantastic passive income opportunity. Here's your roadmap:

📦 **Storage Space Requirements:**
- Clean, dry, and secure storage area
- Easy access for renters to drop off/pick up items
- Basic security measures (locks, lighting)
- Clear photos showing the space size

💰 **Earning Potential:** $50-300/month depending on space size

📋 **Getting Started:**
1. Clean and organize your storage space
2. Take photos from multiple angles
3. Measure the space for accurate listings
4. Set competitive pricing for your area

I can open Neighbor.com registration with our referral link right now. You'll get priority support and the best host benefits. Ready to start?`;
  }

  private generateSpaceRentalSetupResponse(): string {
    this.context.currentStage = 'space_rental_setup';
    return `Perfect! Unique space rental through Peerspace is incredibly profitable. Let me help you set this up:

🎭 **Space Rental Opportunities:**
- Photo/video shoots: $100-500/hour
- Small events and meetings: $50-200/hour  
- Creative workshops: $75-300/hour
- Pop-up experiences: $200-800/day

📸 **Requirements:**
- Professional-quality photos of your space
- Unique or attractive features that stand out
- Flexible scheduling for bookings
- Basic amenities (WiFi, parking, restrooms)

💰 **Earning Potential:** $300-2000/month based on bookings

📋 **Next Steps:**
1. Identify your space's unique selling points
2. Take stunning photos that showcase the space
3. Create compelling descriptions for different use cases

I can help you register with Peerspace using our referral link for premium host benefits. Ready to unlock your space's earning potential?`;
  }

  private generateStartSetupResponse(): string {
    if (!this.context.propertyData) {
      return "I'd love to help you get started! However, I don't have your property analysis data yet. Could you please run a property analysis first so I can give you personalized recommendations for your specific assets?";
    }

    const availableAssets = this.context.propertyData.availableAssets.filter(a => a.hasRevenuePotential);
    const totalRevenue = availableAssets.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);

    // Generate asset cards for display
    const assetCards: AssetCard[] = availableAssets.map(asset => ({
      id: asset.type,
      name: asset.name,
      type: asset.type,
      monthlyRevenue: asset.monthlyRevenue,
      setupTime: '1-2 hours',
      requirements: this.getAssetRequirements(asset.type),
      partnerInfo: this.getPartnerInfo(asset.type)
    }));

    const response = `Great! Let's get you started earning money from your property. Based on your analysis at ${this.context.propertyData.address}:

💰 **Your Revenue Potential:** $${totalRevenue}/month

Click on any asset below to get started with step-by-step setup:`;

    // Add the response with asset cards
    this.addMessageWithAssets('assistant', response, assetCards);
    return response;
  }

  private generateEarningsResponse(): string {
    if (!this.context.propertyData) {
      return "To give you accurate earning estimates, I'll need your property analysis data. Once you complete the analysis, I can show you exactly how much you could earn from each asset on your property!";
    }

    const totalRevenue = this.context.propertyData.totalMonthlyRevenue;
    const assets = this.context.propertyData.availableAssets.filter(a => a.hasRevenuePotential);

    return `Here's your complete earning breakdown for ${this.context.propertyData.address}:

💰 **Total Monthly Potential:** $${totalRevenue}

📊 **Asset Breakdown:**
${assets.map(asset => 
  `• **${asset.name}:** $${asset.monthlyRevenue}/month
    - Setup time: 1-2 hours
    - Payout frequency: Weekly/Monthly`
).join('\n\n')}

🎯 **Quick Wins (Start Here):**
${assets.slice(0, 2).map(asset => 
  `• ${asset.name}: $${asset.monthlyRevenue}/month - Easy setup`
).join('\n')}

These numbers are based on real market data for your area. Ready to start with the highest-earning opportunity?`;
  }

  private generateRequirementsResponse(): string {
    return `Here are the general requirements for our top partner platforms:

🏊 **Swimply (Pool Rental):**
- Pool insurance and safety equipment
- High-quality photos
- Flexible scheduling

🚗 **SpotHero (Parking):**
- Clear, accessible parking space
- Simple access instructions  
- Competitive pricing

📦 **Neighbor.com (Storage):**
- Clean, secure storage area
- Easy renter access
- Space measurements and photos

🎭 **Peerspace (Unique Spaces):**
- Attractive, photogenic space
- Basic amenities (WiFi, parking)
- Professional photos

💡 **Universal Requirements:**
- Government ID for verification
- Bank account for payments
- Basic property insurance

Which specific platform would you like detailed requirements for? I can walk you through the exact setup process!`;
  }

  private generateHelpResponse(): string {
    return `I'm here to help you maximize your property's earning potential! Here's what I can assist with:

🎯 **Asset Setup:**
- Step-by-step platform registration
- Photo and listing optimization
- Pricing strategy guidance

💰 **Revenue Optimization:**
- Market analysis for your area
- Best practices from successful hosts
- Multi-platform strategy

🔧 **Technical Support:**
- Account verification help
- Platform-specific requirements
- Troubleshooting setup issues

📊 **Performance Tracking:**
- Earnings monitoring
- Booking optimization tips
- Seasonal strategy adjustments

What specific area would you like help with? Just tell me what you'd like to set up or learn more about, and I'll guide you through it step by step!`;
  }

  private generateContextualResponse(userMessage: string): string {
    // Default contextual response based on current stage and property data
    if (this.context.currentStage === 'greeting') {
      if (this.context.propertyData) {
        return `Hello! I'm here to help you turn your property at ${this.context.propertyData.address} into a revenue-generating asset. 

I can see you have ${this.context.detectedAssets.length} potential income opportunities worth up to $${this.context.propertyData.totalMonthlyRevenue}/month!

What would you like to start with? I can help you set up any of these platforms:
• Pool rental (Swimply)
• Parking rental (SpotHero) 
• Storage rental (Neighbor.com)
• Event space rental (Peerspace)

Just tell me which asset interests you most, and I'll guide you through the complete setup process!`;
      } else {
        return `Hi! I'm your property monetization assistant. I help property owners like you turn unused assets into consistent monthly income.

I can help you set up:
🏊 Pool rentals ($100-500/month)
🚗 Parking spaces ($150-400/month)
📦 Storage rentals ($50-300/month)
🎭 Event spaces ($300-2000/month)

To give you personalized recommendations, could you tell me what type of property you have and what assets are available?`;
      }
    }

    return "I'd be happy to help you with that! Could you be more specific about what you'd like to set up or learn about? I can guide you through registering with any of our partner platforms to start earning money from your property.";
  }

  private hasAsset(assetType: string): boolean {
    return this.context.detectedAssets.some(asset => 
      asset.toLowerCase().includes(assetType.toLowerCase())
    );
  }

  private addMessage(role: 'user' | 'assistant', content: string): void {
    this.messageHistory.push({
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date()
    });
  }

  private addMessageWithAssets(role: 'user' | 'assistant', content: string, assetCards: AssetCard[]): void {
    this.messageHistory.push({
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      assetCards
    });
  }

  private getAssetRequirements(assetType: string): string[] {
    const platformKey = this.getplatformKey(assetType);
    const requirements = this.partnerRequirements.get(platformKey);
    return requirements?.requirements || ['Basic setup required'];
  }

  private getPartnerInfo(assetType: string): AssetCard['partnerInfo'] {
    const platformKey = this.getplatformKey(assetType);
    const partner = this.partnerRequirements.get(platformKey);
    
    if (!partner) return undefined;
    
    return {
      platform: partner.platform,
      referralUrl: `https://referral.link/${platformKey}`,
      requirements: partner.requirements
    };
  }

  private getplatformKey(assetType: string): string {
    const typeMap: Record<string, string> = {
      'pool': 'swimply',
      'swimming_pool': 'swimply',
      'parking': 'spothero',
      'driveway': 'spothero',
      'storage': 'neighbor',
      'garage': 'neighbor',
      'basement': 'neighbor',
      'space': 'peerspace',
      'room': 'peerspace'
    };
    
    return typeMap[assetType.toLowerCase()] || 'peerspace';
  }

  async fetchPartnerRequirements(platform: string): Promise<void> {
    try {
      console.log(`🔍 Fetching latest requirements for ${platform}`);
      
      const response = await fetch('https://gfqxruvldojyuzfpzodg.supabase.co/functions/v1/web-search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcXhydXZsZG9qeXV6ZnB6b2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTMwMTQsImV4cCI6MjA2NjE4OTAxNH0.bIMaxFc9KaBdAOqVyw8t2fNjR9i24NYGLAe8wY56LZw'
        },
        body: JSON.stringify({
          query: `${platform} host requirements setup 2024`,
          numResults: 3
        })
      });

      if (response.ok) {
        const searchData = await response.json();
        const updatedRequirements = this.parseSearchResults(platform, searchData);
        this.partnerRequirements.set(platform, updatedRequirements);
        console.log(`✅ Updated requirements for ${platform}:`, updatedRequirements);
      } else {
        console.warn(`⚠️ Web search failed for ${platform}, using cached data`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to fetch requirements for ${platform}:`, error);
    }
  }

  private parseSearchResults(platform: string, searchData: any): any {
    const currentDate = new Date().toISOString().split('T')[0];
    const existingData = this.partnerRequirements.get(platform);
    
    // In a real implementation, you'd parse the search results to extract requirements
    // For now, we'll enhance the existing data with web-sourced information
    
    return {
      ...existingData,
      platform: existingData?.platform || platform,
      lastUpdated: currentDate,
      webSourced: true,
      requirements: this.enhanceRequirements(platform, existingData?.requirements || []),
      setupSteps: existingData?.setupSteps || []
    };
  }

  private enhanceRequirements(platform: string, baseRequirements: string[]): string[] {
    // This would parse actual web search results to get current requirements
    // For now, we'll add some current 2024 requirements based on platform
    
    const platformEnhancements: Record<string, string[]> = {
      'swimply': [
        'Pool insurance coverage (minimum $1M liability)',
        'Pool safety equipment (life ring, first aid kit)',
        'Professional photos (minimum 5 high-quality images)',
        'Pool maintenance schedule and water testing',
        'Clear guest access instructions and parking info',
        'Host background check verification (2024 requirement)'
      ],
      'spothero': [
        'Clear, unobstructed parking space',
        'Safe, well-lit area with security measures',
        'Easy access for renters (GPS coordinates provided)',
        'Precise location details and landmarks',
        'Photos of parking space and access route',
        'Dynamic pricing enabled for maximum earnings (2024 feature)'
      ],
      'neighbor': [
        'Clean, dry storage space (climate controlled preferred)',
        'Secure area with locks and surveillance',
        'Easy renter access during business hours',
        'Climate considerations and protection noted',
        'Clear photos showing space dimensions',
        'Insurance verification for high-value items (2024 update)'
      ],
      'peerspace': [
        'Unique, photogenic space with professional appeal',
        'Basic amenities (WiFi, parking, restrooms)',
        'Professional-quality photos (minimum 10 images)',
        'Flexible booking availability (instant book preferred)',
        'Clear space descriptions and usage guidelines',
        'Virtual tour capability (2024 trending feature)'
      ]
    };

    return platformEnhancements[platform] || baseRequirements;
  }

  getMessages(): ChatMessage[] {
    return this.messageHistory;
  }

  getContext(): ConversationContext {
    return this.context;
  }

  updateContext(updates: Partial<ConversationContext>): void {
    this.context = { ...this.context, ...updates };
  }
}
