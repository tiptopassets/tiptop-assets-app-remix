
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AdditionalOpportunity } from "@/types/analysis";
import { glowColorMap } from "./AssetCard";

interface AdditionalAssetsCarouselProps {
  opportunities: AdditionalOpportunity[];
}

const AdditionalAssetsCarousel = ({ opportunities }: AdditionalAssetsCarouselProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mt-12"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg text-center md:text-left">
        Additional Asset Opportunities
      </h2>
      
      <Carousel 
        className="w-full glass-effect p-4 rounded-lg"
        opts={{
          align: "start",
          loop: true
        }}
      >
        <CarouselContent className="py-2">
          {opportunities.map((opportunity, index) => {
            const iconType = opportunity.icon as keyof typeof glowColorMap;
            const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
            
            return (
              <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div 
                  className="h-full rounded-lg p-3 flex flex-col items-center text-center glass-effect"
                  style={{
                    background: `linear-gradient(to bottom right, ${glowColor.replace('0.5', '0.8')}, transparent)`,
                    boxShadow: `0 4px 15px ${glowColor}`
                  }}
                >
                  <div className="w-10 h-10 glass-effect rounded-lg flex items-center justify-center mb-2">
                    <img 
                      src={`/lovable-uploads/${iconType === 'wifi' ? 'f5bf9c32-688f-4a52-8a95-4d803713d2ff.png' : 
                            iconType === 'storage' ? '417dfc9f-434d-4b41-aec2-fca0d8c4cb23.png' :
                            'ef52333e-7ea8-4692-aeed-9a222da95b75.png'}`}
                      alt={`${opportunity.title} Icon`}
                      className="w-6 h-6 object-contain"
                      style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {opportunity.title}
                  </h3>
                  <p className="text-xl font-bold text-white mb-1">
                    ${opportunity.monthlyRevenue}/mo
                  </p>
                  <p className="text-xs text-gray-200">
                    {opportunity.description.length > 50 
                      ? opportunity.description.substring(0, 50) + '...' 
                      : opportunity.description}
                  </p>
                  
                  {/* Enhanced glossy effect */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg pointer-events-none"></div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-1 bg-white/20 hover:bg-white/30 text-white" />
        <CarouselNext className="right-1 bg-white/20 hover:bg-white/30 text-white" />
      </Carousel>
    </motion.div>
  );
};

export default AdditionalAssetsCarousel;
