
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  earnings: string;
  icon: React.ReactNode;
  link?: string;
  linkText?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  description,
  earnings,
  icon,
  link,
  linkText,
}) => {
  return (
    <Card key={id} className="glass-effect p-6 transition-all">
      <div className="flex items-center space-x-2 mb-2">
        <div className="p-2 rounded-full bg-purple-500/20">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-300 text-sm mb-2">{description}</p>
      <p className="text-tiptop-purple font-bold">{earnings}</p>
      
      {link && (
        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={() => window.open(link, '_blank')}
        >
          {linkText || 'Learn More'}
        </Button>
      )}
    </Card>
  );
};

export default ServiceCard;
