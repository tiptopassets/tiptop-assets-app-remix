
import { supabase } from '@/integrations/supabase/client';

export interface PartnerPlatform {
  id: string;
  name: string;
  referralLink: string;
  assetTypes: string[];
  requirements: string[];
  setupSteps: string[];
  earningRange: { min: number; max: number };
  setupTime: string;
  description: string;
}

export class PartnerIntegrationService {
  private static platforms: PartnerPlatform[] = [
    {
      id: 'swimply',
      name: 'Swimply',
      referralLink: 'https://swimply.com/host?ref=tiptop',
      assetTypes: ['pool'],
      requirements: [
        'Swimming pool in good condition',
        'Pool insurance coverage',
        'Safety equipment (life ring, first aid kit)',
        'Clear access path to pool',
        'Flexible scheduling availability'
      ],
      setupSteps: [
        'Take 5-10 high-quality photos of pool and surrounding area',
        'Verify pool safety equipment and insurance',
        'Create detailed pool description and house rules',
        'Set competitive pricing for your market',
        'Complete host verification process'
      ],
      earningRange: { min: 100, max: 500 },
      setupTime: '2-3 hours',
      description: 'Rent your pool for parties, events, and relaxation'
    },
    {
      id: 'spothero',
      name: 'SpotHero',
      referralLink: 'https://spothero.com/partners?ref=tiptop',
      assetTypes: ['parking'],
      requirements: [
        'Available parking space (driveway, garage, or lot)',
        'Clear, unobstructed access',
        'Safe and well-lit area',
        'Consistent availability',
        'Clear parking instructions'
      ],
      setupSteps: [
        'Measure and photograph parking space',
        'Create clear access instructions',
        'Set availability schedule',
        'Price competitively for your area',
        'Complete host verification'
      ],
      earningRange: { min: 150, max: 400 },
      setupTime: '1-2 hours',
      description: 'Rent out parking spaces in your driveway or property'
    },
    {
      id: 'neighbor',
      name: 'Neighbor.com',
      referralLink: 'http://www.neighbor.com/invited/eduardo-944857?program_version=1',
      assetTypes: ['storage', 'garage', 'basement'],
      requirements: [
        'Clean, dry storage space',
        'Secure access to storage area',
        'Space measurements',
        'Renter access availability',
        'Basic security measures'
      ],
      setupSteps: [
        'Clean and organize storage space',
        'Take photos from multiple angles',
        'Measure space dimensions accurately',
        'Set up secure access method',
        'Create detailed space description'
      ],
      earningRange: { min: 50, max: 300 },
      setupTime: '1-2 hours',
      description: 'Rent out extra storage space to neighbors'
    },
    {
      id: 'peerspace',
      name: 'Peerspace',
      referralLink: 'http://www.peerspace.com/claim/gr-jdO4oxx4LGzq',
      assetTypes: ['event_space', 'creative_space', 'unique_space'],
      requirements: [
        'Unique or attractive space',
        'Basic amenities (WiFi, parking, restroom access)',
        'Professional-quality photos',
        'Flexible booking availability',
        'Space suitable for events/shoots'
      ],
      setupSteps: [
        'Identify unique selling points of your space',
        'Take professional-quality photos',
        'Write compelling space description',
        'Set competitive hourly/daily rates',
        'Configure booking availability'
      ],
      earningRange: { min: 300, max: 2000 },
      setupTime: '3-4 hours',
      description: 'Rent unique spaces for events, meetings, and creative projects'
    }
  ];

  static getPlatformsByAsset(assetType: string): PartnerPlatform[] {
    return this.platforms.filter(platform => 
      platform.assetTypes.some(type => 
        type.toLowerCase().includes(assetType.toLowerCase()) ||
        assetType.toLowerCase().includes(type.toLowerCase())
      )
    );
  }

  static getPlatformById(id: string): PartnerPlatform | null {
    return this.platforms.find(platform => platform.id === id) || null;
  }

  static getAllPlatforms(): PartnerPlatform[] {
    return this.platforms;
  }

  static async trackReferralClick(platformId: string, userId?: string): Promise<void> {
    try {
      const platform = this.getPlatformById(platformId);
      if (!platform) return;

      // Track the referral click
      await supabase
        .from('partner_integration_progress')
        .insert({
          user_id: userId || null,
          onboarding_id: `referral-${Date.now()}`,
          partner_name: platform.name,
          referral_link: platform.referralLink,
          integration_status: 'referral_clicked',
          registration_data: {
            clicked_at: new Date().toISOString(),
            platform_id: platformId
          }
        });

      console.log(`Tracked referral click for ${platform.name}`);
    } catch (error) {
      console.error('Error tracking referral click:', error);
    }
  }

  static openReferralLink(platformId: string, userId?: string): void {
    const platform = this.getPlatformById(platformId);
    if (!platform) return;

    // Track the click
    this.trackReferralClick(platformId, userId);

    // Open the referral link
    window.open(platform.referralLink, '_blank', 'noopener,noreferrer');
  }

  static generateSetupGuide(platformId: string): string {
    const platform = this.getPlatformById(platformId);
    if (!platform) return '';

    return `
# ${platform.name} Setup Guide

## Overview
${platform.description}

**Earning Potential:** $${platform.earningRange.min}-${platform.earningRange.max}/month
**Setup Time:** ${platform.setupTime}

## Requirements
${platform.requirements.map(req => `• ${req}`).join('\n')}

## Setup Steps
${platform.setupSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Ready to Start?
Click the button below to register with our referral link for the best host benefits and support!
    `.trim();
  }
}
