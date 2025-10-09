import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Mail, Phone } from 'lucide-react';
import { z } from 'zod';

interface LeadCaptureBannerProps {
  opportunityCount: number;
  onSubmit: (contact: string, type: 'email' | 'phone') => void;
  onSkip: () => void;
}

const contactSchema = z.union([
  z.string().email({ message: "Please enter a valid email address" }),
  z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: "Please enter a valid phone number"
  })
]);

const LeadCaptureBanner = ({ opportunityCount, onSubmit, onSkip }: LeadCaptureBannerProps) => {
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const detectContactType = (value: string): 'email' | 'phone' => {
    return value.includes('@') ? 'email' : 'phone';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedContact = contact.trim();
    
    // Validate
    const result = contactSchema.safeParse(trimmedContact);
    if (!result.success) {
      toast({
        title: "Invalid format",
        description: result.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const contactType = detectContactType(trimmedContact);
      await onSubmit(trimmedContact, contactType);
      
      toast({
        title: "Success! 🎉",
        description: "Your results are ready to view",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Banner Content */}
      <div className="relative w-full max-w-lg animate-scale-in">
        <div className="glass-effect p-6 sm:p-8 rounded-2xl border border-white/20 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-400/30">
              <Sparkles className="w-8 h-8 text-purple-300" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-200 via-violet-200 to-purple-200 bg-clip-text text-transparent">
            Great News!
          </h2>
          
          <p className="text-center text-gray-200 text-base sm:text-lg mb-6">
            We found <span className="font-bold text-purple-300">{opportunityCount} monetization opportunities</span> for your property!
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <Phone className="w-4 h-4" />
                <span>Enter your email or phone to see your results</span>
              </label>
              <Input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email@example.com or (123) 456-7890"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                disabled={isSubmitting}
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              {isSubmitting ? "Processing..." : "Show Me My Results →"}
            </Button>
          </form>

          {/* Skip Option */}
          <button
            onClick={onSkip}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-300 mt-4 transition-colors"
            disabled={isSubmitting}
          >
            Skip for now
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            We respect your privacy. Your information will only be used to show you personalized opportunities.
          </p>
        </div>

        {/* Decorative Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-purple-500/20 rounded-2xl blur-xl -z-10 opacity-75" />
      </div>
    </div>
  );
};

export default LeadCaptureBanner;
