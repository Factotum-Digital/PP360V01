"use client";

import React, { useState, useEffect } from 'react';

/**
 * Componente Comet: Representa una estela de energía que recorre el grid.
 * Se alinea automáticamente a las líneas del grid (40px para coincidir con globals.css).
 */
const Comet = ({ axis = 'horizontal', delay = 0, speed = 8 }: { axis?: 'horizontal' | 'vertical', delay?: number, speed?: number }) => {
     const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

     useEffect(() => {
          // Wrap in requestAnimationFrame or setTimeout to ensure window is available and layout is ready
          const calculatePosition = () => {
               if (typeof window === 'undefined') return;

               const gridSize = 40; // Coincide con el background-size de globals.css
               const dimension = axis === 'horizontal' ? window.innerHeight : window.innerWidth;
               const maxLines = Math.floor(dimension / gridSize);
               const randomLine = Math.floor(Math.random() * maxLines);
               const pos = randomLine * gridSize;

               if (axis === 'horizontal') {
                    setStyle({
                         top: `${pos}px`,
                         left: '-20%',
                         animation: `moveHorizontal ${speed}s linear infinite`,
                         animationDelay: `${delay}s`,
                    });
               } else {
                    setStyle({
                         left: `${pos}px`,
                         top: '-20%',
                         animation: `moveVertical ${speed}s linear infinite`,
                         animationDelay: `${delay}s`,
                    });
               }
          };

          calculatePosition();
          window.addEventListener('resize', calculatePosition);
          return () => window.removeEventListener('resize', calculatePosition);
     }, [axis, delay, speed]);

     return (
          <div
               className={`absolute opacity-0 pointer-events-none z-0 ${axis === 'horizontal'
                    ? 'h-[1px] w-24 bg-gradient-to-r from-transparent via-[#FF4D00] to-transparent'
                    : 'w-[1px] h-24 bg-gradient-to-b from-transparent via-[#FF4D00] to-transparent'
                    }`}
               style={style}
               suppressHydrationWarning
          />
     );
};

export const GridComets = () => {
     // Use mounted state to prevent hydration mismatch
     const [mounted, setMounted] = useState(false);

     useEffect(() => {
          setMounted(true);
     }, []);

     // Configuración de los cometas
     const comets = [
          { axis: 'horizontal' as const, delay: 0, speed: 10 },
          { axis: 'horizontal' as const, delay: 2, speed: 14 },
          { axis: 'horizontal' as const, delay: 5, speed: 12 },
          { axis: 'horizontal' as const, delay: 8, speed: 16 },
          { axis: 'horizontal' as const, delay: 12, speed: 20 },
          { axis: 'vertical' as const, delay: 1, speed: 12 },
          { axis: 'vertical' as const, delay: 4, speed: 15 },
          { axis: 'vertical' as const, delay: 7, speed: 11 },
          { axis: 'vertical' as const, delay: 10, speed: 18 },
          { axis: 'vertical' as const, delay: 15, speed: 25 },
     ];

     // Don't render on server to avoid hydration mismatch from Math.random()
     if (!mounted) {
          return <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]" suppressHydrationWarning />;
     }

     return (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]" suppressHydrationWarning>
               {comets.map((c, i) => (
                    <Comet key={i} {...c} />
               ))}
          </div>
     );
};

