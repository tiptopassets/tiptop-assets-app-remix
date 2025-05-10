
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { ServiceIntegration } from '@/hooks/useServiceIntegrations';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  description: z.string().min(5, { message: 'Description is required' }),
  icon: z.string().min(1, { message: 'Icon is required' }),
  status: z.enum(['active', 'pending', 'inactive']),
  monthly_revenue_low: z.coerce.number().min(0),
  monthly_revenue_high: z.coerce.number().min(0),
  integration_url: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  partner_name: z.string().min(2, { message: 'Partner name is required' }),
});

interface AddServiceIntegrationFormProps {
  onAdd: (integration: Omit<ServiceIntegration, 'id' | 'created_at'>) => Promise<{ success: boolean }>;
  onClose: () => void;
}

const AddServiceIntegrationForm = ({ onAdd, onClose }: AddServiceIntegrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: 'home',
      status: 'pending',
      monthly_revenue_low: 0,
      monthly_revenue_high: 0,
      integration_url: '',
      partner_name: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const integrationData = {
        ...values,
        integration_url: values.integration_url || null,
      };
      
      const { success } = await onAdd(integrationData);
      
      if (success) {
        toast({
          title: 'Integration Added',
          description: `${values.name} integration has been added successfully`,
        });
        onClose();
      } else {
        throw new Error('Failed to add integration');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add service integration',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Integration Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Airbnb" {...field} />
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
                <FormLabel>Partner Name</FormLabel>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this integration does"
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="sun">Solar</SelectItem>
                    <SelectItem value="battery-charging">EV Charging</SelectItem>
                    <SelectItem value="wifi">Internet</SelectItem>
                    <SelectItem value="garden">Garden</SelectItem>
                  </SelectContent>
                </Select>
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

        <div className="grid grid-cols-2 gap-4">
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

        <FormField
          control={form.control}
          name="integration_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Integration URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://partner.com/integration" {...field} />
              </FormControl>
              <FormDescription>
                URL to the partner's integration portal
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Integration"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AddServiceIntegrationForm;
