"use client";

import React, { useState } from 'react';
import { Slab, Tag } from '@/components/ui/brutalist-system';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ExchangeOrder } from '@/lib/supabase/database.types';

interface DashboardContentProps {
     user: User;
     orders: ExchangeOrder[];
     currentRate: number;
}

export function DashboardContent({ user, orders, currentRate }: DashboardContentProps) {
     const [showNewOrder, setShowNewOrder] = useState(false);
     const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
     const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
     const [uploadedOrderIds, setUploadedOrderIds] = useState<string[]>([]);
     const router = useRouter();
     const supabase = createClient();

     const handleLogout = async () => {
          await supabase.auth.signOut();
          router.push('/');
          router.refresh();
     };

     const getStatusColor = (status: string) => {
          switch (status) {
               case 'COMPLETED':
                    return 'bg-green-500';
               case 'PENDING':
                    return 'bg-yellow-500';
               case 'VERIFYING':
                    return 'bg-blue-500';
               case 'CANCELLED':
                    return 'bg-red-500';
               default:
                    return 'bg-gray-500';
          }
     };

     const handleOrderUpload = async (e: React.ChangeEvent<HTMLInputElement>, orderId: string, ticketId: string | null) => {
          if (!e.target.files || e.target.files.length === 0) return;

          const file = e.target.files[0];
          if (!file.type.startsWith('image/')) {
               alert('Error: Solo se permiten imágenes');
               return;
          }
          if (file.size > 2 * 1024 * 1024) {
               alert('Error: El archivo es muy grande (máx 2MB)');
               return;
          }

          setUploadingOrderId(orderId);

          try {
               const fileExt = file.name.split('.').pop();
               const ticketRef = ticketId || orderId.slice(0, 8);
               const fileName = `${ticketRef}_${Date.now()}.${fileExt}`;
               const filePath = `${ticketRef}/${fileName}`;

               const { error: uploadError } = await supabase.storage
                    .from('payment-proofs')
                    .upload(filePath, file);

               if (uploadError) throw uploadError;

               const { data: { publicUrl } } = supabase.storage
                    .from('payment-proofs')
                    .getPublicUrl(filePath);

               // Actualizar orden
               await supabase
                    .from('exchange_orders')
                    .update({ payment_proof_url: publicUrl, status: 'VERIFYING' })
                    .eq('order_id', orderId);

               setUploadedOrderIds(prev => [...prev, orderId]);
               router.refresh();
          } catch (error) {
               alert(`Error al subir: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          } finally {
               setUploadingOrderId(null);
          }
     };

     return (
          <div className="space-y-8">
               {/* Header */}
               <div className="flex justify-between items-start">
                    <div>
                         <Tag active>DASHBOARD</Tag>
                         <h1 className="text-4xl font-black uppercase tracking-tighter mt-4">
                              Panel de Usuario
                         </h1>
                         <p className="mono text-xs font-bold text-gray-500 mt-2">
                              {user.email} // SESSION_ACTIVE
                         </p>
                    </div>
                    <Slab
                         className="p-3 mono text-xs font-black uppercase cursor-pointer"
                         onClick={handleLogout}
                    >
                         LOGOUT
                    </Slab>
               </div>

               {/* Stats Row */}
               <div className="grid md:grid-cols-4 gap-4">
                    <Slab className="p-6 text-center">
                         <div className="text-3xl font-black">{orders.length}</div>
                         <div className="mono text-[10px] font-bold uppercase text-gray-500">Total Órdenes</div>
                    </Slab>
                    <Slab className="p-6 text-center bg-[#262626] text-white">
                         <div className="text-3xl font-black text-[#FF4D00]">
                              {orders.filter(o => o.status === 'COMPLETED').length}
                         </div>
                         <div className="mono text-[10px] font-bold uppercase">Completadas</div>
                    </Slab>
                    <Slab className="p-6 text-center bg-[#FF4D00] text-white">
                         <div className="text-3xl font-black">
                              {orders.filter(o => o.status === 'PENDING').length}
                         </div>
                         <div className="mono text-[10px] font-bold uppercase">Pendientes</div>
                    </Slab>
                    <Slab className="p-6 text-center bg-orange-100">
                         <div className="text-3xl font-black">{currentRate.toFixed(2)}</div>
                         <div className="mono text-[10px] font-bold uppercase text-gray-500">Tasa Actual</div>
                    </Slab>
               </div>

               {/* New Order Button */}
               <Slab
                    dark
                    className="p-6 text-center font-black uppercase tracking-widest bg-[#FF4D00] cursor-pointer"
                    onClick={() => setShowNewOrder(!showNewOrder)}
               >
                    {showNewOrder ? 'CANCELAR' : '+ NUEVA ORDEN DE INTERCAMBIO'}
               </Slab>

               {/* New Order Form */}
               {showNewOrder && <NewOrderForm currentRate={currentRate} onComplete={() => {
                    setShowNewOrder(false);
                    router.refresh();
               }} />}

               {/* Orders List */}
               <Slab className="p-6">
                    <h2 className="mono text-sm font-black uppercase mb-6 flex items-center gap-2">
                         <span className="w-2 h-2 bg-[#FF4D00]"></span>
                         Historial de Órdenes
                    </h2>

                    {orders.length === 0 ? (
                         <div className="text-center py-12">
                              <p className="mono text-sm font-bold text-gray-400">
                                   No tienes órdenes todavía. ¡Crea tu primera orden!
                              </p>
                         </div>
                    ) : (
                         <div className="space-y-4">
                              {orders.map((order) => (
                                   <div key={order.order_id} className="border-4 border-[#262626]">
                                        {/* Order Header - Clickeable */}
                                        <div
                                             className="p-4 bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                             onClick={() => setExpandedOrderId(expandedOrderId === order.order_id ? null : order.order_id)}
                                        >
                                             <div className="flex items-center gap-4">
                                                  <span className={`${getStatusColor(order.status)} text-white px-2 py-1 text-[10px] font-black`}>
                                                       {order.status}
                                                  </span>
                                                  <span className="mono text-xs font-bold">
                                                       #{order.ticket_id || order.order_id.slice(0, 8)}
                                                  </span>
                                             </div>
                                             <div className="flex items-center gap-6 mono text-xs">
                                                  <span className="font-black">${order.amount_sent.toFixed(2)} USD</span>
                                                  <span className="text-[#FF4D00] font-black">{order.amount_received.toLocaleString('es-VE')} VES</span>
                                                  <span className="text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                                  <span className="text-xl">{expandedOrderId === order.order_id ? '−' : '+'}</span>
                                             </div>
                                        </div>

                                        {/* Order Details - Expandible */}
                                        {expandedOrderId === order.order_id && (
                                             <div className="border-t-4 border-[#262626] p-6 bg-gray-50 space-y-4">
                                                  <div className="grid md:grid-cols-2 gap-6">
                                                       <div className="space-y-2">
                                                            <h4 className="mono text-xs font-black uppercase underline">Datos de la Orden</h4>
                                                            <p className="mono text-[11px]"><span className="text-gray-500">ID:</span> <span className="font-bold">{order.order_id}</span></p>
                                                            {order.ticket_id && <p className="mono text-[11px]"><span className="text-gray-500">Ticket:</span> <span className="font-bold text-[#FF4D00]">{order.ticket_id}</span></p>}
                                                            <p className="mono text-[11px]"><span className="text-gray-500">Envía:</span> <span className="font-bold">${order.amount_sent.toFixed(2)} {order.currency_sent}</span></p>
                                                            <p className="mono text-[11px]"><span className="text-gray-500">Recibe:</span> <span className="font-bold">{order.amount_received.toLocaleString('es-VE')} {order.currency_received}</span></p>
                                                            <p className="mono text-[11px]"><span className="text-gray-500">Fecha:</span> <span className="font-bold">{new Date(order.created_at).toLocaleString()}</span></p>
                                                       </div>
                                                       <div className="space-y-2">
                                                            <h4 className="mono text-xs font-black uppercase underline">Datos de Pago</h4>
                                                            <p className="mono text-[11px]"><span className="text-gray-500">PayPal:</span> <span className="font-bold">{order.paypal_email || 'N/A'}</span></p>
                                                            <p className="mono text-[11px]"><span className="text-gray-500">Banco:</span> <span className="font-bold">{order.bank_name || 'N/A'}</span></p>
                                                            <p className="mono text-[11px]"><span className="text-gray-500">Cédula:</span> <span className="font-bold">{order.id_number || 'N/A'}</span></p>
                                                            <p className="mono text-[11px]"><span className="text-gray-500">Teléfono:</span> <span className="font-bold">{order.phone_pago_movil || 'N/A'}</span></p>
                                                            <p className="mono text-[11px]"><span className="text-gray-500">WhatsApp:</span> <span className="font-bold">{order.whatsapp || 'N/A'}</span></p>
                                                       </div>
                                                  </div>

                                                  {/* Actions for pending orders */}
                                                  {order.status === 'PENDING' && (
                                                       <div className="pt-4 border-t-2 border-gray-300 space-y-3">
                                                            <div className="bg-orange-50 p-4 border-l-4 border-[#FF4D00]">
                                                                 <p className="mono text-[11px] font-bold">
                                                                      <span className="underline">Instrucciones:</span> Envía ${order.amount_sent.toFixed(2)} USD a <span className="text-[#FF4D00]">pagos@pp360ve.com</span>
                                                                 </p>
                                                                 <p className="mono text-[10px] text-gray-600 mt-1">
                                                                      En la nota del pago coloca: <span className="font-black text-[#FF4D00]">{order.ticket_id || order.order_id.slice(0, 8)}</span>
                                                                 </p>
                                                            </div>

                                                            {/* Subir Comprobante */}
                                                            {!uploadedOrderIds.includes(order.order_id) ? (
                                                                 <label className={`block w-full p-3 text-center font-black uppercase mono text-xs border-4 border-[#262626] cursor-pointer transition-colors ${uploadingOrderId === order.order_id ? 'bg-gray-400 text-gray-800' : 'bg-[#262626] text-white hover:bg-black'}`}>
                                                                      {uploadingOrderId === order.order_id ? 'SUBIENDO...' : '📁 SUBIR COMPROBANTE'}
                                                                      <input
                                                                           type="file"
                                                                           accept="image/*"
                                                                           className="hidden"
                                                                           onChange={(e) => handleOrderUpload(e, order.order_id, order.ticket_id)}
                                                                           disabled={uploadingOrderId === order.order_id}
                                                                      />
                                                                 </label>
                                                            ) : (
                                                                 <div className="bg-green-100 p-3 border-l-4 border-green-500">
                                                                      <p className="mono text-xs font-black text-green-700">✓ COMPROBANTE SUBIDO</p>
                                                                 </div>
                                                            )}
                                                            <p className="mono text-[10px] text-center font-bold text-gray-500">FORMATOS: JPG, PNG | MAX: 2MB</p>

                                                            <div className="relative flex py-2 items-center">
                                                                 <div className="flex-grow border-t border-gray-300"></div>
                                                                 <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] mono uppercase">O reportar por</span>
                                                                 <div className="flex-grow border-t border-gray-300"></div>
                                                            </div>

                                                            <a
                                                                 href={`https://wa.me/584121030740?text=Hola!%20Mi%20ticket%20es%20${order.ticket_id || order.order_id.slice(0, 8)}`}
                                                                 target="_blank"
                                                                 rel="noopener noreferrer"
                                                                 className="block w-full bg-white text-green-600 p-3 text-center font-black uppercase mono text-xs border-4 border-green-600 hover:bg-green-50 transition-colors"
                                                            >
                                                                 📱 Enviar por WhatsApp
                                                            </a>
                                                       </div>
                                                  )}

                                                  {order.status === 'COMPLETED' && (
                                                       <div className="bg-green-100 p-4 border-l-8 border-green-500">
                                                            <p className="mono text-xs font-black text-green-700">✓ ORDEN COMPLETADA</p>
                                                       </div>
                                                  )}
                                             </div>
                                        )}
                                   </div>
                              ))}
                         </div>
                    )}
               </Slab>
          </div>
     );
}

