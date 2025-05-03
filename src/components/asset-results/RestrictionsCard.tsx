
import { motion } from "framer-motion";

interface RestrictionsCardProps {
  restrictions: string | null;
}

const RestrictionsCard = ({ restrictions }: RestrictionsCardProps) => {
  if (!restrictions) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="mt-6 p-4 glass-effect rounded-lg"
      style={{
        background: "linear-gradient(to bottom right, rgba(239, 68, 68, 0.8), rgba(239, 68, 68, 0.6))",
        boxShadow: "0 5px 15px rgba(239, 68, 68, 0.3)"
      }}
    >
      <h3 className="text-lg font-semibold text-white">Restrictions:</h3>
      <p className="text-gray-100">{restrictions}</p>
      
      {/* Enhanced glossy effect */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-lg pointer-events-none"></div>
    </motion.div>
  );
};

export default RestrictionsCard;
