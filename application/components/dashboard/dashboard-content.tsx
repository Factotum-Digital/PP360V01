"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Slab, Tag } from '@/components/ui/brutalist-system';
import { PayPalServiceButton } from '@/components/features/paypal-service-button';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/admin-config';
import type { User } from '@supabase/supabase-js';
import type { ExchangeOrder } from '@/lib/supabase/database.types';
import { NewOrderForm } from './new-order-form';
import { ProfileModal } from './profile-modal';
import {
     getStatusColor,
     archiveOrder as archiveOrderUtil,
     unarchiveOrder as unarchiveOrderUtil,
     uploadPaymentProof,
     updateOrderWithProof
} from '@/lib/utils/order-utils';

interface DashboardContentProps {
     user: User;
     orders: ExchangeOrder[];
     currentRate: number;
     paraleloRate?: number;
}

export function DashboardContent({ user, orders, currentRate, paraleloRate }: DashboardContentProps) {
     const [showNewOrder, setShowNewOrder] = useState(false);
     const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
     const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
     const [uploadedOrderIds, setUploadedOrderIds] = useState<string[]>([]);
     const [showProfile, setShowProfile] = useState(false);
     const [showArchived, setShowArchived] = useState(false);
     const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'PENDING' | null>(null);
     const router = useRouter();
     const supabase = useMemo(() => createClient(), []);

     const handleLogout = useCallback(async () => {
          await supabase.auth.signOut();
          router.push('/');
          router.refresh();
     }, [supabase, router]);

     // Memoized order filtering - reemplaza la IIFE
     const filteredOrders = useMemo(() => {
          return orders.filter(o => {
               if (showArchived) return o.is_archived;
               if (statusFilter === 'COMPLETED') return o.status === 'COMPLETED' && !o.is_archived;
               if (statusFilter === 'PENDING') return o.status === 'PENDING' && !o.is_archived;
               return !o.is_archived;
          });
     }, [orders, showArchived, statusFilter]);

     // Memoized stats
     const stats = useMemo(() => ({
          total: orders.filter(o => !o.is_archived).length,
          completed: orders.filter(o => o.status === 'COMPLETED' && !o.is_archived).length,
          pending: orders.filter(o => o.status === 'PENDING').length,
     }), [orders]);

     const handleOrderUpload = useCallback(async (
          e: React.ChangeEvent<HTMLInputElement>,
          orderId: string,
          ticketId: string | null
     ) => {
          if (!e.target.files || e.target.files.length === 0) return;
          setUploadingOrderId(orderId);

          try {
               const file = e.target.files[0];
               const fileExt = file.name.split('.').pop();
               const ticketRef = ticketId || orderId.slice(0, 8);
               const fileName = `${ticketRef}_${Date.now()}.${fileExt}`;

               const uploadResult = await uploadPaymentProof(file, `${ticketRef}/${fileName}`);

               if (!uploadResult.success || !uploadResult.publicUrl) {
                    throw new Error(uploadResult.error || 'Error al subir');
               }

               await updateOrderWithProof(orderId, ticketId, uploadResult.publicUrl);
               setUploadedOrderIds(prev => [...prev, orderId]);
               router.refresh();
          } catch (error) {
               alert(`Error al subir: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          } finally {
               setUploadingOrderId(null);
          }
     }, [router]);

     const handleArchiveOrder = useCallback(async (orderId: string) => {
          const result = await archiveOrderUtil(orderId);
          if (!result.success) {
               alert(result.error);
          } else {
               router.refresh();
          }
     }, [router]);

     const handleUnarchiveOrder = useCallback(async (orderId: string) => {
          const result = await unarchiveOrderUtil(orderId);
          if (!result.success) {
               alert(result.error);
          } else {
               router.refresh();
          }
     }, [router]);

     const toggleExpanded = useCallback((orderId: string) => {
          setExpandedOrderId(prev => prev === orderId ? null : orderId);
     }, []);

     return (
          <div className="space-y-8">
               {/* Header */}
               <div className="flex justify-between items-start">
                    <div>
                         <div className="flex items-center gap-3">
                              <Tag active>DASHBOARD</Tag>
                              {paraleloRate && (
                                   <div className="mono text-xs font-bold text-[#FF4D00]">
                                        PARALELO: {paraleloRate.toFixed(2)} VES
                                   </div>
                              )}
                         </div>
                         <h1 className="text-4xl font-black uppercase tracking-tighter mt-4">
                              Panel de Usuario
                         </h1>
                         <p className="mono text-xs font-bold text-gray-500 mt-2">
                              {user.email} // SESSION_ACTIVE
                         </p>
                    </div>
                    <div className="flex gap-2">
                         {isAdmin(user.email) && (
                              <Link href="/admin">
                                   <Slab className="w-24 py-3 text-center justify-center mono text-xs font-black uppercase cursor-pointer bg-[#FF4D00] text-white hover:bg-[#e04400]">
                                        ADMIN
                                   </Slab>
                              </Link>
                         )}
                         <Slab
                              className="w-24 py-3 text-center justify-center mono text-xs font-black uppercase cursor-pointer bg-white border-2 border-[#262626] hover:bg-gray-100"
                              onClick={() => setShowProfile(true)}
                         >
                              PERFIL
                         </Slab>
                         <Slab
                              className="w-24 py-3 text-center justify-center mono text-xs font-black uppercase cursor-pointer bg-[#262626] text-white hover:bg-[#404040]"
                              onClick={handleLogout}
                         >
                              LOGOUT
                         </Slab>
                    </div>
               </div>

               {/* Stats Row - 5 cards */}
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Slab
                         className={`p-6 text-center cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-4 ring-[#FF4D00]' : 'hover:ring-2 hover:ring-gray-300'}`}
                         onClick={() => { setStatusFilter(statusFilter === 'all' ? null : 'all'); setShowArchived(false); }}
                    >
                         <div className="text-3xl font-black">{stats.total}</div>
                         <div className="mono text-[10px] font-bold uppercase text-gray-500">Total Órdenes</div>
                    </Slab>
                    <Slab
                         className={`p-6 text-center bg-[#262626] text-white cursor-pointer transition-all ${statusFilter === 'COMPLETED' ? 'ring-4 ring-[#FF4D00]' : 'hover:ring-2 hover:ring-gray-500'}`}
                         onClick={() => { setStatusFilter(statusFilter === 'COMPLETED' ? null : 'COMPLETED'); setShowArchived(false); }}
                    >
                         <div className="text-3xl font-black text-[#FF4D00]">{stats.completed}</div>
                         <div className="mono text-[10px] font-bold uppercase">Completadas</div>
                    </Slab>
                    <Slab
                         className={`p-6 text-center bg-[#FF4D00] text-white cursor-pointer transition-all ${statusFilter === 'PENDING' ? 'ring-4 ring-[#262626]' : 'hover:ring-2 hover:ring-orange-300'}`}
                         onClick={() => { setStatusFilter(statusFilter === 'PENDING' ? null : 'PENDING'); setShowArchived(false); }}
                    >
                         <div className="text-3xl font-black">{stats.pending}</div>
                         <div className="mono text-[10px] font-bold uppercase">Pendientes</div>
                    </Slab>
                    <Slab className="p-6 text-center bg-orange-100">
                         <div className="text-3xl font-black">{currentRate.toFixed(2)}</div>
                         <div className="mono text-[10px] font-bold uppercase text-gray-500">Tasa Actual</div>
                    </Slab>
                    <Slab className="p-6 text-center bg-green-100">
                         <div className="text-3xl font-black text-green-600">0</div>
                         <div className="mono text-[10px] font-bold uppercase text-gray-500">Referidos</div>
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
               {showNewOrder && (
                    <NewOrderForm
                         currentRate={currentRate}
                         paraleloRate={paraleloRate || currentRate}
                         onComplete={() => {
                              setShowNewOrder(false);
                              router.refresh();
                         }}
                    />
               )}

               {/* Orders List */}
               <Slab className="p-6">
                    <div className="flex justify-between items-center mb-6">
                         <h2 className="mono text-sm font-black uppercase flex items-center gap-2">
                              <span className="w-2 h-2 bg-[#FF4D00]"></span>
                              Historial de Órdenes
                              {statusFilter && (
                                   <span className="text-[#FF4D00] text-xs">
                                        ({statusFilter === 'all' ? 'Todas' : statusFilter === 'COMPLETED' ? 'Completadas' : 'Pendientes'})
                                   </span>
                              )}
                         </h2>
                         <div className="flex gap-2">
                              {statusFilter && (
                                   <button
                                        onClick={() => setStatusFilter(null)}
                                        className="mono text-[10px] font-bold uppercase px-3 py-1 border-2 border-red-400 text-red-500 hover:bg-red-50"
                                   >
                                        ✕ Limpiar Filtro
                                   </button>
                              )}
                              <button
                                   onClick={() => { setShowArchived(!showArchived); setStatusFilter(null); }}
                                   className={`mono text-[10px] font-bold uppercase px-3 py-1 border-2 transition-colors ${showArchived
                                        ? 'bg-[#262626] text-white border-[#262626]'
                                        : 'bg-white text-gray-500 border-gray-300 hover:border-[#262626]'
                                        }`}
                              >
                                   {showArchived ? '📁 Ocultar Archivados' : '📁 Ver Archivados'}
                              </button>
                         </div>
                    </div>

                    {filteredOrders.length === 0 ? (
                         <div className="text-center py-12">
                              <p className="mono text-sm font-bold text-gray-400">
                                   {showArchived
                                        ? 'No tienes órdenes archivadas.'
                                        : statusFilter
                                             ? `No tienes órdenes ${statusFilter === 'COMPLETED' ? 'completadas' : 'pendientes'}.`
                                             : 'No tienes órdenes todavía. ¡Crea tu primera orden!'
                                   }
                              </p>
                         </div>
                    ) : (
                         <div className="space-y-4">
                              {filteredOrders.map((order) => (
                                   <OrderCard
                                        key={order.order_id}
                                        order={order}
                                        isExpanded={expandedOrderId === order.order_id}
                                        isUploading={uploadingOrderId === order.order_id}
                                        isUploaded={uploadedOrderIds.includes(order.order_id)}
                                        onToggleExpand={() => toggleExpanded(order.order_id)}
                                        onUpload={(e) => handleOrderUpload(e, order.order_id, order.ticket_id)}
                                        onArchive={() => handleArchiveOrder(order.order_id)}
                                        onUnarchive={() => handleUnarchiveOrder(order.order_id)}
                                   />
                              ))}
                         </div>
                    )}
               </Slab>

               {/* Profile Modal */}
               {showProfile && (
                    <ProfileModal
                         userId={user.id}
                         onClose={() => setShowProfile(false)}
                    />
               )}
          </div>
     );
}

// Order Card Component - memoizado para evitar re-renders innecesarios
interface OrderCardProps {
     order: ExchangeOrder;
     isExpanded: boolean;
     isUploading: boolean;
     isUploaded: boolean;
     onToggleExpand: () => void;
     onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
     onArchive: () => void;
     onUnarchive: () => void;
}

const OrderCard = React.memo(function OrderCard({
     order,
     isExpanded,
     isUploading,
     isUploaded,
     onToggleExpand,
     onUpload,
     onArchive,
     onUnarchive
}: OrderCardProps) {
     const router = useRouter();

     return (
          <div className={`border-4 ${order.is_archived ? 'border-gray-300 opacity-70' : 'border-[#262626]'}`}>
               {/* Order Header - Clickeable */}
               <div
                    className="p-4 bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={onToggleExpand}
               >
                    <div className="flex items-center gap-4">
                         <span className={`${getStatusColor(order.status)} text-white px-2 py-1 text-[10px] font-black`}>
                              {order.status}
                         </span>
                         <span className="mono text-xs font-bold">
                              #{order.ticket_id || order.order_id.slice(0, 8)}
                         </span>
                    </div>
                    <div className="flex items-center gap-4 mono text-xs">
                         <span className="font-black">${order.amount_sent.toFixed(2)} USD</span>
                         <span className="text-[#FF4D00] font-black">{order.amount_received.toLocaleString('es-VE')} VES</span>
                         <span className="text-gray-400 hidden sm:inline">{new Date(order.created_at).toLocaleDateString()}</span>
                         {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
                              <button
                                   onClick={(e) => {
                                        e.stopPropagation();
                                        order.is_archived ? onUnarchive() : onArchive();
                                   }}
                                   className={`px-3 py-1 text-xs font-black border-2 transition-colors uppercase ${order.is_archived
                                        ? 'border-green-500 text-green-500 hover:bg-green-50'
                                        : 'border-[#262626] text-[#262626] hover:bg-gray-100 bg-white'
                                        }`}
                                   title={order.is_archived ? 'Desarchivar' : 'Archivar'}
                              >
                                   {order.is_archived ? '↩️' : '🗑️'}
                              </button>
                         )}
                         <span className="text-xl">{isExpanded ? '−' : '+'}</span>
                    </div>
               </div>

               {/* Order Details - Expandible */}
               {isExpanded && (
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
                                   <div className="bg-orange-50 p-4 border-l-4 border-[#FF4D00] space-y-4">
                                        {/* Manual Instructions Section */}
                                        <div className="space-y-2 border-b-2 border-orange-200 pb-4 mb-2">
                                             <h4 className="mono text-sm font-black uppercase underline decoration-[#FF4D00]">Instrucciones de Pago:</h4>
                                             <ol className="space-y-1">
                                                  <li className="mono text-[11px] font-bold text-gray-700">1. Envía ${order.amount_sent.toFixed(2)} USD a: pagos@pp360ve.com</li>
                                                  <li className="mono text-[11px] font-bold text-gray-700">2. En la nota del pago coloca: {order.ticket_id || order.order_id.slice(0, 8)}</li>
                                                  <li className="mono text-[11px] font-bold text-gray-700">3. Envía captura del pago por WhatsApp</li>
                                                  <li className="mono text-[11px] font-bold text-gray-700">4. Recibirás Bs. {order.amount_received.toLocaleString('es-VE')} en tu cuenta</li>
                                             </ol>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                             {/* QR Code Section */}
                                             <div className="bg-white p-2 border-4 border-[#262626] shadow-[4px_4px_0px_0px_#262626] flex-shrink-0 mx-auto md:mx-0">
                                                  <QRCodeSVG
                                                       value={`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=sb-43h8a33591630@business.example.com&currency_code=USD&amount=${order.amount_sent}&item_name=Order${order.ticket_id || order.order_id}`}
                                                       size={140}
                                                       level={'H'}
                                                       includeMargin={true}
                                                  />
                                                  <p className="text-[9px] font-bold text-center mt-2 mono">ESCANEAR PARA PAGAR</p>
                                             </div>

                                             {/* PayPal Button Section */}
                                             <div className="flex-1 space-y-3 w-full">
                                                  <div className="text-center md:text-left space-y-1">
                                                       <h4 className="mono text-sm font-black uppercase underline decoration-[#FF4D00]">Realizar Pago:</h4>
                                                       <p className="mono text-[10px] font-bold text-gray-600">Clic para pagar con PayPal (Auto-Verificación):</p>
                                                  </div>
                                                  <div className="w-full relative z-0">
                                                       <PayPalServiceButton
                                                            amount={order.amount_sent.toString()}
                                                            description={`Order #${order.ticket_id || order.order_id.slice(0, 8)} - Exchange ${order.amount_sent} USD`}
                                                            ticketId={order.ticket_id ?? undefined}
                                                            style={{ color: 'black', layout: "horizontal" }}
                                                            onSuccess={async () => {
                                                                 router.refresh();
                                                            }}
                                                       />
                                                  </div>
                                                  <p className="text-[9px] italic text-gray-500 leading-tight">
                                                       * Al completar el pago, el sistema verificará tu orden automáticamente.
                                                  </p>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Subir Comprobante */}
                                   {!isUploaded ? (
                                        <label className={`block w-full p-3 text-center font-black uppercase mono text-xs border-4 border-[#262626] cursor-pointer transition-colors ${isUploading ? 'bg-gray-400 text-gray-800' : 'bg-[#262626] text-white hover:bg-black'}`}>
                                             {isUploading ? 'SUBIENDO...' : '📁 SUBIR COMPROBANTE'}
                                             <input
                                                  type="file"
                                                  accept="image/*"
                                                  className="hidden"
                                                  onChange={onUpload}
                                                  disabled={isUploading}
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
                                        href={`https://api.whatsapp.com/send/?phone=15557745095&text=Hola!%20Mi%20ticket%20es%20${order.ticket_id || order.order_id.slice(0, 8)}`}
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
     );
});
