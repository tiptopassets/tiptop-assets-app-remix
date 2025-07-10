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
  priority?: number;
}

export class PartnerIntegrationService {
  private static platforms: PartnerPlatform[] = [
    {
      id: 'grass',
      name: 'Grass.io',
      referralLink: 'https://app.grass.io/register/?referralCode=nmGzz16893s4u-R',
      assetTypes: ['internet', 'bandwidth', 'wifi'],
      requirements: [
        'Stable internet connection (minimum 10 Mbps)',
        'Computer or device running 24/7',
        'Unlimited internet plan recommended',
        'Basic technical setup knowledge'
      ],
      setupSteps: [
        'Register using our referral link for bonus rewards',
        'Download and install Grass desktop application',
        'Complete account verification process',
        'Configure bandwidth sharing settings',
        'Start earning from your unused bandwidth'
      ],
      earningRange: { min: 20, max: 60 },
      setupTime: '30 minutes',
      description: 'Share your unused internet bandwidth and earn passive income',
      priority: 1
    },
    {
      id: 'honeygain',
      name: 'Honeygain',
      referralLink: 'https://r.honeygain.me/TIPTO9E10F',
      assetTypes: ['internet', 'bandwidth', 'wifi'],
      requirements: [
        'Stable internet connection',
        'Device running continuously',
        'Minimum 10 GB monthly bandwidth',
        'Residential IP address'
      ],
      setupSteps: [
        'Sign up using our referral link for $5 bonus',
        'Download Honeygain app on your devices',
        'Install and run the application',
        'Monitor your earnings in the dashboard',
        'Cash out when you reach minimum threshold'
      ],
      earningRange: { min: 15, max: 45 },
      setupTime: '20 minutes',
      description: 'Monetize your unused internet bandwidth effortlessly',
      priority: 2
    },
    {
      id: 'swimply',
      name: 'Swimply',
      referralLink: 'https://swimply.com/referral?ref=MjQ0MTUyMw==&r=g&utm_medium=referral&utm_source=link&utm_campaign=2441523',
      assetTypes: ['pool', 'swimming_pool'],
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
      id: 'neighbor-parking',
      name: 'Neighbor.com',
      referralLink: 'http://www.neighbor.com/invited/eduardo-944857?program_version=1',
      assetTypes: ['parking', 'driveway'],
      requirements: [
        'Available parking space (driveway, garage, or lot)',
        'Clear, unobstructed access',
        'Safe and well-lit area',
        'Consistent availability',
        'Clear parking instructions'
      ],
      setupSteps: [
        'Sign up using our referral link',
        'List your parking space with photos',
        'Set availability schedule and pricing',
        'Complete host verification',
        'Start earning from your parking space'
      ],
      earningRange: { min: 100, max: 300 },
      setupTime: '1-2 hours',
      description: 'Rent out parking spaces and earn consistent income',
      priority: 1
    },
    {
      id: 'spothero',
      name: 'SpotHero',
      referralLink: 'https://spothero.com/developers',
      assetTypes: ['parking', 'driveway'],
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
      description: 'Rent out parking spaces in your driveway or property',
      priority: 2
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
      description: 'Rent out extra storage space to neighbors',
      priority: 1
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
    const platforms = this.platforms.filter(platform => 
      platform.assetTypes.some(type => 
        type.toLowerCase().includes(assetType.toLowerCase()) ||
        assetType.toLowerCase().includes(type.toLowerCase())
      )
    );
    
    // Sort by priority (lowest number = highest priority)
    return platforms.sort((a, b) => (a.priority || 999) - (b.priority || 999));
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
