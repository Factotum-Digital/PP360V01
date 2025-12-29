import { createClient } from '@/lib/supabase/client';
import jsPDF from 'jspdf';
import type { ExchangeOrder } from '@/lib/supabase/database.types';

/**
 * Utilidades compartidas para operaciones de órdenes
 * Centralizadas para evitar duplicación entre dashboard y admin
 */

/**
 * Retorna el color de fondo basado en el status de una orden
 */
export function getStatusColor(status: string): string {
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
}

/**
 * Archiva una orden (marca como is_archived = true)
 */
export async function archiveOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
     const supabase = createClient();
     try {
          const { error } = await supabase
               .from('exchange_orders')
               .update({ is_archived: true })
               .eq('order_id', orderId);

          if (error) throw error;
          return { success: true };
     } catch (error) {
          console.error('Error archivando orden:', error);
          return { success: false, error: 'Error al archivar la orden' };
     }
}

/**
 * Desarchiva una orden (marca como is_archived = false)
 */
export async function unarchiveOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
     const supabase = createClient();
     try {
          const { error } = await supabase
               .from('exchange_orders')
               .update({ is_archived: false })
               .eq('order_id', orderId);

          if (error) throw error;
          return { success: true };
     } catch (error) {
          console.error('Error desarchivando orden:', error);
          return { success: false, error: 'Error al desarchivar la orden' };
     }
}

/**
 * Valida y sube un comprobante de pago
 * @param file - Archivo a subir
 * @param path - Ruta en el bucket (ej: "TICKET123/filename.jpg")
 * @returns URL pública del archivo subido
 */
