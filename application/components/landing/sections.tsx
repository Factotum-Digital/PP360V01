"use client";

import React from 'react';
import { Slab, Tag } from '@/components/ui/brutalist-system';
import { PayPalServiceButton } from '@/components/features/paypal-service-button';

export const LandingSections: React.FC = () => (
     <div className="space-y-24 mt-32">
          <section>
               <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                         <Tag active>About US</Tag>
                         <h2 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter">
                              Automate your <br /> <span className="text-transparent italic" style={{ WebkitTextStroke: '2px #262626' }}>Strategic Planning</span>
                         </h2>
                         <p className="text-lg font-medium text-gray-500 max-width-xl">
                              Streamline financial tasks, reduce manual errors, and unlock the power of real-time analytics with PP360VE.
                         </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <Slab className="p-8 text-center bg-white">
                              <div className="text-4xl font-black mb-2">25k+</div>
                              <div className="text-xs font-bold uppercase mono">Customers</div>
                         </Slab>
                         <Slab className="p-8 text-center bg-[#262626] text-white">
                              <div className="text-4xl font-black mb-2 text-[#FF4D00]">$2k+</div>
                              <div className="text-xs font-bold uppercase mono">Invested</div>
                         </Slab>
                         <Slab className="p-8 text-center bg-[#FF4D00] text-white border-[#262626]">
                              <div className="text-4xl font-black mb-2">4.9</div>
                              <div className="text-xs font-bold uppercase mono">Rating</div>
                         </Slab>
                         <Slab className="p-8 text-center bg-orange-100">
                              <div className="text-4xl font-black mb-2">205+</div>
                              <div className="text-xs font-bold uppercase mono">Nodes</div>
                         </Slab>
                    </div>
               </div>
          </section>

          <section className="bg-[#262626] -mx-6 md:-mx-12 lg:-mx-20 p-20 text-white border-y-8 border-[#262626]">
               <div className="max-w-6xl mx-auto space-y-16">
                    <div className="flex flex-col md:flex-row justify-between gap-12 items-end">
                         <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                              Expert <br /> <span className="text-[#FF4D00]">Support</span>
                         </h2>
                         <p className="max-w-md mono text-sm font-bold text-gray-400">
                              Our specialized team operates 24/7. Whether it&apos;s high-volume liquidation or KYC assistance, we are the interface between your capital and liquidity.
                         </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                         {[1, 2, 3].map(i => (
                              <Slab key={i} className="p-10 bg-[#333333] border-gray-700">
                                   <div className="text-[#FF4D00] mono mb-4 font-black">BENEFIT_0{i}</div>
                                   <h4 className="text-xl font-black mb-4">Scalable High-End Infrastructure</h4>
                                   <p className="text-xs mono text-gray-400">Adaptive API endpoints designed for rapid enterprise-level data processing.</p>
                              </Slab>
                         ))}
                    </div>
               </div>
          </section>

          <section className="pb-32">
               <div className="text-center space-y-8">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter underline decoration-8 decoration-[#FF4D00] underline-offset-8">Choose your protocol</h2>
                    <div className="grid md:grid-cols-3 gap-8 pt-8">
                         {['Starter', 'Standard', 'Premium'].map((plan, i) => (
                              <Slab key={plan} className={`p-10 ${i === 2 ? 'bg-[#262626] text-white' : 'bg-white'}`}>
                                   <div className="mono text-xs font-black mb-6 italic">{plan.toUpperCase()}_PLAN</div>
                                   <div className="text-5xl font-black mb-8">${(i + 1) * 99}<span className="text-sm mono font-normal opacity-50">/MO</span></div>
                                   <ul className="text-left space-y-4 mono text-[10px] font-bold uppercase mb-10">
                                        <li>- 5 Workflows</li>
                                        <li>- Standard Rate Access</li>
                                        <li>- Priority Node Routing</li>
                                        {i > 0 && <li>- AI Market Forecast</li>}
                                        {i > 1 && <li>- Direct Node API</li>}
                                   </ul>

                                   {/* PayPal desactivado temporalmente - los pagos no se registraban en BD */}
                                   <button
                                        disabled
                                        className={`w-full py-3 font-black uppercase text-sm border-4 border-[#262626] opacity-50 cursor-not-allowed ${i === 2 ? 'bg-[#333] text-gray-400' : 'bg-gray-100 text-gray-500'}`}
                                   >
                                        Coming Soon
                                   </button>

                              </Slab>
                         ))}
                    </div>
               </div>
          </section>
     </div>
);
