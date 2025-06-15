
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardEmptyState = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-tiptop-purple/10 rounded-full flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-tiptop-purple" />
          </div>
          <CardTitle className="text-2xl">No Property Analysis Yet</CardTitle>
          <CardDescription className="text-lg">
            Start by analyzing your property to see monetization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Get started by analyzing your property to discover how you can monetize your home assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/">
                  <MapPin className="mr-2 h-4 w-4" />
                  Analyze Property
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/submit-property">
                  Submit Property Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
