
import { LocalChatService } from './localChatService';
import { PartnerIntegrationService } from './partnerIntegrationService';

export class LocalChatServiceTest {
  static runTests() {
    console.log('🧪 [LOCAL_CHAT_TEST] Running comprehensive tests...');
    
    // Test 1: Asset Detection
    console.log('\n=== TEST 1: Asset Detection ===');
    const service = new LocalChatService();
    
    const testMessages = [
      'I want to configure my Airbnb rental',
      'Help me set up solar panels',
      'I want to start a library in my community',
      'How can I monetize my EV charging station?',
      'I have a pool I want to rent out',
      'Help me with car rental options'
    ];
    
    testMessages.forEach(msg => {
      const detected = (service as any).detectAssetFromMessage(msg);
      console.log(`Message: "${msg}" -> Detected: [${detected.join(', ')}]`);
    });
    
    // Test 2: Partner Matching
    console.log('\n=== TEST 2: Partner Matching ===');
    const assetTypes = ['short_term_rental', 'solar', 'library', 'ev_charging', 'pool', 'vehicle'];
    
    assetTypes.forEach(assetType => {
      const partners = PartnerIntegrationService.getPlatformsByAsset(assetType);
      console.log(`Asset: "${assetType}" -> Partners: [${partners.map(p => p.name).join(', ')}]`);
    });
    
    // Test 3: All Available Partners
    console.log('\n=== TEST 3: All Available Partners ===');
    const allPartners = PartnerIntegrationService.getAllPlatforms();
    console.log(`Total partners: ${allPartners.length}`);
    allPartners.forEach(partner => {
      console.log(`- ${partner.name} (${partner.assetTypes.join(', ')}) - $${partner.earningRange.min}-${partner.earningRange.max}/month`);
    });
    
    // Test 4: Full Message Processing
    console.log('\n=== TEST 4: Full Message Processing ===');
    const testService = new LocalChatService();
    
    const testFullMessages = [
      'I want to configure my Airbnb rental for monetization',
      'Show me solar panel options',
      'Help me start a Little Free Library'
    ];
    
    testFullMessages.forEach(async (msg, index) => {
      console.log(`\nProcessing test message ${index + 1}: "${msg}"`);
      try {
        const response = await testService.processMessage(msg);
        const messages = testService.getMessages();
        const lastMessage = messages[messages.length - 1];
        console.log(`Response: "${response}"`);
        console.log(`Partner options: ${lastMessage.partnerOptions?.length || 0}`);
        console.log(`Partner names: [${lastMessage.partnerOptions?.map(p => p.name).join(', ') || 'none'}]`);
      } catch (error) {
        console.error(`Error processing message: ${error}`);
      }
    });
    
    console.log('\n✅ [LOCAL_CHAT_TEST] Tests completed!');
  }
}

// Auto-run tests when this file is imported
if (typeof window !== 'undefined') {
  // Run tests after a short delay to ensure everything is loaded
  setTimeout(() => {
    LocalChatServiceTest.runTests();
  }, 1000);
}
