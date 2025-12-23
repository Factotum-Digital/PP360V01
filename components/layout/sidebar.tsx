"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Icons SVG
const HomeIcon = () => (
     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
     </svg>
);

const DashboardIcon = () => (
     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
     </svg>
);

const CalculatorIcon = () => (
     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
     </svg>
);

export const Sidebar: React.FC = () => {
     const pathname = usePathname();

     const navItems = [
          { href: '/', icon: <HomeIcon />, label: 'Home', active: pathname === '/' },
          { href: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard', active: pathname === '/dashboard' },
          { href: '/#calculator', icon: <CalculatorIcon />, label: 'Calculadora', active: false },
     ];

     return (
          <aside className="w-20 border-r-4 border-[#262626] bg-white hidden sm:flex flex-col items-center py-10 gap-12 z-20 sticky top-0 h-screen">
               {/* Logo - Click to go Home */}
               <Link
                    href="/"
                    className="w-12 h-12 flex items-center justify-center border-4 border-[#262626] shadow-[4px_4px_0_0_rgba(38,38,38,0.2)] overflow-hidden bg-[#262626] hover:shadow-[2px_2px_0_0_rgba(38,38,38,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
               >
                    <Image
                         src="/logo.png"
                         alt="PP360VE"
                         width={48}
                         height={48}
                         className="object-contain"
                    />
               </Link>

               {/* Navigation */}
               <nav className="flex flex-col gap-6">
                    {navItems.map((item, index) => (
                         <Link
                              key={index}
                              href={item.href}
                              title={item.label}
                              className={`w-10 h-10 flex items-center justify-center border-4 border-[#262626] transition-all cursor-pointer
                                   ${item.active
                                        ? 'bg-[#FF4D00] text-white'
                                        : 'bg-white text-[#262626] hover:bg-[#FF4D00] hover:text-white'
                                   }
                              `}
                         >
                              {item.icon}
                         </Link>
                    ))}
               </nav>

               {/* Version Text */}
               <div className="mt-auto vertical-text font-black text-xs uppercase tracking-[0.3em] opacity-30 select-none">
                    Secure Terminal v.4.0
               </div>
          </aside>
     );
};
