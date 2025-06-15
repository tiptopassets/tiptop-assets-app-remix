
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2,
  Sun,
  Wifi,
  Battery,
  Car,
  Home
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface OnboardingData {
  id: string;
  selected_option: 'manual' | 'concierge';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  current_step: number;
  total_steps: number;
  completed_assets: string[];
  progress_data: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
}

const OnboardingChatbot = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedOption = searchParams.get('option') as 'manual' | 'concierge' | null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/options');
    }
  }, [user, authLoading, navigate]);

  // Initialize onboarding data
  useEffect(() => {
    if (user && selectedOption) {
      initializeOnboarding();
    } else if (user) {
      loadExistingOnboarding();
    }
  }, [user, selectedOption]);

  const initializeOnboarding = async () => {
    if (!user || !selectedOption) return;

    try {
      console.log('🚀 Initializing onboarding for:', user.id, 'option:', selectedOption);
      
      // Check if onboarding already exists
      const { data: existing, error: checkError } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        setOnboardingData(existing);
        await loadMessages(existing.id);
      } else {
        // Create new onboarding session
        const { data: newOnboarding, error: insertError } = await supabase
          .from('user_onboarding')
          .insert({
            user_id: user.id,
            selected_option: selectedOption,
            status: 'in_progress'
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setOnboardingData(newOnboarding);

        // Add welcome message
        const welcomeContent = selectedOption === 'manual' 
          ? "Welcome to TipTop's Asset Onboarding! 🎉 I'll guide you through uploading your assets manually to our partner platforms. Let's start by understanding what assets you'd like to monetize. What type of property do you have?"
          : "Welcome to TipTop Concierge! 🌟 I'll handle the entire onboarding process for you. For just $20, we'll professionally optimize and list your assets. Let's start by gathering some information about your property. What type of property do you have?";

        await addMessage(newOnboarding.id, 'assistant', welcomeContent);
      }
    } catch (error) {
      console.error('❌ Error initializing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to initialize onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingOnboarding = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setOnboardingData(data);
        await loadMessages(data.id);
      } else {
        // No existing onboarding, redirect to options
        navigate('/options');
      }
    } catch (error) {
      console.error('❌ Error loading onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to load onboarding data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (onboardingId: string) => {
    try {
      const { data, error } = await supabase
        .from('onboarding_messages')
        .select('*')
        .eq('onboarding_id', onboardingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };

  const addMessage = async (onboardingId: string, role: 'user' | 'assistant', content: string, metadata?: any) => {
    try {
      const { data, error } = await supabase
        .from('onboarding_messages')
        .insert({
          onboarding_id: onboardingId,
          role,
          content,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('❌ Error adding message:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !onboardingData || sending) return;

    setSending(true);
    const userMessage = message.trim();
    setMessage('');

    try {
      // Add user message
      await addMessage(onboardingData.id, 'user', userMessage);

      // Generate AI response (simplified for now)
      const aiResponse = generateAIResponse(userMessage, onboardingData);
      
      // Add AI response
      setTimeout(async () => {
        await addMessage(onboardingData.id, 'assistant', aiResponse);
        setSending(false);
      }, 1000);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setSending(false);
    }
  };

  const generateAIResponse = (userMessage: string, data: OnboardingData): string => {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('house') || lower.includes('home') || lower.includes('residential')) {
      return "Great! A residential property has many monetization opportunities. I can help you with:\n\n🏠 **Rooftop Solar** - Generate passive income from solar installations\n📶 **Internet Bandwidth** - Share unused bandwidth with Honeygain\n🚗 **EV Charging** - Install charging stations for electric vehicles\n🏊 **Pool Sharing** - Rent out your pool through Swimply\n\nWhich of these assets interests you most?";
    }
    
    if (lower.includes('solar') || lower.includes('roof')) {
      return data.selected_option === 'manual' 
        ? "Excellent choice! Solar can generate $50-200+ monthly. For manual setup:\n\n✅ I'll provide step-by-step guidance\n✅ Connect you with solar installers\n✅ Help with paperwork and permits\n\nDo you know your roof size and direction it faces?"
        : "Perfect! Solar is our most popular asset. With TipTop Concierge:\n\n🌟 We handle all installer communications\n🌟 Complete permit applications for you\n🌟 Professional site assessment coordination\n🌟 Ongoing monitoring setup\n\nI'll need some details about your roof. Can you describe your roof type and size?";
    }
    
    if (lower.includes('internet') || lower.includes('bandwidth') || lower.includes('wifi')) {
      return "Smart choice! Internet bandwidth sharing with Honeygain can earn $20-50 monthly with zero effort. It's completely passive income!\n\n📶 **How it works:**\n- Install Honeygain app on your devices\n- Share unused bandwidth securely\n- Earn while you sleep\n\nShall I help you get started with Honeygain registration?";
    }
    
    if (lower.includes('ev') || lower.includes('charging') || lower.includes('electric')) {
      return "EV charging is booming! You can earn $100-300+ monthly depending on location and usage.\n\n⚡ **Next steps:**\n- Property assessment for installation\n- Local permit requirements\n- Utility coordination\n- Platform registration (ChargePoint, etc.)\n\nDo you have a garage or dedicated parking area?";
    }

    // Default responses
    const responses = [
      "I understand. Can you tell me more about what specific assets you're interested in monetizing?",
      "That's helpful information! What would you like to focus on first?",
      "Great! Let me know if you have any questions about the process.",
      "I'm here to help guide you through each step. What would you like to know more about?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getAssetIcon = (assetType: string) => {
    switch (assetType.toLowerCase()) {
      case 'solar':
      case 'rooftop':
        return <Sun className="w-4 h-4" />;
      case 'internet':
      case 'bandwidth':
        return <Wifi className="w-4 h-4" />;
      case 'ev':
      case 'charging':
        return <Battery className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-tiptop-purple" />
            <p className="text-gray-600">Loading onboarding assistant...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!onboardingData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Onboarding Session Found</h1>
          <p className="text-gray-600 mb-6">Let's get you started with asset onboarding.</p>
          <Button onClick={() => navigate('/options')} className="bg-tiptop-purple hover:bg-tiptop-purple/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Options
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const progressPercentage = (onboardingData.current_step / onboardingData.total_steps) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Asset Onboarding Assistant</h1>
              <p className="text-gray-600">
                {onboardingData.selected_option === 'manual' ? 'Manual Setup' : 'TipTop Concierge'} • Step {onboardingData.current_step} of {onboardingData.total_steps}
              </p>
            </div>
            <Badge variant="outline" className="text-tiptop-purple border-tiptop-purple">
              {onboardingData.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          {onboardingData.completed_assets.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {onboardingData.completed_assets.map((asset, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {getAssetIcon(asset)}
                  <span className="ml-1">{asset}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-tiptop-purple" />
              TipTop Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      msg.role === 'user' ? 'bg-tiptop-purple' : 'bg-gray-600'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-lg px-4 py-2 ${
                      msg.role === 'user' 
                        ? 'bg-tiptop-purple text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-gray-600">Typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                  className="bg-tiptop-purple hover:bg-tiptop-purple/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OnboardingChatbot;
