"use client";

import React from 'react';
import { Tag } from '@/components/ui/brutalist-system';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/ui/icons';

export const Footer: React.FC = () => (
     <footer className="mt-32 pt-16 border-t-8 border-[#262626] pb-20">
          <div className="flex flex-col md:flex-row justify-between gap-12">
               <div className="max-w-md">
                    <h2 className="font-black italic text-4xl mb-6 text-[#262626]">P360_TERM</h2>
                    <p className="mono text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                         ESTE TERMINAL OPERA BAJO PROTOCOLOS ESTRICTOS DE CUMPLIMIENTO INTERNACIONAL. TODAS LAS TRANSACCIONES SON FINALES. NO SE PERMITEN PAGOS DE TERCEROS SIN VALIDACIÓN KYC NIVEL 2.
                    </p>
               </div>
               <div className="flex gap-12 md:gap-20 flex-wrap">
                    {/* Contact Section */}
                    <div className="space-y-4">
                         <Tag active>Contact</Tag>
                         <ul className="mono text-[10px] font-bold uppercase space-y-3">
                              <li>
                                   <a
                                        href="https://wa.me/15557745095"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:text-[#FF4D00] transition-colors"
                                   >
                                        <WhatsAppIcon />
                                        <span>WhatsApp</span>
                                   </a>
                              </li>
                              <li>
                                   <a
                                        href="https://www.facebook.com/groups/paypal360ve"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:text-[#FF4D00] transition-colors"
                                   >
                                        <FacebookIcon />
                                        <span>Facebook Group</span>
                                   </a>
                              </li>
                              <li>
                                   <a
                                        href="https://www.instagram.com/paypal360ve/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:text-[#FF4D00] transition-colors"
                                   >
                                        <InstagramIcon />
                                        <span>@paypal360ve</span>
                                   </a>
                              </li>
                         </ul>
                    </div>
                    {/* Support Section */}
                    <div className="space-y-4">
                         <Tag active>Support</Tag>
                         <ul className="mono text-[10px] font-bold uppercase space-y-2">
                              <li>WhatsApp: 24/7</li>
                              <li>Status: Operational</li>
                         </ul>
                    </div>
                    {/* Legal Section */}
                    <div className="space-y-4">
                         <Tag active>Legal</Tag>
                         <ul className="mono text-[10px] font-bold uppercase space-y-2">
                              <li>Terms / Privacy</li>
                              <li>AML Compliance</li>
                         </ul>
                    </div>
               </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t-4 border-gray-200">
               <p className="mono text-[10px] font-bold text-gray-400 uppercase text-center">
                    © 2025 PP360VE Terminal. All rights reserved.
               </p>
          </div>
     </footer>
);
