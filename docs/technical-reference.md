
# TipTop Technical Reference

## API Endpoints

### Edge Function Endpoints

Base URL: `https://cxvdcdatxewrvwbcnksg.supabase.co/functions/v1/`

#### 1. analyze-property

- **Purpose**: Analyzes a property to identify monetizable assets
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "address": "123 Main St, Anytown, USA",
    "coordinates": {
      "lat": 37.7749,
      "lng": -122.4194
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "analysis": {
      "propertyType": "Single Family Home",
      "amenities": ["Garage", "Pool", "Garden"],
      "rooftop": {
        "area": 1200,
        "solarCapacity": 10,
        "revenue": 200
      },
      // additional fields...
    }
  }
  ```

#### 2. generate-3d-model

- **Purpose**: Generates a 3D model from property images
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "satelliteImage": "base64-encoded-string",
    "streetViewImage": "base64-encoded-string",
    "outputFormat": "glb",
    "quality": "standard"
  }
  ```
- **Response** (task started):
  ```json
  {
    "success": true,
    "taskId": "task-uuid-string",
    "progress": 0
  }
  ```
- **Response** (task status):
  ```json
  {
    "success": true,
    "taskId": "task-uuid-string",
    "status": "SUCCEEDED",
    "progress": 100,
    "modelUrl": "https://example.com/model.glb"
  }
  ```

#### 3. process-submission

- **Purpose**: Processes property submissions and contacts partners
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "propertyAddress": "123 Main St, Anytown, USA",
    "hasPool": true,
    "hasDriveway": true,
    "hasGarage": false,
    "hasInternet": true,
    "additionalInfo": "Additional notes"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "submissionId": "submission-uuid",
    "estimatedEarnings": 350,
    "partnersNotified": ["swimply", "honeygain"]
  }
  ```

#### 4. sync_affiliate_earnings

- **Purpose**: Syncs earnings data from browser extension
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "user_id": "user-uuid",
    "service": "honeygain",
    "earnings": 12.50
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "updated": true,
    "previousEarnings": 10.25,
    "newEarnings": 12.50
  }
  ```

## Component Hierarchy

```
App
├── AuthProvider
│   └── ModelGenerationProvider
│       └── GoogleMapProvider
│           ├── Index (Home Page)
│           │   ├── SearchBar
│           │   ├── AnalyzeButton
│           │   ├── GoogleMap
│           │   ├── AssetIcons
│           │   ├── AssetResultList
│           │   ├── ModelGenerationSheet
│           │   └── HomeModelViewer
│           │
│           ├── Dashboard
│           │   ├── DashboardLayout
│           │   │   ├── DashboardSidebar
│           │   │   └── [Dashboard Content]
│           │   ├── PropertyOverviewCard
│           │   ├── StatsCard
│           │   ├── RevenueCharts
│           │   └── AssetsTable
│           │
│           └── [Other Pages]
```

## State Management

### Context Patterns

TipTop uses React Context for global state management. Each context typically follows this pattern:

```typescript
// Context creation
const ExampleContext = createContext<ExampleContextType | undefined>(undefined);

// Provider component
export const ExampleProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  // Methods that update state
  const updateState = () => { /* ... */ };
  
  // API calls that update state
  const fetchData = async () => { /* ... */ };
  
  // Context value
  const value = {
    state,
    updateState,
    fetchData,
  };
  
  return (
    <ExampleContext.Provider value={value}>
      {children}
    </ExampleContext.Provider>
  );
};

// Custom hook for consuming context
export const useExample = () => {
  const context = useContext(ExampleContext);
  if (context === undefined) {
    throw new Error('useExample must be used within an ExampleProvider');
  }
  return context;
};
```

### Data Fetching Pattern

TipTop uses Tanstack Query for data fetching:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['resourceName', id],
  queryFn: () => fetchResource(id),
});
```

## Testing Procedures

### Component Testing

Component tests focus on rendering and user interactions. Example test pattern:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('handles user interaction', () => {
    const mockFn = jest.fn();
    render(<Component onAction={mockFn} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### API Testing

API tests verify edge function behavior. Example test pattern:

```typescript
import { createClient } from '@supabase/supabase-js';

describe('analyze-property', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  it('returns analysis for valid address', async () => {
    const { data, error } = await supabase.functions.invoke('analyze-property', {
      body: { 
        address: '123 Main St', 
        coordinates: { lat: 37.7749, lng: -122.4194 } 
      }
    });
    
    expect(error).toBeNull();
    expect(data.success).toBe(true);
    expect(data.analysis).toBeDefined();
  });
});
```

## Browser Extension

### Content Script Registration

Content scripts are registered in the manifest.json file:

```json
"content_scripts": [
  {
    "matches": ["https://*.honeygain.com/dashboard*"],
    "js": ["content-scripts/honeygain.js"]
  }
]
```

### Message Passing Pattern

Communication between content scripts and background service worker:

```javascript
// Content script sending message
chrome.runtime.sendMessage({
  action: 'detectedEarnings',
  service: 'honeygain',
  earnings: 10.50
});

// Background worker receiving message
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'detectedEarnings') {
    syncEarningsWithTipTop(message.service, message.earnings, message.userId)
      .then(result => sendResponse(result));
    return true; // Required for async response
  }
});
```

## Deployment

TipTop is deployed as a static site with Supabase handling the backend functionality. The deployment process involves:

1. Building the React application: `npm run build`
2. Deploying the static assets to a hosting service
3. Deploying edge functions to Supabase: `supabase functions deploy analyze-property`
4. Configuring environment variables on the hosting platform
5. Setting up necessary CORS and security headers
