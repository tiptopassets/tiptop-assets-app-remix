-- Add missing partners from additionalOpportunities to enhanced_service_providers table

INSERT INTO enhanced_service_providers (
  name, 
  description, 
  asset_types, 
  avg_monthly_earnings_low, 
  avg_monthly_earnings_high,
  priority,
  is_active,
  url,
  referral_link_template
) VALUES 
(
  'Eventbrite',
  'Event planning and ticketing platform for large venue rentals and event hosting',
  ARRAY['event-space', 'venue-rental', 'large-events'],
  200,
  400,
  75,
  true,
  'https://www.eventbrite.com',
  'https://www.eventbrite.com/organizer/overview/'
),
(
  'Rover',
  'Pet care services platform for dog boarding, pet sitting, and pet walking services',
  ARRAY['pet-services', 'dog-boarding', 'pet-sitting'],
  120,
  250,
  70,
  true,
  'https://www.rover.com',
  'https://www.rover.com/become-a-sitter/'
),
(
  'Splacer',
  'Fitness and wellness space rental platform for workout studios and dance spaces',
  ARRAY['fitness-studio', 'workout-space', 'dance-studio'],
  120,
  200,
  65,
  true,
  'https://www.splacer.co',
  'https://www.splacer.co/list-your-space'
),
(
  'Local Markets',
  'Local farmers market and produce sales platform for garden and agricultural products',
  ARRAY['garden', 'produce-sales', 'farmers-market', 'experience'],
  50,
  120,
  60,
  true,
  'https://www.localmarkets.org',
  'https://www.localmarkets.org/join'
),
(
  'Instacart',
  'Grocery delivery service pickup point partnerships and delivery hub services',
  ARRAY['grocery-pickup', 'delivery-hub', 'storage'],
  50,
  100,
  55,
  true,
  'https://www.instacart.com',
  'https://shoppers.instacart.com/'
),
(
  'GameServers',
  'Gaming server hosting and online gaming services for gaming enthusiasts',
  ARRAY['gaming', 'server-hosting', 'online-services'],
  100,
  200,
  50,
  true,
  'https://www.gameservers.com',
  'https://www.gameservers.com/affiliate-program'
);