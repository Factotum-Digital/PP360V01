import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Validar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("CRITICAL: Missing Supabase env vars");
    return NextResponse.json(
      { error: "Configuration Error" },
      { status: 500 }
    );
  }

  // Cliente Admin (bypass RLS) - funciona para GUEST y registrados
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const body = await request.json();
    const { ticketId, proofUrl } = body;

    if (!ticketId || !proofUrl) {
      return NextResponse.json(
        { error: "Ticket ID y URL son requeridos" },
        { status: 400 }
      );
    }

    console.log(`[PayPal Verify] Processing: ${ticketId}`);

    // 1. Verificar que la orden existe
    const { data: order, error: findError } = await supabaseAdmin
      .from("exchange_orders")
      .select("order_id, status")
      .eq("ticket_id", ticketId)
      .single();

    if (findError || !order) {
      console.error(`[PayPal Verify] Order not found: ${ticketId}`, findError);
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // 2. Actualizar estado y comprobante (Admin bypass RLS)
    const { error: updateError } = await supabaseAdmin
      .from("exchange_orders")
      .update({
        payment_proof_url: proofUrl,
        status: 'VERIFYING'
      })
      .eq("ticket_id", ticketId);

    if (updateError) {
      console.error(`[PayPal Verify] Update failed:`, updateError);
      return NextResponse.json(
        { error: "Error al actualizar la orden" },
        { status: 500 }
      );
    }

    console.log(`[PayPal Verify] Success: ${ticketId} → VERIFYING`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[PayPal Verify] Internal error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
