import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Use service_role to bypass RLS for server-side updates
const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();
          const { ticketId, proofUrl } = body;

          console.log('[UPLOAD-PROOF] Received:', { ticketId, proofUrl });

          if (!ticketId || !proofUrl) {
               console.log('[UPLOAD-PROOF] Missing fields:', { ticketId, proofUrl });
               return NextResponse.json(
                    { error: "Ticket ID y URL son requeridos" },
                    { status: 400 }
               );
          }


          // 1. Verificar orden
          const { data: order, error: findError } = await supabaseAdmin
               .from("exchange_orders")
               .select("order_id")
               .eq("ticket_id", ticketId)
               .single();

          if (findError || !order) {
               return NextResponse.json(
                    { error: "Orden no encontrada" },
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
