
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Wifi, Download, Upload, Clock, Activity, Play, Square } from 'lucide-react';
import { useInternetSpeed } from '@/hooks/useInternetSpeed';

const SpeedTestWidget = () => {
  const { 
    latestResult, 
    isTestRunning, 
    runSpeedTest,
    getNetworkQuality 
  } = useInternetSpeed();

  const getSpeedColor = (speed: number, type: 'download' | 'upload') => {
    const threshold = type === 'download' ? 25 : 10;
    if (speed >= threshold * 2) return 'text-green-500';
    if (speed >= threshold) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPingColor = (ping: number) => {
    if (ping <= 20) return 'text-green-500';
    if (ping <= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityBadge = () => {
    if (!latestResult) return null;
    const quality = getNetworkQuality();
    if (quality >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (quality >= 60) return <Badge className="bg-yellow-500">Good</Badge>;
    if (quality >= 40) return <Badge className="bg-orange-500">Fair</Badge>;
    return <Badge className="bg-red-500">Poor</Badge>;
  };

  return (
    <Card className="bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wifi className="h-5 w-5 text-blue-500" />
          Internet Speed Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex gap-2">
          <Button
            onClick={runSpeedTest}
            disabled={isTestRunning}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isTestRunning ? 'Testing...' : 'Start Speed Test'}
          </Button>
        </div>

        {/* Test Progress */}
        {isTestRunning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Running speed test...</span>
              <span className="text-gray-300">In Progress</span>
            </div>
            <Progress value={33} className="h-2" />
          </motion.div>
        )}

        {/* Latest Results */}
        {latestResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-4 border-t border-gray-600"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Network Quality</span>
              {getQualityBadge()}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                <Download className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Download</p>
                <p className={`text-lg font-bold ${getSpeedColor(latestResult.downloadSpeed, 'download')}`}>
                  {latestResult.downloadSpeed.toFixed(1)} Mbps
                </p>
              </div>

              <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                <Upload className="h-5 w-5 text-green-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Upload</p>
                <p className={`text-lg font-bold ${getSpeedColor(latestResult.uploadSpeed, 'upload')}`}>
                  {latestResult.uploadSpeed.toFixed(1)} Mbps
                </p>
              </div>

              <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                <Clock className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Ping</p>
                <p className={`text-lg font-bold ${getPingColor(latestResult.ping)}`}>
                  {latestResult.ping} ms
                </p>
              </div>

              <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                <Activity className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Jitter</p>
                <p className="text-lg font-bold text-orange-400">
                  {latestResult.jitter.toFixed(1)} ms
                </p>
              </div>
            </div>

            <div className="text-center text-xs text-gray-400">
              Last tested: {latestResult.timestamp.toLocaleString()}
            </div>
          </motion.div>
        )}

        {!latestResult && !isTestRunning && (
          <div className="text-center py-6 text-gray-400">
            <Wifi className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Run a speed test to see your connection details</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpeedTestWidget;
