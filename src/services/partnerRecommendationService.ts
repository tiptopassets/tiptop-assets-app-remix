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

export const generatePartnerRecommendations = async (
  onboardingId: string,
  detectedAssets: string[]
): Promise<PartnerRecommendation[]> => {
  try {
    console.log('🎯 Generating partner recommendations for assets:', detectedAssets);
    
    const { data: providers, error: providersError } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('integration_status', 'active');

    if (providersError) throw providersError;

    const recommendations: PartnerRecommendation[] = [];
    
    if (providers) {
      for (const provider of providers) {
        // Safe type handling for supported_assets
        let supportedAssets: string[] = [];
        if (Array.isArray(provider.supported_assets)) {
          supportedAssets = provider.supported_assets.filter((asset: any) => 
            typeof asset === 'string'
          ) as string[];
        }
          
        const matchingAssets = detectedAssets.filter(asset => 
          supportedAssets.some(supported => 
            supported.toLowerCase().includes(asset.toLowerCase()) || 
            asset.toLowerCase().includes(supported.toLowerCase())
          )
        );

        if (matchingAssets.length > 0) {
          // Safe type handling for setup_requirements
          let setupRequirements: Record<string, any> = {};
          if (provider.setup_requirements && typeof provider.setup_requirements === 'object' && !Array.isArray(provider.setup_requirements)) {
            setupRequirements = provider.setup_requirements as Record<string, any>;
          }

          const recommendation: PartnerRecommendation = {
            id: `${onboardingId}_${provider.name}`,
            partner_name: provider.name || '',
            asset_type: matchingAssets[0],
            priority_score: provider.priority_score || 5,
            estimated_monthly_earnings: ((provider.avg_earnings_low || 0) + (provider.avg_earnings_high || 0)) / 2,
            setup_complexity: getSetupComplexity(setupRequirements),
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

    // Safe type conversion for database response
    const safeRegistrationData: Record<string, any> = 
      data.registration_data && typeof data.registration_data === 'object' && !Array.isArray(data.registration_data)
        ? data.registration_data as Record<string, any>
        : {};

    const safeEarningsData: Record<string, any> = 
      data.earnings_data && typeof data.earnings_data === 'object' && !Array.isArray(data.earnings_data)
        ? data.earnings_data as Record<string, any>
        : {};

    const safeNextSteps: string[] = Array.isArray(data.next_steps) 
      ? data.next_steps.filter((step: any) => typeof step === 'string') as string[]
      : [];

    return {
      id: data.id,
      partner_name: data.partner_name,
      integration_status: data.integration_status as 'pending' | 'in_progress' | 'completed' | 'failed',
      referral_link: data.referral_link || '',
      registration_data: safeRegistrationData,
      earnings_data: safeEarningsData,
      next_steps: safeNextSteps
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

    return (data || []).map(item => {
      // Safe type conversion for database response
      const safeRegistrationData: Record<string, any> = 
        item.registration_data && typeof item.registration_data === 'object' && !Array.isArray(item.registration_data)
          ? item.registration_data as Record<string, any>
          : {};

      const safeEarningsData: Record<string, any> = 
        item.earnings_data && typeof item.earnings_data === 'object' && !Array.isArray(item.earnings_data)
          ? item.earnings_data as Record<string, any>
          : {};

      const safeNextSteps: string[] = Array.isArray(item.next_steps) 
        ? item.next_steps.filter((step: any) => typeof step === 'string') as string[]
        : [];

      return {
        id: item.id,
        partner_name: item.partner_name,
        integration_status: item.integration_status as 'pending' | 'in_progress' | 'completed' | 'failed',
        referral_link: item.referral_link || '',
        registration_data: safeRegistrationData,
        earnings_data: safeEarningsData,
        next_steps: safeNextSteps
      };
    });

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
