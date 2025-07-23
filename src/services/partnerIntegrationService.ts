export interface PartnerPlatform {
  id: string;
  name: string;
  description: string;
  assetTypes: string[];
  earningRange: {
    min: number;
    max: number;
  };
  referralLink: string;
  logoUrl: string;
  priority?: number;
  locationRestrictions?: string[];
}

export class PartnerIntegrationService {
  private static platforms: PartnerPlatform[] = [
    // Airbnb Partners
    {
      id: 'airbnb-unit-rental',
      name: 'Airbnb Unit Rental',
      description: 'Rent out your property or spare rooms to travelers on Airbnb',
      assetTypes: ['short_term_rental', 'rental', 'room_rental', 'guest_room', 'property'],
      earningRange: { min: 800, max: 3000 },
      referralLink: 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9',
      logoUrl: 'https://www.airbnb.com/favicon.ico',
      priority: 10
    },
    {
      id: 'airbnb-experience',
      name: 'Airbnb Experience',
      description: 'Create and host unique experiences for travelers in your area',
      assetTypes: ['experience', 'tours', 'activities', 'local_expertise'],
      earningRange: { min: 200, max: 1500 },
      referralLink: 'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a',
      logoUrl: 'https://www.airbnb.com/favicon.ico',
      priority: 8
    },
    {
      id: 'airbnb-service',
      name: 'Airbnb Service',
      description: 'Offer services to Airbnb hosts and guests in your area',
      assetTypes: ['services', 'cleaning', 'maintenance', 'hospitality'],
      earningRange: { min: 300, max: 2000 },
      referralLink: 'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b',
      logoUrl: 'https://www.airbnb.com/favicon.ico',
      priority: 7
    },
    
    // Solar Partners
    {
      id: 'tesla-solar',
      name: 'Tesla Solar',
      description: 'Install Tesla solar panels and energy storage systems',
      assetTypes: ['solar', 'rooftop', 'energy', 'renewable_energy'],
      earningRange: { min: 200, max: 800 },
      referralLink: 'https://www.tesla.com/solar',
      logoUrl: 'https://www.tesla.com/favicon.ico',
      priority: 9
    },
    {
      id: 'kolonia-energy',
      name: 'Kolonia Energy',
      description: 'Solar energy solutions for Florida and Texas properties',
      assetTypes: ['solar', 'rooftop', 'energy', 'renewable_energy'],
      earningRange: { min: 180, max: 750 },
      referralLink: 'https://koloniahouse.com',
      logoUrl: 'https://koloniahouse.com/favicon.ico',
      priority: 8,
      locationRestrictions: ['florida', 'texas', 'fl', 'tx']
    },
    
    // Community Partners
    {
      id: 'little-free-library',
      name: 'Little Free Library',
      description: 'Start a Little Free Library in your neighborhood',
      assetTypes: ['library', 'community', 'books', 'neighborhood'],
      earningRange: { min: 0, max: 50 },
      referralLink: 'https://littlefreelibrary.org/start/',
      logoUrl: 'https://littlefreelibrary.org/favicon.ico',
      priority: 6
    },
    
    // EV Charging Partners
    {
      id: 'chargepoint',
      name: 'ChargePoint',
      description: 'Install EV charging stations and earn from usage fees',
      assetTypes: ['ev_charging', 'parking', 'charging', 'electric_vehicle'],
      earningRange: { min: 100, max: 500 },
      referralLink: 'https://www.chargepoint.com/businesses/property-managers/',
      logoUrl: 'https://www.chargepoint.com/favicon.ico',
      priority: 7
    },
    {
      id: 'evgo',
      name: 'EVgo',
      description: 'Partner with EVgo to install fast charging stations',
      assetTypes: ['ev_charging', 'parking', 'charging', 'electric_vehicle'],
      earningRange: { min: 150, max: 600 },
      referralLink: 'https://www.evgo.com/partners/',
      logoUrl: 'https://www.evgo.com/favicon.ico',
      priority: 8
    },
    
    // Existing Partners
    {
      id: 'neighbor',
      name: 'Neighbor.com',
      description: 'Rent out your extra storage space to neighbors',
      assetTypes: ['storage', 'garage', 'basement', 'shed'],
      earningRange: { min: 50, max: 300 },
      referralLink: 'http://www.neighbor.com/invited/eduardo-944857?program_version=1',
      logoUrl: 'https://www.neighbor.com/favicon.ico',
      priority: 9
    },
    {
      id: 'swimply',
      name: 'Swimply',
      description: 'Rent your pool by the hour to guests',
      assetTypes: ['pool', 'swimming_pool', 'hot_tub'],
      earningRange: { min: 150, max: 800 },
      referralLink: 'https://swimply.com/referral?ref=MjQ0MTUyMw==&r=g&utm_medium=referral&utm_source=link&utm_campaign=2441523',
      logoUrl: 'https://swimply.com/favicon.ico',
      priority: 10
    },
    {
      id: 'peerspace',
      name: 'Peerspace',
      description: 'Rent your unique space for events and meetings',
      assetTypes: ['event_space', 'creative_space', 'meeting_room'],
      earningRange: { min: 100, max: 500 },
      referralLink: 'http://www.peerspace.com/claim/gr-jdO4oxx4LGzq',
      logoUrl: 'https://www.peerspace.com/favicon.ico',
      priority: 8
    },
    {
      id: 'spothero',
      name: 'SpotHero',
      description: 'Monetize your parking space',
      assetTypes: ['parking', 'driveway', 'garage_parking'],
      earningRange: { min: 75, max: 400 },
      referralLink: 'https://spothero.com/developers',
      logoUrl: 'https://spothero.com/favicon.ico',
      priority: 7
    },
    {
      id: 'honeygain',
      name: 'Honeygain',
      description: 'Share your unused internet bandwidth',
      assetTypes: ['internet', 'bandwidth', 'wifi'],
      earningRange: { min: 20, max: 80 },
      referralLink: 'https://r.honeygain.me/EDUARCE2A5',
      logoUrl: 'https://honeygain.com/favicon.ico',
      priority: 8
    },
    {
      id: 'turo',
      name: 'Turo',
      description: 'Rent out your car to travelers',
      assetTypes: ['vehicle', 'car', 'transportation'],
      earningRange: { min: 200, max: 1000 },
      referralLink: 'https://turo.com/us/en/list-your-car',
      logoUrl: 'https://turo.com/favicon.ico',
      priority: 7
    }
  ];

