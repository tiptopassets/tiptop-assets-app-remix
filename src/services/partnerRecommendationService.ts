
import { supabase } from '@/integrations/supabase/client';

export interface PartnerRecommendation {
  id: string;
  partnerName: string;
  assetType: string;
  estimatedMonthlyEarnings: number;
  setupComplexity: 'low' | 'medium' | 'high';
  recommendationReason: string;
  priorityScore: number;
  referralLink?: string; // Add the missing referral_link property (camelCase)
}

export interface OnboardingAsset {
  type: string;
  detected: boolean;
  potential: number;
  requirements?: string[];
}

export const generatePartnerRecommendations = async (
  onboardingId: string,
  detectedAssets: OnboardingAsset[] | string[]
): Promise<PartnerRecommendation[]> => {
  try {
    console.log('🔄 Generating partner recommendations for:', { onboardingId, detectedAssets });

    // Convert string array to OnboardingAsset array if needed
    const assetsToProcess: OnboardingAsset[] = detectedAssets.map(asset => {
      if (typeof asset === 'string') {
        return {
          type: asset,
          detected: true,
          potential: 100
        };
      }
      return asset;
    });

    // Get enhanced service providers that match the detected assets
    const { data: providers, error: providersError } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .order('priority_score', { ascending: false });

    if (providersError) {
      console.error('❌ Error fetching service providers:', providersError);
      return [];
    }

    if (!providers || providers.length === 0) {
      console.log('⚠️ No service providers found');
      return [];
    }

    // Generate recommendations based on detected assets
    const recommendations: PartnerRecommendation[] = [];

    for (const asset of assetsToProcess) {
      if (!asset.detected || asset.potential <= 0) continue;

      // Find providers that support this asset type
      const matchingProviders = providers.filter(provider => {
        const supportedAssets = Array.isArray(provider.supported_assets) 
          ? provider.supported_assets as string[]
          : [];
        
        return supportedAssets.some(supportedAsset => 
          supportedAsset.toLowerCase().includes(asset.type.toLowerCase()) ||
          asset.type.toLowerCase().includes(supportedAsset.toLowerCase())
        );
      });

      // Create recommendations for matching providers
      for (const provider of matchingProviders.slice(0, 2)) { // Limit to top 2 per asset
        const avgEarnings = (provider.avg_earnings_low + provider.avg_earnings_high) / 2;
        const estimatedEarnings = Math.round(avgEarnings * (asset.potential / 100));

        recommendations.push({
          id: `${provider.id}-${asset.type}`,
          partnerName: provider.name,
          assetType: asset.type,
          estimatedMonthlyEarnings: estimatedEarnings,
          setupComplexity: determineSetupComplexity(provider.setup_requirements),
          recommendationReason: generateRecommendationReason(provider, asset),
          priorityScore: provider.priority_score || 0,
          referralLink: provider.affiliate_base_url || `https://example.com/signup?ref=${provider.id}` // Generate referral link
        });
      }
    }

    // Sort by priority score and estimated earnings
    const sortedRecommendations = recommendations.sort((a, b) => {
      const scoreA = a.priorityScore + (a.estimatedMonthlyEarnings / 100);
      const scoreB = b.priorityScore + (b.estimatedMonthlyEarnings / 100);
      return scoreB - scoreA;
    });

    // Store recommendations in database
    await storeRecommendations(onboardingId, sortedRecommendations);

    console.log('✅ Generated', sortedRecommendations.length, 'partner recommendations');
    return sortedRecommendations.slice(0, 10); // Return top 10

  } catch (error) {
    console.error('❌ Error generating partner recommendations:', error);
    return [];
  }
};

export const initializePartnerIntegration = async (
  userId: string,
  onboardingId: string,
  partnerName: string,
  referralLink: string
) => {
  try {
    console.log('🔄 Initializing partner integration:', { userId, onboardingId, partnerName });

    const { data, error } = await supabase
      .from('partner_integration_progress')
      .insert({
        user_id: userId,
        onboarding_id: onboardingId,
        partner_name: partnerName,
        referral_link: referralLink,
        integration_status: 'initiated',
        registration_data: {},
        earnings_data: {}
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error initializing partner integration:', error);
      return null;
    }

    console.log('✅ Partner integration initialized:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in initializePartnerIntegration:', error);
    return null;
  }
};

const determineSetupComplexity = (setupRequirements: any): 'low' | 'medium' | 'high' => {
  if (!setupRequirements || typeof setupRequirements !== 'object') {
    return 'medium';
  }

  const requirementCount = Object.keys(setupRequirements).length;
  if (requirementCount <= 2) return 'low';
  if (requirementCount <= 4) return 'medium';
  return 'high';
};

const generateRecommendationReason = (provider: any, asset: OnboardingAsset): string => {
  const reasons = [
    `High earning potential for ${asset.type} assets`,
    `Strong market presence in ${provider.category}`,
    `Simplified setup process`,
    `Proven track record with similar properties`
  ];

  return reasons[Math.floor(Math.random() * reasons.length)];
};

const storeRecommendations = async (
  onboardingId: string,
  recommendations: PartnerRecommendation[]
) => {
  try {
    const recommendationRecords = recommendations.map(rec => ({
      onboarding_id: onboardingId,
      partner_name: rec.partnerName,
      asset_type: rec.assetType,
      estimated_monthly_earnings: rec.estimatedMonthlyEarnings,
      setup_complexity: rec.setupComplexity,
      recommendation_reason: rec.recommendationReason,
      priority_score: rec.priorityScore
    }));

    const { error } = await supabase
      .from('partner_recommendations')
      .insert(recommendationRecords);

    if (error) {
      console.error('❌ Error storing recommendations:', error);
    } else {
      console.log('✅ Stored', recommendationRecords.length, 'recommendations');
    }
  } catch (error) {
    console.error('❌ Error in storeRecommendations:', error);
  }
};

export const getStoredRecommendations = async (
  onboardingId: string
): Promise<PartnerRecommendation[]> => {
  try {
    const { data, error } = await supabase
      .from('partner_recommendations')
      .select('*')
      .eq('onboarding_id', onboardingId)
      .order('priority_score', { ascending: false });

    if (error) {
      console.error('❌ Error fetching stored recommendations:', error);
      return [];
    }

    return (data || []).map(rec => ({
      id: rec.id,
      partnerName: rec.partner_name,
      assetType: rec.asset_type,
      estimatedMonthlyEarnings: rec.estimated_monthly_earnings || 0,
      setupComplexity: (rec.setup_complexity as 'low' | 'medium' | 'high') || 'medium',
      recommendationReason: rec.recommendation_reason || '',
      priorityScore: rec.priority_score || 0
    }));
  } catch (error) {
    console.error('❌ Error in getStoredRecommendations:', error);
    return [];
  }
};
