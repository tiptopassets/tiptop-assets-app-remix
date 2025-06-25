
import { supabase } from '@/integrations/supabase/client';

export interface PartnerRecommendation {
  id: string;
  onboarding_id: string;
  partner_name: string;
  asset_type: string;
  priority_score: number;
  estimated_monthly_earnings: number;
  setup_complexity: 'easy' | 'medium' | 'hard';
  recommendation_reason: string;
  referral_link?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerIntegrationProgress {
  id: string;
  user_id: string;
  onboarding_id: string;
  partner_name: string;
  referral_link?: string;
  integration_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

// Mock service provider data for generating recommendations
const mockServiceProviders = [
  {
    name: 'Airbnb',
    asset_types: ['house', 'apartment', 'room'],
    avg_monthly_earnings: 2500,
    setup_complexity: 'medium' as const,
    commission_rate: 0.03,
    description: 'Turn your property into a short-term rental'
  },
  {
    name: 'Turo',
    asset_types: ['car', 'vehicle'],
    avg_monthly_earnings: 800,
    setup_complexity: 'easy' as const,
    commission_rate: 0.25,
    description: 'Rent out your car when not in use'
  },
  {
    name: 'Getaround',
    asset_types: ['car', 'vehicle'],
    avg_monthly_earnings: 600,
    setup_complexity: 'easy' as const,
    commission_rate: 0.20,
    description: 'Car sharing platform'
  },
  {
    name: 'SpotHero',
    asset_types: ['parking', 'driveway'],
    avg_monthly_earnings: 300,
    setup_complexity: 'easy' as const,
    commission_rate: 0.15,
    description: 'Rent out your parking space'
  },
  {
    name: 'Swimply',
    asset_types: ['pool', 'backyard'],
    avg_monthly_earnings: 1200,
    setup_complexity: 'medium' as const,
    commission_rate: 0.15,
    description: 'Rent out your pool by the hour'
  },
  {
    name: 'Neighbor',
    asset_types: ['storage', 'garage', 'basement'],
    avg_monthly_earnings: 400,
    setup_complexity: 'easy' as const,
    commission_rate: 0.20,
    description: 'Rent out storage space'
  }
];

export const generatePartnerRecommendations = async (
  onboardingId: string,
  detectedAssets: string[]
): Promise<PartnerRecommendation[]> => {
  try {
    const recommendations: Omit<PartnerRecommendation, 'id' | 'created_at' | 'updated_at'>[] = [];

    // Generate recommendations based on detected assets
    for (const asset of detectedAssets) {
      const relevantProviders = mockServiceProviders.filter(provider =>
        provider.asset_types.some(type => 
          asset.toLowerCase().includes(type) || type.includes(asset.toLowerCase())
        )
      );

      for (const provider of relevantProviders) {
        const priorityScore = calculatePriorityScore(provider, asset);
        
        recommendations.push({
          onboarding_id: onboardingId,
          partner_name: provider.name,
          asset_type: asset,
          priority_score: priorityScore,
          estimated_monthly_earnings: provider.avg_monthly_earnings,
          setup_complexity: provider.setup_complexity,
          recommendation_reason: provider.description
        });
      }
    }

    // Sort by priority score (higher is better)
    recommendations.sort((a, b) => b.priority_score - a.priority_score);

    // Take top 5 recommendations
    const topRecommendations = recommendations.slice(0, 5);

    // Save to database
    if (topRecommendations.length > 0) {
      const { data, error } = await supabase
        .from('partner_recommendations')
        .insert(topRecommendations)
        .select();

      if (error) {
        console.error('Error saving partner recommendations:', error);
        // Return mock data if database insert fails
        return topRecommendations.map((rec, index) => ({
          id: `mock-${index}`,
          ...rec,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      }

      return data as PartnerRecommendation[];
    }

    return [];
  } catch (error) {
    console.error('Error generating partner recommendations:', error);
    return [];
  }
};

const calculatePriorityScore = (provider: any, asset: string): number => {
  let score = 50; // Base score

  // Higher earnings = higher priority
  score += Math.min(provider.avg_monthly_earnings / 100, 30);

  // Easier setup = higher priority
  if (provider.setup_complexity === 'easy') score += 20;
  else if (provider.setup_complexity === 'medium') score += 10;

  // Asset type match precision
  const exactMatch = provider.asset_types.includes(asset.toLowerCase());
  if (exactMatch) score += 15;

  return Math.round(score);
};

export const getPartnerRecommendations = async (
  onboardingId: string
): Promise<PartnerRecommendation[]> => {
  try {
    const { data, error } = await supabase
      .from('partner_recommendations')
      .select('*')
      .eq('onboarding_id', onboardingId)
      .order('priority_score', { ascending: false });

    if (error) {
      console.error('Error fetching partner recommendations:', error);
      return [];
    }

    return data as PartnerRecommendation[];
  } catch (error) {
    console.error('Error fetching partner recommendations:', error);
    return [];
  }
};

export const trackPartnerIntegration = async (
  userId: string,
  onboardingId: string,
  partnerName: string,
  referralLink?: string
): Promise<PartnerIntegrationProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('partner_integration_progress')
      .insert({
        user_id: userId,
        onboarding_id: onboardingId,
        partner_name: partnerName,
        referral_link: referralLink,
        integration_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking partner integration:', error);
      return null;
    }

    return data as PartnerIntegrationProgress;
  } catch (error) {
    console.error('Error tracking partner integration:', error);
    return null;
  }
};

export const updateIntegrationStatus = async (
  integrationId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('partner_integration_progress')
      .update({ 
        integration_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating integration status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating integration status:', error);
    return false;
  }
};

export const getUserIntegrations = async (
  userId: string
): Promise<PartnerIntegrationProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('partner_integration_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user integrations:', error);
      return [];
    }

    return data as PartnerIntegrationProgress[];
  } catch (error) {
    console.error('Error fetching user integrations:', error);
    return [];
  }
};
