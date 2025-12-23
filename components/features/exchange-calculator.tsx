"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Slab, Tag } from '@/components/ui/brutalist-system';
import { AppStep, ExchangeData, TerminalLog } from '@/types';
import { COMMISSION_RATE, MINIMUM_USD, ICONS } from '@/constants';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

const FALLBACK_RATE = 54.42;

const generateChartData = (baseRate: number) => Array.from({ length: 12 }, (_, i) => ({
     time: `${i + 8}:00`,
     val: baseRate + (Math.random() * 2 - 1)
}));

export const ExchangeTerminal: React.FC = () => {
     const [step, setStep] = useState<AppStep>(AppStep.QUOTATION);
     const [currentRate, setCurrentRate] = useState(FALLBACK_RATE);
     const [chartData, setChartData] = useState<{ time: string; val: number }[]>([]);
     const [data, setData] = useState<ExchangeData>({
          usdAmount: 100,
          vesAmount: 0,
          rate: FALLBACK_RATE,
          email: '',
          bank: 'Banesco',
          idNumber: '',
          phone: ''
     });
     const [logs, setLogs] = useState<TerminalLog[]>([]);
     const [errors, setErrors] = useState<{ [key: string]: string }>({});
     const [insight, setInsight] = useState({
          title: "LIQUIDITY ANALYSIS PENDING",
          description: "WAITING FOR TERMINAL SYNC AND MARKET DATA STREAM...",
          sentiment: "NEUTRAL"
     });

     const addLog = useCallback((msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
          setLogs(prev => [
               { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: msg, type },
               ...prev.slice(0, 15)
          ]);
     }, []);

     // Fetch real rate from DolarAPI (paralelo - 15%)
     const fetchRates = useCallback(async () => {
          addLog("FETCHING_PARALELO_RATES...", "info");
          try {
               const res = await fetch('/api/rates');
               if (!res.ok) throw new Error('API Error');
               const rates = await res.json();
               // Usamos payRate (tasa paralela - 15%)
               const payRate = rates.payRate || rates.paralelo * 0.85;
               setCurrentRate(payRate);
               setChartData(generateChartData(rates.paralelo));
               setInsight({
                    title: `DÓLAR OFICIAL BCV: ${rates.oficial.toFixed(2)} VES`,
                    description: `PARALELO: ${rates.paralelo.toFixed(2)} VES | TU RECIBES: ${payRate.toFixed(2)} VES/USD`,
                    sentiment: "STABLE"
               });
               addLog(`RATES_SYNCED: BCV=${rates.oficial.toFixed(2)} | PARALELO=${rates.paralelo.toFixed(2)} | PAGO=${payRate.toFixed(2)}`, "success");
          } catch (error) {
               addLog("RATE_FETCH_FAILED: USING_FALLBACK", "warning");
               setChartData(generateChartData(FALLBACK_RATE));
          }
     }, [addLog]);

     // Calculate VES amount based on current rate
     useEffect(() => {
          const netUsd = data.usdAmount * (1 - COMMISSION_RATE);
          setData(prev => ({ ...prev, rate: currentRate, vesAmount: netUsd * currentRate }));
     }, [data.usdAmount, currentRate]);

     useEffect(() => {
          addLog("SYSTEM BOOTED", "success");
          addLog("KERNEL_VERSION: 4.0.2");
          addLog("LIQUIDITY_CHECK: PASSED");

          fetchRates();

          const interval = setInterval(() => {
               const msgs = ["PEER CONNECTED", "PING: 14ms", "RATE SYNCED", "SECURE TUNNEL: ACTIVE"];
               addLog(msgs[Math.floor(Math.random() * msgs.length)]);
          }, 5000);

          return () => clearInterval(interval);
     }, [addLog, fetchRates]);

     const handleProcess = () => {
          if (data.usdAmount < MINIMUM_USD) return;
          addLog(`USER_ACTION: REQUEST_STEP_02`, "warning");
          setStep(AppStep.VALIDATION);
     };

     const validateEmail = (email: string) => {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return re.test(email);
     };

     const validatePhone = (phone: string) => {
          const re = /^04\d{9}$/;
          return re.test(phone.replace(/\s/g, ''));
     };

     const validateIdNumber = (id: string) => {
          const re = /^[VEJGC]-?\d{6,9}$/i;
          return re.test(id.replace(/\s/g, ''));
     };

     const handleFinalize = () => {
          const newErrors: { [key: string]: string } = {};

          // Validate email
          if (!data.email || data.email.trim() === '') {
               newErrors.email = 'Email PayPal es obligatorio';
          } else if (!validateEmail(data.email)) {
               newErrors.email = 'Email no válido';
          }

          // Validate ID number
          if (!data.idNumber || data.idNumber.trim() === '') {
               newErrors.idNumber = 'Cédula / RIF es obligatorio';
          } else if (!validateIdNumber(data.idNumber)) {
               newErrors.idNumber = 'Formato: V-12345678';
          }

          // Validate phone
          if (!data.phone || data.phone.trim() === '') {
               newErrors.phone = 'Teléfono es obligatorio';
          } else if (!validatePhone(data.phone)) {
               newErrors.phone = 'Formato: 04XX1234567';
          }

          // If there are errors, show them and stop
          if (Object.keys(newErrors).length > 0) {
               setErrors(newErrors);
               addLog(`VALIDATION_FAILED: ${Object.keys(newErrors).length} FIELD(S) MISSING`, "warning");
               return;
          }

          // Clear errors and proceed
          setErrors({});
          addLog(`ENCRYPTING_ORDER_DATA...`, "info");
          setTimeout(() => {
               setStep(AppStep.SUCCESS);
               addLog(`ORDER_COMMITTED_ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, "success");
          }, 1500);
     };

     return (
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
               {/* Transaction Unit */}
               <div className="lg:col-span-8 space-y-12">
                    <Slab className="p-6 md:p-10 relative overflow-hidden min-h-[550px]">
                         <div className="absolute top-0 right-0 flex">
                              <div className={`px-4 py-2 border-l-4 border-b-4 border-[#262626] mono text-sm font-bold transition-all ${step === AppStep.QUOTATION ? 'bg-[#262626] text-white' : 'bg-white opacity-30'}`}>STEP_01</div>
                              <div className={`px-4 py-2 border-l-4 border-b-4 border-[#262626] mono text-sm font-bold transition-all ${step === AppStep.VALIDATION ? 'bg-[#262626] text-white' : 'bg-white opacity-30'}`}>STEP_02</div>
                         </div>

                         {step === AppStep.QUOTATION && (
                              <div className="mt-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                   <div className="space-y-4">
                                        <label className="mono text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                             <span className="w-3 h-3 bg-[#FF4D00]"></span> Tú envías (PayPal USD)
                                        </label>
                                        <div className="relative group">
                                             <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-4xl opacity-20">$</span>
                                             <input
                                                  type="number"
                                                  value={data.usdAmount}
                                                  onChange={e => setData({ ...data, usdAmount: Number(e.target.value) })}
                                                  className="w-full bg-gray-50 border-b-8 border-[#262626] p-8 pl-16 text-5xl font-black mono focus:bg-white transition-all outline-none"
                                             />
                                        </div>
                                        {data.usdAmount < MINIMUM_USD && <p className="text-[#FF4D00] mono text-[10px] font-bold uppercase">Monto mínimo: $10.00 USD</p>}
                                   </div>

                                   <div className="flex items-center gap-6">
                                        <div className="h-1 flex-1 bg-[#262626]"></div>
                                        <div className="w-16 h-16 border-4 border-[#262626] flex items-center justify-center rotate-45 hover:rotate-0 transition-transform duration-500 bg-white">
                                             <ICONS.Exchange className="-rotate-45" />
                                        </div>
                                        <div className="h-1 flex-1 bg-[#262626]"></div>
                                   </div>

                                   <div className="space-y-4">
                                        <label className="mono text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                             <span className="w-3 h-3 bg-[#FF4D00]"></span> Tú recibes (VES)
                                        </label>
                                        <div className="relative">
                                             <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-4xl opacity-20">Bs</span>
                                             <input
                                                  type="text"
                                                  readOnly
                                                  value={data.vesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                                  className="w-full bg-[#262626] text-white p-8 pl-24 text-5xl font-black mono outline-none"
                                             />
                                        </div>
                                        <div className="flex justify-between items-center py-2 mono text-[10px] font-bold text-gray-400 uppercase">
                                             <span>RATE: 1 USD = {currentRate.toFixed(2)} VES</span>
                                             <span>FEE: 5.00% INCL.</span>
                                        </div>
                                   </div>

                                   <Slab dark className="p-8 text-xl font-black uppercase tracking-widest flex justify-between items-center bg-[#FF4D00] border-[#262626] text-white" onClick={handleProcess}>
                                        <span>Continuar Proceso</span>
                                        <ICONS.ArrowRight className="w-8 h-8" />
                                   </Slab>
                              </div>
                         )}

                         {step === AppStep.VALIDATION && (
                              <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                   <h3 className="mono text-2xl font-black uppercase underline decoration-4 decoration-[#FF4D00] underline-offset-4">Datos de Destino</h3>
                                   <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                             <label className="mono text-[10px] font-black uppercase">Email PayPal <span className="text-[#FF4D00]">*</span></label>
                                             <input
                                                  className={`w-full border-4 ${errors.email ? 'border-[#FF4D00] bg-red-50' : 'border-[#262626]'} p-4 font-bold mono focus:bg-gray-50 outline-none`}
                                                  placeholder="usuario@email.com"
                                                  value={data.email}
                                                  onChange={e => setData({ ...data, email: e.target.value })}
                                             />
                                             {errors.email && <p className="text-[#FF4D00] mono text-[10px] font-bold">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                             <label className="mono text-[10px] font-black uppercase">Banco <span className="text-[#FF4D00]">*</span></label>
                                             <select
                                                  className="w-full border-4 border-[#262626] p-4 font-bold mono appearance-none bg-white outline-none"
                                                  value={data.bank}
                                                  onChange={e => setData({ ...data, bank: e.target.value })}
                                             >
                                                  <option>Banesco</option>
                                                  <option>Mercantil</option>
                                                  <option>Banco de Venezuela</option>
                                                  <option>Provincial</option>
                                                  <option>BOD</option>
                                                  <option>BNC</option>
                                             </select>
                                        </div>
                                        <div className="space-y-2">
                                             <label className="mono text-[10px] font-black uppercase">Cédula / RIF <span className="text-[#FF4D00]">*</span></label>
                                             <input
                                                  className={`w-full border-4 ${errors.idNumber ? 'border-[#FF4D00] bg-red-50' : 'border-[#262626]'} p-4 font-bold mono focus:bg-gray-50 outline-none`}
                                                  placeholder="V-12345678"
                                                  value={data.idNumber}
                                                  onChange={e => setData({ ...data, idNumber: e.target.value })}
                                             />
                                             {errors.idNumber && <p className="text-[#FF4D00] mono text-[10px] font-bold">{errors.idNumber}</p>}
                                        </div>
                                        <div className="space-y-2">
                                             <label className="mono text-[10px] font-black uppercase">Teléfono Pago Móvil <span className="text-[#FF4D00]">*</span></label>
                                             <input
                                                  className={`w-full border-4 ${errors.phone ? 'border-[#FF4D00] bg-red-50' : 'border-[#262626]'} p-4 font-bold mono focus:bg-gray-50 outline-none`}
                                                  placeholder="04121234567"
                                                  value={data.phone}
                                                  onChange={e => setData({ ...data, phone: e.target.value })}
                                             />
                                             {errors.phone && <p className="text-[#FF4D00] mono text-[10px] font-bold">{errors.phone}</p>}
                                        </div>
                                   </div>

                                   <div className="bg-orange-50 p-4 border-l-8 border-[#FF4D00]">
                                        <p className="mono text-[10px] font-bold leading-tight">ATENCIÓN: Solo aceptamos pagos de cuentas verificadas coincidentes con el titular bancario.</p>
                                   </div>

                                   <div className="flex gap-4 pt-4">
                                        <Slab className="w-1/3 p-6 text-center font-black uppercase mono" onClick={() => setStep(AppStep.QUOTATION)}>Volver</Slab>
                                        <Slab dark className="flex-1 p-6 text-center text-xl font-black uppercase tracking-widest bg-[#FF4D00]" onClick={handleFinalize}>Confirmar</Slab>
                                   </div>
                              </div>
                         )}

                         {step === AppStep.SUCCESS && (
                              <div className="mt-8 space-y-8 flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
                                   <div className="w-24 h-24 bg-[#FF4D00] border-4 border-[#262626] flex items-center justify-center mb-6 shadow-[8px_8px_0px_0px_#262626]">
                                        <ICONS.Check className="w-16 h-16 text-white" />
                                   </div>
                                   <h3 className="text-4xl font-black uppercase italic tracking-tighter">Orden Generada</h3>
                                   <p className="mono text-sm font-bold max-w-md">Instrucciones enviadas a su correo. TICKET_ID: <span className="bg-[#262626] text-white px-2">#P360-{Math.floor(Math.random() * 9999)}</span></p>
                                   <button
                                        onClick={() => setStep(AppStep.QUOTATION)}
                                        className="mt-8 underline font-black mono uppercase hover:text-[#FF4D00] transition-colors"
                                   >
                                        Nueva Operación
                                   </button>
                              </div>
                         )}
                    </Slab>

                    <div className="grid md:grid-cols-3 gap-6">
                         <Slab className="p-6 bg-orange-100">
                              <div className="mono text-xs font-black mb-2 italic underline decoration-[#FF4D00]">MODO_SEGURO</div>
                              <p className="text-[10px] font-bold leading-tight uppercase">Encriptación AES-256 en cada segmento de datos.</p>
                         </Slab>
                         <Slab className="p-6">
                              <div className="mono text-xs font-black mb-2 italic underline decoration-[#FF4D00]">TIME_EFFICIENCY</div>
                              <p className="text-[10px] font-bold leading-tight uppercase">Promedio de liquidación: 14.2 minutos.</p>
                         </Slab>
                         <Slab className="p-6 bg-[#262626] text-white">
                              <div className="mono text-xs font-black mb-2 text-[#FF4D00] italic underline">NETWORK_STATUS</div>
                              <p className="text-[10px] font-bold leading-tight uppercase">Liquidez inmediata confirmada en nodos centrales.</p>
                         </Slab>
                    </div>
               </div>

               {/* Analytics Sidebar */}
               <div className="lg:col-span-4 space-y-8">
                    <Slab dark className="p-8 overflow-hidden relative">
                         <div className="flex justify-between items-start mb-8">
                              <h3 className="mono text-sm font-bold tracking-tighter uppercase italic">Histórico Tasa</h3>
                              <span className="bg-[#FF4D00] text-white px-2 py-1 mono text-[10px] font-black">+2.4%</span>
                         </div>
                         <div className="h-40 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                   <LineChart data={chartData}>
                                        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                                        <Tooltip
                                             contentStyle={{ backgroundColor: '#262626', border: '2px solid #FF4D00', fontSize: '10px' }}
                                             labelStyle={{ display: 'none' }}
                                             itemStyle={{ color: '#fff' }}
                                             formatter={(value) => [`Bs: ${Number(value).toFixed(2)}`, '']}
                                        />
                                        <Line
                                             type="stepAfter"
                                             dataKey="val"
                                             stroke="#FF4D00"
                                             strokeWidth={4}
                                             dot={false}
                                        />
                                   </LineChart>
                              </ResponsiveContainer>
                         </div>
                         <div className="mt-4 flex justify-between mono text-[10px] text-gray-500 uppercase font-black">
                              <span>08:00</span>
                              <span>12:00</span>
                              <span>16:00</span>
                              <span>Real-time</span>
                         </div>
                    </Slab>

                    {/* Terminal Logs Slab - Ajustado para legibilidad total y texto negro */}
                    <Slab className="p-4 bg-white mono text-[11px] h-48 relative border-4 border-[#262626] overflow-hidden">
                         <div className="h-full overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                              {logs.length === 0 ? (
                                   <div className="text-[#262626] opacity-30 italic">&gt; STANDBY: WAITING_FOR_KERNEL...</div>
                              ) : (
                                   logs.map(log => (
                                        <div key={log.id} className="text-[#262626] leading-relaxed break-words border-l-2 border-transparent pl-2">
                                             <span className="opacity-50 font-bold">{log.timestamp}</span> : {log.message}
                                        </div>
                                   ))
                              )}
                         </div>
                    </Slab>

                    {/* AI MARKET INTELLIGENCE BOX */}
                    <Slab className="p-6 bg-orange-50 border-[#FF4D00]">
                         <div className="space-y-4">
                              <div className="mono text-[10px] font-black flex items-center gap-2 text-[#262626]">
                                   <span className="w-2 h-2 bg-[#262626]"></span> AI_MARKET_INTELLIGENCE
                              </div>

                              <h4 className="text-xl font-black leading-none text-[#262626] uppercase">
                                   {insight.title}
                              </h4>

                              <p className="mono text-[11px] font-bold text-gray-500 leading-tight uppercase italic">
                                   {insight.description}
                              </p>

                              <div className={`inline-block px-3 py-1 text-[10px] font-black mono text-white uppercase ${insight.sentiment === 'NEGATIVE' ? 'bg-[#FF4D00]' : 'bg-[#262626]'}`}>
                                   SENTIMENT: {insight.sentiment}
                              </div>
                         </div>
                    </Slab>

                    {/* AI Market Signal */}
                    <Slab className="p-8 bg-[#262626] text-[#FF4D00] border-[#262626]">
                         <h3 className="mono text-xs font-black mb-4 flex items-center gap-2">
                              <span className="animate-pulse w-2 h-2 bg-orange-400 rounded-full"></span>
                              AI_MARKET_SIGNAL
                         </h3>
                         <p className="mono text-xl font-bold tracking-tighter leading-none italic uppercase">
                              Rate Optimized. {data.vesAmount.toLocaleString('es-VE', { maximumFractionDigits: 0 })} VES Secured. Hedge Established.
                         </p>
                    </Slab>
               </div>
          </div>
     );
};
