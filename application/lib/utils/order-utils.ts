import { createClient } from '@/lib/supabase/client';

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
