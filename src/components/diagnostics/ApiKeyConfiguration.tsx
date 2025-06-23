
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ApiKeyConfiguration = () => {
  const [newApiKey, setNewApiKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpdateApiKey = async () => {
    if (!newApiKey.trim()) {
      setUpdateStatus('error');
      setStatusMessage('Please enter a valid API key');
      return;
    }

    setIsUpdating(true);
    setUpdateStatus('idle');

    try {
      // Test the API key first by making a simple request
      const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${newApiKey}`;
      const response = await fetch(testUrl);
      const data = await response.json();

      if (data.error_message) {
        throw new Error(data.error_message);
      }

      // If the test passes, the API key is valid
      setUpdateStatus('success');
      setStatusMessage(`API key is valid and ready to use. You need to update it in your Supabase secrets.`);
    } catch (error) {
      setUpdateStatus('error');
      setStatusMessage(`API key validation failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentDomain = window.location.origin;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            API Key Configuration
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Google Cloud Console
              </a>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Domain:</strong> {currentDomain}
              <br />
              Make sure your API key is authorized for this domain and <code>*.lovableproject.com/*</code>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key">New Google Maps API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Google Maps API key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="font-mono"
              />
            </div>

            <Button
              onClick={handleUpdateApiKey}
              disabled={isUpdating || !newApiKey.trim()}
              className="w-full"
            >
              {isUpdating ? 'Validating...' : 'Validate API Key'}
            </Button>

            {updateStatus !== 'idle' && (
              <Alert variant={updateStatus === 'success' ? 'default' : 'destructive'}>
                {updateStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How to update your API key:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
              <li>Find your Maps API key or create a new one</li>
              <li>Under "Application restrictions", add these domains:
                <ul className="list-disc list-inside ml-4 mt-1 font-mono text-xs">
                  <li>{currentDomain}/*</li>
                  <li>https://*.lovableproject.com/*</li>
                  <li>http://localhost:*</li>
                </ul>
              </li>
              <li>Enable these APIs: Maps JavaScript API, Geocoding API, Places API</li>
              <li>Test your key using the form above</li>
              <li>Update the <code>GOOGLE_MAPS_API_KEY</code> secret in your Supabase project</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyConfiguration;
