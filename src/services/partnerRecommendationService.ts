
import { supabase } from '@/integrations/supabase/client';

export interface PartnerRecommendation {
  id: string;
  partner_name: string;
  asset_type: string;
  estimated_monthly_earnings: number;
  priority_score: number;
  recommendation_reason: string;
  setup_complexity: 'low' | 'medium' | 'high';
  referral_link?: string;
}

export const getPartnerRecommendations = async (
  onboardingId: string,
  detectedAssets: string[]
): Promise<PartnerRecommendation[]> => {
  try {
    // First, try to get existing recommendations for this onboarding session
    const { data: existingRecommendations, error: existingError } = await supabase
      .from('partner_recommendations')
      .select('*')
      .eq('onboarding_id', onboardingId);

    if (existingError) {
      console.warn('Error fetching existing recommendations:', existingError);
    }

    if (existingRecommendations && existingRecommendations.length > 0) {
      return existingRecommendations.map(rec => ({
        id: rec.id,
        partner_name: rec.partner_name,
        asset_type: rec.asset_type,
        estimated_monthly_earnings: Number(rec.estimated_monthly_earnings || 0),
        priority_score: rec.priority_score || 0,
        recommendation_reason: rec.recommendation_reason || '',
        setup_complexity: (rec.setup_complexity as 'low' | 'medium' | 'high') || 'medium',
        referral_link: generateReferralLink(rec.partner_name)
      }));
    }

    // If no existing recommendations, generate new ones based on detected assets
    const recommendations: PartnerRecommendation[] = [];

    for (const asset of detectedAssets) {
      const assetRecommendations = generateRecommendationsForAsset(asset);
      recommendations.push(...assetRecommendations);
    }

    // Store the generated recommendations in the database
    if (recommendations.length > 0) {
      const recommendationsToInsert = recommendations.map(rec => ({
        onboarding_id: onboardingId,
        partner_name: rec.partner_name,
        asset_type: rec.asset_type,
        estimated_monthly_earnings: rec.estimated_monthly_earnings,
        priority_score: rec.priority_score,
        recommendation_reason: rec.recommendation_reason,
        setup_complexity: rec.setup_complexity
      }));

      const { error: insertError } = await supabase
        .from('partner_recommendations')
        .insert(recommendationsToInsert);

      if (insertError) {
        console.error('Error storing recommendations:', insertError);
      }
    }

    return recommendations;
  } catch (error) {
    console.error('Error in getPartnerRecommendations:', error);
    return [];
  }
};

// Export alias for backward compatibility
export const generatePartnerRecommendations = getPartnerRecommendations;

const generateReferralLink = (partnerName: string): string => {
  const referralLinks: Record<string, string> = {
    'Tesla Energy': 'https://www.tesla.com/energy?referral=tiptop',
    'Honeygain': 'https://r.honeygain.me/TIPTOP123',
    'Swimply': 'https://swimply.com/?ref=tiptop',
    'FlexOffers': 'https://www.flexoffers.com/affiliate-programs/?ref=tiptop'
  };
  
  return referralLinks[partnerName] || '#';
};

const generateRecommendationsForAsset = (asset: string): PartnerRecommendation[] => {
  const assetRecommendations: Record<string, PartnerRecommendation[]> = {
    solar: [
      {
        id: 'solar-tesla',
        partner_name: 'Tesla Energy',
        asset_type: 'solar',
        estimated_monthly_earnings: 300,
        priority_score: 9,
        recommendation_reason: 'High-quality solar installation with excellent ROI',
        setup_complexity: 'medium',
        referral_link: generateReferralLink('Tesla Energy')
      }
    ],
    wifi: [
      {
        id: 'wifi-honeygain',
        partner_name: 'Honeygain',
        asset_type: 'wifi',
        estimated_monthly_earnings: 25,
        priority_score: 7,
        recommendation_reason: 'Passive income through internet bandwidth sharing',
        setup_complexity: 'low',
        referral_link: generateReferralLink('Honeygain')
      }
    ],
    pool: [
      {
        id: 'pool-swimply',
        partner_name: 'Swimply',
        asset_type: 'pool',
        estimated_monthly_earnings: 200,
        priority_score: 8,
        recommendation_reason: 'Rent your pool to neighbors for hourly rates',
        setup_complexity: 'low',
        referral_link: generateReferralLink('Swimply')
      }
    ],
    parking: [
      {
        id: 'parking-flexoffers',
        partner_name: 'FlexOffers',
        asset_type: 'parking',
        estimated_monthly_earnings: 150,
        priority_score: 6,
        recommendation_reason: 'Monetize parking spaces through affiliate partnerships',
        setup_complexity: 'medium',
        referral_link: generateReferralLink('FlexOffers')
      }
    ]
  };

  return assetRecommendations[asset] || [];
};

export const initializePartnerIntegration = async (
  userId: string,
  onboardingId: string,
  partnerName: string,
  referralLink: string
) => {
  try {
    const { data, error } = await supabase
      .from('partner_integration_progress')
      .insert({
        user_id: userId,
        onboarding_id: onboardingId,
        partner_name: partnerName,
        referral_link: referralLink,
        integration_status: 'started'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error initializing partner integration:', error);
    throw error;
  }
};

export const updatePartnerRecommendation = async (
  recommendationId: string,
  updates: Partial<PartnerRecommendation>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('partner_recommendations')
      .update(updates)
      .eq('id', recommendationId);

    return !error;
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return false;
  }
};
