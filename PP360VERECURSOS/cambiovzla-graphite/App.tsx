import React from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ExchangeForm } from './components/ExchangeForm';
import { RateChart } from './components/RateChart';

const App: React.FC = () => {
    return (
        <div className="min-h-screen text-[var(--graphite-900)]">
            <Navbar />
            
            <div className="flex min-h-[calc(100vh-64px)]">
                <Sidebar />
                
                <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
                    <div className="max-w-5xl mx-auto">
                        <header className="mb-10 border-l-4 border-black pl-6 py-2 reveal">
                            <div className="mono text-xs text-[var(--graphite-400)] mb-1 uppercase tracking-tighter">Plataforma Segura // Venta USD</div>
                            <h1 className="text-3xl md:text-5xl font-light tracking-tight text-[var(--graphite-900)]">
                                Cambio <span className="font-bold italic">Rápido</span>
                            </h1>
                        </header>

                        <div className="grid lg:grid-cols-12 gap-8 reveal">
                            {/* Left Column: Form (8 cols) */}
                            <div className="lg:col-span-7 xl:col-span-8">
                                <ExchangeForm />
                            </div>

                            {/* Right Column: Chart & Info (4 cols) */}
                            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                                <div className="h-80">
                                    <RateChart />
                                </div>
                                
                                {/* Instructions / Promo Box */}
                                <div className="bg-[var(--graphite-100)] border border-[var(--graphite-200)] p-6">
                                    <h3 className="mono text-xs uppercase font-bold mb-4">¿Cómo funciona?</h3>
                                    <ol className="text-sm space-y-4 text-[var(--graphite-700)] list-decimal list-inside marker:font-mono marker:font-bold">
                                        <li>Ingresa el monto en USD que deseas vender.</li>
                                        <li>Completa tus datos de Pago Móvil o Banco.</li>
                                        <li>Recibirás una factura PayPal en tu correo.</li>
                                        <li>Al pagar, liberamos los Bolívares inmediatamente.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <footer className="mt-24 border-t border-[var(--graphite-200)] pt-8 flex flex-col md:flex-row justify-between items-start gap-8 pb-12 opacity-60">
                            <div className="max-w-xs">
                                <div className="mono text-[10px] font-bold mb-4 uppercase tracking-[0.2em]">Seguridad</div>
                                <p className="text-xs text-[var(--graphite-400)] leading-loose">
                                    Todas las transacciones son monitoreadas. No aceptamos pagos de terceros. La cuenta PayPal y la cuenta bancaria deben tener el mismo titular.
                                </p>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
