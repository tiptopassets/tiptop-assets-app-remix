import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
type AssetCardProps = {
  title: string;
  description: string;
  color: string;
  hoverColor: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
};
const assetCards: AssetCardProps[] = [{
  title: "Rooftop",
  description: "Solar panels, gardens",
  color: "from-yellow-400",
  hoverColor: "hover:shadow-yellow-400/70",
  gradientFrom: "from-yellow-400/30",
  gradientTo: "to-amber-500/20",
  glowColor: "rgba(250, 204, 21, 0.7)"
}, {
  title: "Garden Space",
  description: "Urban farming, events",
  color: "from-green-400",
  hoverColor: "hover:shadow-green-400/70",
  gradientFrom: "from-green-400/30",
  gradientTo: "to-emerald-500/20",
  glowColor: "rgba(74, 222, 128, 0.7)"
}, {
  title: "Storage Space",
  description: "Equipment, vehicles",
  color: "from-amber-400",
  hoverColor: "hover:shadow-amber-400/70",
  gradientFrom: "from-amber-400/30",
  gradientTo: "to-orange-500/20",
  glowColor: "rgba(245, 158, 11, 0.7)"
}, {
  title: "Swimming Pool",
  description: "Hourly rental, events",
  color: "from-blue-400",
  hoverColor: "hover:shadow-blue-400/70",
  gradientFrom: "from-blue-400/30",
  gradientTo: "to-sky-500/20",
  glowColor: "rgba(14, 165, 233, 0.7)"
}, {
  title: "Car Space",
  description: "Parking, short-term rental",
  color: "from-indigo-400",
  hoverColor: "hover:shadow-indigo-400/70",
  gradientFrom: "from-indigo-400/30",
  gradientTo: "to-blue-500/20",
  glowColor: "rgba(99, 102, 241, 0.7)"
}, {
  title: "Items",
  description: "Tools, equipment sharing",
  color: "from-purple-400",
  hoverColor: "hover:shadow-purple-400/70",
  gradientFrom: "from-purple-400/30",
  gradientTo: "to-fuchsia-500/20",
  glowColor: "rgba(168, 85, 247, 0.7)"
}, {
  title: "EV Charger",
  description: "Hourly EV charging",
  color: "from-violet-400",
  hoverColor: "hover:shadow-violet-400/70",
  gradientFrom: "from-violet-400/30",
  gradientTo: "to-purple-500/20",
  glowColor: "rgba(167, 139, 250, 0.7)"
}, {
  title: "Parking Space",
  description: "Hourly, daily parking",
  color: "from-fuchsia-400",
  hoverColor: "hover:shadow-fuchsia-400/70",
  gradientFrom: "from-fuchsia-400/30",
  gradientTo: "to-pink-500/20",
  glowColor: "rgba(217, 70, 239, 0.7)"
}, {
  title: "Unused Bandwidth",
  description: "Share your internet",
  color: "from-pink-400",
  hoverColor: "hover:shadow-pink-400/70",
  gradientFrom: "from-pink-400/30",
  gradientTo: "to-rose-500/20",
  glowColor: "rgba(244, 114, 182, 0.7)"
}];
const AssetCard = ({
  title,
  description,
  color,
  hoverColor,
  gradientFrom,
  gradientTo,
  glowColor
}: AssetCardProps) => {
  return <motion.div whileHover={{
    scale: 1.05,
    y: -5
  }} className={`p-3 rounded-xl cursor-pointer transition-all duration-300 shadow-lg ${hoverColor}
                 backdrop-blur-xl bg-white/10 border border-white/20 h-full
                 bg-gradient-to-br ${gradientFrom} ${gradientTo} overflow-hidden relative`} style={{
    boxShadow: `0 5px 15px ${glowColor}`
  }}>
      <div className={`absolute inset-0 bg-gradient-to-tr ${color} to-transparent opacity-20 z-0`}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent z-0"></div>
      <div className="relative z-10">
        <h3 className="font-medium mb-1 text-white drop-shadow-md">{title}</h3>
        <p className="text-sm text-white/90">{description}</p>
      </div>
      
      {/* Glossy reflection */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl pointer-events-none"></div>
      
      {/* Bottom light effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-white/10 to-transparent rounded-b-xl pointer-events-none"></div>
    </motion.div>;
};
const FooterCarousel = () => {
  const isMobile = useIsMobile();
  return <div className="w-full py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="glass-effect py-6 px-4 md:px-8 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-tiptop-purple/20 to-transparent opacity-70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
          
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-6 text-center relative z-10 drop-shadow-lg">
            Rent Your Assets, Make Passive Income
          </h2>
          
          <Carousel opts={{
          align: "start",
          loop: true
        }} className="w-full relative z-10">
            <CarouselContent className="py-2">
              {assetCards.map((card, index) => <CarouselItem key={index} className={isMobile ? "basis-full sm:basis-1/2" : "basis-1/4"}>
                  <AssetCard {...card} />
                </CarouselItem>)}
            </CarouselContent>
            
            <div className="flex justify-center mt-4">
              <CarouselPrevious className="static relative transform-none mr-2 bg-white/10 hover:bg-white/20 border-white/20" />
              <CarouselNext className="static relative transform-none bg-white/10 hover:bg-white/20 border-white/20" />
            </div>
          </Carousel>
          
          <p className="text-white mt-5 text-center text-lg relative z-10 drop-shadow-md">Check which assets you can start monetizing now! Enter your property address.</p>
        </motion.div>
      </div>
    </div>;
};
export default FooterCarousel;