  static getAllPlatforms(): PartnerPlatform[] {
    return this.platforms.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  static getPlatformById(id: string): PartnerPlatform | undefined {
    return this.platforms.find(p => p.id === id);
  }

  static getPlatformsByAsset(assetType: string, userLocation?: string): PartnerPlatform[] {
    const normalizedAssetType = assetType.toLowerCase().trim();
    
    let matchingPlatforms = this.platforms.filter(platform => 
      platform.assetTypes.some(type => 
        type.toLowerCase().includes(normalizedAssetType) || 
        normalizedAssetType.includes(type.toLowerCase())
      )
    );

    // Apply location restrictions
    if (userLocation) {
      const normalizedLocation = userLocation.toLowerCase();
      matchingPlatforms = matchingPlatforms.filter(platform => {
        if (!platform.locationRestrictions) return true;
        
        return platform.locationRestrictions.some(restriction => 
          normalizedLocation.includes(restriction.toLowerCase())
        );
      });
    }

    return matchingPlatforms.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  static openReferralLink(platformId: string, userId?: string): void {
    const platform = this.getPlatformById(platformId);
    if (!platform) return;

    const referralUrl = platform.referralLink;
    window.open(referralUrl, '_blank');
  }

  static getAssetTypeDisplayName(assetType: string): string {
    const displayNames: Record<string, string> = {
      'short_term_rental': 'Short-term Rental',
      'rental': 'Property Rental',
      'room_rental': 'Room Rental',
      'guest_room': 'Guest Room',
      'experience': 'Experience Hosting',
      'tours': 'Tours & Activities',
      'activities': 'Local Activities',
      'services': 'Services',
      'cleaning': 'Cleaning Services',
      'maintenance': 'Maintenance Services',
      'solar': 'Solar Panels',
      'rooftop': 'Rooftop Solar',
      'energy': 'Energy Solutions',
      'renewable_energy': 'Renewable Energy',
      'library': 'Community Library',
      'community': 'Community Projects',
      'books': 'Book Sharing',
      'ev_charging': 'EV Charging',
      'parking': 'Parking Space',
      'charging': 'Charging Station',
      'electric_vehicle': 'Electric Vehicle',
      'storage': 'Storage Space',
      'garage': 'Garage Space',
      'basement': 'Basement Storage',
      'pool': 'Swimming Pool',
      'swimming_pool': 'Swimming Pool',
      'hot_tub': 'Hot Tub',
      'event_space': 'Event Space',
      'creative_space': 'Creative Space',
      'meeting_room': 'Meeting Room',
      'driveway': 'Driveway Parking',
      'garage_parking': 'Garage Parking',
      'internet': 'Internet Sharing',
      'bandwidth': 'Bandwidth Sharing',
      'wifi': 'WiFi Sharing',
      'vehicle': 'Vehicle Rental',
      'car': 'Car Rental',
      'transportation': 'Transportation'
    };

    return displayNames[assetType.toLowerCase()] || assetType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
