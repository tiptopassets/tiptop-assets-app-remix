
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { loadGoogleMaps, getGoogleMapsApiKey, verifyApiKeyConfiguration } from '@/utils/googleMapsLoader';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

const GoogleMapsDiagnostic = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');

  useEffect(() => {
    setCurrentDomain(window.location.origin);
  }, []);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    clearResults();

    // Test 1: Check environment variable
    addResult({ test: 'Environment Variable Check', status: 'pending', message: 'Checking VITE_GOOGLE_MAPS_API_KEY...' });
    const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (envApiKey) {
      addResult({ 
        test: 'Environment Variable Check', 
        status: 'success', 
        message: `Found API key in environment: ${envApiKey.substring(0, 10)}...`,
        details: { key: envApiKey }
      });
    } else {
      addResult({ 
        test: 'Environment Variable Check', 
        status: 'warning', 
        message: 'No API key found in environment variables'
      });
    }

    // Test 2: Check Supabase Edge Function
    addResult({ test: 'Supabase Edge Function', status: 'pending', message: 'Testing get-google-maps-key function...' });
    try {
      const { data, error } = await supabase.functions.invoke('get-google-maps-key', {
        body: { origin: window.location.origin }
      });
      
      if (error) {
        addResult({ 
          test: 'Supabase Edge Function', 
          status: 'error', 
          message: `Edge function error: ${error.message}`,
          details: error
        });
      } else if (data?.apiKey) {
        addResult({ 
          test: 'Supabase Edge Function', 
          status: 'success', 
          message: `Edge function returned API key: ${data.apiKey.substring(0, 10)}...`,
          details: data
        });
      } else {
        addResult({ 
          test: 'Supabase Edge Function', 
          status: 'error', 
          message: 'Edge function returned no API key',
          details: data
        });
      }
    } catch (error) {
      addResult({ 
        test: 'Supabase Edge Function', 
        status: 'error', 
        message: `Edge function failed: ${error.message}`,
        details: error
      });
    }

    // Test 3: Get API Key via our loader
    addResult({ test: 'API Key Retrieval', status: 'pending', message: 'Getting API key via googleMapsLoader...' });
    try {
      const apiKey = await getGoogleMapsApiKey();
      addResult({ 
        test: 'API Key Retrieval', 
        status: 'success', 
        message: `Retrieved API key: ${apiKey.substring(0, 10)}...`,
        details: { key: apiKey, source: envApiKey ? 'environment' : 'supabase' }
      });
    } catch (error) {
      addResult({ 
        test: 'API Key Retrieval', 
        status: 'error', 
        message: `Failed to get API key: ${error.message}`,
        details: error
      });
    }

    // Test 4: Verify API Key Configuration
    addResult({ test: 'API Key Validation', status: 'pending', message: 'Validating API key configuration...' });
    try {
      const validation = await verifyApiKeyConfiguration();
      addResult({ 
        test: 'API Key Validation', 
        status: validation.valid ? 'success' : 'error', 
        message: validation.message,
        details: validation
      });
    } catch (error) {
      addResult({ 
        test: 'API Key Validation', 
        status: 'error', 
        message: `Validation failed: ${error.message}`,
        details: error
      });
    }

    // Test 5: Load Google Maps API
    addResult({ test: 'Google Maps API Loading', status: 'pending', message: 'Attempting to load Google Maps API...' });
    try {
      const maps = await loadGoogleMaps();
      addResult({ 
        test: 'Google Maps API Loading', 
        status: 'success', 
        message: 'Google Maps API loaded successfully',
        details: { version: maps.version }
      });
    } catch (error) {
      addResult({ 
        test: 'Google Maps API Loading', 
        status: 'error', 
        message: `Failed to load Google Maps: ${error.message}`,
        details: error
      });
    }

    // Test 6: Test Map Creation
    addResult({ test: 'Map Instance Creation', status: 'pending', message: 'Testing map instance creation...' });
    try {
      if (window.google?.maps) {
        const testDiv = document.createElement('div');
        testDiv.style.width = '100px';
        testDiv.style.height = '100px';
        testDiv.style.position = 'absolute';
        testDiv.style.left = '-9999px';
        document.body.appendChild(testDiv);
        
        const testMap = new google.maps.Map(testDiv, {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 10
        });
        
        document.body.removeChild(testDiv);
        
        addResult({ 
          test: 'Map Instance Creation', 
          status: 'success', 
          message: 'Map instance created successfully'
        });
      } else {
        addResult({ 
          test: 'Map Instance Creation', 
          status: 'error', 
          message: 'Google Maps API not available'
        });
      }
    } catch (error) {
      addResult({ 
        test: 'Map Instance Creation', 
        status: 'error', 
        message: `Map creation failed: ${error.message}`,
        details: error
      });
    }

    // Test 7: Domain Information
    addResult({ 
      test: 'Domain Information', 
      status: 'success', 
      message: `Current domain: ${currentDomain}`,
      details: { 
        origin: window.location.origin,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port
      }
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Maps Diagnostic Tool
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              'Run Diagnostics'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.length === 0 && !isRunning && (
            <p className="text-gray-500 text-center py-8">
              Click "Run Diagnostics" to test all Google Maps connections
            </p>
          )}
          
          {results.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="font-medium">{result.test}</div>
                <div className="text-sm text-gray-600">{result.message}</div>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-blue-600 cursor-pointer">Show Details</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsDiagnostic;
