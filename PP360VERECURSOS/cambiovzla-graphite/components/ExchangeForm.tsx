import React, { useState, useEffect } from 'react';
import { PaymentMethod, ExchangeFormData } from '../types';
import { VENEZUELAN_BANKS, CURRENT_RATE, COMISSION_RATE } from '../constants';
import { ArrowDown } from 'lucide-react';

export const ExchangeForm: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState<ExchangeFormData>({
        usdAmount: 10,
        vefAmount: 0,
        paymentMethod: PaymentMethod.PAGO_MOVIL,
        fullName: '',
        cedula: '',
        bank: '',
        phoneNumber: '',
        accountNumber: '',
        paypalEmail: ''
    });

    // Calculate VEF automatically when USD changes
    useEffect(() => {
        const netUsd = formData.usdAmount * (1 - COMISSION_RATE);
        const calculatedVef = netUsd * CURRENT_RATE;
        setFormData(prev => ({ ...prev, vefAmount: parseFloat(calculatedVef.toFixed(2)) }));
    }, [formData.usdAmount]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= 0) {
            setFormData(prev => ({ ...prev, usdAmount: val }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const confirmTransaction = () => {
        // Here you would integrate with backend
        setStep(3);
    };

    if (step === 3) {
        return (
            <div className="bg-[var(--graphite-900)] text-white p-8 shadow-xl flex flex-col items-center justify-center h-full text-center reveal">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                    <div className="text-[var(--graphite-900)] text-3xl">✓</div>
                </div>
                <h2 className="text-2xl font-light mb-2">Orden Recibida</h2>
                <p className="text-white/60 text-sm mb-8 max-w-xs">
                    Hemos enviado una factura a <strong>{formData.paypalEmail}</strong>. 
                    Una vez pagada, recibirás tus Bolívares en aprox. 15 minutos.
                </p>
                <div className="mono text-xs border border-white/20 p-4 w-full mb-6">
                    <div className="flex justify-between mb-2">
                        <span>MONTO RECIBIR:</span>
                        <span className="font-bold">Bs. {formData.vefAmount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>REF:</span>
                        <span>#CW-{Math.floor(Math.random() * 10000)}</span>
                    </div>
                </div>
                <button 
                    onClick={() => { setStep(1); setFormData({...formData, usdAmount: 10}); }}
                    className="bg-white text-black py-3 px-8 text-xs font-semibold hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                    Nueva Operación
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white skeleton-border p-8 shadow-lg relative reveal h-full flex flex-col">
            <div className="absolute top-4 right-4 mono text-[10px] text-[var(--graphite-200)] select-none">
                FORM_ID: USD_VEF_01
            </div>

            <h2 className="text-2xl font-light text-[var(--graphite-900)] mb-6">
                {step === 1 ? 'Calculadora de Cambio' : 'Datos Bancarios'}
            </h2>

            {step === 1 ? (
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* INPUT USD */}
                        <div>
                            <label className="mono text-[10px] uppercase tracking-widest text-[var(--graphite-400)] block mb-2">Envías (PayPal USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg">$</span>
                                <input 
                                    type="number" 
                                    value={formData.usdAmount}
                                    onChange={handleAmountChange}
                                    min="5"
                                    className="w-full bg-[var(--graphite-100)] border border-[var(--graphite-200)] p-4 pl-8 text-2xl font-mono focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center -my-3 relative z-10">
                            <div className="bg-white border border-[var(--graphite-200)] rounded-full p-2">
                                <ArrowDown className="w-4 h-4 text-[var(--graphite-400)]" />
                            </div>
                        </div>

                        {/* OUTPUT VEF */}
                        <div>
                            <label className="mono text-[10px] uppercase tracking-widest text-[var(--graphite-400)] block mb-2">Recibes (Bolívares)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-[var(--graphite-400)]">Bs.</span>
                                <input 
                                    type="number" 
                                    value={formData.vefAmount}
                                    readOnly
                                    className="w-full bg-white border border-[var(--graphite-900)] p-4 pl-12 text-2xl font-bold font-mono"
                                />
                            </div>
                            <p className="text-[10px] text-[var(--graphite-400)] mt-2 text-right">
                                Comisión de servicio incluida (5%)
                            </p>
                        </div>
                    </div>

                    <button type="submit" className="mt-8 w-full bg-[var(--graphite-900)] text-white py-4 text-sm font-semibold hover:bg-black transition-all uppercase tracking-widest flex justify-between px-6 items-center group">
                        <span>Continuar</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                </form>
            ) : (
                <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setFormData({...formData, paymentMethod: PaymentMethod.PAGO_MOVIL})}
                                className={`p-3 text-xs border ${formData.paymentMethod === PaymentMethod.PAGO_MOVIL ? 'bg-[var(--graphite-900)] text-white border-[var(--graphite-900)]' : 'border-[var(--graphite-200)] hover:border-black'}`}
                            >
                                PAGO MÓVIL
                            </button>
                            <button 
                                onClick={() => setFormData({...formData, paymentMethod: PaymentMethod.TRANSFERENCIA})}
                                className={`p-3 text-xs border ${formData.paymentMethod === PaymentMethod.TRANSFERENCIA ? 'bg-[var(--graphite-900)] text-white border-[var(--graphite-900)]' : 'border-[var(--graphite-200)] hover:border-black'}`}
                            >
                                TRANSFERENCIA
                            </button>
                        </div>

                        <div className="space-y-3">
                            <input 
                                name="fullName"
                                placeholder="Nombre del Titular"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-transparent border-b border-[var(--graphite-200)] focus:border-black text-sm transition-colors"
                            />
                            <div className="flex gap-4">
                                <input 
                                    name="cedula"
                                    placeholder="C.I. / RIF"
                                    value={formData.cedula}
                                    onChange={handleInputChange}
                                    className="w-1/3 p-3 bg-transparent border-b border-[var(--graphite-200)] focus:border-black text-sm transition-colors"
                                />
                                <select 
                                    name="bank"
                                    value={formData.bank}
                                    onChange={handleInputChange}
                                    className="w-2/3 p-3 bg-transparent border-b border-[var(--graphite-200)] focus:border-black text-sm transition-colors"
                                >
                                    <option value="">Seleccionar Banco</option>
                                    {VENEZUELAN_BANKS.map(b => (
                                        <option key={b.code} value={b.code}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.paymentMethod === PaymentMethod.PAGO_MOVIL ? (
                                <input 
                                    name="phoneNumber"
                                    placeholder="Teléfono (Ej: 0414...)"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-transparent border-b border-[var(--graphite-200)] focus:border-black text-sm transition-colors"
                                />
                            ) : (
                                <input 
                                    name="accountNumber"
                                    placeholder="Número de Cuenta (20 dígitos)"
                                    value={formData.accountNumber}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-transparent border-b border-[var(--graphite-200)] focus:border-black text-sm transition-colors"
                                />
                            )}
                            
                            <div className="pt-4 border-t border-dashed border-[var(--graphite-200)] mt-4">
                                <label className="mono text-[10px] uppercase text-[var(--graphite-400)] mb-1 block">Tu Correo PayPal (Para la factura)</label>
                                <input 
                                    name="paypalEmail"
                                    placeholder="tu-email@paypal.com"
                                    type="email"
                                    value={formData.paypalEmail}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-[var(--graphite-100)] border border-[var(--graphite-200)] focus:border-black text-sm transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                         <button onClick={() => setStep(1)} className="w-1/3 bg-white border border-[var(--graphite-200)] text-[var(--graphite-900)] py-4 text-sm font-semibold hover:bg-[var(--graphite-100)] transition-all">
                            ATRÁS
                        </button>
                        <button onClick={confirmTransaction} className="w-2/3 bg-[var(--graphite-900)] text-white py-4 text-sm font-semibold hover:bg-black transition-all uppercase tracking-widest">
                            CONFIRMAR CAMBIO
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
