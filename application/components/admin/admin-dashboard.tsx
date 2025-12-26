"use client";

import React, { useState } from 'react';
import { Slab, Tag } from '@/components/ui/brutalist-system';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ExchangeOrder } from '@/lib/supabase/database.types';

interface AdminStats {
     total: number;
     guests: number;
     registered: number;
     pending: number;
     verifying: number;
     completed: number;
     cancelled: number;
     totalUSD: number;
     totalVES: number;
}

interface AdminDashboardProps {
     user: User;
     orders: ExchangeOrder[];
     stats: AdminStats;
     currentRate: number;
}

export function AdminDashboard({ user, orders, stats, currentRate }: AdminDashboardProps) {
     const [filter, setFilter] = useState<string>('ALL');
     const [updating, setUpdating] = useState<string | null>(null);
     const router = useRouter();
     const supabase = createClient();

     const handleLogout = async () => {
          await supabase.auth.signOut();
          router.push('/');
          router.refresh();
     };

     const updateOrderStatus = async (orderId: string, newStatus: string) => {
          setUpdating(orderId);

          const { error } = await supabase
               .from('exchange_orders')
               .update({ status: newStatus })
               .eq('order_id', orderId);

          if (error) {
               alert('Error al actualizar: ' + error.message);
          } else {
               router.refresh();
          }

          setUpdating(null);
     };

     const getStatusColor = (status: string) => {
          const upperStatus = status?.toUpperCase();
          switch (upperStatus) {
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

     const filteredOrders = filter === 'ALL'
          ? orders
          : filter === 'GUESTS'
               ? orders.filter(o => o.is_guest === true)
               : filter === 'REGISTERED'
                    ? orders.filter(o => o.is_guest !== true && o.user_id !== null)
                    : orders.filter(o => o.status?.toUpperCase() === filter);

     return (
          <div className="space-y-8">
               {/* Header */}
               <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                         <Tag active>ADMIN_TERMINAL</Tag>
                         <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mt-4">
                              Panel Administrativo
                         </h1>
                         <p className="mono text-xs font-bold text-gray-500 mt-2">
                              {user.email} // SUPERUSER_ACCESS
                         </p>
                    </div>
                    <div className="flex gap-2">
                         <Slab
                              className="p-3 mono text-xs font-black uppercase cursor-pointer"
                              onClick={() => router.push('/dashboard')}
                         >
                              DASHBOARD
                         </Slab>
                         <Slab
                              className="p-3 mono text-xs font-black uppercase cursor-pointer bg-[#262626] text-white"
                              onClick={handleLogout}
                         >
                              LOGOUT
                         </Slab>
                    </div>
               </div>

               {/* Stats Row */}
               <div className="grid md:grid-cols-6 gap-4">
                    <Slab
                         className={`p-4 text-center cursor-pointer transition-transform hover:scale-105 ${filter === 'ALL' ? 'ring-4 ring-black' : ''}`}
                         onClick={() => setFilter('ALL')}
                    >
                         <div className="text-2xl font-black">{stats.total}</div>
                         <div className="mono text-[10px] font-bold uppercase text-gray-500">Total</div>
                    </Slab>
                    <Slab
                         className={`p-4 text-center bg-yellow-100 cursor-pointer transition-transform hover:scale-105 ${filter === 'PENDING' ? 'ring-4 ring-yellow-600' : ''}`}
                         onClick={() => setFilter('PENDING')}
                    >
                         <div className="text-2xl font-black text-yellow-600">{stats.pending}</div>
                         <div className="mono text-[10px] font-bold uppercase">Pendientes</div>
                    </Slab>
                    <Slab
                         className={`p-4 text-center bg-blue-100 cursor-pointer transition-transform hover:scale-105 ${filter === 'VERIFYING' ? 'ring-4 ring-blue-600' : ''}`}
                         onClick={() => setFilter('VERIFYING')}
                    >
                         <div className="text-2xl font-black text-blue-600">{stats.verifying}</div>
                         <div className="mono text-[10px] font-bold uppercase">Verificando</div>
                    </Slab>
                    <Slab
                         className={`p-4 text-center bg-green-100 cursor-pointer transition-transform hover:scale-105 ${filter === 'COMPLETED' ? 'ring-4 ring-green-600' : ''}`}
                         onClick={() => setFilter('COMPLETED')}
                    >
                         <div className="text-2xl font-black text-green-600">{stats.completed}</div>
                         <div className="mono text-[10px] font-bold uppercase">Completadas</div>
                    </Slab>
                    <Slab className="p-4 text-center bg-[#FF4D00] text-white">
                         <div className="text-2xl font-black">${stats.totalUSD.toFixed(0)}</div>
                         <div className="mono text-[10px] font-bold uppercase">Total USD</div>
                    </Slab>
                    <Slab className="p-4 text-center bg-[#262626] text-white">
                         <div className="text-2xl font-black text-[#FF4D00]">{currentRate.toFixed(2)}</div>
                         <div className="mono text-[10px] font-bold uppercase">Tasa Pago</div>
                    </Slab>
               </div>

               {/* Filter Buttons */}
               <div className="flex gap-2 flex-wrap">
                    {['ALL', 'GUESTS', 'REGISTERED', 'PENDING', 'VERIFYING', 'COMPLETED', 'CANCELLED'].map((status) => (
                         <button
                              key={status}
                              onClick={() => setFilter(status)}
                              className={`px-4 py-2 mono text-xs font-black uppercase border-4 border-[#262626] transition-colors ${filter === status
                                   ? status === 'GUESTS' ? 'bg-purple-600 text-white'
                                        : status === 'REGISTERED' ? 'bg-blue-600 text-white'
                                             : 'bg-[#262626] text-white'
                                   : status === 'GUESTS' ? 'bg-purple-100 hover:bg-purple-200'
                                        : status === 'REGISTERED' ? 'bg-blue-100 hover:bg-blue-200'
                                             : 'bg-white hover:bg-gray-100'
                                   }`}
                         >
                              {status === 'ALL' ? 'TODAS' : status === 'GUESTS' ? '👤 GUESTS' : status === 'REGISTERED' ? '✓ REGISTERED' : status}
                         </button>
                    ))}
               </div>

               {/* Orders List */}
               <Slab className="p-6">
                    <h2 className="mono text-sm font-black uppercase mb-6 flex items-center gap-2">
                         <span className="w-2 h-2 bg-[#FF4D00]"></span>
                         Órdenes ({filteredOrders.length})
                    </h2>

                    {filteredOrders.length === 0 ? (
                         <div className="text-center py-12">
                              <p className="mono text-sm font-bold text-gray-400">
                                   No hay órdenes con este filtro.
                              </p>
                         </div>
                    ) : (
                         <div className="space-y-4">
                              {filteredOrders.map((order) => (
                                   <OrderCard
                                        key={order.order_id}
                                        order={order}
                                        onUpdateStatus={updateOrderStatus}
                                        updating={updating === order.order_id}
                                        getStatusColor={getStatusColor}
                                   />
                              ))}
                         </div>
                    )}
               </Slab>
          </div>
     );
}

// Order Card Component
function OrderCard({
     order,
     onUpdateStatus,
     updating,
     getStatusColor
}: {
     order: ExchangeOrder;
     onUpdateStatus: (id: string, status: string) => void;
     updating: boolean;
     getStatusColor: (status: string) => string;
}) {
     const [expanded, setExpanded] = useState(false);

     // Check if order has payment data (from individual columns or destination_data)
     const hasPaymentData = order.bank_name || order.phone_pago_movil || order.id_number || order.whatsapp || order.paypal_email || order.destination_data;

     return (
          <div className="border-4 border-[#262626] bg-white">
               {/* Header Row */}
               <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpanded(!expanded)}
               >
                    <div className="flex items-center gap-4">
                         <span className={`${getStatusColor(order.status)} text-white px-2 py-1 mono text-[10px] font-black`}>
                              {order.status}
                         </span>
                         <span className="mono text-xs font-bold">
                              #{order.order_id.slice(0, 8)}
                         </span>
                    </div>
                    <div className="flex items-center gap-6">
                         <div className="text-right">
                              <div className="font-black">${order.amount_sent}</div>
                              <div className="mono text-[10px] text-gray-500">USD</div>
                         </div>
                         <div className="text-right">
                              <div className="font-black text-[#FF4D00]">{Number(order.amount_received).toLocaleString('es-VE')}</div>
                              <div className="mono text-[10px] text-gray-500">VES</div>
                         </div>
                         <div className="text-right">
                              <div className="mono text-xs">{new Date(order.created_at).toLocaleDateString()}</div>
                              <div className="mono text-[10px] text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</div>
                         </div>
                         <span className="text-2xl">{expanded ? '−' : '+'}</span>
                    </div>
               </div>

               {/* Expanded Details */}
               {expanded && (
                    <div className="border-t-4 border-[#262626] p-4 bg-gray-50">
                         <div className="grid md:grid-cols-2 gap-6">
                              {/* Order Info */}
                              <div className="space-y-3">
                                   <h4 className="mono text-xs font-black uppercase underline decoration-[#FF4D00]">Datos de la Orden</h4>
                                   <div className="mono text-xs space-y-1">
                                        <p><span className="opacity-50">ID:</span> {order.order_id.slice(0, 8)}...</p>
                                        {order.ticket_id && <p><span className="opacity-50">Ticket:</span> <span className="font-bold text-[#FF4D00]">{order.ticket_id}</span></p>}
                                        <p><span className="opacity-50">Email:</span> <span className="font-bold">{order.paypal_email || 'N/A'}</span></p>
                                        <p><span className="opacity-50">Envía:</span> ${order.amount_sent} {order.currency_sent}</p>
                                        <p><span className="opacity-50">Recibe:</span> {Number(order.amount_received).toLocaleString('es-VE')} {order.currency_received}</p>
                                        <p><span className="opacity-50">Tasa:</span> {order.exchange_rate ? order.exchange_rate.toFixed(2) : 'N/A'} VES/USD</p>
                                        <p><span className="opacity-50">Fecha:</span> {new Date(order.created_at).toLocaleString()}</p>
                                        {order.is_guest && <span className="inline-block bg-purple-200 text-purple-800 px-2 py-0.5 font-bold text-[10px] mt-1">GUEST</span>}
                                        {!order.is_guest && order.user_id && <span className="inline-block bg-blue-200 text-blue-800 px-2 py-0.5 font-bold text-[10px] mt-1">REGISTRADO</span>}

                                        {/* Payment Method Badge */}
                                        {(() => {
                                             const data = order.destination_data as any;
                                             const method = data?.payment_method;

                                             // GUESTS are always Pago Móvil
                                             if (order.is_guest || method === 'pago_movil') {
                                                  return <span className="inline-block bg-orange-100 text-orange-800 px-2 py-0.5 font-bold text-[10px] mt-1 ml-2">PAGO MÓVIL</span>;
                                             } else if (method === 'transferencia') {
                                                  return <span className="inline-block bg-gray-200 text-gray-800 px-2 py-0.5 font-bold text-[10px] mt-1 ml-2">TRANSFERENCIA</span>;
                                             }
                                             return null;
                                        })()}
                                   </div>
                              </div>

                              {/* Destination Data */}
                              <div className="space-y-3">
                                   <h4 className="mono text-xs font-black uppercase underline decoration-[#FF4D00]">Datos de Pago</h4>
                                   {hasPaymentData ? (
                                        <div className="mono text-xs space-y-1">
                                             <p><span className="opacity-50">Método:</span> <span className="font-bold uppercase bg-gray-100 px-1">{
                                                  order.is_guest || (order.destination_data as any)?.payment_method === 'pago_movil' ? 'Pago Móvil' :
                                                       (order.destination_data as any)?.payment_method === 'transferencia' ? 'Transferencia' : 'N/A'
                                             }</span></p>
                                             <p><span className="opacity-50">Banco:</span> <span className="font-bold">{order.bank_name || 'N/A'}</span></p>
                                             <p><span className="opacity-50">Cédula:</span> <span className="font-bold">{order.id_number || 'N/A'}</span></p>
                                             <p><span className="opacity-50">Teléfono:</span> <span className="font-bold">{order.phone_pago_movil || 'N/A'}</span></p>
                                             <p><span className="opacity-50">WhatsApp:</span> <span className="font-bold">{order.whatsapp || 'N/A'}</span></p>
                                        </div>
                                   ) : (
                                        <p className="mono text-xs text-gray-400">Sin datos de destino</p>
                                   )}

                                   {/* WhatsApp Contact Button */}
                                   {order.whatsapp && (
                                        <a
                                             href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}?text=Hola!%20Soy%20de%20PP360VE.%20Tu%20orden%20${order.ticket_id || order.order_id.slice(0, 8)}%20está%20siendo%20procesada.`}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="inline-flex items-center gap-2 bg-green-500 text-white px-3 py-2 font-bold text-xs uppercase hover:bg-green-600 transition-colors mt-2"
                                        >
                                             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                             </svg>
                                             Contactar Cliente
                                        </a>
                                   )}
                              </div>
                         </div>

                         {/* Action Buttons */}
                         {order.payment_proof_url && (
                              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                   <h4 className="mono text-xs font-black uppercase underline decoration-[#FF4D00] mb-2">Comprobante de Pago</h4>
                                   {order.payment_proof_url.startsWith('PAYPAL_AUTO_') ? (
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                                             <p className="mono text-[10px] font-black text-blue-800 uppercase mb-1">
                                                  ✓ Pago Verificado por PayPal
                                             </p>
                                             <p className="mono text-xs font-bold text-gray-600">
                                                  ID Transacción: <span className="text-black">{order.payment_proof_url.replace('PAYPAL_AUTO_', '')}</span>
                                             </p>
                                        </div>
                                   ) : (
                                        <a
                                             href={order.payment_proof_url}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="inline-block"
                                        >
                                             <img
                                                  src={order.payment_proof_url}
                                                  alt="Comprobante"
                                                  className="max-h-48 border-2 border-black hover:scale-105 transition-transform"
                                             />
                                        </a>
                                   )}
                              </div>
                         )}

                         <div className="flex gap-2 mt-6 pt-4 border-t-2 border-gray-200">
                              {order.status === 'PENDING' && (
                                   <>
                                        <button
                                             onClick={() => onUpdateStatus(order.order_id, 'VERIFYING')}
                                             disabled={updating}
                                             className="px-4 py-2 bg-blue-500 text-white mono text-xs font-black uppercase disabled:opacity-50"
                                        >
                                             {updating ? '...' : 'VERIFICANDO'}
                                        </button>
                                        <button
                                             onClick={() => onUpdateStatus(order.order_id, 'COMPLETED')}
                                             disabled={updating}
                                             className="px-4 py-2 bg-green-500 text-white mono text-xs font-black uppercase disabled:opacity-50"
                                        >
                                             {updating ? '...' : 'COMPLETAR'}
                                        </button>
                                        <button
                                             onClick={() => onUpdateStatus(order.order_id, 'CANCELLED')}
                                             disabled={updating}
                                             className="px-4 py-2 bg-red-500 text-white mono text-xs font-black uppercase disabled:opacity-50"
                                        >
                                             {updating ? '...' : 'CANCELAR'}
                                        </button>
                                   </>
                              )}
                              {order.status === 'VERIFYING' && (
                                   <>
                                        <button
                                             onClick={() => onUpdateStatus(order.order_id, 'COMPLETED')}
                                             disabled={updating}
                                             className="px-4 py-2 bg-green-500 text-white mono text-xs font-black uppercase disabled:opacity-50"
                                        >
                                             {updating ? '...' : 'MARCAR PAGADO'}
                                        </button>
                                        <button
                                             onClick={() => onUpdateStatus(order.order_id, 'CANCELLED')}
                                             disabled={updating}
                                             className="px-4 py-2 bg-red-500 text-white mono text-xs font-black uppercase disabled:opacity-50"
                                        >
                                             {updating ? '...' : 'RECHAZAR'}
                                        </button>
                                   </>
                              )}
                              {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
                                   <span className="mono text-xs text-gray-400 italic">
                                        Orden finalizada - No hay acciones disponibles
                                   </span>
                              )}
                         </div>
                    </div>
               )}
          </div>
     );
}
