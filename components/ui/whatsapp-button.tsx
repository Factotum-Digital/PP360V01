"use client";

import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon, CloseIcon } from '@/components/ui/icons';

export const WhatsAppFloatingButton: React.FC = () => {
     const [isExpanded, setIsExpanded] = useState(false);
     const containerRef = useRef<HTMLDivElement>(null);

     const whatsappNumber = "15557745095";
     const whatsappChannel = "https://whatsapp.com/channel/0029Vb6gXXSFMqrY7mFbEi0K";
     const defaultMessage = "Hola! Me interesa cambiar PayPal a Bolívares en PP360VE";

     // Close menu when clicking outside
     useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
               if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsExpanded(false);
               }
          };

          if (isExpanded) {
               document.addEventListener('mousedown', handleClickOutside);
          }

          return () => {
               document.removeEventListener('mousedown', handleClickOutside);
          };
     }, [isExpanded]);

     const handleDirectChat = () => {
          const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
          window.open(url, '_blank');
          setIsExpanded(false);
     };

     const handleChannel = () => {
          window.open(whatsappChannel, '_blank');
          setIsExpanded(false);
     };

     return (
          <div
               ref={containerRef}
               className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
               onMouseLeave={() => setIsExpanded(false)}
          >
               {/* Expanded Options */}
               {isExpanded && (
                    <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
                         {/* Chat Directo */}
                         <button
                              onClick={handleDirectChat}
                              className="bg-[#262626] text-white px-4 py-3 flex items-center gap-3 border-4 border-[#262626] hover:bg-[#FF4D00] hover:border-[#FF4D00] transition-all group"
                         >
                              <span className="w-8 h-8 bg-[#25D366] flex items-center justify-center">
                                   <WhatsAppIcon size={28} />
                              </span>
                              <div className="text-left">
                                   <p className="mono text-[10px] font-black uppercase">Chat Directo</p>
                                   <p className="mono text-[8px] font-bold opacity-60">Respuesta inmediata</p>
                              </div>
                         </button>

                         {/* Canal de WhatsApp */}
                         <button
                              onClick={handleChannel}
                              className="bg-white text-[#262626] px-4 py-3 flex items-center gap-3 border-4 border-[#262626] hover:bg-[#FF4D00] hover:text-white hover:border-[#FF4D00] transition-all"
                         >
                              <span className="w-8 h-8 bg-[#25D366] text-white flex items-center justify-center">
                                   <WhatsAppIcon size={28} />
                              </span>
                              <div className="text-left">
                                   <p className="mono text-[10px] font-black uppercase">Canal PP360VE</p>
                                   <p className="mono text-[8px] font-bold opacity-60">Únete para actualizaciones</p>
                              </div>
                         </button>
                    </div>
               )}

               {/* Main Button */}
               <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`w-16 h-16 flex items-center justify-center border-4 shadow-[4px_4px_0px_0px_#262626] transition-all text-white
                         ${isExpanded
                              ? 'bg-[#262626] border-[#262626]'
                              : 'bg-[#25D366] border-[#262626] hover:bg-[#FF4D00] hover:border-[#FF4D00] active:bg-[#FF4D00] active:border-[#FF4D00]'
                         }
                         hover:shadow-[2px_2px_0px_0px_#262626] hover:translate-x-[2px] hover:translate-y-[2px]
                    `}
               >
                    {isExpanded ? <CloseIcon /> : <WhatsAppIcon size={28} />}
               </button>

               {/* Pulse Animation when not expanded */}
               {!isExpanded && (
                    <span className="absolute bottom-0 right-0 w-16 h-16 bg-[#25D366] animate-ping opacity-30 -z-10" />
               )}
          </div>
     );
};
