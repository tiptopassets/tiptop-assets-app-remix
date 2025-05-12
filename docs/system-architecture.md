
# TipTop System Architecture

## Overview

TipTop uses a modern web application architecture with React on the frontend and Supabase on the backend. This document outlines the key components and how they interact.

## Architecture Diagram

```
+---------------+     +----------------+     +------------------+
| User Interface |---->| React Contexts |---->| Supabase Client  |
+---------------+     +----------------+     +------------------+
       |                      |                      |
       v                      v                      v
+---------------+     +----------------+     +------------------+
| UI Components |     | Custom Hooks   |     | Edge Functions   |
+---------------+     +----------------+     +------------------+
                              |                      |
                              v                      v
                      +----------------+     +------------------+
                      | State Management|    | External APIs    |
                      +----------------+     +------------------+
```

## Core Components

### Context Providers

1. **AuthContext**
   - Manages user authentication state
   - Provides login/logout functionality
   - Tracks user roles and permissions

2. **ModelGenerationContext**
   - Handles 3D model generation process
   - Manages property image capturing
   - Tracks generation status and progress

3. **GoogleMapContext**
   - Manages Google Maps integration
   - Handles address search and validation
   - Provides property analysis functionality

### Edge Functions

1. **analyze-property**
   - Input: Property address and coordinates
   - Process: Calls OpenAI to analyze property features
   - Output: Asset opportunities and revenue estimates

2. **generate-3d-model**
   - Input: Satellite and street view images
   - Process: Calls Meshy.ai API to generate 3D models
   - Output: GLB model file URL

3. **process-submission**
   - Input: User and property details
   - Process: Validates submission and contacts service partners
   - Output: Confirmation and estimated earnings

4. **sync_affiliate_earnings**
   - Input: Service name and earnings data
   - Process: Updates user earnings in database
   - Output: Success/failure status

### Database Structure

1. **Auth Tables** (managed by Supabase)
   - users
   - auth.users

2. **Custom Tables**
   - property_submissions
   - affiliate_earnings
   - services
   - user_roles

## Data Flow

### Property Analysis Flow

1. User enters address in search bar
2. Address geocoded via Google Maps API
3. Property images captured from Google Maps
4. Images sent to analyze-property edge function
5. OpenAI analyzes property features
6. Results stored in database
7. Frontend displays monetization options

### 3D Model Generation Flow

1. Property images captured from Google Maps
2. Images sent to generate-3d-model edge function
3. Meshy.ai API processes images
4. 3D model URL returned to frontend
5. Model displayed in viewer component

### Affiliate Earnings Flow

1. User browses partner website with extension installed
2. Extension content script detects earnings data
3. Data sent to background service worker
4. Worker calls sync_affiliate_earnings edge function
5. Earnings updated in database
6. Dashboard displays latest earnings

## Security Model

- Row-Level Security (RLS) on all database tables
- JWT authentication for API requests
- Service-role key used only in edge functions
- Public API keys restricted by domain

## Error Handling

- Toast notifications for user-facing errors
- Console logging for development debugging
- Structured error responses from edge functions
- Fallback UI states for failed operations
