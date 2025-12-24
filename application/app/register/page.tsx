"use client";

import React, { useState } from 'react';
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
               setError('Passwords do not match');
               return;
          }

          if (password.length < 6) {
               setError('Password must be at least 6 characters');
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

     if (success) {
          return (
               <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
                    <div className="w-full max-w-md">
                         <div className="border-4 border-[#262626] bg-white p-8 shadow-[10px_10px_0px_0px_#262626] text-center">
                              <div className="w-20 h-20 bg-[#FF4D00] border-4 border-[#262626] flex items-center justify-center mx-auto mb-6">
                                   <span className="text-4xl text-white">✓</span>
                              </div>
                              <h2 className="text-2xl font-black uppercase mb-4">REGISTRATION SUCCESSFUL</h2>
                              <p className="mono text-xs font-bold text-gray-500 mb-6">
                                   Check your email to confirm your account.
                              </p>
                              <Link href="/login">
                                   <button className="w-full border-4 border-[#262626] bg-[#262626] text-white p-4 font-black uppercase shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                        GO TO LOGIN
                                   </button>
                              </Link>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
               <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="text-center mb-10">
                         <div className="inline-block border-4 border-[#262626] bg-[#262626] px-3 py-1 mb-6 transform rotate-2">
                              <span className="mono text-[10px] font-black text-white uppercase tracking-tighter">NEW_USER</span>
                         </div>
                         <h1 className="text-6xl font-black uppercase tracking-tighter mb-2 leading-none">REGISTER</h1>
                         <p className="mono text-xs font-bold text-gray-400 uppercase tracking-widest">Create your terminal account</p>
                    </div>

                    <div className="border-4 border-[#262626] bg-white p-6 sm:p-10 shadow-[10px_10px_0px_0px_#262626] relative">

                         {/* Quick Social Register */}
                         <div className="mb-10">
                              <div className="relative flex items-center mb-6">
                                   <div className="flex-grow border-t-2 border-[#262626] opacity-10"></div>
                                   <span className="flex-shrink mx-4 mono text-[10px] font-black text-gray-400 uppercase">Quick Register</span>
                                   <div className="flex-grow border-t-2 border-[#262626] opacity-10"></div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                   <button
                                        onClick={() => handleOAuthLogin('google')}
                                        className="border-4 border-[#262626] p-4 flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                                        title="Google"
                                   >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:fill-white">
                                             <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.228 1.224-3.14 2.56-6.412 2.56-5.116 0-9.156-4.152-9.156-9.272s4.04-9.272 9.156-9.272c2.752 0 4.748 1.088 6.224 2.496l2.308-2.308c-2.08-1.996-4.832-3.188-8.532-3.188-6.644 0-12.24 5.396-12.24 12.04s5.596 12.04 12.24 12.04c3.588 0 6.304-1.18 8.428-3.396 2.184-2.184 2.872-5.232 2.872-7.668 0-.736-.068-1.428-.192-2.068h-11.12z" />
                                        </svg>
                                   </button>
                                   <button
                                        onClick={() => handleOAuthLogin('facebook')}
                                        className="border-4 border-[#262626] p-4 flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                                        title="Facebook"
                                   >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:fill-white">
                                             <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                   </button>
                                   <button
                                        onClick={() => handleOAuthLogin('azure')}
                                        className="border-4 border-[#262626] p-4 flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_#262626] hover:bg-[#FF4D00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                                        title="Microsoft"
                                   >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:fill-white">
                                             <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                                        </svg>
                                   </button>
                              </div>
                         </div>

                         {/* Divider */}
                         <div className="relative flex items-center mb-8">
                              <div className="flex-grow border-t-2 border-[#262626] opacity-10"></div>
                              <span className="flex-shrink mx-4 mono text-[10px] font-black text-gray-400 uppercase">Or use email</span>
                              <div className="flex-grow border-t-2 border-[#262626] opacity-10"></div>
                         </div>

                         {/* Standard Register Form */}
                         <form onSubmit={handleRegister} className="space-y-6">
                              <div className="space-y-2">
                                   <label className="mono text-[11px] font-black uppercase flex justify-between">
                                        <span>Email</span>
                                        <span className="text-gray-300">REQ_FIELD</span>
                                   </label>
                                   <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full border-4 border-[#262626] p-4 font-bold mono outline-none text-sm transition-all placeholder:text-gray-300 focus:border-[#FF4D00] focus:bg-[#fff9f6]"
                                        placeholder="user@email.com"
                                   />
                              </div>
                              <div className="space-y-2">
                                   <label className="mono text-[11px] font-black uppercase">
                                        <span>Password</span>
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
                              <div className="space-y-2">
                                   <label className="mono text-[11px] font-black uppercase">
                                        <span>Confirm Password</span>
                                   </label>
                                   <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                   className="w-full border-4 border-[#262626] bg-[#FF4D00] text-white p-4 font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_#262626] hover:bg-[#262626] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
                              >
                                   {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
                              </button>
                         </form>

                         <div className="mt-8 text-center">
                              <p className="mono text-[10px] font-bold text-gray-400 uppercase">
                                   Already have an account?{' '}
                                   <Link href="/login" className="text-[#FF4D00] underline hover:no-underline font-black">
                                        LOGIN
                                   </Link>
                              </p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
