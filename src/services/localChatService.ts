import { PropertyAnalysisData } from '@/hooks/useUserPropertyAnalysis';
import { PartnerIntegrationService } from './partnerIntegrationService';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  partnerOptions?: any[];
  assetType?: string;
  detectedAssets?: string[];
}

export class LocalChatService {
  private messages: ChatMessage[] = [];
  private propertyData: PropertyAnalysisData | null = null;
  private context: any = {};

  constructor(propertyData: PropertyAnalysisData | null = null) {
    this.propertyData = propertyData;
    console.log('🏠 [LOCAL_CHAT_SERVICE] Initialized with property data:', {
      hasPropertyData: !!propertyData,
      address: propertyData?.address,
      availableAssets: propertyData?.availableAssets?.map(a => a.type) || [],
      selectedAssets: propertyData?.selectedAssets?.map(a => a.asset_type) || []
    });
  }

  async processMessage(userMessage: string): Promise<string> {
    console.log('🔄 [LOCAL_CHAT_SERVICE] Processing message:', userMessage);

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMsg);

    // Detect assets from message
    const detectedAssets = this.detectAssetFromMessage(userMessage);
    console.log('🎯 [LOCAL_CHAT_SERVICE] Detected assets:', detectedAssets);

    // Analyze intent
    const intent = this.analyzeIntent(userMessage);
    console.log('🧠 [LOCAL_CHAT_SERVICE] Analyzed intent:', intent);

    let response = '';
    let partnerOptions: any[] = [];

    // Handle different intents
    switch (intent) {
      case 'asset_configuration':
        console.log('⚙️ [LOCAL_CHAT_SERVICE] Handling asset configuration intent');
        const configResult = await this.handleAssetConfiguration(userMessage, detectedAssets);
        response = configResult.response;
        partnerOptions = configResult.partnerOptions;
        break;
      case 'partner_inquiry':
        console.log('🤝 [LOCAL_CHAT_SERVICE] Handling partner inquiry intent');
        const partnerResult = await this.handlePartnerInquiry(userMessage, detectedAssets);
        response = partnerResult.response;
        partnerOptions = partnerResult.partnerOptions;
        break;
      case 'greeting':
        response = this.generateGreeting();
        break;
      case 'property_info':
        response = this.generatePropertyInfo();
        break;
      default:
        console.log('❓ [LOCAL_CHAT_SERVICE] Handling general inquiry');
        const generalResult = await this.handleGeneralInquiry(userMessage, detectedAssets);
        response = generalResult.response;
        partnerOptions = generalResult.partnerOptions;
    }

