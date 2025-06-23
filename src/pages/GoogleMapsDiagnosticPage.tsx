
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoogleMapsDiagnostic from '@/components/diagnostics/GoogleMapsDiagnostic';
import ApiKeyConfiguration from '@/components/diagnostics/ApiKeyConfiguration';

const GoogleMapsDiagnosticPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-white hover:text-white/80">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Google Maps Configuration & Diagnostics
          </h1>
          <p className="text-gray-400">
            Configure your API key and test all Google Maps connections
          </p>
        </div>
        
        <Tabs defaultValue="configure" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configure">Configure API Key</TabsTrigger>
            <TabsTrigger value="diagnostic">Run Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configure" className="mt-6">
            <ApiKeyConfiguration />
          </TabsContent>
          
          <TabsContent value="diagnostic" className="mt-6">
            <GoogleMapsDiagnostic />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GoogleMapsDiagnosticPage;
