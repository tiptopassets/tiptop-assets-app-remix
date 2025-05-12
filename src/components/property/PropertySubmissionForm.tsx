import React from 'react';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Building, Car, WifiIcon, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

// Define form schema with validation
const formSchema = z.object({
  full_name: z.string().min(2, {
    message: 'Name is required'
  }),
  email: z.string().email({
    message: 'Please enter a valid email address'
  }),
  property_address: z.string().min(5, {
    message: 'Property address is required'
  }),
  has_garage: z.boolean().default(false),
  has_driveway: z.boolean().default(false),
  has_pool: z.boolean().default(false),
  has_internet: z.boolean().default(false),
  additional_info: z.string().optional(),
  consent: z.boolean().refine(value => value === true, {
    message: 'You must consent to share your information'
  })
});
export type FormValues = z.infer<typeof formSchema>;
interface PropertySubmissionFormProps {
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
}
const PropertySubmissionForm: React.FC<PropertySubmissionFormProps> = ({
  onSubmit,
  isSubmitting
}) => {
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
      consent: false
    }
  });

  // Handle form errors
  const onError = (errors: any) => {
    console.error('Form errors:', errors);
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className="w-full max-w-3xl">
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
              
              <FormField control={form.control} name="full_name" render={({
              field
            }) => <FormItem>
                    <FormLabel className="text-white">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" className="glass-effect border-white/20 text-purple" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email address" type="email" className="glass-effect border-white/20 text-purple" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="property_address" render={({
              field
            }) => <FormItem>
                    <FormLabel className="text-white">Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your property address" className="glass-effect border-white/20 text-purple" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>
            
            {/* Property Features */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Property Features</h2>
              <p className="text-sm text-gray-300">Select all that apply to your property</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="has_garage" render={({
                field
              }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white flex gap-2 items-center">
                          <Building size={18} /> Garage
                        </FormLabel>
                        <FormDescription className="text-gray-400">
                          Do you have a garage that can be rented out?
                        </FormDescription>
                      </div>
                    </FormItem>} />
                
                <FormField control={form.control} name="has_driveway" render={({
                field
              }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white flex gap-2 items-center">
                          <Car size={18} /> Driveway
                        </FormLabel>
                        <FormDescription className="text-gray-400">
                          Do you have a driveway with parking space?
                        </FormDescription>
                      </div>
                    </FormItem>} />
                
                <FormField control={form.control} name="has_pool" render={({
                field
              }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white flex gap-2 items-center">
                          <Waves size={18} /> Swimming Pool
                        </FormLabel>
                        <FormDescription className="text-gray-400">
                          Do you have a swimming pool?
                        </FormDescription>
                      </div>
                    </FormItem>} />
                
                <FormField control={form.control} name="has_internet" render={({
                field
              }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white flex gap-2 items-center">
                          <WifiIcon size={18} /> Internet Connection
                        </FormLabel>
                        <FormDescription className="text-gray-400">
                          Do you have high-speed internet?
                        </FormDescription>
                      </div>
                    </FormItem>} />
              </div>
            </div>
            
            {/* Additional Information */}
            <FormField control={form.control} name="additional_info" render={({
            field
          }) => <FormItem>
                  <FormLabel className="text-white">Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Anything else you'd like to share about your property?" className="glass-effect border-white/20 text-white min-h-[100px]" {...field} />
                  </FormControl>
                </FormItem>} />
            
            {/* Consent */}
            <FormField control={form.control} name="consent" render={({
            field
          }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-white/10 bg-black/20">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-white">
                      I consent to share my information
                    </FormLabel>
                    <FormDescription className="text-gray-400">
                      TipTop may share your information with partner services that can help you monetize your property.
                    </FormDescription>
                  </div>
                </FormItem>} />
            
            <Button type="submit" className="w-full glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Submit Property'}
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>;
};
export default PropertySubmissionForm;