    // Add assistant response with partner options
    return this.addMessageWithPartners(response, partnerOptions, detectedAssets);
  }

  private detectAssetFromMessage(message: string): string[] {
    console.log('🔍 [LOCAL_CHAT_SERVICE] Detecting assets from message:', message);
    
    const lowerMessage = message.toLowerCase();
    const detectedAssets: string[] = [];

    // Enhanced asset detection with more comprehensive keywords
    const assetKeywords = {
      'short_term_rental': ['airbnb', 'short term rental', 'short-term rental', 'vacation rental', 'guest room', 'spare room', 'bnb'],
      'rental': ['rental', 'rent out', 'lease', 'tenant', 'renting'],
      'room_rental': ['room rental', 'room', 'bedroom', 'guest room', 'spare room'],
      'experience': ['experience', 'tour', 'activity', 'local experience', 'host experience'],
      'services': ['service', 'cleaning', 'maintenance', 'hospitality service'],
      'solar': ['solar', 'solar panels', 'rooftop solar', 'renewable energy'],
      'rooftop': ['rooftop', 'roof', 'rooftop space'],
      'energy': ['energy', 'power', 'electricity', 'renewable'],
      'library': ['library', 'book', 'community library', 'free library', 'tool library', 'little free library'],
      'community': ['community', 'neighborhood', 'local community'],
      'ev_charging': ['ev charging', 'electric vehicle', 'charging station', 'ev charger', 'electric car'],
      'parking': ['parking', 'parking space', 'driveway', 'garage parking'],
      'charging': ['charging', 'charge', 'ev charge'],
      'storage': ['storage', 'storage space', 'garage storage', 'basement storage'],
      'garage': ['garage', 'garage space'],
      'pool': ['pool', 'swimming pool', 'swim'],
      'swimming_pool': ['swimming pool', 'pool rental', 'private pool'],
      'event_space': ['event space', 'event', 'meeting', 'venue'],
      'creative_space': ['creative space', 'studio', 'art space'],
      'internet': ['internet', 'bandwidth', 'wifi', 'connection'],
      'bandwidth': ['bandwidth', 'internet sharing', 'passive income'],
      'vehicle': ['vehicle', 'car', 'automobile', 'car rental'],
      'car': ['car', 'auto', 'vehicle rental', 'car sharing']
    };

    // Check for each asset type
    for (const [assetType, keywords] of Object.entries(assetKeywords)) {
      const matched = keywords.some(keyword => lowerMessage.includes(keyword));
      if (matched) {
        detectedAssets.push(assetType);
        console.log(`✅ [LOCAL_CHAT_SERVICE] Matched asset type "${assetType}" with keywords:`, keywords.filter(k => lowerMessage.includes(k)));
      }
    }

    // If no specific assets detected, try to infer from property data
    if (detectedAssets.length === 0 && this.propertyData) {
      console.log('🔍 [LOCAL_CHAT_SERVICE] No assets detected from message, checking property data');
      const availableAssets = this.propertyData.availableAssets?.map(a => a.type) || [];
      console.log('🏠 [LOCAL_CHAT_SERVICE] Available assets from property:', availableAssets);
      
      // Add some common asset types if property has them
      if (availableAssets.includes('short_term_rental') && lowerMessage.includes('monetiz')) {
        detectedAssets.push('short_term_rental');
      }
    }

    console.log('🎯 [LOCAL_CHAT_SERVICE] Final detected assets:', detectedAssets);
    return detectedAssets;
  }

  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Configuration intent
    if (lowerMessage.includes('configure') || lowerMessage.includes('setup') || lowerMessage.includes('set up')) {
      return 'asset_configuration';
    }
    
    // Partner inquiry
    if (lowerMessage.includes('partner') || lowerMessage.includes('platform') || lowerMessage.includes('monetiz')) {
      return 'partner_inquiry';
    }
    
    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting';
    }
    
    // Property info
    if (lowerMessage.includes('property') || lowerMessage.includes('address') || lowerMessage.includes('analysis')) {
      return 'property_info';
    }
    
    return 'general';
  }

  private async handleAssetConfiguration(message: string, detectedAssets: string[]): Promise<{response: string, partnerOptions: any[]}> {
    console.log('⚙️ [LOCAL_CHAT_SERVICE] Handling asset configuration for assets:', detectedAssets);
    
    if (detectedAssets.length === 0) {
      console.log('⚠️ [LOCAL_CHAT_SERVICE] No assets detected for configuration');
      return {
        response: "I'd be happy to help you configure your assets for monetization! Could you please specify which asset you'd like to work with? For example, you could say 'I want to configure my Airbnb rental' or 'I want to set up solar panels'.",
        partnerOptions: []
      };
    }

    // Get partners for each detected asset
    let allPartners: any[] = [];
    
    for (const assetType of detectedAssets) {
      console.log(`🔍 [LOCAL_CHAT_SERVICE] Getting partners for asset type: ${assetType}`);
      const partners = PartnerIntegrationService.getPlatformsByAsset(assetType);
      console.log(`📊 [LOCAL_CHAT_SERVICE] Found ${partners.length} partners for ${assetType}:`, partners.map(p => p.name));
      allPartners = [...allPartners, ...partners];
    }

    // Remove duplicates
    const uniquePartners = allPartners.filter((partner, index, self) => 
      index === self.findIndex(p => p.id === partner.id)
    );

    console.log(`🎯 [LOCAL_CHAT_SERVICE] Final unique partners (${uniquePartners.length}):`, uniquePartners.map(p => p.name));

    if (uniquePartners.length === 0) {
      console.log('⚠️ [LOCAL_CHAT_SERVICE] No partners found for detected assets');
      return {
        response: `I understand you want to configure your ${detectedAssets.join(', ')} for monetization. Unfortunately, I don't have specific partner recommendations for these asset types at the moment. Please check back later as we're constantly adding new partners!`,
        partnerOptions: []
      };
    }

    return this.generatePartnerOptionsResponse(detectedAssets, uniquePartners);
  }

  private async handlePartnerInquiry(message: string, detectedAssets: string[]): Promise<{response: string, partnerOptions: any[]}> {
    console.log('🤝 [LOCAL_CHAT_SERVICE] Handling partner inquiry for assets:', detectedAssets);
    
    if (detectedAssets.length === 0) {
      // Show general partner overview
      const allPartners = PartnerIntegrationService.getAllPlatforms();
      console.log(`📊 [LOCAL_CHAT_SERVICE] Showing all partners (${allPartners.length}):`, allPartners.map(p => p.name));
      
      return {
        response: "Here are all the monetization partners we currently support. Click on any partner to learn more and get started with their platform:",
        partnerOptions: allPartners
      };
    }

    // Get partners for specific assets
    return this.handleAssetConfiguration(message, detectedAssets);
  }

  private async handleGeneralInquiry(message: string, detectedAssets: string[]): Promise<{response: string, partnerOptions: any[]}> {
    console.log('❓ [LOCAL_CHAT_SERVICE] Handling general inquiry for assets:', detectedAssets);
    
    if (detectedAssets.length > 0) {
      return this.handleAssetConfiguration(message, detectedAssets);
    }

    return {
      response: "I'm here to help you monetize your property assets! You can ask me about setting up Airbnb rentals, solar panels, EV charging stations, storage spaces, and more. What would you like to explore?",
      partnerOptions: []
    };
  }

  private generatePartnerOptionsResponse(detectedAssets: string[], partners: any[]): {response: string, partnerOptions: any[]} {
    console.log('📝 [LOCAL_CHAT_SERVICE] Generating partner options response');
    console.log('🎯 [LOCAL_CHAT_SERVICE] Assets:', detectedAssets);
    console.log('🤝 [LOCAL_CHAT_SERVICE] Partners:', partners.map(p => ({ name: p.name, id: p.id, assetTypes: p.assetTypes })));

    const assetNames = detectedAssets.map(asset => 
      PartnerIntegrationService.getAssetTypeDisplayName(asset)
    ).join(', ');

    const response = `Great! I found ${partners.length} partner platform${partners.length > 1 ? 's' : ''} for your ${assetNames}. Here are the available options:`;

    console.log('✅ [LOCAL_CHAT_SERVICE] Generated response:', response);
    console.log('📊 [LOCAL_CHAT_SERVICE] Partner options being returned:', partners.length);

    return {
      response,
      partnerOptions: partners
    };
  }

  private generateGreeting(): string {
    if (this.propertyData?.address) {
      return `Hello! I'm here to help you monetize your property at ${this.propertyData.address}. What would you like to work on today?`;
    }
    return "Hello! I'm here to help you monetize your property assets. What would you like to explore?";
  }

  private generatePropertyInfo(): string {
    if (!this.propertyData) {
      return "I don't have property information available right now. Please provide your property details so I can help you better.";
    }

    const { address, totalMonthlyRevenue, totalOpportunities, availableAssets } = this.propertyData;
    const assetTypes = availableAssets?.map(a => a.type).join(', ') || 'None detected';

    return `Here's your property information:
    
**Address:** ${address}
**Monthly Revenue Potential:** $${totalMonthlyRevenue || 0}
**Total Opportunities:** ${totalOpportunities || 0}
**Available Assets:** ${assetTypes}

Would you like to explore monetization options for any of these assets?`;
  }

  private addMessageWithPartners(response: string, partnerOptions: any[], detectedAssets: string[]): string {
    console.log('💬 [LOCAL_CHAT_SERVICE] Adding message with partners');
    console.log('📝 [LOCAL_CHAT_SERVICE] Response:', response);
    console.log('🤝 [LOCAL_CHAT_SERVICE] Partner options count:', partnerOptions.length);
    console.log('🎯 [LOCAL_CHAT_SERVICE] Detected assets:', detectedAssets);

    const assistantMsg: ChatMessage = {
      id: Date.now().toString(),
      content: response,
      role: 'assistant',
      timestamp: new Date(),
      partnerOptions: partnerOptions,
      detectedAssets: detectedAssets
    };

    this.messages.push(assistantMsg);
    console.log('✅ [LOCAL_CHAT_SERVICE] Message added to chat history');
    console.log('📊 [LOCAL_CHAT_SERVICE] Total messages:', this.messages.length);

    return response;
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  getContext(): any {
    return { ...this.context };
  }

  updateContext(updates: any): void {
    this.context = { ...this.context, ...updates };
  }
}
