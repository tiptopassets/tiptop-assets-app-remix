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
  registration_data: any;
  earnings_data: any;
  next_steps: string[];
}

// Simplified database row type
interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  api_type: string;
  affiliate_base_url: string | null;
  supported_assets: any;
  priority_score: number | null;
  avg_earnings_low: number | null;
  avg_earnings_high: number | null;
  commission_rate: number | null;
  setup_requirements: any;
  integration_status: string;
  created_at: string;
  updated_at: string;
}

// Helper function to safely convert array data
const ensureStringArray = (data: any): string[] => {
  if (Array.isArray(data)) {
    return data.filter(item => typeof item === 'string');
  }
  return [];
};

export const generatePartnerRecommendations = async (
  onboardingId: string,
  detectedAssets: string[]
): Promise<PartnerRecommendation[]> => {
  try {
    console.log('🎯 Generating partner recommendations for assets:', detectedAssets);
    
    // Get enhanced service providers that match detected assets
    const { data: rawProviders, error: providersError } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('integration_status', 'active');

    if (providersError) throw providersError;

    const recommendations: PartnerRecommendation[] = [];
    
    if (rawProviders) {
      // Cast to our simplified type to avoid type inference issues
      const providers = rawProviders as ServiceProvider[];
      
      providers.forEach((provider) => {
        // Safely extract fields with fallbacks
        const providerName = provider.name || '';
        const category = provider.category || '';
        const affiliateUrl = provider.affiliate_base_url || '';
        const supportedAssets = ensureStringArray(provider.supported_assets);
        const priorityScore = provider.priority_score || 5;
        const avgEarningsLow = provider.avg_earnings_low || 0;
        const avgEarningsHigh = provider.avg_earnings_high || 0;
        const setupRequirements = provider.setup_requirements || {};

        // Check if provider supports any of the detected assets
        const matchingAssets = detectedAssets.filter(asset => 
          supportedAssets.some(supported => 
            supported.toLowerCase().includes(asset.toLowerCase()) || 
            asset.toLowerCase().includes(supported.toLowerCase())
          )
        );

        if (matchingAssets.length > 0) {
          const recommendation: PartnerRecommendation = {
            id: `${onboardingId}_${providerName}`,
            partner_name: providerName,
            asset_type: matchingAssets[0],
            priority_score: priorityScore,
            estimated_monthly_earnings: (avgEarningsLow + avgEarningsHigh) / 2,
            setup_complexity: getSetupComplexity(setupRequirements),
            recommendation_reason: `Perfect match for your ${matchingAssets.join(', ')} asset${matchingAssets.length > 1 ? 's' : ''}`,
            referral_link: affiliateUrl
          };
          recommendations.push(recommendation);
        }
      });
    }

    // Sort by priority score and estimated earnings
    recommendations.sort((a, b) => 
      (b.priority_score * b.estimated_monthly_earnings) - (a.priority_score * a.estimated_monthly_earnings)
    );

    // Save recommendations to database
    if (recommendations.length > 0) {
      const { error: insertError } = await supabase
        .from('partner_recommendations')
        .insert(
          recommendations.map(rec => ({
            onboarding_id: onboardingId,
            partner_name: rec.partner_name,
            asset_type: rec.asset_type,
            priority_score: rec.priority_score,
            estimated_monthly_earnings: rec.estimated_monthly_earnings,
            setup_complexity: rec.setup_complexity,
            recommendation_reason: rec.recommendation_reason
          }))
        );

      if (insertError) {
        console.error('Error saving recommendations:', insertError);
      }
    }

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

    const { data, error } = await supabase
      .from('partner_integration_progress')
      .insert({
        user_id: userId,
        onboarding_id: onboardingId,
        partner_name: partnerName,
        integration_status: 'in_progress' as const,
        referral_link: referralLink,
        next_steps: getNextSteps(partnerName)
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      partner_name: data.partner_name,
      integration_status: data.integration_status as 'pending' | 'in_progress' | 'completed' | 'failed',
      referral_link: data.referral_link,
      registration_data: data.registration_data || {},
      earnings_data: data.earnings_data || {},
      next_steps: ensureStringArray(data.next_steps)
    };

  } catch (error) {
    console.error('❌ Error initializing partner integration:', error);
    return null;
  }
};

export const updateIntegrationStatus = async (
  integrationId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  additionalData?: any
): Promise<boolean> => {
  try {
    const updateData: any = {
      integration_status: status,
      updated_at: new Date().toISOString()
    };

    if (additionalData) {
      if (additionalData.registrationData) {
        updateData.registration_data = additionalData.registrationData;
      }
      if (additionalData.earningsData) {
        updateData.earnings_data = additionalData.earningsData;
      }
    }

    const { error } = await supabase
      .from('partner_integration_progress')
      .update(updateData)
      .eq('id', integrationId);

    if (error) throw error;
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
    const { data, error } = await supabase
      .from('partner_integration_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(item => ({
      id: item.id,
      partner_name: item.partner_name,
      integration_status: item.integration_status as 'pending' | 'in_progress' | 'completed' | 'failed',
      referral_link: item.referral_link || '',
      registration_data: item.registration_data || {},
      earnings_data: item.earnings_data || {},
      next_steps: ensureStringArray(item.next_steps)
    })) || [];

  } catch (error) {
    console.error('❌ Error getting integration progress:', error);
    return [];
  }
};

const getSetupComplexity = (requirements: any): 'easy' | 'medium' | 'hard' => {
  if (!requirements || !requirements.requirements) return 'medium';
  
  const reqCount = requirements.requirements.length;
  if (reqCount <= 2) return 'easy';
  if (reqCount <= 4) return 'medium';
  return 'hard';
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
