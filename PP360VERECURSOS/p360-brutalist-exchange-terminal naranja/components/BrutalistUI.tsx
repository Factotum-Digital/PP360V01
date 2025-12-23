
import React, { useState } from 'react';

interface SlabProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  onClick?: () => void;
}

export const Slab: React.FC<SlabProps> = ({ children, className = '', dark = false, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Using the new primary text color #262626 instead of pure black
  const borderColor = "border-[#262626]";
  const baseClasses = `border-4 ${borderColor} transition-all duration-300 ease-out relative transform-gpu`;
  
  const colorClasses = dark 
    ? "bg-[#262626] text-white" 
    : "bg-white text-[#262626]";
  
  const interactionClasses = onClick ? "cursor-pointer active:scale-[0.97]" : "";

  // Brutalist shadow lift logic adjusted for the new theme
  const shadowOffset = isHovered ? (dark ? '10px' : '16px') : (dark ? '6px' : '8px');
  const shadowOpacity = dark ? '0.2' : '1';
  const shadowColor = dark ? `rgba(38,38,38,${shadowOpacity})` : '#262626';

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: isHovered 
          ? 'scale(1.02) translateY(-4px)' 
          : 'scale(1) translateY(0px)',
        boxShadow: `${shadowOffset} ${shadowOffset} 0px 0px ${shadowColor}`,
        willChange: 'transform, box-shadow',
      }}
      className={`${baseClasses} ${colorClasses} ${interactionClasses} ${className}`}
    >
      <div style={{ 
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0px)', 
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' 
      }}>
        {children}
      </div>
    </div>
  );
};

export const Tag: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <span className={`mono text-xs px-2 py-1 uppercase font-bold border-2 border-[#262626] inline-block ${active ? 'bg-[#262626] text-white' : 'bg-white text-[#262626]'}`}>
    {children}
  </span>
);
