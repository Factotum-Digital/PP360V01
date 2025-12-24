import React from 'react';

export const COMMISSION_RATE = 0.05;
export const MINIMUM_USD = 5;

export const ICONS = {
     ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="round" {...props}>
               <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
     ),
     Check: (props: React.SVGProps<SVGSVGElement>) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="square" strokeLinejoin="round" {...props}>
               <path d="M20 6 9 17l-5-5" />
          </svg>
     ),
     Exchange: (props: React.SVGProps<SVGSVGElement>) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="round" {...props}>
               <path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" />
          </svg>
     )
};
