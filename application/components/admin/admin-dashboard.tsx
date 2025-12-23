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
               <div className="flex justify-between items-start">
                    <div>
                         <Tag active>ADMIN_TERMINAL</Tag>
                         <h1 className="text-4xl font-black uppercase tracking-tighter mt-4">
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
                    <Slab className="p-4 text-center">
                         <div className="text-2xl font-black">{stats.total}</div>
                         <div className="mono text-[10px] font-bold uppercase text-gray-500">Total</div>
                    </Slab>
                    <Slab className="p-4 text-center bg-yellow-100">
                         <div className="text-2xl font-black text-yellow-600">{stats.pending}</div>
                         <div className="mono text-[10px] font-bold uppercase">Pendientes</div>
                    </Slab>
                    <Slab className="p-4 text-center bg-blue-100">
                         <div className="text-2xl font-black text-blue-600">{stats.verifying}</div>
                         <div className="mono text-[10px] font-bold uppercase">Verificando</div>
                    </Slab>
                    <Slab className="p-4 text-center bg-green-100">
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
                                        <p><span className="opacity-50">ID:</span> {order.order_id}</p>
                                        <p><span className="opacity-50">Usuario:</span> {order.user_id}</p>
                                        <p><span className="opacity-50">Envía:</span> ${order.amount_sent} {order.currency_sent}</p>
                                        <p><span className="opacity-50">Recibe:</span> {Number(order.amount_received).toLocaleString('es-VE')} {order.currency_received}</p>
                                        <p><span className="opacity-50">Fecha:</span> {new Date(order.created_at).toLocaleString()}</p>
                                   </div>
                              </div>

                              {/* Destination Data */}
                              <div className="space-y-3">
                                   <h4 className="mono text-xs font-black uppercase underline decoration-[#FF4D00]">Datos de Pago</h4>
                                   {hasPaymentData ? (
                                        <div className="mono text-xs space-y-1">
                                             {order.paypal_email && <p><span className="opacity-50">PayPal:</span> <span className="font-bold">{order.paypal_email}</span></p>}
                                             <p><span className="opacity-50">Banco:</span> <span className="font-bold">{order.bank_name || 'N/A'}</span></p>
                                             <p><span className="opacity-50">Cédula:</span> <span className="font-bold">{order.id_number || 'N/A'}</span></p>
                                             <p><span className="opacity-50">Teléfono:</span> <span className="font-bold">{order.phone_pago_movil || 'N/A'}</span></p>
                                             <p><span className="opacity-50">WhatsApp:</span> <span className="font-bold">{order.whatsapp || 'N/A'}</span></p>
                                             {order.ticket_id && <p><span className="opacity-50">Ticket:</span> <span className="font-bold text-[#FF4D00]">{order.ticket_id}</span></p>}
                                             {order.is_guest && <p><span className="bg-yellow-200 px-1 font-bold">GUEST</span></p>}
                                        </div>
                                   ) : (
                                        <p className="mono text-xs text-gray-400">Sin datos de destino</p>
                                   )}
                              </div>
                         </div>

                         {/* Action Buttons */}
                         {order.payment_proof_url && (
                              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                   <h4 className="mono text-xs font-black uppercase underline decoration-[#FF4D00] mb-2">Comprobante de Pago</h4>
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
