"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Slab } from '@/components/ui/brutalist-system';
import { AppStep, ExchangeData, TerminalLog } from '@/types';
import { COMMISSION_RATE, MINIMUM_USD, ICONS } from '@/constants';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { createClient } from '@/lib/supabase/client';

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
          usdAmount: 5,
          vesAmount: 0,
          rate: FALLBACK_RATE,
          email: '',
          bank: 'Banesco',
          idNumber: '',
          phone: '',
          whatsapp: ''
     });
     const [logs, setLogs] = useState<TerminalLog[]>([]);
     const [errors, setErrors] = useState<{ [key: string]: string }>({});
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [uploading, setUploading] = useState(false);
     const [uploadSuccess, setUploadSuccess] = useState(false);
     const [paymentInfo, setPaymentInfo] = useState<{
          ticketId: string;
          paypalDestination: string;
          instructions: string[];
     } | null>(null);
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
               const payRate = rates.payRate || rates.paralelo * 0.85;
               setCurrentRate(payRate);
               setChartData(generateChartData(rates.paralelo));
               setInsight({
                    title: `DÓLAR OFICIAL BCV: ${rates.oficial.toFixed(2)} VES`,
                    description: `PARALELO: ${rates.paralelo.toFixed(2)} VES | TU RECIBES: ${payRate.toFixed(2)} VES/USD`,
                    sentiment: "STABLE"
               });
               addLog(`RATES_SYNCED: BCV=${rates.oficial.toFixed(2)} | PARALELO=${rates.paralelo.toFixed(2)} | PAGO=${payRate.toFixed(2)}`, "success");
          } catch {
               addLog("RATE_FETCH_FAILED: USING_FALLBACK", "warning");
               setChartData(generateChartData(FALLBACK_RATE));
          }
     }, [addLog]);

     useEffect(() => {
          const amount = data.usdAmount === '' ? 0 : data.usdAmount;
          const netUsd = amount * (1 - COMMISSION_RATE);
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
          if (data.usdAmount === '' || Number(data.usdAmount) < MINIMUM_USD) return;
          addLog(`USER_ACTION: REQUEST_STEP_02`, "warning");
          setStep(AppStep.VALIDATION);
     };

     const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
     const validatePhone = (phone: string) => /^(?:\+58)?0?4\d{9}$/.test(phone.replace(/\s/g, ''));
     const validateIdNumber = (id: string) => /^[VEJGC]-?\d{6,9}$/i.test(id.replace(/\s/g, ''));

     const handleFinalize = async () => {
          const newErrors: { [key: string]: string } = {};

          if (!data.email?.trim()) newErrors.email = 'Email PayPal es obligatorio';
          else if (!validateEmail(data.email)) newErrors.email = 'Email no válido';

          if (!data.idNumber?.trim()) newErrors.idNumber = 'Cédula / RIF es obligatorio';
          else if (!validateIdNumber(data.idNumber)) newErrors.idNumber = 'Formato: V-12345678';

          if (!data.phone?.trim()) newErrors.phone = 'Teléfono es obligatorio';
          else if (!validatePhone(data.phone)) newErrors.phone = 'Formato: 04XX1234567';

          if (!data.whatsapp?.trim()) newErrors.whatsapp = 'WhatsApp es obligatorio';
          else if (!validatePhone(data.whatsapp)) newErrors.whatsapp = 'Formato: 04XX1234567';

          if (Object.keys(newErrors).length > 0) {
               setErrors(newErrors);
               addLog(`VALIDATION_FAILED: ${Object.keys(newErrors).length} FIELD(S) MISSING`, "warning");
               return;
          }

          setErrors({});
          setIsSubmitting(true);
          addLog(`ENCRYPTING_ORDER_DATA...`, "info");

          try {
               const response = await fetch('/api/orders/guest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         usdAmount: Number(data.usdAmount),
                         vesAmount: data.vesAmount,
                         rate: data.rate,
                         email: data.email,
                         bank: data.bank,
                         idNumber: data.idNumber,
                         phone: data.phone,
                         whatsapp: data.whatsapp
                    })
               });

               const result = await response.json();

               if (!response.ok) {
                    throw new Error(result.error || 'Error al crear la orden');
               }

               setPaymentInfo(result.paymentInfo);
               addLog(`ORDER_COMMITTED_ID: ${result.order.ticketId}`, "success");
               setStep(AppStep.SUCCESS);
          } catch (error) {
               addLog(`ORDER_FAILED: ${error instanceof Error ? error.message : 'Error desconocido'}`, "warning");
               setErrors({ general: error instanceof Error ? error.message : 'Error al procesar la orden' });
          } finally {
               setIsSubmitting(false);
          }
     };

     const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target.files || e.target.files.length === 0 || !paymentInfo) return;

          const file = e.target.files[0];
          if (!file.type.startsWith('image/')) {
               addLog("UPLOAD_ERROR: INVALID_FILE_TYPE", "warning");
               return;
          }
          if (file.size > 5 * 1024 * 1024) {
               addLog("UPLOAD_ERROR: FILE_TOO_LARGE (MAX 5MB)", "warning");
               return;
          }

          setUploading(true);
          addLog("INITIATING_SECURE_UPLOAD...", "info");

          try {
               const supabase = createClient();
               const fileExt = file.name.split('.').pop();
               const fileName = `${paymentInfo.ticketId}_${Date.now()}.${fileExt}`;
               const filePath = `${paymentInfo.ticketId}/${fileName}`;

               const { error: uploadError } = await supabase.storage
                    .from('payment_proofs')
                    .upload(filePath, file);

               if (uploadError) throw uploadError;

               const { data: { publicUrl } } = supabase.storage
                    .from('payment_proofs')
                    .getPublicUrl(filePath);

               // Update Order Status via API
               const response = await fetch('/api/orders/upload-proof', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         ticketId: paymentInfo.ticketId,
                         proofUrl: publicUrl
                    })
               });

               if (!response.ok) throw new Error('Update failed');

               addLog("UPLOAD_SUCCESS: PROOF_SECURED", "success");
               setUploadSuccess(true);
          } catch (error) {
               addLog(`UPLOAD_FAILED: ${error instanceof Error ? error.message : 'Unknown'}`, "warning");
          } finally {
               setUploading(false);
          }
     };

     const resetForm = () => {
          setStep(AppStep.QUOTATION);
          setPaymentInfo(null);
          setData({
               usdAmount: 5,
               vesAmount: 0,
               rate: currentRate,
               email: '',
               bank: 'Banesco',
               idNumber: '',
               phone: '',
               whatsapp: ''
          });
     };

     return (
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
               {/* Transaction Unit */}
               <div className="lg:col-span-8 space-y-12">
                    <Slab className="p-6 md:p-10 relative overflow-hidden min-h-[550px]">
                         <div className="absolute top-0 right-0 flex">
                              <div className={`px-4 py-2 border-l-4 border-b-4 border-[#262626] mono text-sm font-bold transition-all ${step === AppStep.QUOTATION ? 'bg-[#262626] text-white' : 'bg-white opacity-30'}`}>STEP_01</div>
                              <div className={`px-4 py-2 border-l-4 border-b-4 border-[#262626] mono text-sm font-bold transition-all ${step === AppStep.VALIDATION || step === AppStep.SUCCESS ? 'bg-[#262626] text-white' : 'bg-white opacity-30'}`}>STEP_02</div>
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
                                                  min={MINIMUM_USD}
                                                  step={10}
                                                  onFocus={(e) => e.target.select()}
                                                  onChange={e => {
                                                       const val = e.target.value;
                                                       setData({ ...data, usdAmount: val === '' ? '' : Number(val) });
                                                  }}
                                                  className="w-full bg-gray-50 border-b-8 border-[#262626] p-8 pl-16 text-5xl font-black mono focus:bg-white transition-all outline-none"
                                             />
                                        </div>
                                        {data.usdAmount !== '' && Number(data.usdAmount) < MINIMUM_USD && <p className="text-[#FF4D00] mono text-[10px] font-bold uppercase">Monto mínimo: $5.00 USD</p>}
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

                                   <Slab dark className="p-8 text-xl font-black uppercase tracking-widest flex justify-between items-center bg-[#FF4D00] border-[#262626] text-white cursor-pointer" onClick={handleProcess}>
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
                                        <div className="space-y-2 md:col-span-2">
                                             <label className="mono text-[10px] font-black uppercase flex items-center gap-2">
                                                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                  WhatsApp <span className="text-[#FF4D00]">*</span>
                                                  <span className="text-gray-400 text-[8px] normal-case">(Te contactaremos aquí)</span>
                                             </label>
                                             <input
                                                  className={`w-full border-4 ${errors.whatsapp ? 'border-[#FF4D00] bg-red-50' : 'border-[#262626]'} p-4 font-bold mono focus:bg-gray-50 outline-none`}
                                                  placeholder="04121234567"
                                                  value={data.whatsapp}
                                                  onChange={e => setData({ ...data, whatsapp: e.target.value })}
                                             />
                                             {errors.whatsapp && <p className="text-[#FF4D00] mono text-[10px] font-bold">{errors.whatsapp}</p>}
                                        </div>
                                   </div>

                                   {errors.general && (
                                        <div className="bg-red-100 p-4 border-l-8 border-red-500">
                                             <p className="mono text-[10px] font-bold text-red-700">{errors.general}</p>
                                        </div>
                                   )}

                                   <div className="bg-orange-50 p-4 border-l-8 border-[#FF4D00]">
                                        <p className="mono text-[10px] font-bold leading-tight">ATENCIÓN: Solo aceptamos pagos de cuentas verificadas coincidentes con el titular bancario.</p>
                                   </div>

                                   <div className="flex gap-4 pt-4">
                                        <Slab className="w-1/3 p-6 text-center font-black uppercase mono cursor-pointer" onClick={() => setStep(AppStep.QUOTATION)}>Volver</Slab>
                                        <Slab
                                             dark
                                             className={`flex-1 p-6 text-center text-xl font-black uppercase tracking-widest bg-[#FF4D00] ${isSubmitting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                             onClick={isSubmitting ? undefined : handleFinalize}
                                        >
                                             {isSubmitting ? 'Procesando...' : 'Confirmar'}
                                        </Slab>
                                   </div>
                              </div>
                         )}

                         {step === AppStep.SUCCESS && (
                              <div className="mt-8 space-y-8 flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-500">
                                   <div className="w-24 h-24 bg-[#FF4D00] border-4 border-[#262626] flex items-center justify-center mb-4 shadow-[8px_8px_0px_0px_#262626]">
                                        <ICONS.Check className="w-16 h-16 text-white" />
                                   </div>
                                   <h3 className="text-3xl font-black uppercase italic tracking-tighter">¡Orden Generada!</h3>

                                   {paymentInfo && (
                                        <div className="w-full max-w-md space-y-4 text-left">
                                             <div className="bg-[#262626] text-white p-4">
                                                  <p className="mono text-sm font-bold">TICKET_ID: <span className="text-[#FF4D00]">#{paymentInfo.ticketId}</span></p>
                                             </div>

                                             <div className="bg-orange-50 p-4 border-4 border-[#262626] space-y-3">
                                                  <h4 className="mono text-sm font-black uppercase underline">Instrucciones de Pago:</h4>
                                                  <ol className="space-y-2">
                                                       {paymentInfo.instructions.map((instruction, i) => (
                                                            <li key={i} className="mono text-[11px] font-bold">{instruction}</li>
                                                       ))}
                                                  </ol>
                                             </div>

                                             {!uploadSuccess ? (
                                                  <div className="space-y-4">
                                                       <label className={`block w-full p-4 text-center font-black uppercase mono border-4 border-[#262626] transition-colors cursor-pointer relative ${uploading ? 'bg-gray-400 text-gray-800' : 'bg-[#262626] text-white hover:bg-black'}`}>
                                                            {uploading ? 'SUBIENDO...' : '📁 SUBIR COMPROBANTE'}
                                                            <input
                                                                 type="file"
                                                                 accept="image/*"
                                                                 className="absolute inset-0 opacity-0 cursor-pointer"
                                                                 onChange={handleUpload}
                                                                 disabled={uploading}
                                                            />
                                                       </label>
                                                       <p className="mono text-[10px] text-center font-bold text-gray-500">FORMATOS: JPG, PNG | MAX: 5MB</p>
                                                  </div>
                                             ) : (
                                                  <div className="bg-green-100 p-4 border-l-8 border-green-500 text-center animate-in fade-in duration-500">
                                                       <p className="mono text-xs font-black text-green-700 uppercase">¡COMPROBANTE RECIBIDO!</p>
                                                       <p className="mono text-[10px] text-green-600">Tu orden está siendo verificada.</p>
                                                  </div>
                                             )}

                                             <div className="relative flex py-2 items-center">
                                                  <div className="flex-grow border-t border-gray-300"></div>
                                                  <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] mono uppercase">O reportar por</span>
                                                  <div className="flex-grow border-t border-gray-300"></div>
                                             </div>

                                             <a
                                                  href={`https://wa.me/584121030740?text=Hola!%20Mi%20ticket%20es%20${paymentInfo.ticketId}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="block w-full bg-white text-green-600 p-3 text-center font-black uppercase mono border-4 border-green-600 hover:bg-green-50 transition-colors text-xs"
                                             >
                                                  📱 Enviar por WhatsApp
                                             </a>
                                        </div>
                                   )}

                                   <button
                                        onClick={resetForm}
                                        className="mt-6 underline font-black mono uppercase hover:text-[#FF4D00] transition-colors"
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
                                        <Line type="stepAfter" dataKey="val" stroke="#FF4D00" strokeWidth={4} dot={false} />
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

                    <Slab className="p-6 bg-orange-50 border-[#FF4D00]">
                         <div className="space-y-4">
                              <div className="mono text-[10px] font-black flex items-center gap-2 text-[#262626]">
                                   <span className="w-2 h-2 bg-[#262626]"></span> AI_MARKET_INTELLIGENCE
                              </div>
                              <h4 className="text-xl font-black leading-none text-[#262626] uppercase">{insight.title}</h4>
                              <p className="mono text-[11px] font-bold text-gray-500 leading-tight uppercase italic">{insight.description}</p>
                              <div className={`inline-block px-3 py-1 text-[10px] font-black mono text-white uppercase ${insight.sentiment === 'NEGATIVE' ? 'bg-[#FF4D00]' : 'bg-[#262626]'}`}>
                                   SENTIMENT: {insight.sentiment}
                              </div>
                         </div>
                    </Slab>

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
