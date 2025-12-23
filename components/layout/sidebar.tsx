"use client";

import React from 'react';
import Image from 'next/image';

export const Sidebar: React.FC = () => (
     <aside className="w-20 border-r-4 border-[#262626] bg-white hidden sm:flex flex-col items-center py-10 gap-12 z-20 sticky top-0 h-screen">
          <div className="w-12 h-12 flex items-center justify-center border-4 border-[#262626] shadow-[4px_4px_0_0_rgba(38,38,38,0.2)] overflow-hidden bg-[#262626]">
               <Image
                    src="/logo.png"
                    alt="PP360VE"
                    width={48}
                    height={48}
                    className="object-contain"
               />
          </div>
          <nav className="flex flex-col gap-8">
               <div className="w-8 h-8 bg-[#262626] hover:bg-[#FF4D00] transition-colors cursor-pointer border-2 border-[#262626]" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}></div>
               <div className="w-8 h-8 border-4 border-[#262626] hover:bg-[#FF4D00] transition-colors cursor-pointer"></div>
               <div className="w-8 h-8 border-4 border-[#262626] opacity-20 hover:opacity-100 transition-opacity cursor-pointer"></div>
          </nav>
          <div className="mt-auto vertical-text font-black text-xs uppercase tracking-[0.3em] opacity-30 select-none">
               Secure Terminal v.4.0
          </div>
     </aside>
);
