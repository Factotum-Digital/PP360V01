import React from 'react';

export const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 border-r border-[var(--graphite-200)] bg-white/50 hidden lg:block h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-6">
                <p className="mono text-[10px] uppercase tracking-widest text-[var(--graphite-400)] mb-4">Operaciones</p>
                <div className="space-y-1">
                    <div className="sidebar-item px-3 py-2 text-sm cursor-pointer flex justify-between items-center group bg-white border-l-2 border-black">
                        <span>Nueva Venta</span>
                        <span className="mono text-[10px]">01</span>
                    </div>
                    <div className="sidebar-item px-3 py-2 text-sm cursor-pointer flex justify-between items-center group">
                        <span>Historial</span>
                        <span className="mono text-[10px] opacity-0 group-hover:opacity-100">02</span>
                    </div>
                    <div className="sidebar-item px-3 py-2 text-sm cursor-pointer flex justify-between items-center group">
                        <span>Cuentas Guardadas</span>
                        <span className="mono text-[10px] opacity-0 group-hover:opacity-100">03</span>
                    </div>
                </div>

                <div className="mt-12">
                    <p className="mono text-[10px] uppercase tracking-widest text-[var(--graphite-400)] mb-4">Información</p>
                    <div className="p-4 border border-dashed border-[var(--graphite-200)] text-xs text-[var(--graphite-700)] leading-relaxed">
                        <strong className="block mb-2 text-black">Horario de Atención:</strong>
                        Lunes a Sábado<br/>
                        8:00 AM - 9:00 PM<br/><br/>
                        Domingos<br/>
                        10:00 AM - 6:00 PM
                    </div>
                </div>
            </div>
        </aside>
    );
};
