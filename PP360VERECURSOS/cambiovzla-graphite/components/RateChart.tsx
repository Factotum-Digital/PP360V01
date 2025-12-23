import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RATE_HISTORY, CURRENT_RATE } from '../constants';

export const RateChart: React.FC = () => {
    return (
        <div className="bg-white skeleton-border p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="mono text-xs uppercase tracking-widest text-[var(--graphite-400)] mb-1">Tasa Actual</h3>
                        <div className="text-3xl font-bold font-mono">{CURRENT_RATE.toFixed(2)} <span className="text-sm text-[var(--graphite-400)] font-sans">VEF/USD</span></div>
                    </div>
                    <div className="px-2 py-1 bg-[var(--graphite-100)] border border-[var(--graphite-200)] mono text-[10px]">
                        PAYPAL → BS
                    </div>
                </div>
            </div>
            
            <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={RATE_HISTORY}>
                        <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="date" 
                            tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} 
                            axisLine={false}
                            tickLine={false}
                            stroke="#9a9a9a"
                        />
                        <YAxis 
                            hide={true} 
                            domain={['dataMin - 0.5', 'dataMax + 0.5']}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e0e0e0',
                                fontFamily: 'JetBrains Mono',
                                fontSize: '12px'
                            }}
                            itemStyle={{ color: '#1a1a1a' }}
                            formatter={(value: number) => [`Bs. ${value}`, 'Tasa']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="rate" 
                            stroke="#1a1a1a" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorRate)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-[var(--graphite-400)] mt-2 mono">
                ACTUALIZADO: HACE 5 MINUTOS
            </p>
        </div>
    );
};
