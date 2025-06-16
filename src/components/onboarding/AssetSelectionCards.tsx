
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Wifi, 
  Car, 
  Waves, 
  Archive, 
  Trees, 
  Camera,
  ArrowRight,
  DollarSign
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  icon: React.ReactNode;
  estimatedEarnings: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  requirements: string[];
}

interface AssetSelectionCardsProps {
  detectedAssets: string[];
  onAssetSelect: (assetId: string) => void;
}

const assetMap: Record<string, Asset> = {
  rooftop: {
    id: 'rooftop',
    name: 'Rooftop Solar',
    icon: <Sun className="w-6 h-6" />,
    estimatedEarnings: '$200-500/month',
    difficulty: 'Medium',
    requirements: ['Roof access', 'Suitable roof condition', 'Local permits']
  },
  internet: {
    id: 'internet',
    name: 'Internet Bandwidth',
    icon: <Wifi className="w-6 h-6" />,
    estimatedEarnings: '$20-50/month',
    difficulty: 'Easy',
    requirements: ['High-speed internet', 'Device to share bandwidth']
  },
  parking: {
    id: 'parking',
    name: 'Parking Space',
    icon: <Car className="w-6 h-6" />,
    estimatedEarnings: '$100-300/month',
    difficulty: 'Easy',
    requirements: ['Available parking space', 'Safe location', 'Easy access']
  },
  pool: {
    id: 'pool',
    name: 'Swimming Pool',
    icon: <Waves className="w-6 h-6" />,
    estimatedEarnings: '$50-150/hour',
    difficulty: 'Medium',
    requirements: ['Pool maintenance', 'Insurance', 'Safety equipment']
  },
  storage: {
    id: 'storage',
    name: 'Storage Space',
    icon: <Archive className="w-6 h-6" />,
    estimatedEarnings: '$50-200/month',
    difficulty: 'Easy',
    requirements: ['Clean storage area', 'Secure access', 'Climate consideration']
  },
  garden: {
    id: 'garden',
    name: 'Garden/Yard',
    icon: <Trees className="w-6 h-6" />,
    estimatedEarnings: '$30-100/month',
    difficulty: 'Medium',
    requirements: ['Suitable outdoor space', 'Garden maintenance', 'Weather protection']
  },
  unique_spaces: {
    id: 'unique_spaces',
    name: 'Unique Spaces',
    icon: <Camera className="w-6 h-6" />,
    estimatedEarnings: '$100-500/event',
    difficulty: 'Hard',
    requirements: ['Attractive space', 'Good lighting', 'Easy access', 'Insurance']
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const AssetSelectionCards = ({ detectedAssets, onAssetSelect }: AssetSelectionCardsProps) => {
  const availableAssets = detectedAssets.map(assetKey => assetMap[assetKey]).filter(Boolean);

  if (availableAssets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 text-tiptop-purple font-semibold text-lg">
        <DollarSign className="w-5 h-5" />
        <span>Ready to Monetize Your Assets</span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        Great! I've identified {availableAssets.length} asset{availableAssets.length > 1 ? 's' : ''} that can generate income. 
        Click on any asset below to start the setup process:
      </p>

      <div className="grid gap-3 max-w-2xl">
        {availableAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-tiptop-purple">
              <CardContent className="p-4">
                <button
                  onClick={() => onAssetSelect(asset.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-tiptop-purple/10 text-tiptop-purple">
                        {asset.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={getDifficultyColor(asset.difficulty)}
                          >
                            {asset.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{asset.estimatedEarnings}</p>
                        
                        <div className="flex flex-wrap gap-1">
                          {asset.requirements.slice(0, 2).map((req, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {req}
                            </span>
                          ))}
                          {asset.requirements.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{asset.requirements.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-tiptop-purple transition-colors" />
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AssetSelectionCards;
