
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Compass, Sun, Mountain, Clock, Calendar } from 'lucide-react';
import { RoofSegmentData } from '@/types/analysis';

interface RoofAnalysisDetailProps {
  roofSegments?: RoofSegmentData[];
  maxSunshineHoursPerYear?: number;
  imageryDate?: {
    year: number;
    month: number;
    day: number;
  };
}

const RoofAnalysisDetail: React.FC<RoofAnalysisDetailProps> = ({
  roofSegments = [],
  maxSunshineHoursPerYear = 0,
  imageryDate
}) => {
  // Function to convert azimuth degrees to compass direction
  const getCompassDirection = (azimuth: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(azimuth / 22.5) % 16;
    return directions[index];
  };

  // Function to get roof pitch description
  const getPitchDescription = (pitch: number) => {
    if (pitch < 5) return 'Flat';
    if (pitch < 15) return 'Low Slope';
    if (pitch < 30) return 'Medium Slope';
    if (pitch < 45) return 'Steep';
    return 'Very Steep';
  };

  // Function to determine solar efficiency based on orientation
  const getSolarEfficiency = (azimuth: number, pitch: number) => {
    // South-facing (180°) with 30-45° pitch is optimal in Northern Hemisphere
    const optimalAzimuth = 180;
    const optimalPitch = 37;
    
    const azimuthDiff = Math.abs(azimuth - optimalAzimuth);
    const pitchDiff = Math.abs(pitch - optimalPitch);
    
    // Calculate efficiency penalty
    const azimuthPenalty = Math.min(azimuthDiff / 90, 1) * 0.3; // Max 30% penalty for orientation
    const pitchPenalty = Math.min(pitchDiff / 30, 1) * 0.2; // Max 20% penalty for pitch
    
    const efficiency = Math.max(0.5, 1 - azimuthPenalty - pitchPenalty);
    return Math.round(efficiency * 100);
  };

  const averageDailySunHours = maxSunshineHoursPerYear ? Math.round((maxSunshineHoursPerYear / 365) * 10) / 10 : 0;

  return (
    <div className="space-y-4">
      {/* Sun Exposure Summary */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sun className="h-5 w-5 text-yellow-500" />
            Sun Exposure Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Annual Sun Hours</p>
              <p className="text-xl font-bold text-yellow-200">{maxSunshineHoursPerYear.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
              <Sun className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Daily Average</p>
              <p className="text-xl font-bold text-orange-200">{averageDailySunHours} hrs</p>
            </div>
            <div className="text-center p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <Calendar className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Peak Season</p>
              <p className="text-xl font-bold text-green-200">Summer</p>
            </div>
          </div>
          
          {imageryDate && (
            <div className="text-center text-sm text-gray-400">
              Satellite data from {imageryDate.month}/{imageryDate.year}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roof Segments Analysis */}
      {roofSegments.length > 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Mountain className="h-5 w-5 text-blue-400" />
              Roof Segment Analysis
              <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-200">
                {roofSegments.length} segments
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roofSegments.map((segment, index) => {
              const efficiency = getSolarEfficiency(segment.azimuthDegrees, segment.pitchDegrees);
              const compassDir = getCompassDirection(segment.azimuthDegrees);
              const pitchDesc = getPitchDescription(segment.pitchDegrees);
              
              return (
                <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Segment {index + 1}</h4>
                    <Badge 
                      variant={efficiency >= 85 ? "default" : efficiency >= 70 ? "secondary" : "destructive"}
                      className={
                        efficiency >= 85 ? "bg-green-500/80" : 
                        efficiency >= 70 ? "bg-yellow-500/80" : "bg-red-500/80"
                      }
                    >
                      {efficiency}% efficiency
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-gray-300">Direction</p>
                        <p className="text-white font-medium">{compassDir} ({segment.azimuthDegrees}°)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-300">Pitch</p>
                        <p className="text-white font-medium">{segment.pitchDegrees}° ({pitchDesc})</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-400" />
                      <div>
                        <p className="text-gray-300">Sun Hours</p>
                        <p className="text-white font-medium">{Math.round(segment.sunshineHours)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-300">Area</p>
                      <p className="text-white font-medium">{Math.round(segment.areaMeters2 * 10.764)} sq ft</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Solar Efficiency</span>
                      <span className="text-white">{efficiency}%</span>
                    </div>
                    <Progress value={efficiency} className="h-2" />
                  </div>
                </div>
              );
            })}
            
            <div className="text-xs text-gray-400 mt-4">
              <p><strong>Note:</strong> Efficiency calculated based on optimal south-facing orientation (180°) with 37° pitch.</p>
              <p>Actual performance may vary based on local weather, shading, and system components.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoofAnalysisDetail;
