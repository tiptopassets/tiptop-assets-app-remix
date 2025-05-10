import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Building, Car, WifiIcon, Waves, Check, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { generatePropertyReportPDF } from '@/utils/pdfGenerator';

// Define form schema with validation
const formSchema = z.object({
  full_name: z.string().min(2, { message: 'Name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  property_address: z.string().min(5, { message: 'Property address is required' }),
  has_garage: z.boolean().default(false),
  has_driveway: z.boolean().default(false),
  has_pool: z.boolean().default(false),
  has_internet: z.boolean().default(false),
  additional_info: z.string().optional(),
  consent: z.boolean().refine(value => value === true, {
    message: 'You must consent to share your information',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  earnings: string;
  icon: React.ReactNode;
  link?: string;
  linkText?: string;
}

const SubmitProperty = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [formData, setFormData] = useState<FormValues | null>(null);
  
  // Define the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      property_address: '',
      has_garage: false,
      has_driveway: false,
      has_pool: false,
      has_internet: false,
      additional_info: '',
      consent: false,
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setFormData(values); // Store the form data for PDF generation
      
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('process-submission', {
        body: {
          full_name: values.full_name,
          email: values.email,
          property_address: values.property_address,
          has_garage: values.has_garage,
          has_driveway: values.has_driveway,
          has_pool: values.has_pool,
          has_internet: values.has_internet,
          additional_info: values.additional_info,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Process the result
      const serviceCards: ServiceCard[] = [];
      
      // Neighbor service card
      if (data.services.neighbor.sent) {
        serviceCards.push({
          id: 'neighbor',
          title: 'Neighbor Storage',
          description: 'You\'ve been referred to Neighbor. Earn money by renting out your garage or driveway.',
          earnings: '$150–$300/mo',
          icon: <Building size={24} className="text-tiptop-purple" />,
        });
      }
      
      // Honeygain service card
      if (data.services.honeygain.sent) {
        serviceCards.push({
          id: 'honeygain',
          title: 'Honeygain',
          description: 'Share your internet connection and earn passive income.',
          earnings: '$50–$100/mo',
          icon: <WifiIcon size={24} className="text-tiptop-purple" />,
          link: data.services.honeygain.referralLink,
          linkText: 'Sign up for Honeygain'
        });
      }
      
      // Swimply service card
      if (data.services.swimply.sent) {
        serviceCards.push({
          id: 'swimply',
          title: 'Swimply',
          description: 'Rent out your swimming pool by the hour.',
          earnings: '$200–$500/mo',
          icon: <Waves size={24} className="text-tiptop-purple" />,
          link: data.services.swimply.referralLink,
          linkText: 'Sign up for Swimply'
        });
      }
      
      setServices(serviceCards);
      setTotalEarnings(data.estimatedEarnings);
      setSubmissionComplete(true);
      
    } catch (err) {
      console.error('Submission error:', err);
      toast({
        title: 'Submission Error',
        description: 'There was a problem submitting your property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Download PDF report
  const handleDownloadPDF = () => {
    if (!formData) return;
    
    try {
      const pdfBlob = generatePropertyReportPDF(
        formData.property_address,
        totalEarnings,
        services.map(({ id, title, description, earnings }) => ({ id, title, description, earnings })),
        formData.full_name
      );
      
      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'TipTop_Property_Report.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Downloaded",
        description: "Your property report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Download Error',
        description: 'There was a problem generating your PDF report.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle form errors
  const onError = (errors: any) => {
    console.error('Form errors:', errors);
    toast({
      title: 'Form Error',
      description: 'Please check the form and fix all errors before submitting.',
      variant: 'destructive',
    });
  };
  
  // Redirect to Dashboard after login
  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-purple-900">
      {/* Header */}
      <header className="w-full p-4 md:p-6 flex justify-between items-center">
        <div 
          className="text-2xl md:text-3xl font-bold text-tiptop-purple hover:scale-105 transition-transform flex items-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          tiptop
        </div>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 pb-12">
        {!submissionComplete ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Monetize Your Property</h1>
              <p className="text-gray-300 mt-2 max-w-xl mx-auto">
                Fill out this form to discover how you can earn money from your property assets.
              </p>
            </div>
            
            <div className="glass-effect p-6 rounded-lg">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                    
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              className="glass-effect border-white/20 text-white" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email address" 
                              className="glass-effect border-white/20 text-white" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="property_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Property Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your property address" 
                              className="glass-effect border-white/20 text-white" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Property Features */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Property Features</h2>
                    <p className="text-sm text-gray-300">Select all that apply to your property</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="has_garage"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white flex gap-2 items-center">
                                <Building size={18} /> Garage
                              </FormLabel>
                              <FormDescription className="text-gray-400">
                                Do you have a garage that can be rented out?
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="has_driveway"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white flex gap-2 items-center">
                                <Car size={18} /> Driveway
                              </FormLabel>
                              <FormDescription className="text-gray-400">
                                Do you have a driveway with parking space?
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="has_pool"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white flex gap-2 items-center">
                                <Waves size={18} /> Swimming Pool
                              </FormLabel>
                              <FormDescription className="text-gray-400">
                                Do you have a swimming pool?
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="has_internet"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white flex gap-2 items-center">
                                <WifiIcon size={18} /> Internet Connection
                              </FormLabel>
                              <FormDescription className="text-gray-400">
                                Do you have high-speed internet?
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Additional Information */}
                  <FormField
                    control={form.control}
                    name="additional_info"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Anything else you'd like to share about your property?"
                            className="glass-effect border-white/20 text-white min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* Consent */}
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-white">
                            I consent to share my information
                          </FormLabel>
                          <FormDescription className="text-gray-400">
                            TipTop may share your information with partner services that can help you monetize your property.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : 'Submit Property'}
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
        ) : (
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
                onClick={handleDownloadPDF}
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
                    <Card key={service.id} className="glass-effect p-6 transition-all">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-2 rounded-full bg-purple-500/20">
                          {service.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{service.description}</p>
                      <p className="text-tiptop-purple font-bold">{service.earnings}</p>
                      
                      {service.link && (
                        <Button 
                          variant="outline" 
                          className="mt-4 w-full"
                          onClick={() => window.open(service.link, '_blank')}
                        >
                          {service.linkText || 'Learn More'}
                        </Button>
                      )}
                    </Card>
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
                onClick={handleViewDashboard} 
                className="px-8 bg-gradient-to-r from-tiptop-purple to-purple-600"
              >
                View Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubmitProperty;
