"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Slab } from '@/components/ui/brutalist-system';
import { PayPalServiceButton } from '@/components/features/paypal-service-button';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { VENEZUELAN_BANKS } from '@/constants/banks';
import { calculateOrderMetrics } from '@/lib/rate-calculator';
import { uploadPaymentProof, updateOrderWithProof } from '@/lib/utils/order-utils';

interface NewOrderFormProps {
     currentRate: number;
     paraleloRate: number;
     onComplete: () => void;
}

interface FormErrors {
     email?: string;
     phone?: string;
     id?: string;
     whatsapp?: string;
     accountNumber?: string;
     accountHolder?: string;
}

interface PaymentInfo {
     ticketId: string;
     paypalDestination: string;
     instructions: string[];
}

export function NewOrderForm({ currentRate, paraleloRate, onComplete }: NewOrderFormProps) {
     const router = useRouter();
     const supabase = useMemo(() => createClient(), []);

     // Form state
     const [step, setStep] = useState(1);
     const [amount, setAmount] = useState('5');
     const [emailPaypal, setEmailPaypal] = useState('');
     const [bank, setBank] = useState('Banesco');
     const [phone, setPhone] = useState('');
     const [phoneCountryCode, setPhoneCountryCode] = useState('+58');
     const [idNumber, setIdNumber] = useState('');
     const [idPrefix, setIdPrefix] = useState('V');
     const [whatsapp, setWhatsapp] = useState('');
     const [whatsappCountryCode, setWhatsappCountryCode] = useState('+58');
     const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'transferencia'>('pago_movil');
     const [accountNumber, setAccountNumber] = useState('');
     const [accountHolder, setAccountHolder] = useState('');

     // Locked Fields State
     const [isIdLocked, setIsIdLocked] = useState(false);
     const [isPhoneLocked, setIsPhoneLocked] = useState(false);
     const [isAccountLocked, setIsAccountLocked] = useState(false);

     // UI state
     const [loading, setLoading] = useState(false);
     const [errors, setErrors] = useState<FormErrors>({});
     const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
     const [uploading, setUploading] = useState(false);
     const [uploadSuccess, setUploadSuccess] = useState(false);
     const [errorMessage, setErrorMessage] = useState<string | null>(null);
     const [errorField, setErrorField] = useState<string | null>(null);

     // Cálculos memoizados
     const amountNum = useMemo(() => parseFloat(amount) || 0, [amount]);
     const { vesAmount, effectiveRate: shownRate } = useMemo(
          () => calculateOrderMetrics(amountNum, paraleloRate || currentRate),
          [amountNum, paraleloRate, currentRate]
     );

     // Cargar datos bancarios guardados del usuario
     useEffect(() => {
          const loadUserPaymentData = async () => {
               const { data: { user } } = await supabase.auth.getUser();
               if (!user) return;

               const { data: paymentData } = await supabase
                    .from('user_payment_data')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

               if (paymentData) {
                    if (paymentData.bank_name) setBank(paymentData.bank_name);

                    if (paymentData.id_number) {
                         // Parse V-12345678
                         const match = paymentData.id_number.match(/^([VEJP])-?(.+)$/i);
                         if (match) {
                              setIdPrefix(match[1].toUpperCase());
                              setIdNumber(match[2]);
                         } else {
                              setIdNumber(paymentData.id_number);
                         }
                         setIsIdLocked(true);
                    }

                    if (paymentData.pago_movil_phone) {
                         const match = paymentData.pago_movil_phone.match(/^(\+\d+)\s*(.+)$/);
                         if (match) {
                              setPhoneCountryCode(match[1]);
                              setPhone(match[2]);
                         } else {
                              setPhone(paymentData.pago_movil_phone.replace('+58', '').trim());
                         }
                         setIsPhoneLocked(true);
                    }

                    if (paymentData.account_number) {
                         setAccountNumber(paymentData.account_number);
                         setAccountHolder(paymentData.account_holder || '');
                         setIsAccountLocked(true);
                    }
               }
          };

          loadUserPaymentData();
     }, [supabase]);

     // Validación memoizada
     const validateStep2 = useCallback(() => {
          const newErrors: FormErrors = {};

          if (!emailPaypal.trim() || !emailPaypal.includes('@')) {
               newErrors.email = 'Email PayPal es obligatorio';
          }

          // Validar cédula: 6-8 dígitos (acepta con o sin puntos)
          const cleanId = idNumber.replace(/[.\s]/g, '').trim();
          if (!cleanId || cleanId.length < 6 || cleanId.length > 8 || !/^\d+$/.test(cleanId)) {
               newErrors.id = 'Cédula: 6-8 dígitos';
          }

          // Validar WhatsApp: acepta números de 10+ dígitos
          const cleanWhatsapp = whatsapp.replace(/[\s\-]/g, '').replace(/^0+/, '');
          if (!cleanWhatsapp || cleanWhatsapp.length < 10 || !/^\d+$/.test(cleanWhatsapp)) {
               newErrors.whatsapp = 'WhatsApp inválido (mín. 10 dígitos)';
          }

          if (paymentMethod === 'pago_movil') {
               const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^0+/, '');
               if (!cleanPhone || cleanPhone.length < 10 || !/^\d+$/.test(cleanPhone)) {
                    newErrors.phone = 'Teléfono inválido (mín. 10 dígitos)';
               }
          } else {
               const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^0+/, '');
               if (!cleanPhone || cleanPhone.length < 10 || !/^\d+$/.test(cleanPhone)) {
                    newErrors.phone = 'Teléfono inválido (mín. 10 dígitos)';
               }
               if (!accountNumber.trim() || accountNumber.length < 20) {
                    newErrors.accountNumber = 'Número de cuenta inválido (min 20 dígitos)';
               }
               if (!accountHolder.trim() || accountHolder.length < 3) {
                    newErrors.accountHolder = 'Nombre del titular es obligatorio';
               }
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     }, [emailPaypal, idNumber, whatsapp, paymentMethod, phone, accountNumber, accountHolder]);

     const handleSubmit = useCallback(async () => {
          if (!validateStep2()) return;

          setLoading(true);

          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
               alert('Error: Usuario no autenticado');
               setLoading(false);
               return;
          }

          // Build complete values for API
          const cleanIdNumber = `${idPrefix}-${idNumber.replace(/\./g, '').trim()}`;
          const cleanPhone = `${phoneCountryCode} ${phone.replace(/^0/, '').trim()}`;
          const cleanWhatsapp = `${whatsappCountryCode} ${whatsapp.replace(/^0/, '').trim()}`;

          try {
               const response = await fetch('/api/orders/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         amount: amount,
                         emailPaypal: emailPaypal,
                         bank: bank,
                         idNumber: cleanIdNumber,
                         phone: cleanPhone,
                         whatsapp: cleanWhatsapp,
                         paymentMethod: paymentMethod,
                         accountNumber: accountNumber,
                         accountHolder: accountHolder
                    })
               });

               const data = await response.json();

               if (!response.ok) {
                    // Limpiar errores previos
                    setErrorMessage(null);
                    setErrorField(null);

                    // Extraer información del error
                    const errorMsg = data.error || 'Error al procesar la orden';
                    const errorCode = data.code;
                    const fieldName = data.field;

                    // Configurar mensaje de error visible
                    setErrorMessage(errorMsg);
                    if (fieldName) {
                         setErrorField(fieldName);
                    }

                    // También mostrar alert para asegurar que el usuario lo vea
                    if (errorCode === 'DUPLICATE_DATA') {
                         alert(`⚠️ DATOS DUPLICADOS\n\n${errorMsg}\n\nEste dato ya está registrado por otro usuario. Por favor verifica tu información.`);
                    } else if (errorCode === 'DATA_MISMATCH') {
                         alert(`⚠️ DATOS INCONSISTENTES\n\n${errorMsg}\n\nLos datos que ingresaste no coinciden con tu perfil registrado.`);
                    } else if (errorCode === 'INVALID_FORMAT') {
                         alert(`❌ FORMATO INVÁLIDO\n\n${errorMsg}\n\nVerifica el formato de tus datos (email, teléfono, cuenta bancaria).`);
                    } else {
                         alert(`❌ ERROR\n\n${errorMsg}`);
                    }

                    setLoading(false);
                    return;
               }

               // Success
               setPaymentInfo({
                    ticketId: data.ticketId,
                    paypalDestination: 'pagos@pp360ve.com',
                    instructions: data.instructions
               });
               setStep(3);
          } catch (error) {
               console.error('Error de conexión:', error);
               setErrorMessage('Error de conexión. Verifica tu internet e intenta nuevamente.');
               alert('❌ ERROR DE CONEXIÓN\n\nNo se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.');
          } finally {
               setLoading(false);
          }
     }, [validateStep2, amount, emailPaypal, bank, phone, idNumber, whatsapp, paymentMethod, accountNumber, accountHolder, idPrefix, phoneCountryCode, whatsappCountryCode, supabase]);

     const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target.files || e.target.files.length === 0 || !paymentInfo) return;

          const file = e.target.files[0];
          setUploading(true);

          const fileExt = file.name.split('.').pop();
          const fileName = `${paymentInfo.ticketId}_${Date.now()}.${fileExt}`;
          const filePath = `${paymentInfo.ticketId}/${fileName}`;

          const uploadResult = await uploadPaymentProof(file, filePath);

          if (!uploadResult.success || !uploadResult.publicUrl) {
               alert(`Error al subir: ${uploadResult.error}`);
               setUploading(false);
               return;
          }

          const updateResult = await updateOrderWithProof(null, paymentInfo.ticketId, uploadResult.publicUrl);

          if (!updateResult.success) {
               alert(`Error al actualizar orden: ${updateResult.error}`);
          } else {
               setUploadSuccess(true);
          }

          setUploading(false);
     }, [paymentInfo]);

     const clearError = useCallback((field: keyof FormErrors) => {
          setErrors(prev => ({ ...prev, [field]: undefined }));
     }, []);

     return (
          <Slab className="p-8">
               {/* Step Indicators */}
               <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                         <div
                              key={s}
                              className={`flex-1 h-2 ${step >= s ? 'bg-[#FF4D00]' : 'bg-gray-200'}`}
                         />
                    ))}
               </div>

               {step === 1 && (
                    <div className="space-y-6">
                         <h3 className="mono text-xl font-black uppercase">Paso 1: Monto</h3>

                         <div className="space-y-2">
                              <label className="mono text-[10px] font-black uppercase">Cantidad USD (PayPal)</label>
                              <input
                                   type="number"
                                   value={amount}
                                   onChange={(e) => setAmount(e.target.value)}
                                   className="w-full border-4 border-[#262626] p-4 text-2xl font-black mono outline-none"
                                   min={5}
                                   placeholder="Ingresa el monto"
                              />
                              {amountNum < 5 && (
                                   <p className="mono text-[10px] font-black text-[#FF4D00] uppercase mt-1">
                                        (monto minimo 5$)
                                   </p>
                              )}
                         </div>

                         <div className="bg-[#262626] text-white p-4">
                              <div className="flex justify-between items-center mono text-sm font-bold">
                                   <span>Recibes:</span>
                                   <span className="text-2xl font-black text-white">
                                        {vesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
                                   </span>
                              </div>
                              <div className="flex justify-between mono text-[11px] text-gray-100 mt-2">
                                   <span>Tasa: {shownRate.toFixed(2)} VES/USD</span>
                                   <span>Comisión: INCLUIDA</span>
                              </div>
                         </div>

                         {/* Selector de Método de Pago */}
                         <div className="space-y-3">
                              <label className="mono text-[10px] font-black uppercase block">¿Cómo quieres recibir tu pago?</label>
                              <div className="grid grid-cols-2 gap-3">
                                   <button
                                        type="button"
                                        onClick={() => setPaymentMethod('pago_movil')}
                                        className={`border-4 border-[#262626] p-4 font-black uppercase mono text-xs transition-all shadow-[4px_4px_0px_0px_#262626] ${paymentMethod === 'pago_movil'
                                             ? 'bg-[#FF4D00] text-white hover:bg-[#e04400]'
                                             : 'bg-white text-[#262626] hover:bg-[#FF4D00] hover:text-white'
                                             }`}
                                   >
                                        📱 Pago Móvil
                                   </button>
                                   <button
                                        type="button"
                                        onClick={() => setPaymentMethod('transferencia')}
                                        className={`border-4 border-[#262626] p-4 font-black uppercase mono text-xs transition-all shadow-[4px_4px_0px_0px_#262626] ${paymentMethod === 'transferencia'
                                             ? 'bg-[#FF4D00] text-white hover:bg-[#e04400]'
                                             : 'bg-[#262626] text-white hover:bg-[#FF4D00]'
                                             }`}
                                   >
                                        🏦 Transferencia
                                   </button>
                              </div>
                              <p className="mono text-[10px] text-gray-500 italic">
                                   {paymentMethod === 'pago_movil'
                                        ? 'Recibirás en tu teléfono asociado al banco'
                                        : 'Recibirás en tu cuenta bancaria (requiere más datos)'}
                              </p>
                         </div>

                         <Slab
                              dark
                              className="p-4 text-center font-black uppercase cursor-pointer bg-[#262626] text-white hover:bg-[#FF4D00] transition-colors"
                              onClick={() => {
                                   if (amountNum >= 5) {
                                        setStep(2);
                                   } else {
                                        alert('El monto mínimo es de 5 USD');
                                   }
                              }}
                         >
                              CONTINUAR
                         </Slab>
                    </div>
               )}

               {step === 2 && (
                    <div className="space-y-6">
                         <div className="flex justify-between items-center">
                              <h3 className="mono text-xl font-black uppercase underline decoration-4">Datos de Destino</h3>
                              <div className="flex gap-2">
                                   <span className="mono text-[10px] font-bold text-gray-400">STEP_01</span>
                                   <span className="mono text-[10px] font-black bg-[#262626] text-white px-2">STEP_02</span>
                              </div>
                         </div>

                         {/* Banner de Error Visible */}
                         {errorMessage && (
                              <div className="bg-red-50 border-l-4 border-red-500 p-4 space-y-2 animate-pulse">
                                   <div className="flex items-center gap-2">
                                        <span className="text-2xl">⚠️</span>
                                        <p className="mono text-sm font-black text-red-800 uppercase">
                                             {errorField ? `${errorField} ya registrado` : 'Error de Validación'}
                                        </p>
                                   </div>
                                   <p className="mono text-xs text-red-700 font-bold">
                                        {errorMessage}
                                   </p>
                                   <button
                                        onClick={() => {
                                             setErrorMessage(null);
                                             setErrorField(null);
                                        }}
                                        className="mono text-[10px] text-red-600 hover:text-red-800 underline font-bold"
                                   >
                                        Cerrar mensaje
                                   </button>
                              </div>
                         )}

                         <div className="grid md:grid-cols-2 gap-4">
                              {/* Email PayPal */}
                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase">
                                        Email PayPal <span className="text-red-500">*</span>
                                   </label>
                                   <input
                                        type="email"
                                        value={emailPaypal}
                                        onChange={(e) => { setEmailPaypal(e.target.value); clearError('email'); }}
                                        className={`w-full border-4 p-4 font-bold mono outline-none ${errors.email ? 'border-red-500 bg-red-50' : 'border-[#262626]'}`}
                                        placeholder="usuario@email.com"
                                        required
                                   />
                                   {errors.email && <p className="mono text-[10px] text-red-500 font-bold">{errors.email}</p>}
                              </div>

                              {/* Banco */}
                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase">Banco</label>
                                   <select
                                        value={bank}
                                        onChange={(e) => setBank(e.target.value)}
                                        className="w-full border-4 border-[#262626] p-4 font-bold mono outline-none"
                                   >
                                        {VENEZUELAN_BANKS.map(b => <option key={b}>{b}</option>)}
                                   </select>
                              </div>

                              {/* Cédula/RIF */}
                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase flex justify-between">
                                        <span>Cédula / RIF <span className="text-red-500">*</span></span>
                                   </label>
                                   <div className="flex gap-2 relative">
                                        <select
                                             value={idPrefix}
                                             onChange={(e) => setIdPrefix(e.target.value)}
                                             disabled={isIdLocked}
                                             className={`border-4 border-[#262626] p-4 font-bold mono outline-none ${isIdLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#262626] text-white'}`}
                                        >
                                             <option>V</option>
                                             <option>E</option>
                                             <option>J</option>
                                             <option>P</option>
                                        </select>
                                        <div className="relative flex-1">
                                             <input
                                                  type="text"
                                                  value={idNumber}
                                                  onChange={(e) => { setIdNumber(e.target.value); clearError('id'); }}
                                                  disabled={isIdLocked}
                                                  className={`w-full border-4 p-4 font-bold mono outline-none ${errors.id ? 'border-red-500 bg-red-50' : 'border-[#262626]'} ${isIdLocked ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
                                                  placeholder="12.345.678"
                                                  maxLength={10}
                                                  required
                                             />
                                             {isIdLocked && (
                                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                       </svg>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                                   {errors.id && <p className="mono text-[10px] text-red-500 font-bold">{errors.id}</p>}
                              </div>

                              {/* Campos condicionales según método de pago */}
                              {paymentMethod === 'pago_movil' ? (
                                   <div className="space-y-2">
                                        <label className="mono text-[10px] font-black uppercase flex justify-between">
                                             <span>📱 Teléfono Pago Móvil <span className="text-red-500">*</span></span>
                                        </label>
                                        <div className="flex gap-2">
                                             <input
                                                  type="text"
                                                  value={phoneCountryCode}
                                                  onChange={(e) => setPhoneCountryCode(e.target.value)}
                                                  disabled={isPhoneLocked}
                                                  className={`w-20 border-4 border-[#262626] p-4 font-bold mono outline-none text-center ${isPhoneLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#262626] text-white'}`}
                                                  placeholder="+58"
                                             />
                                             <div className="relative flex-1">
                                                  <input
                                                       type="text"
                                                       value={phone}
                                                       onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                                                       disabled={isPhoneLocked}
                                                       className={`w-full border-4 p-4 font-bold mono outline-none ${errors.phone ? 'border-red-500 bg-red-50' : 'border-[#262626]'} ${isPhoneLocked ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
                                                       placeholder="4121234567"
                                                       required
                                                  />
                                                  {isPhoneLocked && (
                                                       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                        {errors.phone && <p className="mono text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                                   </div>
                              ) : (
                                   <>
                                        <div className="space-y-2">
                                             <label className="mono text-[10px] font-black uppercase flex justify-between">
                                                  <span>🏦 Número de Cuenta <span className="text-red-500">*</span></span>
                                             </label>
                                             <div className="relative">
                                                  <input
                                                       type="text"
                                                       value={accountNumber}
                                                       onChange={(e) => { setAccountNumber(e.target.value); clearError('accountNumber'); }}
                                                       disabled={isAccountLocked}
                                                       className={`w-full border-4 p-4 font-bold mono outline-none ${errors.accountNumber ? 'border-red-500 bg-red-50' : 'border-[#262626]'} ${isAccountLocked ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
                                                       placeholder="01340123456789012345"
                                                       required
                                                  />
                                                  {isAccountLocked && (
                                                       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                       </div>
                                                  )}
                                             </div>
                                             {errors.accountNumber && <p className="mono text-[10px] text-red-500 font-bold">{errors.accountNumber}</p>}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                             <label className="mono text-[10px] font-black uppercase flex justify-between">
                                                  <span>👤 Titular de la Cuenta <span className="text-red-500">*</span></span>
                                             </label>
                                             <div className="relative">
                                                  <input
                                                       type="text"
                                                       value={accountHolder}
                                                       onChange={(e) => { setAccountHolder(e.target.value); clearError('accountHolder'); }}
                                                       disabled={isAccountLocked}
                                                       className={`w-full border-4 p-4 font-bold mono outline-none ${errors.accountHolder ? 'border-red-500 bg-red-50' : 'border-[#262626]'} ${isAccountLocked ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
                                                       placeholder="Nombre como aparece en el banco"
                                                       required
                                                  />
                                                  {isAccountLocked && (
                                                       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                       </div>
                                                  )}
                                             </div>
                                             {errors.accountHolder && <p className="mono text-[10px] text-red-500 font-bold">{errors.accountHolder}</p>}
                                        </div>
                                        <div className="space-y-2">
                                             <label className="mono text-[10px] font-black uppercase">
                                                  📱 Teléfono Asociado <span className="text-red-500">*</span>
                                             </label>
                                             <div className="flex gap-2">
                                                  <input
                                                       type="text"
                                                       value={phoneCountryCode}
                                                       onChange={(e) => setPhoneCountryCode(e.target.value)}
                                                       className="w-20 border-4 border-[#262626] p-4 font-bold mono outline-none bg-[#262626] text-white text-center"
                                                       placeholder="+58"
                                                  />
                                                  <input
                                                       type="text"
                                                       value={phone}
                                                       onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                                                       className={`flex-1 border-4 p-4 font-bold mono outline-none ${errors.phone ? 'border-red-500 bg-red-50' : 'border-[#262626]'}`}
                                                       placeholder="4121234567"
                                                       required
                                                  />
                                             </div>
                                             {errors.phone && <p className="mono text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                                        </div>
                                   </>
                              )}

                              {/* WhatsApp */}
                              <div className={`space-y-2 ${paymentMethod === 'transferencia' ? '' : 'md:col-span-2'}`}>
                                   <label className="mono text-[10px] font-black uppercase flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                             <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        WhatsApp <span className="text-red-500">*</span>
                                        <span className="text-gray-400 font-normal">(Te contactaremos aquí)</span>
                                   </label>
                                   <div className="flex gap-2">
                                        <input
                                             type="text"
                                             value={whatsappCountryCode}
                                             onChange={(e) => setWhatsappCountryCode(e.target.value)}
                                             className="w-20 border-4 border-[#262626] p-4 font-bold mono outline-none bg-[#262626] text-white text-center"
                                             placeholder="+58"
                                        />
                                        <input
                                             type="text"
                                             value={whatsapp}
                                             onChange={(e) => { setWhatsapp(e.target.value); clearError('whatsapp'); }}
                                             className={`flex-1 border-4 p-4 font-bold mono outline-none ${errors.whatsapp ? 'border-red-500 bg-red-50' : 'border-[#262626]'}`}
                                             placeholder="4121234567"
                                             required
                                        />
                                   </div>
                                   {errors.whatsapp && <p className="mono text-[10px] text-red-500 font-bold">{errors.whatsapp}</p>}
                              </div>
                         </div>

                         {/* Warning */}
                         <div className="bg-orange-50 border-l-4 border-[#FF4D00] p-4">
                              <p className="mono text-[10px] font-bold text-gray-600">
                                   ATENCIÓN: Solo aceptamos pagos de cuentas verificadas coincidentes con el titular bancario.
                              </p>
                         </div>

                         <div className="flex gap-4">
                              <Slab
                                   className="flex-1 p-4 text-center font-black uppercase cursor-pointer"
                                   onClick={() => setStep(1)}
                              >
                                   VOLVER
                              </Slab>
                              <Slab
                                   dark
                                   className="flex-1 p-4 text-center font-black uppercase bg-[#FF4D00] cursor-pointer"
                                   onClick={handleSubmit}
                              >
                                   {loading ? 'PROCESANDO...' : 'CONFIRMAR'}
                              </Slab>
                         </div>
                    </div>
               )}

               {step === 3 && paymentInfo && (
                    <div className="space-y-6 flex flex-col items-center justify-center py-6 text-center">
                         <div className="w-20 h-20 bg-[#FF4D00] border-4 border-[#262626] flex items-center justify-center shadow-[6px_6px_0px_0px_#262626]">
                              <span className="text-4xl text-white">✓</span>
                         </div>
                         <h3 className="text-2xl font-black uppercase italic">¡Orden Generada!</h3>

                         <div className="w-full space-y-4 text-left">
                              <div className="bg-[#262626] text-white p-6">
                                   <p className="mono text-sm font-bold">TICKET_ID: <span className="text-[#FF4D00]">#{paymentInfo.ticketId}</span></p>
                              </div>

                              <div className="bg-orange-50 border-l-4 border-[#FF4D00] p-6 text-left space-y-4">
                                   <h4 className="mono text-sm font-black uppercase underline decoration-[#FF4D00]">INSTRUCCIONES DE PAGO:</h4>
                                   <ol className="space-y-2">
                                        {paymentInfo.instructions.map((instruction, index) => (
                                             <li key={index} className="mono text-xs font-bold text-gray-800">
                                                  {instruction}
                                             </li>
                                        ))}
                                   </ol>
                              </div>

                              <div className="flex flex-col md:flex-row gap-0 border-4 border-[#262626]">
                                   {/* Left Side: Button */}
                                   <div className="flex-1 bg-orange-50 p-6 space-y-4 border-b-4 md:border-b-0 md:border-r-4 border-[#262626] flex flex-col justify-center items-center">
                                        <div className="text-center">
                                             <h4 className="mono text-sm font-black uppercase underline">Realizar Pago:</h4>
                                             <p className="mono text-[11px] font-bold mt-1">Clic para pagar con PayPal (Auto-Verificación):</p>
                                        </div>

                                        <div className="w-full">
                                             <PayPalServiceButton
                                                  amount={amount}
                                                  description={`Order #${paymentInfo.ticketId} - Exchange ${amount} USD`}
                                                  ticketId={paymentInfo.ticketId}
                                                  style={{ color: 'black' }}
                                                  onSuccess={async () => {
                                                       setUploadSuccess(true);
                                                       router.refresh();
                                                  }}
                                             />
                                        </div>
                                   </div>

                                   {/* Right Side: QR Box */}
                                   <div className="w-full md:w-48 bg-white p-4 flex flex-col items-center justify-center text-center md:border-l-4 border-[#262626]">
                                        <div className="mb-2">
                                             <QRCodeSVG
                                                  value={`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=sb-43h8a33591630@business.example.com&currency_code=USD&amount=${amount}&item_name=Order${paymentInfo.ticketId}`}
                                                  size={140}
                                                  level={'H'}
                                             />
                                        </div>
                                        <p className="mono text-[10px] font-black text-[#262626] leading-tight uppercase">
                                             SCAN TO PAY<br />(APP)
                                        </p>
                                   </div>
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
                                        <p className="mono text-[10px] text-center font-bold text-gray-500">FORMATOS: JPG, PNG | MAX: 2MB</p>
                                   </div>
                              ) : (
                                   <div className="bg-green-100 p-4 border-l-8 border-green-500 text-center">
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
                                   href={`https://api.whatsapp.com/send/?phone=15557745095&text=Hola!%20Mi%20ticket%20es%20${paymentInfo.ticketId}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="block w-full bg-white text-green-600 p-3 text-center font-black uppercase mono border-4 border-green-600 hover:bg-green-50 transition-colors text-xs"
                              >
                                   📱 Enviar por WhatsApp
                              </a>
                         </div>

                         <button
                              onClick={onComplete}
                              className="mt-4 underline font-black mono uppercase hover:text-[#FF4D00] transition-colors"
                         >
                              Nueva Operación
                         </button>
                    </div>
               )}
          </Slab>
     );
}
