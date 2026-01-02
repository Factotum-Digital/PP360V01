"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VENEZUELAN_BANKS } from '@/constants/banks';

interface ProfileModalProps {
     userId: string;
     onClose: () => void;
}

const COUNTRY_CODES = [
     { code: '+58', country: '🇻🇪 Venezuela' },
     { code: '+1', country: '🇺🇸 USA/Canada' },
     { code: '+34', country: '🇪🇸 España' },
     { code: '+57', country: '🇨🇴 Colombia' },
     { code: '+52', country: '🇲🇽 México' },
     { code: '+54', country: '🇦🇷 Argentina' },
     { code: '+56', country: '🇨🇱 Chile' },
     { code: '+51', country: '🇵🇪 Perú' },
     { code: '+593', country: '🇪🇨 Ecuador' },
     { code: '+55', country: '🇧🇷 Brasil' },
];

export function ProfileModal({ userId, onClose }: ProfileModalProps) {
     const supabase = useMemo(() => createClient(), []);

     const [loading, setLoading] = useState(true);
     const [saving, setSaving] = useState(false);
     const [activeSection, setActiveSection] = useState<'identity' | 'payment' | 'paypal'>('identity');

     // Identity Fields
     const [fullName, setFullName] = useState('');
     const [email, setEmail] = useState('');
     const [countryCode, setCountryCode] = useState('+58');
     const [whatsappPrimary, setWhatsappPrimary] = useState('');
     const [whatsappSecondary, setWhatsappSecondary] = useState('');
     const [whatsappSecondaryCode, setWhatsappSecondaryCode] = useState('+58');
     const [idNumber, setIdNumber] = useState('');
     const [idPrefix, setIdPrefix] = useState('V');

     // Payment Fields
     const [bank, setBank] = useState('Banesco');
     const [accountType, setAccountType] = useState<'CORRIENTE' | 'AHORRO'>('CORRIENTE');
     const [accountNumber, setAccountNumber] = useState('');
     const [accountHolder, setAccountHolder] = useState('');
     const [enableTransfer, setEnableTransfer] = useState(true);

     // Pago Móvil Fields  
     const [pagoMovilBank, setPagoMovilBank] = useState('Banesco');
     const [pagoMovilPhone, setPagoMovilPhone] = useState('');
     const [pagoMovilCedula, setPagoMovilCedula] = useState('');
     const [pagoMovilCedulaPrefix, setPagoMovilCedulaPrefix] = useState('V');

     // PayPal Fields
     const [paypalEmail, setPaypalEmail] = useState('');
     const [paypalStatus, setPaypalStatus] = useState<'verified' | 'pending' | 'unverified'>('unverified');

     // Lock States
     const [isNameLocked, setIsNameLocked] = useState(false);
     const [isIdLocked, setIsIdLocked] = useState(false);
     const [isPhoneLocked, setIsPhoneLocked] = useState(false);
     const [isBankLocked, setIsBankLocked] = useState(false);
     const [isPagoMovilPhoneLocked, setIsPagoMovilPhoneLocked] = useState(false);
     const [isPagoMovilCedulaLocked, setIsPagoMovilCedulaLocked] = useState(false);

     // Memoized completion calculation
     const completion = useMemo(() => {
          let completed = 0;
          // [FIX] Incluimos accountNumber y accountHolder para que el 100% sea real
          const fields = [fullName, idNumber, whatsappPrimary, bank, accountNumber, accountHolder, paypalEmail];
          fields.forEach(f => { if (f && f.trim()) completed++; });
          return Math.round((completed / fields.length) * 100);
     }, [fullName, idNumber, whatsappPrimary, bank, accountNumber, accountHolder, paypalEmail]);

     useEffect(() => {
          const loadData = async () => {
               const { data } = await supabase
                    .from('user_payment_data')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

               // [SECURITY FIX] Siempre obtener el email real de la cuenta de autenticación
               // Esto previene que el usuario intente usar otro email y cause conflictos
               const { data: { user } } = await supabase.auth.getUser();
               if (user?.email) {
                    setEmail(user.email);
               }

               if (data) {
                    if (data.full_name) {
                         setFullName(data.full_name);
                         setIsNameLocked(true);
                    }
                    if (data.email) setEmail(data.email);
                    if (data.country_code) setCountryCode(data.country_code);
                    if (data.whatsapp_primary) {
                         setWhatsappPrimary(data.whatsapp_primary);
                         setIsPhoneLocked(true);
                    }
                    if (data.whatsapp_secondary) setWhatsappSecondary(data.whatsapp_secondary);

                    // Parsear cédula con formato V-12345678
                    if (data.id_number) {
                         const match = data.id_number.match(/^([VEJP])-?(.+)$/i);
                         if (match) {
                              setIdPrefix(match[1].toUpperCase());
                              setIdNumber(match[2]);
                         } else {
                              setIdNumber(data.id_number);
                         }
                         setIsIdLocked(true);
                    }

                    if (data.bank_name) setBank(data.bank_name);
                    if (data.account_type) setAccountType(data.account_type);
                    if (data.account_number) {
                         setAccountNumber(data.account_number);
                         setIsBankLocked(true);
                    }
                    if (data.account_holder) setAccountHolder(data.account_holder);
                    if (data.enable_transfer !== undefined) setEnableTransfer(data.enable_transfer);

                    if (data.pago_movil_bank) setPagoMovilBank(data.pago_movil_bank);

                    // Teléfono Pago Móvil - bloquear solo si tiene valor
                    if (data.pago_movil_phone) {
                         setPagoMovilPhone(data.pago_movil_phone);
                         setIsPagoMovilPhoneLocked(true);
                    }

                    // Cédula Asociada Pago Móvil - bloquear solo si tiene valor
                    if (data.pago_movil_cedula) {
                         const match = data.pago_movil_cedula.match(/^([VEJP])-?(.+)$/i);
                         if (match) {
                              setPagoMovilCedulaPrefix(match[1].toUpperCase() as 'V' | 'E' | 'J' | 'P');
                              setPagoMovilCedula(match[2]);
                         } else {
                              setPagoMovilCedula(data.pago_movil_cedula);
                         }
                         setIsPagoMovilCedulaLocked(true);
                    }
                    if (data.paypal_email) setPaypalEmail(data.paypal_email);
                    if (data.paypal_status) setPaypalStatus(data.paypal_status);
               }

               // [AUTO-LINK] Vincular órdenes de guest al usuario registrado por ID
               // Esto permite que si alguien compró como guest antes de registrarse,
               // sus órdenes se vinculen automáticamente a su cuenta
               if (data?.id_number) {
                    try {
                         // Normalizar el ID para comparación (quitar espacios, puntos, todo mayúsculas)
                         const normalizedId = data.id_number.replace(/[.\s]/g, '').toUpperCase();

                         // Buscar órdenes de guest con el mismo id_number
                         const { data: guestOrders, error: fetchError } = await supabase
                              .from('exchange_orders')
                              .select('order_id, id_number')
                              .eq('is_guest', true)
                              .is('user_id', null);

                         if (!fetchError && guestOrders && guestOrders.length > 0) {
                              // Filtrar las que tienen el mismo ID (normalizado)
                              const matchingOrders = guestOrders.filter(order => {
                                   const orderIdNormalized = order.id_number?.replace(/[.\s-]/g, '').toUpperCase() || '';
                                   return orderIdNormalized === normalizedId;
                              });

                              if (matchingOrders.length > 0) {
                                   const orderIds = matchingOrders.map(o => o.order_id);

                                   // Vincular las órdenes al usuario actual
                                   const { error: updateError } = await supabase
                                        .from('exchange_orders')
                                        .update({
                                             user_id: userId,
                                             is_guest: false
                                        })
                                        .in('order_id', orderIds);

                                   if (!updateError) {
                                        console.log(`[AUTO-LINK] ✅ ${matchingOrders.length} orden(es) de guest vinculada(s) al usuario`);
                                   }
                              }
                         }
                    } catch (linkError) {
                         console.log('[AUTO-LINK] Error al vincular órdenes de guest:', linkError);
                    }
               }

               setLoading(false);
          };
          loadData();
     }, [userId, supabase]);

     const handleSave = useCallback(async () => {
          setSaving(true);

          const { error } = await supabase.from('user_payment_data').upsert({
               user_id: userId,
               full_name: fullName || null,
               email: email || null,
               country_code: countryCode,
               whatsapp_primary: whatsappPrimary || null,
               whatsapp_secondary: whatsappSecondary || null,
               id_number: idPrefix && idNumber ? `${idPrefix}-${idNumber}` : null,
               bank_name: bank,
               account_type: accountType,
               account_number: accountNumber || null,
               account_holder: accountHolder || null,
               enable_transfer: enableTransfer,
               pago_movil_bank: pagoMovilBank,
               pago_movil_phone: pagoMovilPhone || null,
               pago_movil_cedula: pagoMovilCedulaPrefix && pagoMovilCedula ? `${pagoMovilCedulaPrefix}-${pagoMovilCedula}` : null,
               paypal_email: paypalEmail || null,
               paypal_status: paypalStatus,
               profile_completion: completion,
          }, { onConflict: 'user_id' }).select().single();

          if (error) {
               console.error('Error al guardar perfil:', error);

               // Manejar errores específicos de PostgreSQL
               if (error.code === '23505') {
                    // Duplicado - extraer campo del mensaje
                    const fieldMap: Record<string, string> = {
                         'unique_id_number': 'Cédula/Pasaporte',
                         'unique_email': 'Correo electrónico',
                         'unique_whatsapp': 'WhatsApp',
                         'unique_pago_movil': 'Teléfono Pago Móvil',
                         'unique_account_number': 'Cuenta bancaria',
                    };

                    let fieldName = 'dato';
                    for (const [key, label] of Object.entries(fieldMap)) {
                         if (error.message.includes(key)) {
                              fieldName = label;
                              break;
                         }
                    }

                    alert(`⚠️ El ${fieldName} ya está registrado por otro usuario. Por favor verifica tus datos.`);
               } else if (error.code === '23514') {
                    alert('❌ Formato inválido. Revisa cédula, email, teléfono y cuenta bancaria.');
               } else {
                    alert('🔧 Error al guardar. Por favor intenta nuevamente.');
               }

               setSaving(false);
               return;
          }

          // Éxito
          alert('✅ Perfil actualizado correctamente');
          setSaving(false);
          onClose();
     }, [supabase, userId, fullName, email, countryCode, whatsappPrimary, whatsappSecondary, idNumber, idPrefix, bank, accountType, accountNumber, accountHolder, enableTransfer, pagoMovilBank, pagoMovilPhone, pagoMovilCedula, pagoMovilCedulaPrefix, paypalEmail, paypalStatus, completion, onClose]);

     return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
               <div className="bg-white border-4 border-[#262626] shadow-[12px_12px_0px_0px_#262626] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header with Progress */}
                    <div className="p-6 border-b-4 border-[#262626] bg-gradient-to-r from-[#262626] to-[#404040]">
                         <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
                                   👤 Mi Perfil
                              </h2>
                              <button
                                   onClick={onClose}
                                   className="w-8 h-8 bg-white text-[#262626] font-black hover:bg-[#FF4D00] hover:text-white transition-colors"
                              >
                                   ✕
                              </button>
                         </div>

                         {/* Progress Bar */}
                         <div className="space-y-1">
                              <div className="flex justify-between mono text-[10px] text-white/80">
                                   <span>Perfil completado</span>
                                   <span className="font-black">{completion}%</span>
                              </div>
                              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                   <div
                                        className="h-full bg-[#FF4D00] transition-all duration-500"
                                        style={{ width: `${completion}%` }}
                                   />
                              </div>
                         </div>
                    </div>

                    {/* Section Tabs */}
                    <div className="flex border-b-4 border-[#262626]">
                         {[
                              { id: 'identity', icon: '📋', label: 'Identificación' },
                              { id: 'payment', icon: '🏦', label: 'Métodos de Pago' },
                              { id: 'paypal', icon: '💳', label: 'PayPal' },
                         ].map((tab) => (
                              <button
                                   key={tab.id}
                                   onClick={() => setActiveSection(tab.id as typeof activeSection)}
                                   className={`flex-1 p-3 mono text-xs font-black uppercase transition-colors ${activeSection === tab.id
                                        ? 'bg-[#FF4D00] text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                              >
                                   {tab.icon} {tab.label}
                              </button>
                         ))}
                    </div>

                    {loading ? (
                         <div className="p-12 text-center flex-1">
                              <div className="animate-pulse">
                                   <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                                   <p className="mono font-bold text-gray-400">Cargando perfil...</p>
                              </div>
                         </div>
                    ) : (
                         <div className="p-6 space-y-4 overflow-y-auto flex-1">

                              {/* SECTION: Identity */}
                              {activeSection === 'identity' && (
                                   <div className="space-y-4 animate-fadeIn">
                                        <h3 className="mono text-sm font-black uppercase flex items-center gap-2 pb-2 border-b-2 border-gray-200">
                                             <span className="w-3 h-3 bg-[#FF4D00]"></span>
                                             Datos Personales
                                        </h3>

                                        {/* Full Name */}
                                        <div className="space-y-1">
                                             <div className="space-y-1">
                                                  <label className="mono text-[10px] font-black uppercase flex items-center justify-between">
                                                       <span>Nombre Completo * {fullName.length >= 3 && <span className="text-green-500">✓</span>}</span>
                                                       {isNameLocked && (
                                                            <a href="https://wa.me/15557745095?text=Deseo%20actualizar%20mi%20Nombre" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-[#FF4D00]">Solicitar Cambio ↗</a>
                                                       )}
                                                  </label>
                                                  <div className="relative">
                                                       <input
                                                            type="text"
                                                            value={fullName}
                                                            onChange={(e) => setFullName(e.target.value)}
                                                            disabled={isNameLocked}
                                                            className={`w-full border-4 p-3 font-bold mono outline-none transition-colors ${fullName.length >= 3 ? 'border-green-500' : 'border-[#262626]'} ${isNameLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                            placeholder="Como aparece en tus documentos"
                                                       />
                                                       {isNameLocked && <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-gray-300 transform translate-y-[1px]">
                                                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                                       </svg></span>}
                                                  </div>
                                             </div>
                                        </div>

                                        {/* ID Number with Prefix */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase flex items-center justify-between">
                                                  <span>Cédula / RIF * {idNumber.length >= 6 && <span className="text-green-500">✓</span>}</span>
                                                  {isIdLocked && (
                                                       <a href="https://wa.me/15557745095?text=Deseo%20actualizar%20mi%20Cedula" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-[#FF4D00]">Solicitar Cambio ↗</a>
                                                  )}
                                             </label>
                                             <div className="flex gap-2 relative">
                                                  <select
                                                       value={idPrefix}
                                                       onChange={(e) => setIdPrefix(e.target.value)}
                                                       disabled={isIdLocked}
                                                       className={`border-4 border-[#262626] p-3 font-bold mono outline-none ${isIdLocked ? 'bg-gray-200 text-gray-500' : 'bg-[#262626] text-white'}`}
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
                                                            onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                                            disabled={isIdLocked}
                                                            className={`w-full border-4 p-3 font-bold mono outline-none transition-colors ${idNumber.length >= 6 ? 'border-green-500' : 'border-[#262626]'} ${isIdLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                            placeholder="12345678"
                                                            maxLength={8}
                                                       />
                                                       {isIdLocked && <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-gray-300 transform translate-y-[1px]">
                                                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                                       </svg></span>}
                                                  </div>
                                             </div>
                                             <p className="mono text-[9px] text-gray-400">6-8 dígitos</p>
                                        </div>

                                        {/* WhatsApp Primary */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase flex items-center justify-between">
                                                  <span>WhatsApp Principal * {whatsappPrimary.length >= 10 && <span className="text-green-500">✓</span>}</span>
                                             </label>
                                             <div className="flex gap-2 relative">
                                                  <select
                                                       value={countryCode}
                                                       onChange={(e) => setCountryCode(e.target.value)}
                                                       className="border-4 border-[#262626] p-3 font-bold mono outline-none bg-gray-50"
                                                  >
                                                       {COUNTRY_CODES.map(c => (
                                                            <option key={c.code} value={c.code}>{c.country} ({c.code})</option>
                                                       ))}
                                                  </select>
                                                  <div className="relative flex-1">
                                                       <input
                                                            type="text"
                                                            value={whatsappPrimary}
                                                            onChange={(e) => setWhatsappPrimary(e.target.value.replace(/\D/g, ''))}
                                                            className={`w-full border-4 p-3 font-bold mono outline-none transition-colors ${whatsappPrimary.length >= 10 ? 'border-green-500' : 'border-[#262626]'}`}
                                                            placeholder="4121234567"
                                                       />
                                                  </div>
                                             </div>
                                        </div>

                                        {/* WhatsApp Secondary */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase text-gray-500">
                                                  WhatsApp Secundario (opcional)
                                             </label>
                                             <div className="flex gap-2">
                                                  <select
                                                       value={whatsappSecondaryCode}
                                                       onChange={(e) => setWhatsappSecondaryCode(e.target.value)}
                                                       className="border-4 border-[#262626] p-3 font-bold mono outline-none bg-gray-50"
                                                  >
                                                       {COUNTRY_CODES.map(c => (
                                                            <option key={c.code} value={c.code}>{c.country} ({c.code})</option>
                                                       ))}
                                                  </select>
                                                  <input
                                                       type="text"
                                                       value={whatsappSecondary}
                                                       onChange={(e) => setWhatsappSecondary(e.target.value.replace(/\D/g, ''))}
                                                       className="flex-1 border-4 border-[#262626] p-3 font-bold mono outline-none"
                                                       placeholder="Número alternativo"
                                                  />
                                             </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase flex items-center justify-between">
                                                  <span className="flex items-center gap-2">
                                                       Correo Electrónico
                                                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-gray-300">
                                                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                                       </svg>
                                                  </span>
                                                  <a href="https://wa.me/15557745095?text=Deseo%20actualizar%20mi%20Email%20de%20Registro" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-[#FF4D00]">Solicitar Cambio ↗</a>
                                             </label>
                                             <input
                                                  type="email"
                                                  value={email}
                                                  disabled={true}
                                                  className="w-full border-4 p-3 font-bold mono outline-none border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                                  placeholder="tu@email.com"
                                             />
                                        </div>
                                   </div>
                              )}

                              {/* SECTION: Payment Methods */}
                              {activeSection === 'payment' && (
                                   <div className="space-y-4 animate-fadeIn">
                                        <h3 className="mono text-sm font-black uppercase flex items-center gap-2 pb-2 border-b-2 border-gray-200">
                                             <span className="w-3 h-3 bg-[#FF4D00]"></span>
                                             Transferencia Bancaria
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">
                                             {/* Bank */}
                                             {/* Bank */}
                                             <div className="space-y-1">
                                                  <label className="mono text-[10px] font-black uppercase flex justify-between">
                                                       <span>Banco Principal *</span>
                                                       {isBankLocked && (
                                                            <a href="https://wa.me/15557745095?text=Deseo%20actualizar%20mis%20Datos%20Bancarios" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-[#FF4D00]">Solicitar Cambio ↗</a>
                                                       )}
                                                  </label>
                                                  <select
                                                       value={bank}
                                                       onChange={(e) => setBank(e.target.value)}
                                                       disabled={isBankLocked}
                                                       className={`w-full border-4 border-[#262626] p-3 font-bold mono outline-none ${isBankLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
                                                  >
                                                       {VENEZUELAN_BANKS.map(b => <option key={b}>{b}</option>)}
                                                  </select>
                                             </div>

                                             {/* Account Type */}
                                             <div className="space-y-1">
                                                  <label className="mono text-[10px] font-black uppercase">Tipo de Cuenta *</label>
                                                  <select
                                                       value={accountType}
                                                       onChange={(e) => setAccountType(e.target.value as 'CORRIENTE' | 'AHORRO')}
                                                       disabled={isBankLocked}
                                                       className={`w-full border-4 border-[#262626] p-3 font-bold mono outline-none ${isBankLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
                                                  >
                                                       <option value="CORRIENTE">Corriente</option>
                                                       <option value="AHORRO">Ahorro</option>
                                                  </select>
                                             </div>
                                        </div>

                                        {/* Account Number */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase flex items-center gap-2">
                                                  Número de Cuenta
                                                  {accountNumber.length === 20 && <span className="text-green-500">✓ 20 dígitos</span>}
                                             </label>
                                             <div className="relative">
                                                  <input
                                                       type="text"
                                                       value={accountNumber}
                                                       onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 20))}
                                                       disabled={isBankLocked}
                                                       className={`w-full border-4 p-3 font-bold mono outline-none transition-colors ${accountNumber.length === 20 ? 'border-green-500' : 'border-[#262626]'} ${isBankLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                       placeholder="01340123456789012345"
                                                  />
                                                  {isBankLocked && <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-gray-300 transform translate-y-[1px]">
                                                       <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                                  </svg></span>}
                                             </div>
                                        </div>

                                        {/* Account Holder */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase">Titular de la Cuenta</label>
                                             <input
                                                  type="text"
                                                  value={accountHolder}
                                                  onChange={(e) => setAccountHolder(e.target.value)}
                                                  disabled={isBankLocked}
                                                  className={`w-full border-4 border-[#262626] p-3 font-bold mono outline-none ${isBankLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                  placeholder="Nombre como aparece en el banco"
                                             />
                                        </div>

                                        <hr className="border-2 border-dashed border-gray-200 my-6" />

                                        <h3 className="mono text-sm font-black uppercase flex items-center gap-2 pb-2 border-b-2 border-gray-200">
                                             <span className="w-3 h-3 bg-green-500"></span>
                                             Pago Móvil
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">
                                             {/* Pago Movil Bank */}
                                             <div className="space-y-1">
                                                  <label className="mono text-[10px] font-black uppercase flex justify-between">
                                                       <span>Banco Pago Móvil</span>
                                                       {isPagoMovilPhoneLocked && (
                                                            <a href="https://wa.me/15557745095?text=Deseo%20actualizar%20mi%20Pago%20Movil" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-[#FF4D00]">Solicitar Cambio ↗</a>
                                                       )}
                                                  </label>
                                                  <select
                                                       value={pagoMovilBank}
                                                       onChange={(e) => setPagoMovilBank(e.target.value)}
                                                       disabled={isPagoMovilPhoneLocked}
                                                       className={`w-full border-4 border-[#262626] p-3 font-bold mono outline-none ${isPagoMovilPhoneLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
                                                  >
                                                       {VENEZUELAN_BANKS.map(b => <option key={b}>{b}</option>)}
                                                  </select>
                                             </div>

                                             {/* Pago Movil Phone */}
                                             <div className="space-y-1">
                                                  <label className="mono text-[10px] font-black uppercase flex justify-between">
                                                       <span>Teléfono</span>
                                                       {isPagoMovilPhoneLocked && (
                                                            <a href="https://wa.me/15557745095?text=Deseo%20actualizar%20mi%20Telefono%20Pago%20Movil" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-[#FF4D00]">Solicitar Cambio ↗</a>
                                                       )}
                                                  </label>
                                                  <div className="relative">
                                                       <input
                                                            type="text"
                                                            value={pagoMovilPhone}
                                                            onChange={(e) => setPagoMovilPhone(e.target.value.replace(/\D/g, ''))}
                                                            disabled={isPagoMovilPhoneLocked}
                                                            className={`w-full border-4 border-[#262626] p-3 font-bold mono outline-none ${isPagoMovilPhoneLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                            placeholder="04121234567"
                                                       />
                                                       {isPagoMovilPhoneLocked && <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-gray-300">
                                                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" /></svg></span>}
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Pago Movil Cedula - Auto-filled from main ID */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase flex items-center justify-between">
                                                  <span className="flex items-center gap-2">
                                                       Cédula Asociada
                                                       {isIdLocked && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-gray-300">
                                                                 <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                                            </svg>
                                                       )}
                                                  </span>
                                                  {isIdLocked && (
                                                       <a href="https://wa.me/15557745095?text=Deseo%20actualizar%20mi%20Cedula" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-[#FF4D00]">Solicitar Cambio ↗</a>
                                                  )}
                                             </label>
                                             <div className="flex gap-2 relative">
                                                  <select
                                                       value={idPrefix}
                                                       disabled={true}
                                                       className="border-4 border-[#262626] p-3 font-bold mono outline-none bg-gray-200 text-gray-500 cursor-not-allowed"
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
                                                            disabled={true}
                                                            className="w-full border-4 border-[#262626] p-3 font-bold mono outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                                                            placeholder="12345678"
                                                            maxLength={8}
                                                       />
                                                       <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-gray-300">
                                                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" /></svg></span>
                                                  </div>
                                             </div>
                                             <p className="mono text-[9px] text-gray-400">Se usa la misma cédula de tu perfil</p>
                                        </div>

                                        {/* Enable Transfer Toggle */}
                                        <label className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 cursor-pointer hover:bg-gray-100">
                                             <input
                                                  type="checkbox"
                                                  checked={enableTransfer}
                                                  onChange={(e) => setEnableTransfer(e.target.checked)}
                                                  className="w-5 h-5 accent-[#FF4D00]"
                                             />
                                             <span className="mono text-xs font-bold uppercase">Habilitar transferencias bancarias</span>
                                        </label>
                                   </div>
                              )}

                              {/* SECTION: PayPal */}
                              {activeSection === 'paypal' && (
                                   <div className="space-y-4 animate-fadeIn">
                                        <h3 className="mono text-sm font-black uppercase flex items-center gap-2 pb-2 border-b-2 border-gray-200">
                                             <span className="w-3 h-3 bg-blue-500"></span>
                                             Cuenta PayPal
                                        </h3>

                                        {/* PayPal Email */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase flex items-center gap-2">
                                                  Correo PayPal
                                                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail) && <span className="text-green-500">✓</span>}
                                             </label>
                                             <input
                                                  type="email"
                                                  value={paypalEmail}
                                                  onChange={(e) => setPaypalEmail(e.target.value)}
                                                  className={`w-full border-4 p-3 font-bold mono outline-none transition-colors ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail) ? 'border-green-500' : 'border-[#262626]'}`}
                                                  placeholder="tu@paypal.com"
                                             />
                                        </div>

                                        {/* PayPal Status */}
                                        <div className="space-y-2">
                                             <label className="mono text-[10px] font-black uppercase">Estado de Verificación</label>
                                             <div className="grid grid-cols-3 gap-2">
                                                  {[
                                                       { value: 'verified', label: 'Verificado', icon: '🟢', bg: 'bg-green-100 border-green-500' },
                                                       { value: 'pending', label: 'Pendiente', icon: '🟡', bg: 'bg-yellow-100 border-yellow-500' },
                                                       { value: 'unverified', label: 'No Verificado', icon: '⚪', bg: 'bg-gray-100 border-gray-300' },
                                                  ].map((status) => (
                                                       <button
                                                            key={status.value}
                                                            type="button"
                                                            onClick={() => setPaypalStatus(status.value as typeof paypalStatus)}
                                                            className={`p-3 border-4 font-bold mono text-xs transition-all ${paypalStatus === status.value
                                                                 ? status.bg + ' scale-105'
                                                                 : 'bg-white border-gray-200 hover:border-gray-400'
                                                                 }`}
                                                       >
                                                            {status.icon} {status.label}
                                                       </button>
                                                  ))}
                                             </div>
                                        </div>

                                        {/* OAuth Note */}
                                        <div className="bg-blue-50 p-4 border-l-4 border-blue-500 space-y-2">
                                             <p className="mono text-xs font-black text-blue-800">
                                                  🔐 Verificación Automática (Próximamente)
                                             </p>
                                             <p className="mono text-[10px] text-blue-600">
                                                  En producción, podrás vincular tu cuenta PayPal directamente usando OAuth
                                                  para verificación automática y límites de transacción.
                                             </p>
                                        </div>
                                   </div>
                              )}
                         </div>
                    )}

                    {/* Footer with Save Button */}
                    <div className="p-6 border-t-4 border-[#262626] bg-gray-50">
                         <button
                              onClick={handleSave}
                              disabled={saving}
                              className="w-full bg-[#FF4D00] text-white p-4 font-black uppercase mono border-4 border-[#262626] shadow-[4px_4px_0px_0px_#262626] hover:shadow-[2px_2px_0px_0px_#262626] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                         </button>
                    </div>
               </div>
          </div>
     );
}
