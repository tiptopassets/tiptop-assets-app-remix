
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ServiceCard, { ServiceCardProps } from './ServiceCard';
import { FormValues } from './PropertySubmissionForm';

interface SubmissionResultsProps {
  totalEarnings: number;
  services: ServiceCardProps[];
  formData: FormValues | null;
  onDownloadPDF: () => void;
}

const SubmissionResults: React.FC<SubmissionResultsProps> = ({
  totalEarnings,
  services,
  formData,
  onDownloadPDF,
}) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl"
    >
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">Property Submitted!</h1>
        <p className="text-gray-300 mt-2 max-w-xl mx-auto">
          Based on your property features, you could earn approximately:
        </p>
        <div className="text-4xl font-bold text-tiptop-purple mt-2">${totalEarnings}/month</div>
        
        {/* PDF Download Button */}
        <Button 
          onClick={onDownloadPDF}
          className="mt-4 glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90"
        >
          <Download className="mr-2 h-4 w-4" /> Download Property Report
        </Button>
      </div>
      
      {services.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white text-center">Your Monetization Opportunities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-effect p-6 text-center">
          <h2 className="text-xl font-semibold text-white">No Opportunities Found</h2>
          <p className="text-gray-300 mt-2">
            Based on your property details, we don't have specific monetization opportunities at this time.
          </p>
        </div>
      )}
      
      <div className="flex justify-center mt-8 gap-4">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="px-8"
        >
          Back to Home
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          className="px-8 bg-gradient-to-r from-tiptop-purple to-purple-600"
        >
          View Dashboard
        </Button>
      </div>
    </motion.div>
  );
};

export default SubmissionResults;
