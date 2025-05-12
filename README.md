
# TipTop: Home Asset Monetization Platform

## Project Overview and Scope

TipTop is a platform that helps property owners monetize their home assets by identifying and implementing revenue opportunities. It uses AI-powered analysis to suggest optimal ways to generate income from various property features like rooftops (solar), parking spaces, gardens, pools, internet bandwidth, and storage space.

### Key Features
- Property analysis using AI and satellite imagery
- 3D property model generation
- Revenue opportunity identification
- Partner service integrations
- Asset management dashboard
- Affiliate earnings tracking and browser extension

## System Architecture

### Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Supabase (PostgreSQL database, authentication, edge functions)
- **APIs**: Google Maps API, Meshy.ai, OpenAI
- **Browser Extension**: Chrome extension for affiliate tracking

![TipTop Architecture](/lovable-uploads/091a67ab-4042-438b-bc99-27ee182ea80e.png)

## User Journey

1. **Property Search**: Users enter their property address in the search bar
2. **Property Analysis**: System analyzes the property using Google Maps data
3. **Asset Identification**: AI identifies potential monetizable assets
4. **Revenue Calculation**: System calculates potential monthly revenue
5. **Service Selection**: Users select which assets they want to monetize
6. **Partner Connection**: System connects users with relevant service partners
7. **Dashboard Management**: Users track earnings and manage assets

## Data Flow

```
User Input → Frontend → Supabase Auth → Edge Functions → External APIs
                ↓                         ↑
            Local State              Database Storage
```

1. User inputs address and property data
2. Frontend sends request to Supabase edge functions
3. Edge functions process data and call external APIs
4. Results stored in database and returned to frontend
5. Frontend displays results and options to user

## External Integrations

### Google Maps
- Satellite imagery for property analysis
- Street View for visual confirmation
- Geocoding for address validation

### Meshy.ai
- 3D model generation from satellite imagery

### OpenAI
- Property analysis and revenue estimation

### Service Partners
- **Honeygain**: Internet bandwidth sharing
- **Swimply**: Pool rental service
- **Neighbor**: Storage space rental
- **EV Charging**: Various EV charging networks

## Database Schema

TipTop uses a PostgreSQL database with the following key tables:

- `property_submissions`: Stores property details submitted by users
- `affiliate_earnings`: Tracks user earnings from various services
- `services`: List of available service integrations
- `user_roles`: User permission management

## Edge Functions

- `analyze-property`: Analyzes properties and generates monetization suggestions
- `generate-3d-model`: Creates 3D models of properties using Meshy.ai
- `process-submission`: Processes property submissions and connects with partners
- `sync_affiliate_earnings`: Syncs earnings data from the browser extension

## Browser Extension

The TipTop Affiliate Sync extension monitors partner websites and syncs earnings data with the main platform, including:
- Content scripts for each partner site
- Background service worker for API calls
- Popup interface for user interaction

## Development Setup

### Prerequisites
- Node.js and npm
- Supabase account and CLI
- Google Maps API key
- Meshy.ai API key
- OpenAI API key

### Configuration
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with required API keys
4. Start the development server: `npm run dev`

### Environment Variables
- `GOOGLE_MAPS_API_KEY`: For map integration
- `MESHY_API_KEY`: For 3D model generation
- `OPENAI_API_KEY`: For AI analysis

## Future Roadmap

- Mobile application development
- Additional monetization partners
- Enhanced 3D model capabilities
- Smart contracts for property asset tokenization

## Contact

For questions or support, please contact the TipTop development team.
