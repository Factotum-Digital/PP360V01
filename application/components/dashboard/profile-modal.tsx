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
     const [isPagoMovilLocked, setIsPagoMovilLocked] = useState(false);

     // Memoized completion calculation
     const completion = useMemo(() => {
          let completed = 0;
          const fields = [fullName, idNumber, whatsappPrimary, bank, paypalEmail];
          fields.forEach(f => { if (f && f.trim()) completed++; });
          return Math.round((completed / fields.length) * 100);
     }, [fullName, idNumber, whatsappPrimary, bank, paypalEmail]);

     useEffect(() => {
          const loadData = async () => {
               const { data } = await supabase
                    .from('user_payment_data')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

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
                    if (data.pago_movil_phone) {
                         setPagoMovilPhone(data.pago_movil_phone);
                         setIsPagoMovilLocked(true);
                    }
                    // Parsear cédula pago móvil con formato V-12345678
                    if (data.pago_movil_cedula) {
                         const match = data.pago_movil_cedula.match(/^([VEJP])-?(.+)$/i);
                         if (match) {
                              setPagoMovilCedulaPrefix(match[1].toUpperCase());
                              setPagoMovilCedula(match[2]);
                         } else {
                              setPagoMovilCedula(data.pago_movil_cedula);
                         }
                    }
                    if (data.paypal_email) setPaypalEmail(data.paypal_email);
                    if (data.paypal_status) setPaypalStatus(data.paypal_status);
               }
               setLoading(false);
          };
          loadData();
     }, [userId, supabase]);

     const handleSave = useCallback(async () => {
          setSaving(true);

          await supabase.from('user_payment_data').upsert({
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
          }, { onConflict: 'user_id' });

          setSaving(false);
          onClose();
     }, [supabase, userId, fullName, email, countryCode, whatsappPrimary, whatsappSecondary, idNumber, bank, accountType, accountNumber, accountHolder, enableTransfer, pagoMovilBank, pagoMovilPhone, pagoMovilCedula, paypalEmail, paypalStatus, completion, onClose]);

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
                                                       {isNameLocked && <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>}
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
                                                       {isIdLocked && <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>}
                                                  </div>
                                             </div>
                                             <p className="mono text-[9px] text-gray-400">6-8 dígitos</p>
                                        </div>

                                        {/* WhatsApp Primary */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase flex items-center justify-between">
                                                  <span>WhatsApp Principal * {whatsappPrimary.length >= 10 && <span className="text-green-500">✓</span>}</span>
                                                  {isPhoneLocked && (
                                                       <a href="https://wa.me/15557745095?text=Deseo%20actualizar%20mi%20Telefono" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-[#FF4D00]">Solicitar Cambio ↗</a>
                                                  )}
                                             </label>
                                             <div className="flex gap-2 relative">
                                                  <select
                                                       value={countryCode}
                                                       onChange={(e) => setCountryCode(e.target.value)}
                                                       disabled={isPhoneLocked}
                                                       className={`border-4 border-[#262626] p-3 font-bold mono outline-none ${isPhoneLocked ? 'bg-gray-200 text-gray-500' : 'bg-gray-50'}`}
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
                                                            disabled={isPhoneLocked}
                                                            className={`w-full border-4 p-3 font-bold mono outline-none transition-colors ${whatsappPrimary.length >= 10 ? 'border-green-500' : 'border-[#262626]'} ${isPhoneLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                            placeholder="4121234567"
                                                       />
                                                       {isPhoneLocked && <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>}
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
                                             <label className="mono text-[10px] font-black uppercase flex items-center gap-2">
                                                  Correo Electrónico
                                                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <span className="text-green-500">✓</span>}
                                             </label>
                                             <input
                                                  type="email"
                                                  value={email}
                                                  onChange={(e) => setEmail(e.target.value)}
                                                  className={`w-full border-4 p-3 font-bold mono outline-none transition-colors ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-green-500' : 'border-[#262626]'}`}
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
                                                  {isBankLocked && <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>}
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
                                                       {isPagoMovilLocked && (
                                                            <a href="https://wa.me/15557745095?text=Deseo%20actualizar%20mi%20Pago%20Movil" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-400 hover:text-[#FF4D00]">Solicitar Cambio ↗</a>
                                                       )}
                                                  </label>
                                                  <select
                                                       value={pagoMovilBank}
                                                       onChange={(e) => setPagoMovilBank(e.target.value)}
                                                       disabled={isPagoMovilLocked}
                                                       className={`w-full border-4 border-[#262626] p-3 font-bold mono outline-none ${isPagoMovilLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
                                                  >
                                                       {VENEZUELAN_BANKS.map(b => <option key={b}>{b}</option>)}
                                                  </select>
                                             </div>

                                             {/* Pago Movil Phone */}
                                             <div className="space-y-1">
                                                  <label className="mono text-[10px] font-black uppercase">Teléfono</label>
                                                  <div className="relative">
                                                       <input
                                                            type="text"
                                                            value={pagoMovilPhone}
                                                            onChange={(e) => setPagoMovilPhone(e.target.value.replace(/\D/g, ''))}
                                                            disabled={isPagoMovilLocked}
                                                            className={`w-full border-4 border-[#262626] p-3 font-bold mono outline-none ${isPagoMovilLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                            placeholder="04121234567"
                                                       />
                                                       {isPagoMovilLocked && <span className="absolute right-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>}
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Pago Movil Cedula */}
                                        <div className="space-y-1">
                                             <label className="mono text-[10px] font-black uppercase">Cédula Asociada</label>
                                             <div className="flex gap-2 relative">
                                                  <select
                                                       value={pagoMovilCedulaPrefix}
                                                       onChange={(e) => setPagoMovilCedulaPrefix(e.target.value)}
                                                       disabled={isPagoMovilLocked}
                                                       className={`border-4 border-[#262626] p-3 font-bold mono outline-none ${isPagoMovilLocked ? 'bg-gray-200 text-gray-500' : 'bg-[#262626] text-white'}`}
                                                  >
                                                       <option>V</option>
                                                       <option>E</option>
                                                       <option>J</option>
                                                       <option>P</option>
                                                  </select>
                                                  <div className="relative flex-1">
                                                       <input
                                                            type="text"
                                                            value={pagoMovilCedula}
                                                            onChange={(e) => setPagoMovilCedula(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                                            disabled={isPagoMovilLocked}
                                                            className={`w-full border-4 border-[#262626] p-3 font-bold mono outline-none ${isPagoMovilLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                            placeholder="12345678"
                                                            maxLength={8}
                                                       />
                                                       {isPagoMovilLocked && <span className="absolute right-3 top-3 text-gray-400">🔒</span>}
                                                  </div>
                                             </div>
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
