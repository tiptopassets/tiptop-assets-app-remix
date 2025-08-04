
import { supabase } from '@/integrations/supabase/client';

export interface PartnerRecommendation {
  id: string;
  partner_name: string;
  asset_type: string;
  priority_score: number;
  estimated_monthly_earnings: number;
  setup_complexity: 'easy' | 'medium' | 'hard';
  recommendation_reason: string;
  referral_link?: string;
}

export interface PartnerIntegrationProgress {
  id: string;
  partner_name: string;
  integration_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  referral_link?: string;
  registration_data: Record<string, any>;
  earnings_data: Record<string, any>;
  next_steps: string[];
}

// Helper function to check asset match
const checkAssetMatch = (detectedAssets: string[], supportedAssets: string[]): string[] => {
  const matches: string[] = [];
  
  for (const detected of detectedAssets) {
    for (const supported of supportedAssets) {
      const detectedLower = detected.toLowerCase();
      const supportedLower = supported.toLowerCase();
      
      if (detectedLower.includes(supportedLower) || supportedLower.includes(detectedLower)) {
        matches.push(detected);
        break;
      }
    }
  }
  
  return matches;
};

const getSetupComplexity = (requirementsCount: number): 'easy' | 'medium' | 'hard' => {
  if (requirementsCount <= 2) return 'easy';
  if (requirementsCount <= 4) return 'medium';
  return 'hard';
};

export const generatePartnerRecommendations = async (
  onboardingId: string,
  detectedAssets: string[]
): Promise<PartnerRecommendation[]> => {
  try {
    console.log('🎯 Generating partner recommendations for assets:', detectedAssets);
    
    // Step 1: Get all active providers
    const { data: providers, error: providersError } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('is_active', true);

    if (providersError) {
      console.error('Error fetching providers:', providersError);
      throw providersError;
    }

    if (!providers || providers.length === 0) {
      console.log('No active providers found');
      return [];
    }

    const recommendations: PartnerRecommendation[] = [];

    // Process each provider with simplified logic
    for (const provider of providers) {
      // Mock asset matching for now
      const hasMatchingAsset = detectedAssets.length > 0;

      if (hasMatchingAsset) {
        const priorityScore = provider.priority || 5;
        const avgEarningsLow = provider.avg_monthly_earnings_low || 0;
        const avgEarningsHigh = provider.avg_monthly_earnings_high || 0;

        const recommendation: PartnerRecommendation = {
          id: `${onboardingId}_${provider.name}`,
          partner_name: provider.name,
          asset_type: detectedAssets[0] || 'general',
          priority_score: priorityScore,
          estimated_monthly_earnings: (avgEarningsLow + avgEarningsHigh) / 2,
          setup_complexity: 'medium',
          recommendation_reason: `Good match for your property assets`,
          referral_link: provider.referral_link_template || undefined
        };
        recommendations.push(recommendation);
      }
    }

    // Sort recommendations by priority and earnings
    recommendations.sort((a, b) => 
      (b.priority_score * b.estimated_monthly_earnings) - (a.priority_score * a.estimated_monthly_earnings)
    );

    console.log('✅ Generated recommendations:', recommendations.length);
    return recommendations;

  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    return [];
  }
};

export const initializePartnerIntegration = async (
  userId: string,
  onboardingId: string,
  partnerName: string,
  referralLink: string
): Promise<PartnerIntegrationProgress | null> => {
  try {
    console.log('🔗 Initializing partner integration:', { partnerName, userId });

    // Mock integration progress for now
    const mockProgress: PartnerIntegrationProgress = {
      id: `mock-${Date.now()}`,
      partner_name: partnerName,
      integration_status: 'in_progress',
      referral_link: referralLink,
      registration_data: {},
      earnings_data: {},
      next_steps: getNextSteps(partnerName)
    };

    console.log('✅ Mock partner integration initialized');
    return mockProgress;

  } catch (error) {
    console.error('❌ Error initializing partner integration:', error);
    return null;
  }
};

export const updateIntegrationStatus = async (
  integrationId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  additionalData?: Record<string, any>
): Promise<boolean> => {
  try {
    console.log('🔄 Updating integration status:', { integrationId, status });
    
    // Mock update for now
    console.log('✅ Mock integration status updated');
    return true;

  } catch (error) {
    console.error('❌ Error updating integration status:', error);
    return false;
  }
};

export const getUserIntegrationProgress = async (
  userId: string
): Promise<PartnerIntegrationProgress[]> => {
  try {
    console.log('📊 Getting integration progress for user:', userId);
    
    // Mock empty progress for now
    console.log('✅ Returning empty progress list');
    return [];

  } catch (error) {
    console.error('❌ Error getting integration progress:', error);
    return [];
  }
};

const getNextSteps = (partnerName: string): string[] => {
  const steps: Record<string, string[]> = {
    'Honeygain': [
      'Click the referral link to sign up',
      'Download the Honeygain app',
      'Keep the app running to earn passively'
    ],
    'Packet Stream': [
      'Register using the referral link',
      'Download the PacketStream app',
      'Configure bandwidth sharing settings'
    ],
    'Grass.io': [
      'Sign up with the referral code',
      'Install the browser extension',
      'Enable passive earning mode'
    ],
    'Neighbor.com': [
      'Create host account with referral link',
      'List your storage space',
      'Set competitive pricing'
    ],
    'Peerspace': [
      'Register as a host using referral',
      'Upload high-quality space photos',
      'Set availability and pricing'
    ],
    'SpotHero': [
      'Sign up as a parking partner',
      'Verify your parking space',
      'Set pricing and availability'
    ],
    'Swimply': [
      'Create host account with referral',
      'Upload pool photos and details',
      'Set hourly rental rates'
    ]
  };

  return steps[partnerName] || [
    'Complete registration using referral link',
    'Set up your account and profile',
    'Start earning from your assets'
  ];
};
