import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
     try {
          const { orderId, email, amount, ticketId, concept } = await request.json();

          if (!orderId || !email) {
               return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
          }

          // 1. Email to User
          await resend.emails.send({
               from: 'PP360VE <pagos@pp360ve.com>', // Or 'onboarding@resend.dev' if domain not verifiable yet
               to: [email],
               subject: `Pago Recibido - Orden #${ticketId || orderId}`,
               html: `
        <h1>¡Pago Recibido Exitosamente!</h1>
        <p>Hemos recibido tu pago de <strong>$${amount} USD</strong>.</p>
        <p><strong>Detalle de la Orden:</strong></p>
        <ul>
          <li><strong>ID:</strong> ${orderId}</li>
          <li><strong>Ticket:</strong> #${ticketId}</li>
          <li><strong>Concepto:</strong> ${concept}</li>
        </ul>
        <p>Estamos verificando tu transacción. Te notificaremos cuando el proceso se complete.</p>
        <p>Gracias por confiar en PP360VE.</p>
      `,
          });

          // 2. Email to Admin
          await resend.emails.send({
               from: 'System Alert <alerts@pp360ve.com>',
               to: ['pagos@pp360ve.com'],
               subject: `[NUEVO PAGO] $${amount} - #${ticketId}`,
               html: `
        <h1>Nuevo Pago Detectado</h1>
        <ul>
          <li><strong>Monto:</strong> $${amount} USD</li>
          <li><strong>Usuario:</strong> ${email}</li>
          <li><strong>Ticket:</strong> #${ticketId}</li>
          <li><strong>ID PayPal/Orden:</strong> ${orderId}</li>
        </ul>
        <p>Verifica la transacción en el Dashboard de PayPal y en Supabase.</p>
      `,
          });

          return NextResponse.json({ success: true });
     } catch (error) {
          console.error('Email Error:', error);
          return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
     }
}
