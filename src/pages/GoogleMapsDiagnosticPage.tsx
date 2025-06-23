
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GoogleMapsDiagnostic from '@/components/diagnostics/GoogleMapsDiagnostic';

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
            Google Maps Diagnostic Tool
          </h1>
          <p className="text-gray-400">
            Comprehensive testing of all Google Maps API connections and configurations
          </p>
        </div>
        
        <GoogleMapsDiagnostic />
      </div>
    </div>
  );
};

export default GoogleMapsDiagnosticPage;
