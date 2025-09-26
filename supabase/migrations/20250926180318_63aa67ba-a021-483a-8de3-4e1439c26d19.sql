-- Update referral links for existing partners

UPDATE enhanced_service_providers 
SET referral_link_template = 'https://www.airbnb.com/rp/tiptopa2?p=stay&s=67&unique_share_id=ace0bce8-693b-4430-95a4-d790ae402679'
WHERE name = 'Airbnb Unit Rental';

UPDATE enhanced_service_providers 
SET referral_link_template = 'https://www.airbnb.com/rp/tiptopa2?p=experience&s=67&unique_share_id=31f4b412-ab23-4086-83b1-2c42610fa78d'
WHERE name = 'Airbnb Experience';

UPDATE enhanced_service_providers 
SET referral_link_template = 'https://www.airbnb.com/rp/tiptopa2?p=service&s=67&unique_share_id=831440f2-8e02-447e-9235-bbf4d928ca8b'
WHERE name = 'Airbnb Service';

UPDATE enhanced_service_providers 
SET referral_link_template = 'https://join.honeygain.com/TIPTO9E10F'
WHERE name = 'Honeygain';

UPDATE enhanced_service_providers 
SET referral_link_template = 'https://www.neighbor.com/invited/eduardo-944857?program_version=1'
WHERE name = 'Neighbor.com';

UPDATE enhanced_service_providers 
SET referral_link_template = 'https://www.peerspace.com/claim/gr-jdO4oxx4LGzq'
WHERE name = 'Peerspace';

UPDATE enhanced_service_providers 
SET referral_link_template = 'https://app.grass.io/register?referral=nmGzz16893s4u-R'
WHERE name = 'Grass.io';

UPDATE enhanced_service_providers 
SET referral_link_template = 'https://www.sniffspot.com/host'
WHERE name = 'Sniffspot';