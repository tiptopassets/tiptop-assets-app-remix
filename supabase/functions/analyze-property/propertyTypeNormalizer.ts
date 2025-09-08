// Property type normalization helper
export function normalizePropertyType(rawType: string): string {
  if (!rawType) return 'residential';
  
  const type = rawType.toLowerCase();
  
  // Map variants to primary categories
  if (type.includes('single') || type.includes('family') || type === 'single_family_home') {
    return 'residential';
  }
  
  if (type.includes('apartment') || type.includes('condo') || type.includes('multi')) {
    return 'apartment';
  }
  
  if (type.includes('commercial') || type.includes('retail') || type.includes('office')) {
    return 'commercial';
  }
  
  if (type.includes('industrial') || type.includes('warehouse') || type.includes('manufacturing')) {
    return 'industrial';
  }
  
  if (type.includes('vacant') || type.includes('empty') || type.includes('undeveloped')) {
    return 'vacant_land';
  }
  
  if (type.includes('mixed') || type === 'mixed_use') {
    return 'mixed_use';
  }
  
  if (type.includes('institutional') || type.includes('school') || type.includes('hospital')) {
    return 'institutional';
  }
  
  if (type.includes('agricultural') || type.includes('farm') || type.includes('ranch')) {
    return 'agricultural';
  }
  
  // Return as-is if already normalized
  const validTypes = ['residential', 'commercial', 'industrial', 'vacant_land', 'mixed_use', 'institutional', 'agricultural', 'apartment'];
  if (validTypes.includes(type)) {
    return type;
  }
  
  // Default fallback
  return 'residential';
}