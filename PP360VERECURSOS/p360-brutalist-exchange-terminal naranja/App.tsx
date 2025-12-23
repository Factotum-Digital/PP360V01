
import React, { useState, useEffect } from 'react';
import { Slab, Tag } from './components/BrutalistUI';
import { ExchangeTerminal } from './components/ExchangeTerminal';

const LandingSections: React.FC = () => (
  <div className="space-y-24 mt-32">
    <section>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <Tag active>About US</Tag>
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter">
            Automate your <br/> <span className="text-transparent italic" style={{ WebkitTextStroke: '2px #262626' }}>Strategic Planning</span>
          </h2>
          <p className="text-lg font-medium text-gray-500 max-width-xl">
            Streamline financial tasks, reduce manual errors, and unlock the power of real-time analytics with PP360VE.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Slab className="p-8 text-center bg-white">
            <div className="text-4xl font-black mb-2">25k+</div>
            <div className="text-xs font-bold uppercase mono">Customers</div>
          </Slab>
          <Slab className="p-8 text-center bg-[#262626] text-white">
            <div className="text-4xl font-black mb-2 text-[#FF4D00]">$2k+</div>
            <div className="text-xs font-bold uppercase mono">Invested</div>
          </Slab>
          <Slab className="p-8 text-center bg-[#FF4D00] text-white border-[#262626]">
            <div className="text-4xl font-black mb-2">4.9</div>
            <div className="text-xs font-bold uppercase mono">Rating</div>
          </Slab>
          <Slab className="p-8 text-center bg-orange-100">
            <div className="text-4xl font-black mb-2">205+</div>
            <div className="text-xs font-bold uppercase mono">Nodes</div>
          </Slab>
        </div>
      </div>
    </section>

    <section className="bg-[#262626] -mx-6 md:-mx-12 lg:-mx-20 p-20 text-white border-y-8 border-[#262626]">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row justify-between gap-12 items-end">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
            Expert <br/> <span className="text-[#FF4D00]">Support</span>
          </h2>
          <p className="max-w-md mono text-sm font-bold text-gray-400">
            Our specialized team operates 24/7. Whether it's high-volume liquidation or KYC assistance, we are the interface between your capital and liquidity.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <Slab key={i} className="p-10 bg-[#333333] border-gray-700">
              <div className="text-[#FF4D00] mono mb-4 font-black">BENEFIT_0{i}</div>
              <h4 className="text-xl font-black mb-4">Scalable High-End Infrastructure</h4>
              <p className="text-xs mono text-gray-400">Adaptive API endpoints designed for rapid enterprise-level data processing.</p>
            </Slab>
          ))}
        </div>
      </div>
    </section>

    <section className="pb-32">
       <div className="text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter underline decoration-8 decoration-[#FF4D00] underline-offset-8">Choose your protocol</h2>
          <div className="grid md:grid-cols-3 gap-8 pt-8">
            {['Starter', 'Standard', 'Premium'].map((plan, i) => (
              <Slab key={plan} className={`p-10 ${i === 2 ? 'bg-[#262626] text-white' : 'bg-white'}`}>
                <div className="mono text-xs font-black mb-6 italic">{plan.toUpperCase()}_PLAN</div>
                <div className="text-5xl font-black mb-8">${(i + 1) * 99}<span className="text-sm mono font-normal opacity-50">/MO</span></div>
                <ul className="text-left space-y-4 mono text-[10px] font-bold uppercase mb-10">
                  <li>- 5 Workflows</li>
                  <li>- Standard Rate Access</li>
                  <li>- Priority Node Routing</li>
                  {i > 0 && <li>- AI Market Forecast</li>}
                  {i > 1 && <li>- Direct Node API</li>}
                </ul>
                <button className={`w-full py-4 font-black border-4 border-[#262626] uppercase italic transition-colors ${i === 2 ? 'bg-[#FF4D00] text-white' : 'bg-[#262626] text-white hover:bg-[#FF4D00]'}`}>Deploy</button>
              </Slab>
            ))}
          </div>
       </div>
    </section>
  </div>
);

const Footer: React.FC = () => (
  <footer className="mt-32 pt-16 border-t-8 border-[#262626] pb-20">
    <div className="flex flex-col md:flex-row justify-between gap-12">
      <div className="max-w-md">
        <h2 className="font-black italic text-4xl mb-6 text-[#262626]">P360_TERM</h2>
        <p className="mono text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
          ESTE TERMINAL OPERA BAJO PROTOCOLOS ESTRICTOS DE CUMPLIMIENTO INTERNACIONAL. TODAS LAS TRANSACCIONES SON FINALES. NO SE PERMITEN PAGOS DE TERCEROS SIN VALIDACIÓN KYC NIVEL 2.
        </p>
      </div>
      <div className="flex gap-20">
        <div className="space-y-4">
          <Tag active>Support</Tag>
          <ul className="mono text-[10px] font-bold uppercase space-y-2">
            <li>Telegram: @P360_OPS</li>
            <li>Status: Operational</li>
          </ul>
        </div>
        <div className="space-y-4">
          <Tag active>Legal</Tag>
          <ul className="mono text-[10px] font-bold uppercase space-y-2">
            <li>Terms / Privacy</li>
            <li>AML Compliance</li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [session, setSession] = useState("FF-000-000");

  useEffect(() => {
    setSession(`SESS-${Math.floor(Math.random() * 9000 + 1000)}`);
  }, []);

  return (
    <div className="min-h-screen selection:bg-[#FF4D00] selection:text-white">
      <div className="noise" />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-20 border-r-4 border-[#262626] bg-white hidden sm:flex flex-col items-center py-10 gap-12 z-20 sticky top-0 h-screen">
          <div className="bg-[#262626] text-[#FF4D00] w-12 h-12 flex items-center justify-center font-black text-2xl border-4 border-[#262626] shadow-[4px_4px_0_0_rgba(38,38,38,0.2)]">P</div>
          <nav className="flex flex-col gap-8">
            <div className="w-8 h-8 bg-[#262626] hover:bg-[#FF4D00] transition-colors cursor-pointer border-2 border-[#262626]" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}></div>
            <div className="w-8 h-8 border-4 border-[#262626] hover:bg-[#FF4D00] transition-colors cursor-pointer"></div>
            <div className="w-8 h-8 border-4 border-[#262626] opacity-20 hover:opacity-100 transition-opacity cursor-pointer"></div>
          </nav>
          <div className="mt-auto vertical-text font-black text-xs uppercase tracking-[0.3em] opacity-30 select-none">
            Secure Terminal v.4.0
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 md:p-12 lg:p-20 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <Tag active>Auth: OK</Tag>
                <span className="mono text-xs text-gray-400 font-bold tracking-widest uppercase">{session} // PAYOUTI_KERNEL_ONLINE</span>
              </div>
              <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-4 text-[#262626]">
                PP360VE<br/><span className="text-transparent italic" style={{ WebkitTextStroke: '3px #FF4D00' }}>Terminal</span>
              </h1>
              <p className="text-xl font-bold uppercase tracking-tight max-w-lg mt-8 border-l-8 border-[#FF4D00] pl-4 text-[#262626]">
                Elevate your financial service with the PP360VE Brutalist Exchange Interface.
              </p>
            </header>

            {/* Terminal Section */}
            <ExchangeTerminal />

            {/* Unified Marketing Sections */}
            <LandingSections />

            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
