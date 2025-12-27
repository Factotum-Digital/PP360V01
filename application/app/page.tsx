"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag } from '@/components/ui/brutalist-system';
import { ExchangeTerminal } from '@/components/features/exchange-calculator';
import { LandingSections } from '@/components/landing/sections';
import { Footer } from '@/components/layout/footer';

export default function Home() {
     const [session, setSession] = useState("FF-000-000");

     useEffect(() => {
          setSession(`SESS-${Math.floor(Math.random() * 9000 + 1000)}`);
     }, []);

     return (
          <>
               {/* Header */}
               <header className="mb-16">
                    <div className="flex justify-between items-start mb-6 w-full">
                         <div className="flex items-center gap-4">
                              <Tag active>Sistema: En Línea</Tag>
                              <span className="mono text-xs text-gray-400 font-bold tracking-widest uppercase">{session} // OPERADORES ACTIVOS</span>
                         </div>
                         <div className="button-group">
                              <Link href="/login">
                                   <button className="dashboard-btn">LOGIN</button>
                              </Link>
                              <Link href="/register">
                                   <button className="logout-btn">SIGN UP</button>
                              </Link>
                         </div>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-4 text-[#262626]">
                         PP360VE<br /><span className="text-transparent italic" style={{ WebkitTextStroke: '3px #FF4D00' }}>Terminal</span>
                    </h1>
                    <p className="text-xl font-bold uppercase tracking-tight max-w-lg mt-8 border-l-8 border-[#FF4D00] pl-4 text-[#262626]">
                         Elevate your financial service with the PP360VE Brutalist Exchange Interface.
                    </p>
               </header>

               {/* Terminal Section */}
               <ExchangeTerminal />


               {/* Unified Marketing Sections */}
               <LandingSections />


               <Footer />
          </>
     );
}
