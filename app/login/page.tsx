"use client";

import React, { useState } from 'react';
import { Slab, Tag } from '@/components/ui/brutalist-system';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     const router = useRouter();
     const supabase = createClient();

     const handleLogin = async (e: React.FormEvent) => {
          e.preventDefault();
          setError('');
          setLoading(true);

          const { error } = await supabase.auth.signInWithPassword({
               email,
               password,
          });

          if (error) {
               setError(error.message);
               setLoading(false);
          } else {
               router.push('/dashboard');
               router.refresh();
          }
     };

     return (
          <div className="min-h-screen flex items-center justify-center p-8">
               <div className="w-full max-w-md">
                    <div className="text-center mb-12">
                         <Tag active>AUTH_TERMINAL</Tag>
                         <h1 className="text-5xl font-black uppercase tracking-tighter mt-6 mb-2">
                              LOGIN
                         </h1>
                         <p className="mono text-xs font-bold text-gray-500 uppercase">
                              Accede a tu terminal de intercambio
                         </p>
                    </div>

                    <Slab className="p-8">
                         <form onSubmit={handleLogin} className="space-y-6">
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

                              {error && (
                                   <div className="bg-red-50 border-l-4 border-red-500 p-3">
                                        <p className="mono text-[10px] font-bold text-red-600 uppercase">{error}</p>
                                   </div>
                              )}

                              <Slab
                                   dark
                                   className="w-full p-4 text-center font-black uppercase tracking-widest bg-[#FF4D00] cursor-pointer"
                                   onClick={handleLogin}
                              >
                                   {loading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
                              </Slab>
                         </form>

                         <div className="mt-8 pt-6 border-t-4 border-gray-200 text-center">
                              <p className="mono text-xs font-bold text-gray-500">
                                   ¿No tienes cuenta?{' '}
                                   <Link href="/register" className="text-[#FF4D00] underline hover:no-underline">
                                        REGISTRARSE
                                   </Link>
                              </p>
                         </div>
                    </Slab>
               </div>
          </div>
     );
}
