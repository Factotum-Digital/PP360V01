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

               {/* Orders Table */}
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
                         <div className="overflow-x-auto">
                              <table className="w-full mono text-xs">
                                   <thead>
                                        <tr className="border-b-4 border-[#262626]">
                                             <th className="text-left p-3 font-black uppercase">ID</th>
                                             <th className="text-left p-3 font-black uppercase">Enviado</th>
                                             <th className="text-left p-3 font-black uppercase">Recibido</th>
                                             <th className="text-left p-3 font-black uppercase">Status</th>
                                             <th className="text-left p-3 font-black uppercase">Fecha</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {orders.map((order) => (
                                             <tr key={order.order_id} className="border-b border-gray-200 hover:bg-gray-50">
                                                  <td className="p-3 font-bold">{order.order_id.slice(0, 8)}...</td>
                                                  <td className="p-3">${order.amount_sent.toFixed(2)} {order.currency_sent}</td>
                                                  <td className="p-3">{order.amount_received.toFixed(2)} {order.currency_received}</td>
                                                  <td className="p-3">
                                                       <span className={`${getStatusColor(order.status)} text-white px-2 py-1 text-[10px] font-black`}>
                                                            {order.status}
                                                       </span>
                                                  </td>
                                                  <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
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
     const [bank, setBank] = useState('Banesco');
     const [phone, setPhone] = useState('');
     const [idNumber, setIdNumber] = useState('');
     const [loading, setLoading] = useState(false);
     const supabase = createClient();

     const commission = 0.05;
     const netAmount = amount * (1 - commission);
     const vesAmount = netAmount * currentRate;

     const handleSubmit = async () => {
          setLoading(true);

          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
               alert('Error: Usuario no autenticado');
               setLoading(false);
               return;
          }

          const { error } = await supabase.from('exchange_orders').insert({
               user_id: user.id,
               amount_sent: amount,
               currency_sent: 'USD_PAYPAL',
               amount_received: vesAmount,
               currency_received: 'VES',
               status: 'PENDING',
               destination_data: {
                    bank,
                    phone,
                    id_number: idNumber,
               },
          });

          if (error) {
               alert('Error al crear la orden: ' + error.message);
               setLoading(false);
          } else {
               setStep(3);
               setLoading(false);
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
                         <h3 className="mono text-xl font-black uppercase">Paso 2: Datos de Pago</h3>

                         <div className="grid md:grid-cols-2 gap-4">
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
                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase">Teléfono Pago Móvil</label>
                                   <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full border-4 border-[#262626] p-4 font-bold mono outline-none"
                                        placeholder="04121234567"
                                   />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                   <label className="mono text-[10px] font-black uppercase">Cédula</label>
                                   <input
                                        type="text"
                                        value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)}
                                        className="w-full border-4 border-[#262626] p-4 font-bold mono outline-none"
                                        placeholder="V-12345678"
                                   />
                              </div>
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
                                   {loading ? 'PROCESANDO...' : 'CONFIRMAR ORDEN'}
                              </Slab>
                         </div>
                    </div>
               )}

               {step === 3 && (
                    <div className="text-center space-y-6">
                         <div className="w-20 h-20 bg-[#FF4D00] border-4 border-[#262626] flex items-center justify-center mx-auto">
                              <span className="text-4xl text-white">✓</span>
                         </div>
                         <h3 className="text-2xl font-black uppercase">ORDEN CREADA</h3>
                         <div className="bg-orange-50 border-l-4 border-[#FF4D00] p-4 text-left">
                              <p className="mono text-xs font-bold">
                                   INSTRUCCIONES: Envía ${amount} USD a nuestro PayPal y sube el comprobante.
                              </p>
                              <p className="mono text-xs font-bold text-[#FF4D00] mt-2">
                                   PayPal: pagos@pp360ve.com
                              </p>
                         </div>
                         <Slab
                              dark
                              className="p-4 text-center font-black uppercase bg-[#262626] cursor-pointer"
                              onClick={onComplete}
                         >
                              VER MIS ÓRDENES
                         </Slab>
                    </div>
               )}
          </Slab>
     );
}
