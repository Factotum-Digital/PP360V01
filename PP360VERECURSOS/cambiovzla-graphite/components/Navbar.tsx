import React from 'react';

export const Navbar: React.FC = () => {
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--graphite-200)] px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rotate-45"></div>
                    </div>
                    <span className="font-semibold tracking-tight text-lg uppercase mono">CambioVzla</span>
                </div>
                <div className="hidden md:flex gap-6 text-sm font-medium text-[var(--graphite-700)]">
                    <a href="#" className="hover-line">Cambio</a>
                    <a href="#" className="hover-line">Tasas</a>
                    <a href="#" className="hover-line">Historial</a>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                     <span className="mono text-[10px] text-[var(--graphite-400)] uppercase">Sistema</span>
                     <span className="mono text-xs text-green-600 font-bold">OPERATIVO</span>
                </div>
                <button className="bg-[var(--graphite-900)] text-white text-xs px-4 py-2 hover:bg-black transition-all">
                    Conectar Wallet
                </button>
            </div>
        </nav>
    );
};
