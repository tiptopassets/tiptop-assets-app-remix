-- Clean up duplicate partners by consolidating asset types and removing old entries

-- Update newer entries with consolidated asset types
UPDATE enhanced_service_providers 
SET asset_types = ARRAY['internet', 'bandwidth', 'wifi']
WHERE id = '3545b0b9-c029-4dfa-974a-cecbf648577b'; -- Honeygain (newer)

UPDATE enhanced_service_providers 
SET asset_types = ARRAY['storage', 'garage', 'basement', 'shed', 'parking']
WHERE id = '819e42c5-d41e-4e82-81ab-f8213ecf47f3'; -- Neighbor.com (newer)

UPDATE enhanced_service_providers 
SET asset_types = ARRAY['pool', 'swimming_pool', 'hot_tub', 'event_space']
WHERE id = '70ca689a-2799-46c0-acdf-ef4da7ed56c2'; -- Swimply (newer)

-- Tesla Energy newer entry already has the complete set: ['solar', 'rooftop', 'energy']

-- Remove older duplicate entries
DELETE FROM enhanced_service_providers 
WHERE id IN (
  '6fb4efd4-69c1-4948-8ea9-538e2cb168b3', -- Honeygain (older)
  'a292070c-7013-4c8f-bbda-7e7f5aede99c', -- Neighbor.com (older)
  '5dae1481-3c4a-4e2a-8dac-6da2285e458d', -- Swimply (older)
  'b41a7e90-eef1-4de7-9df7-555fa743a216'  -- Tesla Energy (older)
);