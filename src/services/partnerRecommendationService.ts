
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

interface DatabaseProvider {
  name: string;
  category: string;
  affiliate_base_url: string;
  supported_assets: any;
  priority_score: number;
  avg_earnings_low: number;
  avg_earnings_high: number;
  setup_requirements: any;
}

const convertToStringArray = (data: any): string[] => {
  if (!Array.isArray(data)) return [];
  return data.filter((item: any): item is string => typeof item === 'string');
};

const convertToRecord = (data: any): Record<string, any> => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, any>;
  }
  return {};
};

export const generatePartnerRecommendations = async (
  onboardingId: string,
  detectedAssets: string[]
): Promise<PartnerRecommendation[]> => {
  try {
    console.log('🎯 Generating partner recommendations for assets:', detectedAssets);
    
    const { data: rawProviders, error: providersError } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('integration_status', 'active');

    if (providersError) throw providersError;

    const recommendations: PartnerRecommendation[] = [];
    
    if (rawProviders) {
      for (const rawProvider of rawProviders) {
        const provider: DatabaseProvider = {
          name: rawProvider.name || '',
          category: rawProvider.category || '',
          affiliate_base_url: rawProvider.affiliate_base_url || '',
          supported_assets: rawProvider.supported_assets,
          priority_score: rawProvider.priority_score || 5,
          avg_earnings_low: rawProvider.avg_earnings_low || 0,
          avg_earnings_high: rawProvider.avg_earnings_high || 0,
          setup_requirements: rawProvider.setup_requirements
        };

        const supportedAssets = convertToStringArray(provider.supported_assets);
        const matchingAssets = detectedAssets.filter(asset => 
          supportedAssets.some(supported => 
            supported.toLowerCase().includes(asset.toLowerCase()) || 
            asset.toLowerCase().includes(supported.toLowerCase())
          )
        );

        if (matchingAssets.length > 0) {
          const recommendation: PartnerRecommendation = {
            id: `${onboardingId}_${provider.name}`,
            partner_name: provider.name,
            asset_type: matchingAssets[0],
            priority_score: provider.priority_score,
            estimated_monthly_earnings: (provider.avg_earnings_low + provider.avg_earnings_high) / 2,
            setup_complexity: getSetupComplexity(convertToRecord(provider.setup_requirements)),
            recommendation_reason: `Perfect match for your ${matchingAssets.join(', ')} asset${matchingAssets.length > 1 ? 's' : ''}`,
            referral_link: provider.affiliate_base_url || undefined
          };
          recommendations.push(recommendation);
        }
      }
    }

    recommendations.sort((a, b) => 
      (b.priority_score * b.estimated_monthly_earnings) - (a.priority_score * a.estimated_monthly_earnings)
    );

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
        integration_status: 'in_progress',
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
      referral_link: data.referral_link || '',
      registration_data: convertToRecord(data.registration_data),
      earnings_data: convertToRecord(data.earnings_data),
      next_steps: convertToStringArray(data.next_steps)
    };

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
    const updateData: Record<string, any> = {
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

    return (data || []).map(item => ({
      id: item.id,
      partner_name: item.partner_name,
      integration_status: item.integration_status as 'pending' | 'in_progress' | 'completed' | 'failed',
      referral_link: item.referral_link || '',
      registration_data: convertToRecord(item.registration_data),
      earnings_data: convertToRecord(item.earnings_data),
      next_steps: convertToStringArray(item.next_steps)
    }));

  } catch (error) {
    console.error('❌ Error getting integration progress:', error);
    return [];
  }
};

const getSetupComplexity = (requirements: Record<string, any>): 'easy' | 'medium' | 'hard' => {
  if (!requirements || typeof requirements !== 'object') return 'medium';
  
  if (Array.isArray(requirements.requirements)) {
    const reqCount = requirements.requirements.length;
    if (reqCount <= 2) return 'easy';
    if (reqCount <= 4) return 'medium';
    return 'hard';
  }
  
  return 'medium';
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
