"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const Sidebar: React.FC = () => {
     const [isOpen, setIsOpen] = useState(false);

     return (
          <>
               {/* Mobile Hamburger Button - Small, bottom corner */}
               <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="hidden sm:hidden fixed top-4 right-20 z-50 w-12 h-12 bg-[#262626] border-2 border-[#262626] flex flex-col items-center justify-center gap-1 rounded-sm shadow-[3px_3px_0_0_#FF4D00]"
                    aria-label="Toggle menu"
               >
                    <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                    <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
               </button>

               {/* Mobile Overlay */}
               {isOpen && (
                    <div
                         className="sm:hidden fixed inset-0 bg-black/50 z-30"
                         onClick={() => setIsOpen(false)}
                    />
               )}

               {/* Sidebar - Desktop (always visible) & Mobile (toggle) */}
               <aside className={`
                    w-20 border-r-4 border-[#262626] bg-white flex flex-col items-center py-10 gap-12 z-40 h-screen
                    fixed sm:sticky top-0 left-0
                    transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
               `}>
                    {/* Logo - Click to go Home */}
                    <Link
                         href="/"
                         className="w-12 h-12 flex items-center justify-center border-4 border-[#262626] shadow-[4px_4px_0_0_rgba(38,38,38,0.2)] overflow-hidden bg-[#262626] hover:shadow-[2px_2px_0_0_rgba(38,38,38,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                         onClick={() => setIsOpen(false)}
                    >
                         <Image
                              src="/logo.png"
                              alt="PP360VE"
                              width={48}
                              height={48}
                              className="object-contain"
                         />
                    </Link>

                    {/* Navigation Buttons */}
                    <nav className="flex flex-col gap-8">
                         <div className="w-8 h-8 bg-[#262626] hover:bg-[#FF4D00] transition-colors cursor-pointer border-2 border-[#262626]"></div>
                         <div className="w-8 h-8 border-4 border-[#262626] hover:bg-[#FF4D00] transition-colors cursor-pointer"></div>
                         <div className="w-8 h-8 border-4 border-[#262626] opacity-20 hover:opacity-100 transition-opacity cursor-pointer"></div>
                    </nav>

                    {/* Version Text */}
                    <div className="mt-auto vertical-text font-black text-xs uppercase tracking-[0.3em] opacity-30 select-none">
                         Secure Terminal v.4.0
                    </div>
               </aside>
          </>
     );
};