// New Order Form Component
function NewOrderForm({ currentRate, onComplete }: { currentRate: number; onComplete: () => void }) {
     const [step, setStep] = useState(1);
     const [amount, setAmount] = useState(100);
     const [emailPaypal, setEmailPaypal] = useState('');
     const [bank, setBank] = useState('Banesco');
     const [phone, setPhone] = useState('');
     const [idNumber, setIdNumber] = useState('');
     const [whatsapp, setWhatsapp] = useState('');
     const [loading, setLoading] = useState(false);
     const [errors, setErrors] = useState<{ email?: string; phone?: string; id?: string; whatsapp?: string }>({});
     const [paymentInfo, setPaymentInfo] = useState<{
          ticketId: string;
          paypalDestination: string;
          instructions: string[];
     } | null>(null);
     const [uploading, setUploading] = useState(false);
     const [uploadSuccess, setUploadSuccess] = useState(false);
     const supabase = createClient();

     const commission = 0.05;
     const netAmount = amount * (1 - commission);
     const vesAmount = netAmount * currentRate;

     // Validación de campos obligatorios
     const validateStep2 = () => {
          const newErrors: { email?: string; phone?: string; id?: string; whatsapp?: string } = {};

          if (!emailPaypal.trim() || !emailPaypal.includes('@')) {
               newErrors.email = 'Email PayPal es obligatorio';
          }
          if (!phone.trim() || phone.length < 10) {
               newErrors.phone = 'Teléfono es obligatorio (mín. 10 dígitos)';
          }
          if (!idNumber.trim() || idNumber.length < 6) {
               newErrors.id = 'Cédula/RIF es obligatorio';
          }
          if (!whatsapp.trim() || whatsapp.length < 10) {
               newErrors.whatsapp = 'WhatsApp es obligatorio (mín. 10 dígitos)';
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     const handleSubmit = async () => {
          // Validar antes de enviar
          if (!validateStep2()) {
               return;
          }

          setLoading(true);

          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
               alert('Error: Usuario no autenticado');
               setLoading(false);
               return;
          }

          // Generar ticket_id único (P360-XXXX)
          const ticketId = `P360-${Math.floor(1000 + Math.random() * 9000)}`;

          const { data: orderData, error } = await supabase.from('exchange_orders').insert({
               user_id: user.id,
               amount_sent: amount,
               currency_sent: 'USD_PAYPAL',
               amount_received: vesAmount,
               currency_received: 'VES',
               status: 'PENDING',
               paypal_email: emailPaypal,
               bank_name: bank,
               phone_pago_movil: phone,
               id_number: idNumber,
               whatsapp: whatsapp,
               ticket_id: ticketId,
          }).select().single();

          if (error) {
               alert('Error al crear la orden: ' + error.message);
               setLoading(false);
          } else {
               // Guardar info de pago para mostrar instrucciones
               setPaymentInfo({
                    ticketId: ticketId,
                    paypalDestination: 'pagos@pp360ve.com',
                    instructions: [
                         `1. Envía $${amount.toFixed(2)} USD a: pagos@pp360ve.com`,
                         `2. En la nota del pago coloca: ${ticketId}`,
                         `3. Envía captura del pago por WhatsApp`,
                         `4. Recibirás Bs. ${vesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })} en tu cuenta`
                    ]
               });
               setStep(3);
               setLoading(false);
          }
     };

     const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target.files || e.target.files.length === 0 || !paymentInfo) return;

          const file = e.target.files[0];
          if (!file.type.startsWith('image/')) {
               alert('Error: Solo se permiten imágenes');
               return;
          }
          if (file.size > 2 * 1024 * 1024) {
               alert('Error: El archivo es muy grande (máx 2MB)');
               return;
          }

          setUploading(true);

          try {
               const fileExt = file.name.split('.').pop();
               const fileName = `${paymentInfo.ticketId}_${Date.now()}.${fileExt}`;
               const filePath = `${paymentInfo.ticketId}/${fileName}`;

               const { error: uploadError } = await supabase.storage
                    .from('payment-proofs')
                    .upload(filePath, file);

               if (uploadError) throw uploadError;

               const { data: { publicUrl } } = supabase.storage
                    .from('payment-proofs')
                    .getPublicUrl(filePath);

               // Actualizar orden con la URL del comprobante
               await supabase
                    .from('exchange_orders')
                    .update({ payment_proof_url: publicUrl, status: 'VERIFYING' })
                    .eq('ticket_id', paymentInfo.ticketId);

               setUploadSuccess(true);
          } catch (error) {
               alert(`Error al subir: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          } finally {
               setUploading(false);
          }
     };

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
                                   onChange={(e) => setAmount(Number(e.target.value))}
                                   className="w-full border-4 border-[#262626] p-4 text-2xl font-black mono outline-none"
                                   min={10}
                              />
                         </div>

                         <div className="bg-[#262626] text-white p-4">
                              <div className="flex justify-between mono text-sm font-bold">
                                   <span>Recibes:</span>
                                   <span className="text-[#FF4D00]">{vesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })} VES</span>
                              </div>
                              <div className="flex justify-between mono text-[10px] text-gray-400 mt-2">
                                   <span>Tasa: {currentRate.toFixed(2)} VES/USD</span>
                                   <span>Comisión: 5%</span>
                              </div>
                         </div>

                         <Slab
                              dark
                              className="p-4 text-center font-black uppercase bg-[#FF4D00] cursor-pointer"
                              onClick={() => setStep(2)}
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

                         <div className="grid md:grid-cols-2 gap-4">
                              {/* Email PayPal */}
                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase">
                                        Email PayPal <span className="text-red-500">*</span>
                                   </label>
                                   <input
                                        type="email"
                                        value={emailPaypal}
                                        onChange={(e) => { setEmailPaypal(e.target.value); setErrors({ ...errors, email: undefined }); }}
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
                                        <option>Banesco</option>
                                        <option>Mercantil</option>
                                        <option>Banco de Venezuela</option>
                                        <option>Provincial</option>
                                        <option>BOD</option>
                                   </select>
                              </div>

                              {/* Cédula/RIF */}
                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase">
                                        Cédula / RIF <span className="text-red-500">*</span>
                                   </label>
                                   <input
                                        type="text"
                                        value={idNumber}
                                        onChange={(e) => { setIdNumber(e.target.value); setErrors({ ...errors, id: undefined }); }}
                                        className={`w-full border-4 p-4 font-bold mono outline-none ${errors.id ? 'border-red-500 bg-red-50' : 'border-[#262626]'}`}
                                        placeholder="V-12345678"
                                        required
                                   />
                                   {errors.id && <p className="mono text-[10px] text-red-500 font-bold">{errors.id}</p>}
                              </div>

                              {/* Teléfono */}
                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase">
                                        Teléfono Pago Móvil <span className="text-red-500">*</span>
                                   </label>
                                   <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => { setPhone(e.target.value); setErrors({ ...errors, phone: undefined }); }}
                                        className={`w-full border-4 p-4 font-bold mono outline-none ${errors.phone ? 'border-red-500 bg-red-50' : 'border-[#262626]'}`}
                                        placeholder="04121234567"
                                        required
                                   />
                                   {errors.phone && <p className="mono text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                              </div>
                         </div>

                         {/* WhatsApp - Full width */}
                         <div className="space-y-2">
                              <label className="mono text-[10px] font-black uppercase flex items-center gap-2">
                                   <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                   </svg>
                                   WhatsApp <span className="text-red-500">*</span>
                                   <span className="text-gray-400 font-normal">(Te contactaremos aquí)</span>
                              </label>
                              <input
                                   type="text"
                                   value={whatsapp}
                                   onChange={(e) => { setWhatsapp(e.target.value); setErrors({ ...errors, whatsapp: undefined }); }}
                                   className={`w-full border-4 p-4 font-bold mono outline-none ${errors.whatsapp ? 'border-red-500 bg-red-50' : 'border-[#262626]'}`}
                                   placeholder="04121234567"
                                   required
                              />
                              {errors.whatsapp && <p className="mono text-[10px] text-red-500 font-bold">{errors.whatsapp}</p>}
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
                                   href={`https://wa.me/584121030740?text=Hola!%20Mi%20ticket%20es%20${paymentInfo.ticketId}`}
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
