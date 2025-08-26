import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Partner = Database['public']['Tables']['enhanced_service_providers']['Row'];

export interface PartnerInfo {
  id: string;
  name: string;
  description: string;
  logo: string;
  url: string;
  referralLink: string;
  assetTypes: string[];
  monthlyEarnings: {
    low: number;
    high: number;
  };
  priority: number;
  setupRequirements: Record<string, any>;
}

// Cache for partners data
let partnersCache: Partner[] = [];
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches all active partners from the database with caching
 */
export async function fetchPartners(forceRefresh = false): Promise<Partner[]> {
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (!forceRefresh && partnersCache.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    return partnersCache;
  }

  try {
    console.log('🔄 Fetching partners from database...');
    
    const { data, error } = await supabase
      .from('enhanced_service_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching partners:', error);
      return partnersCache; // Return cached data on error
    }

    partnersCache = data || [];
    lastFetch = now;
    
    console.log(`✅ Loaded ${partnersCache.length} active partners`);
    return partnersCache;
  } catch (err) {
    console.error('Error in fetchPartners:', err);
    return partnersCache; // Return cached data on error
  }
}

/**
 * Normalizes asset type for consistent matching
 */
export function normalizeAssetType(assetType: string): string {
  return assetType
    .toLowerCase()
    .trim()
    .replace(/[_\s-]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Finds partners that match the given asset type
 */
export function getPartnersForAssetType(assetType: string, partners: Partner[] = partnersCache): PartnerInfo[] {
  const normalizedAssetType = normalizeAssetType(assetType);
  
  const matchingPartners = partners.filter(partner => {
    if (!partner.asset_types) return false;
    
    return partner.asset_types.some(partnerAssetType => {
      const normalizedPartnerType = normalizeAssetType(partnerAssetType);
      
      // Check for exact match or partial match
      return normalizedPartnerType === normalizedAssetType ||
             normalizedPartnerType.includes(normalizedAssetType) ||
             normalizedAssetType.includes(normalizedPartnerType);
    });
  });

  // Deduplicate partners by ID and transform to PartnerInfo
  const uniquePartners = matchingPartners.reduce((acc, partner) => {
    if (!acc.some(existing => existing.id === partner.id)) {
      acc.push(transformPartnerToInfo(partner));
    }
    return acc;
  }, [] as PartnerInfo[]);

  console.log(`🎯 Found ${uniquePartners.length} unique partners for asset type: ${assetType}`);
  uniquePartners.forEach(partner => {
    console.log(`- ${partner.name}: ${partner.assetTypes.join(', ')}`);
  });

  return uniquePartners;
}

/**
 * Gets a specific partner by ID
 */
export function getPartnerById(partnerId: string, partners: Partner[] = partnersCache): PartnerInfo | null {
  const partner = partners.find(p => p.id === partnerId);
  return partner ? transformPartnerToInfo(partner) : null;
}

/**
 * Gets all available asset categories from partners
 */
export function getAvailableAssetCategories(partners: Partner[] = partnersCache): string[] {
  const categories = new Set<string>();
  
  partners.forEach(partner => {
    if (partner.asset_types) {
      partner.asset_types.forEach(assetType => {
        categories.add(assetType);
      });
    }
  });

  return Array.from(categories).sort();
}

/**
 * Transforms raw partner data to clean PartnerInfo interface
 */
function transformPartnerToInfo(partner: Partner): PartnerInfo {
  // Handle setup_requirements which can be Json (string, number, object, etc.)
  let setupRequirements: Record<string, any> = {};
  if (partner.setup_requirements && typeof partner.setup_requirements === 'object' && !Array.isArray(partner.setup_requirements)) {
    setupRequirements = partner.setup_requirements as Record<string, any>;
  }

  return {
    id: partner.id,
    name: partner.name,
    description: partner.description || '',
    logo: partner.logo || '',
    url: partner.url || '',
    referralLink: partner.referral_link_template || partner.url || '',
    assetTypes: partner.asset_types || [],
    monthlyEarnings: {
      low: partner.avg_monthly_earnings_low || 0,
      high: partner.avg_monthly_earnings_high || 0,
    },
    priority: partner.priority || 0,
    setupRequirements,
  };
}

/**
 * Gets partner logo with fallback to favicon
 */
export function getPartnerLogo(partner: PartnerInfo): string {
  if (partner.logo) {
    return partner.logo;
  }
  
  try {
    const domain = new URL(partner.url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=example.com&sz=64`;
  }
}

/**
 * Clears the partners cache (useful for testing or when data changes)
 */
export function clearPartnersCache(): void {
  partnersCache = [];
  lastFetch = 0;
  console.log('🗑️ Partners cache cleared');
}