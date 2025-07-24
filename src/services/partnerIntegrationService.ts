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
  setupTime?: string;
  requirements?: string[];
  setupSteps?: string[];
  briefDescription?: string;
}

export class PartnerIntegrationService {
  private static platforms: PartnerPlatform[] = [
    // Airbnb Partners (now separated by type) - Updated to match database
    {
      id: 'airbnb-unit-rental',
      name: 'Airbnb Unit Rental',
      description: 'Rent out your property or spare rooms to travelers on Airbnb',
      briefDescription: 'Short-term rental platform for properties and rooms',
      assetTypes: ['short_term_rental', 'rental', 'room_rental', 'guest_room', 'property'],
      earningRange: { min: 800, max: 3000 },
      referralLink: 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=7d56143e-b489-4ef6-ba7f-c10c1241bce9',
      logoUrl: 'https://www.airbnb.com/favicon.ico',
      priority: 10,
      setupTime: '2-3 hours',
      requirements: ['Property photos', 'Host verification', 'Insurance coverage'],
      setupSteps: ['Create host profile', 'Upload property photos', 'Set pricing and availability', 'Complete verification']
    },
    {
      id: 'airbnb-experience',
      name: 'Airbnb Experience',
      description: 'Create and host unique experiences for travelers in your area',
      briefDescription: 'Host unique local experiences for travelers',
      assetTypes: ['experience', 'tours', 'activities', 'local_expertise', 'hosting'],
      earningRange: { min: 200, max: 1500 },
      referralLink: 'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=560cba6c-7231-400c-84f2-9434c6a31c2a',
      logoUrl: 'https://www.airbnb.com/favicon.ico',
      priority: 8,
      setupTime: '1-2 hours',
      requirements: ['Unique experience idea', 'Local expertise', 'Host verification'],
      setupSteps: ['Define experience concept', 'Create detailed description', 'Set pricing', 'Complete host verification']
    },
    {
      id: 'airbnb-service',
      name: 'Airbnb Service',
      description: 'Offer services to Airbnb hosts and guests in your area',
      briefDescription: 'Provide services to Airbnb hosts and guests',
      assetTypes: ['services', 'cleaning', 'maintenance', 'hospitality'],
      earningRange: { min: 300, max: 2000 },
      referralLink: 'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=6c478139-a138-490e-af41-58869ceb0d6b',
      logoUrl: 'https://www.airbnb.com/favicon.ico',
      priority: 7,
      setupTime: '1-2 hours',
      requirements: ['Service expertise', 'Insurance coverage', 'Professional tools'],
      setupSteps: ['Define service offerings', 'Set pricing', 'Complete verification', 'Start accepting bookings']
    },
    
    // Solar Partners
    {
      id: 'tesla-energy',
      name: 'Tesla Energy',
      description: 'Install Tesla solar panels and energy storage systems',
      briefDescription: 'Premium solar panels and energy storage',
      assetTypes: ['solar', 'rooftop', 'energy', 'renewable_energy'],
      earningRange: { min: 200, max: 800 },
      referralLink: 'https://www.tesla.com/solar',
      logoUrl: 'https://www.tesla.com/favicon.ico',
      priority: 9,
      setupTime: '4-6 weeks',
      requirements: ['Suitable roof space', 'Electrical assessment', 'Permits'],
      setupSteps: ['Site assessment', 'System design', 'Permit approval', 'Installation']
    },
    {
      id: 'kolonia-energy',
      name: 'Kolonia Energy',
      description: 'Solar energy solutions for Florida and Texas properties',
      briefDescription: 'Regional solar solutions for FL and TX',
      assetTypes: ['solar', 'rooftop', 'energy', 'renewable_energy'],
      earningRange: { min: 180, max: 750 },
      referralLink: 'https://koloniahouse.com',
      logoUrl: 'https://koloniahouse.com/favicon.ico',
      priority: 8,
      locationRestrictions: ['florida', 'texas', 'fl', 'tx'],
      setupTime: '3-5 weeks',
      requirements: ['Florida or Texas location', 'Roof assessment', 'Permits'],
      setupSteps: ['Initial consultation', 'Roof evaluation', 'System design', 'Installation']
    },
    
    // Internet/Bandwidth Partners
    {
      id: 'honeygain',
      name: 'Honeygain',
      description: 'Share your unused internet bandwidth and earn passive income',
      briefDescription: 'Passive income from internet bandwidth',
      assetTypes: ['internet', 'bandwidth', 'wifi'],
      earningRange: { min: 20, max: 80 },
      referralLink: 'https://r.honeygain.me/EDUARCE2A5',
      logoUrl: 'https://honeygain.com/favicon.ico',
      priority: 8,
      setupTime: '15 minutes',
      requirements: ['Stable internet', 'Computer or phone', 'Unlimited data plan'],
      setupSteps: ['Download app', 'Create account', 'Install on devices', 'Start earning']
    },
    
    // Fitness/Wellness Partners
    {
      id: 'gympass',
      name: 'Gympass',
      description: 'Corporate wellness platform for fitness and wellness services',
      briefDescription: 'Corporate wellness and fitness platform',
      assetTypes: ['fitness', 'wellness', 'home_gym'],
      earningRange: { min: 100, max: 500 },
      referralLink: 'https://gympass.com',
      logoUrl: 'https://gympass.com/favicon.ico',
      priority: 6,
      setupTime: '1-2 hours',
      requirements: ['Fitness expertise', 'Wellness qualifications', 'Space for activities'],
      setupSteps: ['Create provider profile', 'Verify qualifications', 'Set service offerings', 'Start accepting bookings']
    },
    
    // Community Partners
    {
      id: 'little-free-library',
      name: 'Little Free Library',
      description: 'Start a Little Free Library in your neighborhood',
      briefDescription: 'Community book sharing program',
      assetTypes: ['library', 'community', 'books', 'neighborhood'],
      earningRange: { min: 0, max: 50 },
      referralLink: 'https://littlefreelibrary.org/start/',
      logoUrl: 'https://littlefreelibrary.org/favicon.ico',
      priority: 6,
      setupTime: '1-2 hours',
      requirements: ['Small outdoor space', 'Basic construction skills', 'Community engagement'],
      setupSteps: ['Choose location', 'Build or buy library box', 'Register with organization', 'Stock with books']
    },
    
    // EV Charging Partners
    {
      id: 'chargepoint',
      name: 'ChargePoint',
      description: 'Install EV charging stations and earn from usage fees',
      briefDescription: 'EV charging network for businesses',
      assetTypes: ['ev_charging', 'parking', 'charging', 'electric_vehicle'],
      earningRange: { min: 100, max: 500 },
      referralLink: 'https://www.chargepoint.com/businesses/property-managers/',
      logoUrl: 'https://www.chargepoint.com/favicon.ico',
      priority: 7,
      setupTime: '2-4 weeks',
      requirements: ['Parking space', 'Electrical capacity', 'Property permits'],
      setupSteps: ['Site assessment', 'Electrical upgrade if needed', 'Installation', 'Network activation']
    },
    {
      id: 'evgo',
      name: 'EVgo',
      description: 'Partner with EVgo to install fast charging stations',
      briefDescription: 'Fast charging network partnership',
      assetTypes: ['ev_charging', 'parking', 'charging', 'electric_vehicle'],
      earningRange: { min: 150, max: 600 },
      referralLink: 'https://www.evgo.com/partners/',
      logoUrl: 'https://www.evgo.com/favicon.ico',
      priority: 8,
      setupTime: '3-6 weeks',
      requirements: ['High-traffic location', 'Electrical infrastructure', 'Parking availability'],
      setupSteps: ['Location evaluation', 'Partnership agreement', 'Installation', 'Go live']
    },
    
    // Existing Partners (keeping all existing ones)
    {
      id: 'neighbor',
      name: 'Neighbor.com',
      description: 'Rent out your extra storage space to neighbors',
      briefDescription: 'Peer-to-peer storage space rental',
      assetTypes: ['storage', 'garage', 'basement', 'shed'],
      earningRange: { min: 50, max: 300 },
      referralLink: 'http://www.neighbor.com/invited/eduardo-944857?program_version=1',
      logoUrl: 'https://www.neighbor.com/favicon.ico',
      priority: 9,
      setupTime: '1-2 hours',
      requirements: ['Clean storage space', 'Secure access', 'Clear photos'],
      setupSteps: ['Clean and organize space', 'Take photos', 'Set pricing', 'List space']
    },
    {
      id: 'swimply',
      name: 'Swimply',
      description: 'Rent your pool by the hour to guests',
      briefDescription: 'Pool rental marketplace',
      assetTypes: ['pool', 'swimming_pool', 'hot_tub'],
      earningRange: { min: 150, max: 800 },
      referralLink: 'https://swimply.com/referral?ref=MjQ0MTUyMw==&r=g&utm_medium=referral&utm_source=link&utm_campaign=2441523',
      logoUrl: 'https://swimply.com/favicon.ico',
      priority: 10,
      setupTime: '2-3 hours',
      requirements: ['Pool insurance', 'Safety equipment', 'High-quality photos'],
      setupSteps: ['Take pool photos', 'Set up insurance', 'Create listing', 'Set availability']
    },
    {
      id: 'peerspace',
      name: 'Peerspace',
      description: 'Rent your unique space for events and meetings',
      briefDescription: 'Unique space rental for events',
      assetTypes: ['event_space', 'creative_space', 'meeting_room'],
      earningRange: { min: 100, max: 500 },
      referralLink: 'http://www.peerspace.com/claim/gr-jdO4oxx4LGzq',
      logoUrl: 'https://www.peerspace.com/favicon.ico',
      priority: 8,
      setupTime: '2-3 hours',
      requirements: ['Unique space', 'Professional photos', 'Basic amenities'],
      setupSteps: ['Professional photography', 'Create listing', 'Set pricing', 'Manage bookings']
    },
    {
      id: 'spothero',
      name: 'SpotHero',
      description: 'Monetize your parking space',
      briefDescription: 'Parking space rental platform',
      assetTypes: ['parking', 'driveway', 'garage_parking'],
      earningRange: { min: 75, max: 400 },
      referralLink: 'https://spothero.com/developers',
      logoUrl: 'https://spothero.com/favicon.ico',
      priority: 7,
      setupTime: '1 hour',
      requirements: ['Available parking space', 'Clear access', 'Photos'],
      setupSteps: ['Take parking photos', 'Set availability', 'Price competitively', 'Go live']
    },
    {
      id: 'turo',
      name: 'Turo',
      description: 'Rent out your car to travelers',
      briefDescription: 'Car sharing marketplace',
      assetTypes: ['vehicle', 'car', 'transportation'],
      earningRange: { min: 200, max: 1000 },
      referralLink: 'https://turo.com/us/en/list-your-car',
      logoUrl: 'https://turo.com/favicon.ico',
      priority: 7,
      setupTime: '2-3 hours',
      requirements: ['Eligible vehicle', 'Insurance coverage', 'Clean car'],
      setupSteps: ['Vehicle inspection', 'Upload photos', 'Set pricing', 'List vehicle']
    },
    
    // Legacy partners that users might be clicking on
    {
      id: 'giggster',
      name: 'Giggster',
      description: 'Rent your unique space for film and photo shoots',
      briefDescription: 'Space rental for creative projects',
      assetTypes: ['event_space', 'creative_space', 'property'],
      earningRange: { min: 200, max: 1500 },
      referralLink: 'https://giggster.com',
      logoUrl: 'https://giggster.com/favicon.ico',
      priority: 6,
      setupTime: '2-3 hours',
      requirements: ['Unique space', 'Professional photos', 'Flexible scheduling'],
      setupSteps: ['Professional photography', 'Create listing', 'Set pricing', 'Manage bookings']
    },
    {
      id: 'grass-io',
      name: 'Grass.io',
      description: 'Earn passive income by sharing your internet connection',
      briefDescription: 'Internet bandwidth sharing platform',
      assetTypes: ['internet', 'bandwidth', 'wifi'],
      earningRange: { min: 15, max: 60 },
      referralLink: 'https://grass.io',
      logoUrl: 'https://grass.io/favicon.ico',
      priority: 7,
      setupTime: '10 minutes',
      requirements: ['Stable internet', 'Web browser', 'Email account'],
      setupSteps: ['Create account', 'Install extension', 'Verify connection', 'Start earning']
    },
    {
      id: 'sniffspot',
      name: 'Sniffspot',
      description: 'Rent your yard as a private dog park',
      briefDescription: 'Private dog park rental service',
      assetTypes: ['yard', 'garden', 'outdoor_space'],
      earningRange: { min: 30, max: 200 },
      referralLink: 'https://sniffspot.com',
      logoUrl: 'https://sniffspot.com/favicon.ico',
      priority: 6,
      setupTime: '1-2 hours',
      requirements: ['Secure yard', 'Pet-friendly environment', 'Clear photos'],
      setupSteps: ['Take yard photos', 'Set safety rules', 'Price per hour', 'List space']
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
    console.log('🔍 [PARTNER_SERVICE] Looking for platforms for asset type:', normalizedAssetType);
    
    let matchingPlatforms = this.platforms.filter(platform => {
      const hasMatch = platform.assetTypes.some(type => {
        const normalizedType = type.toLowerCase();
        const matches = normalizedType.includes(normalizedAssetType) || 
                       normalizedAssetType.includes(normalizedType) ||
                       normalizedAssetType === normalizedType;
        
        if (matches) {
          console.log('🎯 [PARTNER_SERVICE] Platform', platform.name, 'matches asset type', normalizedAssetType, 'via', normalizedType);
        }
        return matches;
      });
      
      return hasMatch;
    });

    console.log('🎯 [PARTNER_SERVICE] Found', matchingPlatforms.length, 'matching platforms for', normalizedAssetType);
    matchingPlatforms.forEach(platform => {
      console.log('  - Platform:', platform.name, 'Asset types:', platform.assetTypes.join(', '));
    });

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
      'property': 'Property Rental',
      'experience': 'Experience Hosting',
      'tours': 'Tours & Activities',
      'activities': 'Local Activities',
      'local_expertise': 'Local Expertise',
      'hosting': 'Hosting Services',
      'services': 'Services',
      'cleaning': 'Cleaning Services',
      'maintenance': 'Maintenance Services',
      'hospitality': 'Hospitality Services',
      'solar': 'Solar Panels',
      'rooftop': 'Rooftop Solar',
      'energy': 'Energy Solutions',
      'renewable_energy': 'Renewable Energy',
      'library': 'Community Library',
      'community': 'Community Projects',
      'books': 'Book Sharing',
      'neighborhood': 'Neighborhood Services',
      'ev_charging': 'EV Charging',
      'parking': 'Parking Space',
      'charging': 'Charging Station',
      'electric_vehicle': 'Electric Vehicle',
      'storage': 'Storage Space',
      'garage': 'Garage Space',
      'basement': 'Basement Storage',
      'shed': 'Shed Storage',
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
      'transportation': 'Transportation',
      'fitness': 'Fitness Services',
      'wellness': 'Wellness Services',
      'home_gym': 'Home Gym',
      'yard': 'Yard Space',
      'garden': 'Garden Space',
      'outdoor_space': 'Outdoor Space'
    };

    return displayNames[assetType.toLowerCase()] || assetType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
