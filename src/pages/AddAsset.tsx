
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, Sun, Wifi, BatteryCharging, Car, Home, ParkingCircle } from "lucide-react";
import { useAdditionalOpportunities } from "@/hooks/useAdditionalOpportunities";

interface AssetCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  onSelect: () => void;
  isAvailable?: boolean;
}

interface SmallAssetCardProps {
  title: string;
  monthlyRevenue: number;
  description: string;
  onSelect: () => void;
  setupCost?: number;
}

const AssetCard = ({ title, icon, description, onSelect, isAvailable = true }: AssetCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`relative overflow-hidden cursor-pointer h-full transition-all duration-300 shadow-md hover:shadow-xl ${!isAvailable ? 'opacity-60' : ''}`}>
        {/* Glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 to-white/40 backdrop-blur-sm z-0"></div>
        
        {/* Glow effect for the card */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-tiptop-purple/20 to-blue-500/20 rounded-xl blur-sm -z-10"></div>
        
        <CardContent className="relative z-10 p-6 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="bg-tiptop-purple/10 p-3 rounded-full mr-3 text-tiptop-purple">
              {icon}
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6 flex-grow">{description}</p>
          
          <Button 
            onClick={onSelect} 
            disabled={!isAvailable}
            className="w-full"
          >
            <Plus size={18} className="mr-2" />
            {isAvailable ? 'Add Asset' : 'Coming Soon'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SmallAssetCard = ({ title, monthlyRevenue, description, onSelect, setupCost }: SmallAssetCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="relative overflow-hidden cursor-pointer h-full transition-all duration-300 shadow-sm hover:shadow-md bg-white/90 backdrop-blur-sm">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-tiptop-purple/10 to-blue-500/10 rounded-lg blur-sm -z-10"></div>
        
        <CardContent className="relative z-10 p-4 flex flex-col h-full">
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{title}</h4>
            <p className="text-lg font-bold text-tiptop-purple">${monthlyRevenue}/mo</p>
          </div>
          
          <p className="text-xs text-gray-600 mb-3 flex-grow line-clamp-2">{description}</p>
          
          {setupCost && (
            <p className="text-xs text-gray-500 mb-2">Setup: ${setupCost}</p>
          )}
          
          <Button 
            onClick={onSelect} 
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AddAsset = () => {
  const { additionalOpportunities } = useAdditionalOpportunities();

  const handleAssetSelect = (assetType: string) => {
    console.log(`Selected asset: ${assetType}`);
    // In a real app, this would navigate to a form for the specific asset type
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="flex items-center">
            <Plus className="mr-2 text-tiptop-purple" size={32} />
            <h1 className="text-3xl font-bold">Add Asset</h1>
          </div>
          
          <p className="text-gray-600 mt-2 mb-6">
            Select an asset type below to start monetizing your property.
          </p>
        </motion.div>

        {/* Main Asset Types */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4">Primary Asset Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AssetCard
              title="Rooftop Solar"
              icon={<Sun size={24} />}
              description="Monetize your roof by installing solar panels. Earn money while contributing to clean energy."
              onSelect={() => handleAssetSelect('rooftop')}
            />
            
            <AssetCard
              title="Internet Bandwidth"
              icon={<Wifi size={24} />}
              description="Share your excess internet bandwidth and earn passive income each month."
              onSelect={() => handleAssetSelect('internet')}
            />
            
            <AssetCard
              title="EV Charging"
              icon={<BatteryCharging size={24} />}
              description="Install an EV charging station and earn from electric vehicle owners in your area."
              onSelect={() => handleAssetSelect('ev-charging')}
            />
            
            <AssetCard
              title="Parking Space"
              icon={<ParkingCircle size={24} />}
              description="Rent out your unused parking spaces for daily, weekly, or monthly income."
              onSelect={() => handleAssetSelect('parking')}
            />
            
            <AssetCard
              title="Storage Space"
              icon={<Home size={24} />}
              description="Convert unused space into storage rentals for additional monthly income."
              onSelect={() => handleAssetSelect('storage')}
            />
            
            <AssetCard
              title="Vehicle Rental"
              icon={<Car size={24} />}
              description="Rent out your vehicles when you're not using them."
              onSelect={() => handleAssetSelect('vehicle')}
              isAvailable={false}
            />
          </div>
        </motion.div>

        {/* Additional Opportunities */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4">Additional Opportunities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {additionalOpportunities.slice(0, 24).map((opportunity, index) => (
              <SmallAssetCard
                key={index}
                title={opportunity.title}
                monthlyRevenue={opportunity.monthlyRevenue}
                description={opportunity.description}
                setupCost={opportunity.setupCost}
                onSelect={() => handleAssetSelect(opportunity.title.toLowerCase().replace(/\s+/g, '-'))}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AddAsset;
