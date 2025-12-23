"use client";

import React, { useState } from 'react';
import { Slab, Tag } from '@/components/ui/brutalist-system';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     const [success, setSuccess] = useState(false);
     const router = useRouter();
     const supabase = createClient();

     const handleRegister = async (e: React.FormEvent) => {
          e.preventDefault();
          setError('');

          if (password !== confirmPassword) {
               setError('Las contraseñas no coinciden');
               return;
          }

          if (password.length < 6) {
               setError('La contraseña debe tener al menos 6 caracteres');
               return;
          }

          setLoading(true);

          const { data, error } = await supabase.auth.signUp({
               email,
               password,
               options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
               },
          });

          if (error) {
               setError(error.message);
               setLoading(false);
          } else {
               // Link any guest orders with matching PayPal email to the new user
               if (data.user) {
                    await supabase
                         .from('exchange_orders')
                         .update({
                              user_id: data.user.id,
                              is_guest: false
                         })
                         .eq('paypal_email', email.toLowerCase())
                         .eq('is_guest', true);
               }
               setSuccess(true);
               setLoading(false);
          }
     };

     if (success) {
          return (
               <div className="min-h-screen flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                         <Slab className="p-8 text-center">
                              <div className="w-20 h-20 bg-[#FF4D00] border-4 border-[#262626] flex items-center justify-center mx-auto mb-6">
                                   <span className="text-4xl text-white">✓</span>
                              </div>
                              <h2 className="text-2xl font-black uppercase mb-4">REGISTRO EXITOSO</h2>
                              <p className="mono text-xs font-bold text-gray-500 mb-6">
                                   Revisa tu correo electrónico para confirmar tu cuenta.
                              </p>
                              <Link href="/login">
                                   <Slab dark className="p-4 text-center font-black uppercase bg-[#262626]">
                                        IR A LOGIN
                                   </Slab>
                              </Link>
                         </Slab>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen flex items-center justify-center p-8">
               <div className="w-full max-w-md">
                    <div className="text-center mb-12">
                         <Tag active>NEW_USER</Tag>
                         <h1 className="text-5xl font-black uppercase tracking-tighter mt-6 mb-2">
                              REGISTRO
                         </h1>
                         <p className="mono text-xs font-bold text-gray-500 uppercase">
                              Crea tu cuenta en PP360VE Terminal
                         </p>
                    </div>

                    <Slab className="p-8">
                         <form onSubmit={handleRegister} className="space-y-6">
                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase">Email</label>
                                   <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border-4 border-[#262626] p-4 font-bold mono focus:bg-gray-50 outline-none"
                                        placeholder="usuario@email.com"
                                        required
                                   />
                              </div>

                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase">Password</label>
                                   <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border-4 border-[#262626] p-4 font-bold mono focus:bg-gray-50 outline-none"
                                        placeholder="••••••••"
                                        required
                                   />
                              </div>

                              <div className="space-y-2">
                                   <label className="mono text-[10px] font-black uppercase">Confirmar Password</label>
                                   <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full border-4 border-[#262626] p-4 font-bold mono focus:bg-gray-50 outline-none"
                                        placeholder="••••••••"
                                        required
                                   />
                              </div>

                              {error && (
                                   <div className="bg-red-50 border-l-4 border-red-500 p-3">
                                        <p className="mono text-[10px] font-bold text-red-600 uppercase">{error}</p>
                                   </div>
                              )}

                              <Slab
                                   dark
                                   className="w-full p-4 text-center font-black uppercase tracking-widest bg-[#FF4D00] cursor-pointer"
                                   onClick={() => handleRegister({ preventDefault: () => { } } as React.FormEvent)}
                              >
                                   {loading ? 'PROCESANDO...' : 'CREAR CUENTA'}
                              </Slab>
                         </form>

                         <div className="mt-8 pt-6 border-t-4 border-gray-200 text-center">
                              <p className="mono text-xs font-bold text-gray-500">
                                   ¿Ya tienes cuenta?{' '}
                                   <Link href="/login" className="text-[#FF4D00] underline hover:no-underline">
                                        INICIAR SESIÓN
                                   </Link>
                              </p>
                         </div>
                    </Slab>
               </div>
          </div>
     );
}
