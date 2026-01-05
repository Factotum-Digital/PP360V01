
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

// Initialize Resend with hardcoded key found in codebase
// TODO: Move to env vars in production
const resend = new Resend('re_FNuNGfqn_FQhcDgwYCJNQ4orD1uZAzPqm');

export async function POST(request: Request) {
     try {
          const { email, type, password, redirectTo } = await request.json();

          if (!email || !type) {
               return NextResponse.json({ error: 'Email and type are required' }, { status: 400 });
          }

          console.log(`[Auth Manual] Processing ${type} for ${email}`);

          let actionLink = '';

          // 1. Generate Link using Supabase Admin
          if (type === 'signup') {
               if (!password) {
                    return NextResponse.json({ error: 'Password required for signup' }, { status: 400 });
               }

               // Check if user exists first to avoid error or handle upsert
               const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
               const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

               if (existingUser) {
                    // If user exists but unconfirmed, we might want to resend confirmation
                    if (!existingUser.email_confirmed_at) {
                         const { data, error } = await supabaseAdmin.auth.admin.generateLink({
                              type: 'signup',
                              email,
                              password,
                              options: { redirectTo: redirectTo || 'https://pp360v01.vercel.app/auth/callback' }
                         });
                         if (error) throw error;
                         actionLink = data.properties.action_link;
                    } else {
                         return NextResponse.json({ error: 'User already registered' }, { status: 400 });
                    }
               } else {
                    // Create user and generate link
                    // Note: admin.createUser auto-confirms by default if we don't specify otherwise, 
                    // but generateLink is cleaner for sending our own email.
                    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
                         type: 'signup',
                         email,
                         password,
                         options: { redirectTo: redirectTo || 'https://pp360v01.vercel.app/auth/callback' }
                    });

                    if (error) {
                         console.error('[Auth Signup Error]', error);
                         return NextResponse.json({ error: error.message }, { status: 400 });
                    }
                    actionLink = data.properties.action_link;
               }

          } else if (type === 'magiclink' || type === 'recovery') {
               // Magic Link (Login) or Recovery (Forgot Password)
               const { data, error } = await supabaseAdmin.auth.admin.generateLink({
                    type: type === 'magiclink' ? 'magiclink' : 'recovery',
                    email,
                    options: { redirectTo: redirectTo || 'https://pp360v01.vercel.app/auth/callback' }
               });

               if (error) {
                    console.error('[Auth Link Error]', error);
                    return NextResponse.json({ error: error.message }, { status: 400 });
               }

               actionLink = data.properties.action_link;
          } else {
               return NextResponse.json({ error: 'Invalid auth type' }, { status: 400 });
          }

          // 2. Send Custom Email via Resend
          let subject = '';
          let htmlContent = '';

          const commonStyles = `
      font-family: monospace;
      background-color: #f4f4f4;
      padding: 20px;
      text-align: center;
    `;

          const buttonStyle = `
      display: inline-block;
      padding: 15px 30px;
      background-color: #262626;
      color: #ffffff;
      text-decoration: none;
      font-weight: 900;
      text-transform: uppercase;
      border: 4px solid #262626;
      box-shadow: 4px 4px 0px 0px #FF4D00;
      margin-top: 20px;
    `;

          if (type === 'signup') {
               subject = 'Welcome to PP360VE - Confirm Account';
               htmlContent = `
        <div style="${commonStyles}">
          <h1 style="text-transform: uppercase;">Confirm Registration</h1>
          <p>Welcome to the terminal. Confirm your account to access.</p>
          <a href="${actionLink}" style="${buttonStyle}">CONFIRM ACCOUNT</a>
          <p style="margin-top: 20px; font-size: 10px; color: #666;">If you didn't request this, ignore this email.</p>
        </div>
      `;
          } else if (type === 'magiclink') {
               subject = 'PP360VE Login Link';
               htmlContent = `
        <div style="${commonStyles}">
          <h1 style="text-transform: uppercase;">Magic Link Access</h1>
          <p>Click below to login instantly.</p>
          <a href="${actionLink}" style="${buttonStyle}">ENTER TERMINAL</a>
           <p style="margin-top: 20px; font-size: 10px; color: #666;">Link expires in 1 hour.</p>
        </div>
      `;
          } else if (type === 'recovery') {
               subject = 'PP360VE Password Reset';
               htmlContent = `
        <div style="${commonStyles}">
          <h1 style="text-transform: uppercase;">Reset Password</h1>
          <p>You requested a password reset.</p>
          <a href="${actionLink}" style="${buttonStyle}">RESET PASSWORD</a>
           <p style="margin-top: 20px; font-size: 10px; color: #666;">If you didn't request this, ignore this email.</p>
        </div>
      `;
          }

          await resend.emails.send({
               from: 'PP360VE Security <auth@pp360ve.com>',
               to: [email],
               subject: subject,
               html: htmlContent,
          });

          console.log(`[Auth Manual] Email sent successfully to ${email}`);
          return NextResponse.json({ success: true });

     } catch (error) {
          console.error('[Auth Manual Error]', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}
