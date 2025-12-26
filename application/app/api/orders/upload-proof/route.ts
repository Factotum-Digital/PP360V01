import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Use service_role to bypass RLS for server-side updates
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('[API-INIT] Supabase URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('[API-INIT] Service Role Key:', supabaseKey ? `SET (${supabaseKey.slice(0, 20)}...)` : 'MISSING');

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();
          const { ticketId, proofUrl } = body;

          console.log('[UPLOAD-PROOF] Received:', { ticketId, proofUrl });
          console.log('[UPLOAD-PROOF] Using URL:', supabaseUrl ? 'SET' : 'MISSING');

          if (!ticketId || !proofUrl) {
               console.log('[UPLOAD-PROOF] Missing fields:', { ticketId, proofUrl });
               return NextResponse.json(
                    { error: "Ticket ID y URL son requeridos" },
                    { status: 400 }
               );
          }


          // 1. Verificar orden
          console.log('[UPLOAD-PROOF] Querying order with ticket_id:', ticketId);
          const { data: order, error: findError } = await supabaseAdmin
               .from("exchange_orders")
               .select("order_id")
               .eq("ticket_id", ticketId)
               .single();

          console.log('[UPLOAD-PROOF] Query result:', { order, findError });

          if (findError || !order) {
               console.error('[UPLOAD-PROOF] Order not found or error:', findError);
               return NextResponse.json(
                    { error: "Orden no encontrada", details: findError?.message },
                    { status: 404 }
               );
          }

          // 2. Actualizar estado y URL
          const { error: updateError } = await supabaseAdmin
               .from("exchange_orders")
               .update({
                    payment_proof_url: proofUrl,
                    status: 'VERIFYING'
               })
               .eq("ticket_id", ticketId);

          if (updateError) {
               console.error("DB Update Error:", updateError);
               return NextResponse.json(
                    { error: "Error al actualizar la orden" },
                    { status: 500 }
               );
          }

          return NextResponse.json({ success: true });

     } catch (error) {
          console.error("Upload status error:", error);
          return NextResponse.json(
               { error: "Error interno del servidor" },
               { status: 500 }
          );
     }
}
