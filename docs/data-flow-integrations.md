
# TipTop Data Flow and Integrations

## Data Flow Overview

TipTop's data flows through several layers, from user input to external services and back. This document outlines the main data paths and integration points.

## Frontend to Backend Flow

### User Input → Edge Functions

1. **User enters address**
   - `useAddressSearch` hook captures input
   - Google Places API provides autocomplete
   - Selected address sent to `GoogleMapContext`

2. **Property analysis request**
   - `GoogleMapContext.generatePropertyAnalysis()` called
   - Address and coordinates sent to `analyze-property` edge function
   - Edge function returns property analysis

3. **3D model generation request**
   - `ModelGenerationContext.generateModel()` called
   - Property images sent to `generate-3d-model` edge function
   - Task ID returned for status polling
   - Completed model URL returned to frontend

## API Integrations

### Google Maps Integration

- **API Services Used**:
  - Places API (autocomplete)
  - Geocoding API (coordinates)
  - Static Maps API (satellite imagery)
  - Street View API (property views)

- **Integration Method**:
  - Google Maps JavaScript SDK loaded via `googleMapsLoader.ts`
  - API key stored in Supabase secrets
  - Custom hooks (`useAddressSearch`, `useGoogleMap`) wrap Google APIs

- **Data Flow**:
  ```
  User Input → Places API → Geocoding → Static Maps → 
  Property Images → Model Generation → 3D Model
  ```

### Meshy.ai Integration

- **Purpose**: Generate 3D models from 2D images

- **Integration Method**:
  - API calls made from `generate-3d-model` edge function
  - API key stored in Supabase secrets

- **Data Flow**:
  ```
  Property Images → Meshy API → Task Creation → 
  Status Polling → 3D Model URL → Frontend Display
  ```
  
- **Implementation Details**:
  - Edge function makes initial API call to create task
  - Frontend polls task status until complete
  - GLB model loaded into Three.js viewer component

### OpenAI Integration

- **Purpose**: Property analysis and revenue estimation

- **Integration Method**:
  - API calls made from `analyze-property` edge function
  - API key stored in Supabase secrets

- **Data Flow**:
  ```
  Property Address → OpenAI API → Property Analysis → 
  Asset Identification → Revenue Estimates → Frontend Display
  ```

- **Implementation Details**:
  - Structured prompt includes address and property images
  - Response parsed and structured for frontend consumption
  - Results cached to minimize API usage

## Partner Service Integrations

### Honeygain Integration

- **Purpose**: Internet bandwidth sharing monetization

- **Integration Method**:
  - Browser extension content script extracts earnings data
  - Backend API syncs data to TipTop database

- **Data Flow**:
  ```
  Honeygain Dashboard → Content Script → Background Worker → 
  sync_affiliate_earnings Edge Function → Database → Dashboard
  ```

### Swimply Integration

- **Purpose**: Pool rental monetization

- **Integration Method**:
  - API integration via `process-submission` edge function
  - Browser extension content script for earnings tracking

- **Data Flow**:
  ```
  Property Submission → process-submission → Swimply API → 
  Listing Creation → Earnings Tracking → Dashboard
  ```

### Neighbor Integration

- **Purpose**: Storage space rental

- **Integration Method**:
  - API integration via `process-submission` edge function
  - Browser extension content script for earnings tracking

- **Data Flow**:
  ```
  Property Submission → process-submission → Neighbor API → 
  Listing Creation → Earnings Tracking → Dashboard
  ```

## Authentication Flow

1. **User signs in with Google**
   - `AuthContext.signInWithGoogle()` called
   - Redirected to Google OAuth flow
   - Returns to app with access token
   - Token stored in local storage
   - User data stored in Supabase auth tables

2. **Authenticated API requests**
   - Access token attached to Supabase requests
   - Row-Level Security (RLS) validates user access
   - Edge functions verify JWT token

3. **Session management**
   - `AuthContext` handles session persistence
   - Session recovery on page reload
   - Automatic token refresh

## Browser Extension Integration

1. **Extension installation**
   - User installs Chrome extension
   - Extension requests TipTop API credentials
   - User provides credentials in popup

2. **Content script activation**
   - Extension matches partner website URLs
   - Loads appropriate content script
   - Script extracts earnings data

3. **Data synchronization**
   - Background worker sends data to TipTop API
   - Edge function updates database
   - Dashboard displays synced earnings

## Database Integration

- **Tables**: All data stored in Supabase PostgreSQL tables
- **Authentication**: Handled by Supabase Auth
- **Security**: Row-Level Security (RLS) policies ensure data isolation
- **Real-time**: Changes monitored via Supabase subscriptions
- **Storage**: Files and models stored in Supabase Storage buckets

## Error Handling

- **Network errors**: Retry logic and fallback states
- **API limits**: Rate limiting and queueing mechanisms
- **Data validation**: Schema validation before storage
- **User feedback**: Toast notifications for errors
- **Logging**: Error details logged to console and monitoring systems
