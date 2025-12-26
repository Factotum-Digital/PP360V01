"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/admin-config';

export default function LoginPage() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [magicLinkEmail, setMagicLinkEmail] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     const [magicLinkSent, setMagicLinkSent] = useState(false);
     const [magicLinkLoading, setMagicLinkLoading] = useState(false);
     const [showMagicLinkInput, setShowMagicLinkInput] = useState(false);
     const router = useRouter();
     const supabase = createClient();

     const handleLogin = async (e: React.FormEvent) => {
          e.preventDefault();
          setError('');
          setLoading(true);

          try {
               const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
               });

               if (authError) {
                    setError(authError.message);
                    setLoading(false);
                    return;
               }

               if (data.user && isAdmin(data.user.email)) {
                    router.push('/admin');
               } else {
                    router.push('/dashboard');
               }
               router.refresh();
          } catch {
               setError('Connection error. Please try again.');
               setLoading(false);
          }
     };

     const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'azure') => {
          setError('');
          try {
               const { error } = await supabase.auth.signInWithOAuth({
                    provider,
                    options: {
                         redirectTo: `${window.location.origin}/auth/callback`,
                    },
               });
               if (error) throw error;
          } catch {
               setError(`Error connecting with ${provider}`);
          }
     };

     const handleMagicLink = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!magicLinkEmail) return;

          setError('');
          setMagicLinkLoading(true);

          const { error } = await supabase.auth.signInWithOtp({
               email: magicLinkEmail,
               options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
               },
          });

          if (error) {
               setError(error.message);
               setMagicLinkLoading(false);
          } else {
               setMagicLinkSent(true);
               setMagicLinkLoading(false);
          }
     };

     return (
          <div className="min-h-screen flex items-start justify-center p-4 sm:p-8 pt-32 sm:pt-40">
               <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="text-center mb-10">
                         <div className="inline-block border-4 border-[#262626] bg-[#262626] px-3 py-1 mb-6 transform -rotate-2">
                              <span className="mono text-[10px] font-black text-white uppercase tracking-tighter">ACCESS_SYSTEM</span>
                         </div>
                         <h1 className="text-6xl font-black uppercase tracking-tighter mb-2 leading-none">LOGIN</h1>
                         <p className="mono text-xs font-bold text-gray-400 uppercase tracking-widest">Identify yourself to continue</p>
                    </div>

                    <div className="border-4 border-[#262626] bg-white p-6 sm:p-10 shadow-[10px_10px_0px_0px_#262626] relative transition-all duration-200 hover:shadow-[16px_16px_0px_0px_#262626] hover:-translate-x-1 hover:-translate-y-1">

                         {/* Standard Login Form */}
                         <form onSubmit={handleLogin} className="space-y-6 mb-10">
                              <div className="space-y-2">
                                   <label className="mono text-[11px] font-black uppercase flex justify-between">
                                        <span>User / Email</span>
                                        <span className="text-gray-300">REQ_FIELD</span>
                                   </label>
                                   <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full border-4 border-[#262626] p-4 font-bold mono outline-none text-sm transition-all placeholder:text-gray-300 focus:border-[#FF4D00] focus:bg-[#fff9f6]"
                                        placeholder="terminal@pp360.ve"
                                   />
                              </div>
                              <div className="space-y-2">
                                   <label className="mono text-[11px] font-black uppercase flex justify-between">
                                        <span>Password</span>
                                        <a href="#" className="text-[#FF4D00] hover:underline normal-case font-bold italic">Forgot?</a>
                                   </label>
                                   <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full border-4 border-[#262626] p-4 font-bold mono outline-none text-sm transition-all placeholder:text-gray-300 focus:border-[#FF4D00] focus:bg-[#fff9f6]"
                                        placeholder="••••••••"
                                   />
                              </div>

                              {error && (
                                   <div className="bg-red-50 border-l-4 border-red-500 p-3">
                                        <p className="mono text-[10px] font-bold text-red-600 uppercase">{error}</p>
                                   </div>
                              )}

                              <button
                                   type="submit"
                                   disabled={loading}
                                   className="w-full border-4 border-[#262626] bg-[#262626] text-white p-4 font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
                              >
                                   {loading ? 'LOADING...' : 'ACCESS'}
                              </button>
                         </form>

                         {/* Divider Social */}
                         <div className="relative flex items-center mb-8">
                              <div className="flex-grow border-t-2 border-[#262626] opacity-10"></div>
                              <span className="flex-shrink mx-4 mono text-[10px] font-black text-gray-400 uppercase">Social Networks</span>
                              <div className="flex-grow border-t-2 border-[#262626] opacity-10"></div>
                         </div>

                         {/* Social Grid */}
                         <div className="grid grid-cols-3 gap-4 mb-12">
                              <button
                                   onClick={() => handleOAuthLogin('google')}
                                   className="border-4 border-[#262626] p-4 flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none group"
                                   title="Google"
                              >
                                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:fill-white">
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.228 1.224-3.14 2.56-6.412 2.56-5.116 0-9.156-4.152-9.156-9.272s4.04-9.272 9.156-9.272c2.752 0 4.748 1.088 6.224 2.496l2.308-2.308c-2.08-1.996-4.832-3.188-8.532-3.188-6.644 0-12.24 5.396-12.24 12.04s5.596 12.04 12.24 12.04c3.588 0 6.304-1.18 8.428-3.396 2.184-2.184 2.872-5.232 2.872-7.668 0-.736-.068-1.428-.192-2.068h-11.12z" />
                                   </svg>
                              </button>
                              <button
                                   onClick={() => handleOAuthLogin('facebook')}
                                   className="border-4 border-[#262626] p-4 flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none group"
                                   title="Facebook"
                              >
                                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:fill-white">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                   </svg>
                              </button>
                              <button
                                   onClick={() => handleOAuthLogin('azure')}
                                   className="border-4 border-[#262626] p-4 flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none group"
                                   title="Microsoft"
                              >
                                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:fill-white">
                                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                                   </svg>
                              </button>
                         </div>

                         {/* MAGIC LINK */}
                         <div className="mt-4 pt-8 border-t-4 border-[#262626] border-dashed">
                              <label className="mono text-[10px] font-black uppercase mb-4 block text-center text-gray-500 italic">
                                   Prefer not to use a password?
                              </label>

                              {magicLinkSent ? (
                                   <div className="bg-green-50 border-4 border-green-500 p-4 text-center">
                                        <p className="mono text-xs font-bold text-green-700 uppercase">
                                             ✓ LINK SENT TO {magicLinkEmail}
                                        </p>
                                        <p className="mono text-[10px] text-green-600 mt-1">
                                             Check your email to continue
                                        </p>
                                   </div>
                              ) : showMagicLinkInput ? (
                                   <form onSubmit={handleMagicLink} className="space-y-3">
                                        <input
                                             type="email"
                                             value={magicLinkEmail}
                                             onChange={(e) => setMagicLinkEmail(e.target.value)}
                                             className="w-full border-4 border-[#262626] p-3 font-bold mono text-sm outline-none focus:border-[#FF4D00] focus:bg-[#fff9f6]"
                                             placeholder="your@email.com"
                                             required
                                        />
                                        <button
                                             type="submit"
                                             disabled={magicLinkLoading}
                                             className="w-full border-4 border-[#262626] bg-[#262626] text-white p-3 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
                                        >
                                             {magicLinkLoading ? 'SENDING...' : 'SEND MAGIC LINK'}
                                        </button>
                                   </form>
                              ) : (
                                   <button
                                        onClick={() => setShowMagicLinkInput(true)}
                                        className="w-full border-4 border-[#262626] bg-white text-[#262626] p-4 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3"
                                   >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                             <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                             <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                        </svg>
                                        SEND MAGIC LINK
                                   </button>
                              )}
                         </div>

                         <div className="mt-8 text-center">
                              <p className="mono text-[10px] font-bold text-gray-400 uppercase">
                                   New to the terminal?{' '}
                                   <Link href="/register" className="text-[#FF4D00] underline hover:no-underline font-black">
                                        CREATE ACCOUNT
                                   </Link>
                              </p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