export async function uploadPaymentProof(
     file: File,
     path: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
     // Validaciones
     if (!file.type.startsWith('image/')) {
          return { success: false, error: 'Solo se permiten imágenes' };
     }

     if (file.size > 2 * 1024 * 1024) {
          return { success: false, error: 'El archivo es muy grande (máx 2MB)' };
     }

     const supabase = createClient();

     try {
          const { error: uploadError } = await supabase.storage
               .from('payment-proofs')
               .upload(path, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
               .from('payment-proofs')
               .getPublicUrl(path);

          return { success: true, publicUrl };
     } catch (error) {
          console.error('Error subiendo comprobante:', error);
          return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
     }
}

/**
 * Actualiza el estado de una orden después de subir comprobante
 */
export async function updateOrderWithProof(
     orderId: string | null,
     ticketId: string | null,
     proofUrl: string
): Promise<{ success: boolean; error?: string }> {
     const supabase = createClient();

     try {
          const query = supabase
               .from('exchange_orders')
               .update({ payment_proof_url: proofUrl, status: 'VERIFYING' });

          // Usar ticket_id o order_id según esté disponible
          if (ticketId) {
               await query.eq('ticket_id', ticketId);
          } else if (orderId) {
               await query.eq('order_id', orderId);
          } else {
               return { success: false, error: 'Se requiere orderId o ticketId' };
          }

          return { success: true };
     } catch (error) {
          console.error('Error actualizando orden:', error);
          return { success: false, error: 'Error al actualizar la orden' };
     }
}

/**
 * Genera un ticket ID único para nuevas órdenes
 */
export function generateTicketId(): string {
     return `P360-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ===== EXPORTACIÓN PDF - FACTURA PROFESIONAL =====

/**
 * Genera una factura PDF profesional para una orden
 */
export function generateInvoicePDF(order: ExchangeOrder): void {
     const doc = new jsPDF();
     const ticket = order.ticket_id || order.order_id.slice(0, 8);
     const pageWidth = doc.internal.pageSize.getWidth();

     // Colors
     const orange = '#FF4D00';
     const dark = '#262626';

     // ===== HEADER =====
     doc.setFillColor(38, 38, 38);
     doc.rect(0, 0, pageWidth, 35, 'F');

     doc.setTextColor(255, 77, 0);
     doc.setFontSize(24);
     doc.setFont('helvetica', 'bold');
     doc.text('PP360VE', 20, 22);

     doc.setTextColor(255, 255, 255);
     doc.setFontSize(12);
     doc.text('FACTURA DE SERVICIO', pageWidth - 20, 15, { align: 'right' });
     doc.setFontSize(10);
     doc.text(`#${ticket}`, pageWidth - 20, 25, { align: 'right' });

     // ===== DATOS DEL DOCUMENTO =====
     doc.setTextColor(38, 38, 38);
     doc.setFontSize(10);
     doc.setFont('helvetica', 'normal');
     doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString('es-VE')}`, 20, 45);
     doc.text(`Hora: ${new Date(order.created_at).toLocaleTimeString('es-VE')}`, 20, 52);

     // Estado de la orden
     const statusText = order.status === 'COMPLETED' ? '✓ COMPLETADA' :
          order.status === 'PENDING' ? '⏳ PENDIENTE' :
               order.status === 'VERIFYING' ? '🔍 VERIFICANDO' : '✗ CANCELADA';
     doc.setFont('helvetica', 'bold');
     doc.text(`Estado: ${statusText}`, pageWidth - 20, 45, { align: 'right' });

     // ===== DATOS DEL CLIENTE =====
     doc.setDrawColor(255, 77, 0);
     doc.setLineWidth(0.5);
     doc.line(20, 60, pageWidth - 20, 60);

     doc.setFontSize(11);
     doc.setFont('helvetica', 'bold');
     doc.text('DATOS DEL CLIENTE', 20, 70);

     doc.setFont('helvetica', 'normal');
     doc.setFontSize(10);
     doc.text(`Email PayPal: ${order.paypal_email || 'N/A'}`, 20, 80);
     doc.text(`WhatsApp: ${order.whatsapp || 'N/A'}`, 20, 87);

     // ===== DETALLE DE LA TRANSACCIÓN =====
     doc.line(20, 95, pageWidth - 20, 95);

     doc.setFontSize(11);
     doc.setFont('helvetica', 'bold');
     doc.text('DETALLE DE LA TRANSACCIÓN', 20, 105);

     // Calcular comisiones (según la lógica del sistema)
     const amountUSD = order.amount_sent;
     const paypalFee = (amountUSD * 0.054) + 0.30;
     const afterPaypal = amountUSD - paypalFee;
     const serviceFee = afterPaypal * 0.12;
     const netUSD = afterPaypal - serviceFee;

     doc.setFont('helvetica', 'normal');
     doc.setFontSize(10);

     let y = 115;
     const col1 = 20;
     const col2 = pageWidth - 20;

     const addRow = (label: string, value: string, bold = false) => {
          if (bold) doc.setFont('helvetica', 'bold');
          else doc.setFont('helvetica', 'normal');
          doc.text(label, col1, y);
          doc.text(value, col2, y, { align: 'right' });
          y += 8;
     };

     addRow('Monto enviado:', `$${amountUSD.toFixed(2)} USD`);
     addRow('Comisión PayPal (5.4% + $0.30):', `-$${paypalFee.toFixed(2)} USD`);
     addRow('Comisión servicio (12%):', `-$${serviceFee.toFixed(2)} USD`);

     doc.setDrawColor(200, 200, 200);
     doc.line(20, y, pageWidth - 20, y);
     y += 8;

     doc.setTextColor(255, 77, 0);
     addRow('NETO A RECIBIR:', `$${netUSD.toFixed(2)} USD`, true);

     doc.setTextColor(38, 38, 38);
     addRow('Tasa de cambio:', `${order.exchange_rate?.toFixed(2) || 'N/A'} VES/USD`);

     doc.setFontSize(12);
     doc.setFont('helvetica', 'bold');
     addRow('TOTAL EN BOLÍVARES:', `${Number(order.amount_received).toLocaleString('es-VE', { minimumFractionDigits: 2 })} VES`, true);

     // ===== DATOS DE PAGO DESTINO =====
     y += 5;
     doc.setDrawColor(255, 77, 0);
     doc.line(20, y, pageWidth - 20, y);
     y += 10;

     doc.setTextColor(38, 38, 38);
     doc.setFontSize(11);
     doc.setFont('helvetica', 'bold');
     doc.text('DATOS DE PAGO DESTINO', 20, y);
     y += 10;

     doc.setFontSize(10);
     doc.setFont('helvetica', 'normal');

     const destData = order.destination_data as { payment_method?: string } | null;
     const paymentMethod = destData?.payment_method === 'transferencia' ? 'Transferencia Bancaria' : 'Pago Móvil';

     doc.text(`Método: ${paymentMethod}`, 20, y);
     doc.text(`Banco: ${order.bank_name || 'N/A'}`, pageWidth / 2, y);
     y += 7;
     doc.text(`Cédula: ${order.id_number || 'N/A'}`, 20, y);
     doc.text(`Teléfono: ${order.phone_pago_movil || 'N/A'}`, pageWidth / 2, y);

     // ===== FOOTER =====
     doc.setFillColor(38, 38, 38);
     doc.rect(0, 270, pageWidth, 30, 'F');

     doc.setTextColor(255, 255, 255);
     doc.setFontSize(9);
     doc.setFont('helvetica', 'normal');
     doc.text('PP360VE | Servicio de Asesoría Profesional', pageWidth / 2, 280, { align: 'center' });
     doc.setFontSize(8);
     doc.setTextColor(180, 180, 180);
     doc.text('Documento informativo - No válido como factura fiscal', pageWidth / 2, 287, { align: 'center' });

     // Guardar
     doc.save(`factura_${ticket}.pdf`);
}

// ===== EXPORTACIÓN CSV (Solo Admin) =====

/**
 * Exporta múltiples órdenes a CSV
 */
export function exportOrdersToCSV(orders: ExchangeOrder[], filename: string): void {
     const headers = [
          'Ticket', 'Email', 'USD', 'VES', 'Tasa', 'Estado',
          'Tipo', 'Método', 'Banco', 'Cédula', 'Teléfono', 'WhatsApp', 'Fecha'
     ];

     const rows = orders.map(o => {
          const destData = o.destination_data as { payment_method?: string } | null;
          return [
               o.ticket_id || o.order_id.slice(0, 8),
               o.paypal_email || '',
               o.amount_sent.toString(),
               o.amount_received.toString(),
               o.exchange_rate?.toFixed(2) || '',
               o.status,
               o.is_guest ? 'GUEST' : 'REGISTRADO',
               destData?.payment_method || 'pago_movil',
               o.bank_name || '',
               o.id_number || '',
               o.phone_pago_movil || '',
               o.whatsapp || '',
               new Date(o.created_at).toLocaleString()
          ];
     });

     const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
     ].join('\n');

     const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
     link.click();
     URL.revokeObjectURL(url);
}

/**
 * Exporta múltiples órdenes a un PDF resumen (Solo Admin)
 */
export function exportBulkToPDF(orders: ExchangeOrder[], filter: string): void {
     const doc = new jsPDF();
     const pageWidth = doc.internal.pageSize.getWidth();

     // Header
     doc.setFillColor(38, 38, 38);
     doc.rect(0, 0, pageWidth, 25, 'F');

     doc.setTextColor(255, 77, 0);
     doc.setFontSize(16);
     doc.setFont('helvetica', 'bold');
     doc.text('PP360VE - Reporte de Órdenes', 20, 16);

     doc.setTextColor(255, 255, 255);
     doc.setFontSize(10);
     doc.text(`Filtro: ${filter} | Total: ${orders.length}`, pageWidth - 20, 16, { align: 'right' });

     // Tabla
     doc.setTextColor(38, 38, 38);
     doc.setFontSize(9);
     let y = 35;

     // Header de tabla
     doc.setFont('helvetica', 'bold');
     doc.text('#', 15, y);
     doc.text('Ticket', 25, y);
     doc.text('USD', 60, y);
     doc.text('VES', 85, y);
     doc.text('Estado', 120, y);
     doc.text('Fecha', 155, y);

     doc.line(15, y + 2, pageWidth - 15, y + 2);
     y += 8;

     doc.setFont('helvetica', 'normal');

     orders.forEach((o, i) => {
          if (y > 270) {
               doc.addPage();
               y = 20;
          }

          doc.text(`${i + 1}`, 15, y);
          doc.text(o.ticket_id || o.order_id.slice(0, 8), 25, y);
          doc.text(`$${o.amount_sent}`, 60, y);
          doc.text(o.amount_received.toLocaleString('es-VE'), 85, y);
          doc.text(o.status, 120, y);
          doc.text(new Date(o.created_at).toLocaleDateString(), 155, y);
          y += 6;
     });

     // Totales
     const totalUSD = orders.reduce((sum, o) => sum + o.amount_sent, 0);
     const totalVES = orders.reduce((sum, o) => sum + Number(o.amount_received), 0);

     y += 5;
     doc.line(15, y, pageWidth - 15, y);
     y += 8;
     doc.setFont('helvetica', 'bold');
     doc.text('TOTALES:', 15, y);
     doc.text(`$${totalUSD.toFixed(2)}`, 60, y);
     doc.text(totalVES.toLocaleString('es-VE'), 85, y);

     doc.save(`reporte_${filter.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
}
