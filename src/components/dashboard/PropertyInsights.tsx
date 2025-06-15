
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Lightbulb,
  Target,
  Star,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface PropertyInsightsProps {
  address?: string;
  analysisResults?: any;
}

export const PropertyInsights = ({ address, analysisResults }: PropertyInsightsProps) => {
  // Mock comprehensive property insights
  const insights = {
    propertyScore: 87,
    marketPosition: 'Above Average',
    potentialRevenue: 2150,
    currentRevenue: 1847,
    efficiency: 86,
    recommendations: [
      {
        id: 1,
        title: 'Add EV Charging Station',
        impact: 'High',
        revenue: 450,
        effort: 'Medium',
        timeframe: '2-3 months',
        description: 'Install Level 2 EV charger in parking area',
        status: 'recommended'
      },
      {
        id: 2,
        title: 'Optimize Solar Panel Angle',
        impact: 'Medium',
        revenue: 120,
        effort: 'Low',
        timeframe: '1-2 weeks',
        description: 'Adjust panel tilt for better sun exposure',
        status: 'urgent'
      },
      {
        id: 3,
        title: 'Pool Automation System',
        impact: 'High',
        revenue: 300,
        effort: 'High',
        timeframe: '1-2 months',
        description: 'Smart pool management for better utilization',
        status: 'consideration'
      }
    ],
    marketTrends: {
      solarDemand: { value: 92, trend: 'up', change: 15.3 },
      parkingDemand: { value: 78, trend: 'up', change: 8.7 },
      poolRental: { value: 85, trend: 'up', change: 23.1 },
      gardenSpace: { value: 65, trend: 'stable', change: 2.1 }
    },
    competitiveAnalysis: {
      averageRevenue: 1620,
      yourRevenue: 1847,
      ranking: 'Top 25%',
      strengths: ['Solar efficiency', 'Prime location', 'Multiple assets'],
      improvements: ['EV charging', 'Smart automation', 'Marketing']
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'recommended': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'consideration': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Overview */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-6 w-6 text-purple-600" />
            Property Intelligence Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-purple-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${insights.propertyScore}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">{insights.propertyScore}</span>
                </div>
              </div>
              <p className="font-semibold">Property Score</p>
              <Badge className="mt-1 bg-purple-100 text-purple-800">{insights.marketPosition}</Badge>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${insights.currentRevenue.toLocaleString()}
              </div>
              <p className="text-gray-600">Current Monthly Revenue</p>
              <p className="text-sm text-green-600 mt-1">
                +${(insights.potentialRevenue - insights.currentRevenue).toLocaleString()} potential
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{insights.efficiency}%</div>
              <p className="text-gray-600">Asset Efficiency</p>
              <p className="text-sm text-blue-600 mt-1">Above neighborhood average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Insights Tabs */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Position</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {insights.recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(rec.status)}
                        <div>
                          <h3 className="font-semibold text-lg">{rec.title}</h3>
                          <p className="text-gray-600 text-sm">{rec.description}</p>
                        </div>
                      </div>
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact} Impact
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">+${rec.revenue}</p>
                        <p className="text-xs text-gray-600">Monthly Revenue</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">{rec.effort}</p>
                        <p className="text-xs text-gray-600">Implementation</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">{rec.timeframe}</p>
                        <p className="text-xs text-gray-600">Timeline</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Button size="sm" className="w-full">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Market Demand Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(insights.marketTrends).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={data.value} className="flex-1" />
                      <span className="text-sm font-medium">{data.value}%</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className={`text-sm font-medium ${
                      data.trend === 'up' ? 'text-green-600' : 
                      data.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {data.change > 0 ? '+' : ''}{data.change}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Your Revenue</span>
                    <span className="font-bold text-green-600">
                      ${insights.competitiveAnalysis.yourRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Area Average</span>
                    <span className="font-bold text-gray-600">
                      ${insights.competitiveAnalysis.averageRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">
                      {insights.competitiveAnalysis.ranking}
                    </p>
                    <p className="text-sm text-gray-600">in your area</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strengths & Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                    <div className="space-y-1">
                      {insights.competitiveAnalysis.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Improvement Areas</h4>
                    <div className="space-y-1">
                      {insights.competitiveAnalysis.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
