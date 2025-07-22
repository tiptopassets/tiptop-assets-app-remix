
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Eye, DollarSign } from 'lucide-react';

const AffiliateProgramComingSoon = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold">Affiliate Program</h1>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Coming Soon
          </Badge>
        </div>
        <p className="text-gray-600 text-lg">
          Turn your network into a revenue stream
        </p>
      </div>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="text-purple-600" size={24} />
            How You'll Make Money
          </CardTitle>
          <CardDescription>
            Earn commissions from referrals and build a passive income stream
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="text-blue-600" size={20} />
                <h3 className="font-semibold">Direct Referrals</h3>
              </div>
              <p className="text-sm text-gray-600">
                Earn <strong>15% commission</strong> when your neighbors, friends, or family members sign up and start monetizing their properties through TipTop.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-green-600" size={20} />
                <h3 className="font-semibold">Multi-Level Earnings</h3>
              </div>
              <p className="text-sm text-gray-600">
                Earn <strong>5% commission</strong> from people that your referrals bring in. Build a network that earns for you automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="text-green-600" size={24} />
            Track Everything
          </CardTitle>
          <CardDescription>
            Complete visibility into your affiliate earnings and network growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Real-Time</div>
              <p className="text-sm text-gray-600">Commission Tracking</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Detailed</div>
              <p className="text-sm text-gray-600">Performance Analytics</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Monthly</div>
              <p className="text-sm text-gray-600">Payout Reports</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Get Ready to Start Earning!</h3>
            <p className="text-gray-600">
              We're putting the finishing touches on our affiliate program. 
              Soon you'll be able to share your unique referral link and start earning from your network.
            </p>
            <div className="mt-4">
              <Badge variant="outline" className="bg-white">
                🚀 Launching Soon
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateProgramComingSoon;
