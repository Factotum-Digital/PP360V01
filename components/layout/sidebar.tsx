"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const Sidebar: React.FC = () => (
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

          {/* Version Text */}
          <div className="mt-auto vertical-text font-black text-xs uppercase tracking-[0.3em] opacity-30 select-none">
               Secure Terminal v.4.0
          </div>
     </aside>
);
