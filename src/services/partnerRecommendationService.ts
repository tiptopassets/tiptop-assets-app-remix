
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

    // Step 2: Get supported assets for all providers
    const providerIds = providers.map(p => p.id);
    const { data: supportedAssets, error: assetsError } = await supabase
      .from('provider_supported_assets')
      .select('provider_id, asset_type')
      .in('provider_id', providerIds);

    if (assetsError) {
      console.error('Error fetching supported assets:', assetsError);
      throw assetsError;
    }

    // Step 3: Get setup requirements for all providers
    const { data: setupRequirements, error: requirementsError } = await supabase
      .from('provider_setup_requirements')
      .select('provider_id, requirement_key, requirement_value, requirement_type')
      .in('provider_id', providerIds);

    if (requirementsError) {
      console.error('Error fetching setup requirements:', requirementsError);
      throw requirementsError;
    }

    const recommendations: PartnerRecommendation[] = [];

    // Step 4: Process each provider
    for (const provider of providers) {
      // Get supported assets for this provider
      const providerAssets = (supportedAssets || [])
        .filter(asset => asset.provider_id === provider.id)
        .map(asset => asset.asset_type);

      // Get setup requirements count for this provider
      const providerRequirementsCount = (setupRequirements || [])
        .filter(req => req.provider_id === provider.id).length;

      // Check if provider supports any of the detected assets
      const matchingAssets = checkAssetMatch(detectedAssets, providerAssets);

      if (matchingAssets.length > 0) {
        // Use fallback values if the new columns don't exist yet
        const priorityScore = (provider as any).priority_score || provider.priority || 5;
        const avgEarningsLow = (provider as any).avg_earnings_low || provider.avg_monthly_earnings_low || 0;
        const avgEarningsHigh = (provider as any).avg_earnings_high || provider.avg_monthly_earnings_high || 0;
        const affiliateUrl = (provider as any).affiliate_base_url || provider.referral_link_template;

        const recommendation: PartnerRecommendation = {
          id: `${onboardingId}_${provider.name}`,
          partner_name: provider.name,
          asset_type: matchingAssets[0],
          priority_score: priorityScore,
          estimated_monthly_earnings: (avgEarningsLow + avgEarningsHigh) / 2,
          setup_complexity: getSetupComplexity(providerRequirementsCount),
          recommendation_reason: `Perfect match for your ${matchingAssets.join(', ')} asset${matchingAssets.length > 1 ? 's' : ''}`,
          referral_link: affiliateUrl || undefined
        };
        recommendations.push(recommendation);
      }
    }

    // Sort recommendations by priority and earnings
    recommendations.sort((a, b) => 
      (b.priority_score * b.estimated_monthly_earnings) - (a.priority_score * a.estimated_monthly_earnings)
    );

    // Save to database if we have recommendations
    if (recommendations.length > 0) {
      const insertData = recommendations.map(rec => ({
        onboarding_id: onboardingId,
        partner_name: rec.partner_name,
        asset_type: rec.asset_type,
        priority_score: rec.priority_score,
        estimated_monthly_earnings: rec.estimated_monthly_earnings,
        setup_complexity: rec.setup_complexity,
        recommendation_reason: rec.recommendation_reason
      }));

      const { error: insertError } = await supabase
        .from('partner_recommendations')
        .insert(insertData);

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
        registration_data: {},
        earnings_data: {},
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
      registration_data: (data.registration_data as Record<string, any>) || {},
      earnings_data: (data.earnings_data as Record<string, any>) || {},
      next_steps: Array.isArray(data.next_steps) ? (data.next_steps as string[]) : []
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
      registration_data: (item.registration_data as Record<string, any>) || {},
      earnings_data: (item.earnings_data as Record<string, any>) || {},
      next_steps: Array.isArray(item.next_steps) ? (item.next_steps as string[]) : []
    }));

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
