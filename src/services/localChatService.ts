
import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
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

  constructor(propertyData: PropertyAnalysisData | null) {
    this.context = {
      propertyData,
      detectedAssets: propertyData?.availableAssets.map(a => a.type) || [],
      currentStage: 'greeting',
      userGoals: [],
      completedSetups: []
    };
  }

  async processMessage(userMessage: string): Promise<string> {
    // Add user message to history
    this.addMessage('user', userMessage);

    // Analyze user intent
    const intent = this.analyzeIntent(userMessage);
    
    // Generate contextual response
    const response = this.generateResponse(intent, userMessage);
    
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

  private generateResponse(intent: string, userMessage: string): string {
    switch (intent) {
      case 'pool_setup':
        return this.generatePoolSetupResponse();
      case 'parking_setup':
        return this.generateParkingSetupResponse();
      case 'storage_setup':
        return this.generateStorageSetupResponse();
      case 'space_rental_setup':
        return this.generateSpaceRentalSetupResponse();
      case 'start_setup':
        return this.generateStartSetupResponse();
      case 'earnings_question':
        return this.generateEarningsResponse();
      case 'requirements_question':
        return this.generateRequirementsResponse();
      case 'help_question':
        return this.generateHelpResponse();
      default:
        return this.generateContextualResponse(userMessage);
    }
  }

  private generatePoolSetupResponse(): string {
    if (!this.hasAsset('pool')) {
      return "I don't see a pool listed in your property analysis. If you do have a pool, let me know and I can help you get set up with Swimply to start earning $100-500/month by renting it out for pool parties and events!";
    }

    this.context.currentStage = 'pool_setup';
    return `Perfect! I can help you monetize your pool with Swimply. Here's what you'll need:

🏊 **Pool Setup Requirements:**
- Clear, high-quality photos of your pool area
- Pool safety equipment and insurance verification
- Flexible availability for renters
- Basic pool maintenance knowledge

💰 **Earning Potential:** $100-500/month based on your area

📋 **Next Steps:**
1. Take 5-10 great photos of your pool and surrounding area
2. I'll help you create your Swimply host profile
3. Set competitive pricing for your market

Ready to start? I can open the Swimply registration page with our referral link so you get the best host support!`;
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

    return `Great! Let's get you started earning money from your property. Based on your analysis at ${this.context.propertyData.address}:

💰 **Your Revenue Potential:** $${totalRevenue}/month

🏠 **Available Opportunities:**
${availableAssets.map(asset => 
  `• ${asset.name}: $${asset.monthlyRevenue}/month`
).join('\n')}

🚀 **Recommended Starting Order:**
1. **${availableAssets[0]?.name}** - Highest revenue potential ($${availableAssets[0]?.monthlyRevenue}/month)
2. **${availableAssets[1]?.name}** - Quick setup ($${availableAssets[1]?.monthlyRevenue}/month)

Which asset would you like to start with? I'll guide you through the complete setup process and help you register with our partner platforms using referral links that give you the best benefits!`;
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
