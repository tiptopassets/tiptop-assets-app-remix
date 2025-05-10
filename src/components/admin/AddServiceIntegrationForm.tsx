import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  partner_name: z.string().min(2, { message: 'Partner name is required' }),
  integration_url: z.string().url({ message: 'Must be a valid URL' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  icon: z.string().min(1, { message: 'Icon is required' }).default('puzzle'),
  status: z.enum(['active', 'pending', 'inactive']).default('pending'),
  monthly_revenue_low: z.coerce.number().min(0),
  monthly_revenue_high: z.coerce.number().min(0),
});

export type ServiceIntegrationFormValues = z.infer<typeof formSchema>;

interface AddServiceIntegrationFormProps {
  onAdd: (integration: ServiceIntegrationFormValues) => Promise<void>;
  onClose: () => void;
}

const AddServiceIntegrationForm = ({
  onAdd,
  onClose,
}: AddServiceIntegrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define form using react-hook-form and zod
  const form = useForm<ServiceIntegrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      partner_name: '',
      integration_url: '',
      description: '',
      icon: 'puzzle',
      status: 'pending',
      monthly_revenue_low: 0,
      monthly_revenue_high: 0,
    },
  });

  const onSubmit = async (data: ServiceIntegrationFormValues) => {
    setIsSubmitting(true);
    try {
      await onAdd(data);
      toast({
        title: "Integration Added",
        description: "The service integration was added successfully.",
      });
      onClose();
    } catch (error) {
      console.error('Error adding integration:', error);
      toast({
        title: "Failed to Add Integration",
        description: "There was an error adding the integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Integration Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Airbnb Integration" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="partner_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partner Company</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Airbnb Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="integration_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Integration URL</FormLabel>
              <FormControl>
                <Input placeholder="https://api.example.com/integration" {...field} />
              </FormControl>
              <FormDescription>
                The URL for the integration API or partner website
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this integration does and how it helps monetize properties..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <Input placeholder="Icon name (e.g. home, car, wifi)" {...field} />
                </FormControl>
                <FormDescription>
                  Enter a Lucide icon name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="monthly_revenue_low"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min. Monthly Revenue ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="monthly_revenue_high"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max. Monthly Revenue ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Integration"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddServiceIntegrationForm;
