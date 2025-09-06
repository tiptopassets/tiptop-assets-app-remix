import React from 'react';
import { motion } from 'framer-motion';
import './IconGlowEffect.css';

interface SportsCourtIconProps {
  size?: number;
  glowing?: boolean;
  color?: string;
}

const SportsCourtIcon: React.FC<SportsCourtIconProps> = ({ 
  size = 48, 
  glowing = false,
  color = "#22c55e" 
}) => {
  return (
    <motion.div
      className={`relative inline-block ${glowing ? 'icon-glow' : ''}`}
      style={{ '--glow-color': color } as React.CSSProperties}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Court outline */}
        <rect
          x="2"
          y="4"
          width="20"
          height="16"
          rx="2"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        
        {/* Court center line */}
        <line
          x1="12"
          y1="4"
          x2="12"
          y2="20"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="2,2"
        />
        
        {/* Court center circle */}
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Tennis net */}
        <line
          x1="2"
          y1="12"
          x2="22"
          y2="12"
          stroke={color}
          strokeWidth="2"
        />
        
        {/* Service boxes */}
        <line
          x1="6"
          y1="8"
          x2="6"
          y2="16"
          stroke={color}
          strokeWidth="1"
          opacity="0.7"
        />
        <line
          x1="18"
          y1="8"
          x2="18"
          y2="16"
          stroke={color}
          strokeWidth="1"
          opacity="0.7"
        />
        
        {/* Ball */}
        <motion.circle
          cx="8"
          cy="8"
          r="1.5"
          fill={color}
          animate={{
            x: [0, 2, 0],
            y: [0, -1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    </motion.div>
  );
};

export default SportsCourtIcon;