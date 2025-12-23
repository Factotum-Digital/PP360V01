"use client";

import React from 'react';
import { Tag } from '@/components/ui/brutalist-system';

export const Footer: React.FC = () => (
     <footer className="mt-32 pt-16 border-t-8 border-[#262626] pb-20">
          <div className="flex flex-col md:flex-row justify-between gap-12">
               <div className="max-w-md">
                    <h2 className="font-black italic text-4xl mb-6 text-[#262626]">P360_TERM</h2>
                    <p className="mono text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                         ESTE TERMINAL OPERA BAJO PROTOCOLOS ESTRICTOS DE CUMPLIMIENTO INTERNACIONAL. TODAS LAS TRANSACCIONES SON FINALES. NO SE PERMITEN PAGOS DE TERCEROS SIN VALIDACIÓN KYC NIVEL 2.
                    </p>
               </div>
               <div className="flex gap-20">
                    <div className="space-y-4">
                         <Tag active>Support</Tag>
                         <ul className="mono text-[10px] font-bold uppercase space-y-2">
                              <li>Telegram: @P360_OPS</li>
                              <li>Status: Operational</li>
                         </ul>
                    </div>
                    <div className="space-y-4">
                         <Tag active>Legal</Tag>
                         <ul className="mono text-[10px] font-bold uppercase space-y-2">
                              <li>Terms / Privacy</li>
                              <li>AML Compliance</li>
                         </ul>
                    </div>
               </div>
          </div>
     </footer>
);
