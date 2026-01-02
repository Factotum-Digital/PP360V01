"use client";

import React, { useState, useMemo } from 'react';
import {
     ComposedChart,
     Bar,
     Line,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     ResponsiveContainer,
     Area,
     BarChart
} from 'recharts';
import {
     Wallet,
     ArrowUpRight,
     ArrowDownRight,
     CreditCard,
     Users,
     Search,
     Download,
     AlertTriangle,
     RefreshCw,
     Clock,
     CheckCircle,
     XCircle,
     BarChart3,
     PieChart,
     TrendingUp,
     Activity,
     Plus,
     Target,
     Zap,
     Tag,
     Gavel,
     Calculator,
     ArrowLeft,
     Lock,
     Unlock,
     MapPin,
     Smartphone,
     Globe,
     Shield,
     Calendar,
     Landmark,
     Percent
} from 'lucide-react';
import Link from 'next/link';
import type { ExchangeOrder } from '@/lib/supabase/database.types';
import { useRouter } from 'next/navigation';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: 'USD',
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
}).format(val);

const formatDate = (dateStr: string) => {
     const date = new Date(dateStr);
     return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
};

const getHourFromTime = (timeStr: string) => {
     const [time, modifier] = timeStr.split(' ');
     let [hoursStr] = time.split(':');
     let hours = parseInt(hoursStr, 10);
     if (hours === 12 && modifier === 'AM') hours = 0;
     if (modifier === 'PM' && hours !== 12) hours += 12;
     return hours;
};

// ==========================================
// TYPES
// ==========================================
interface EarningsPanelProps {
     orders: any[]; // ExchangeOrder[]
     campaigns: any[];
     disputes: any[];
     rates: any;
     stats: any;
     userPaymentData: any[];
}

interface Campaign {
     id: string;
     code: string;
     type: string;
     owner?: string;
     discount?: number;
     discount_percent?: number;
     uses?: number;
     uses_count?: number;
     generated_rev?: number;
     active: boolean;
     created?: string;
}

interface Offer {
     id: string;
     title: string;
     discount: number;
     duration: string;
     active: boolean;
}

interface UserInfo {
     email: string;
     fullName: string;
     phone: string;
     document: string;
     registeredAt: string;
     lastAccess: string;
     totalOrders: number;
     totalSpend: number;
     lastOrder: string;
     firstOrder: string;
     status: string;
     isBlocked: boolean;
     disputeCount: number;
     paymentMethods: any[];
}


// ==========================================
// DATA MOCK
// ==========================================
// ==========================================
// DATA MOCK REMOVED - NOW USING PROPS
// ==========================================

// ==========================================
// UI COMPONENTS
// ==========================================
interface BrutalCardProps {
     title: string;
     value: string | number;
     subValue?: string;
     icon: React.ElementType;
     colorClass?: string;
     textColor?: string;
     trend?: 'up' | 'down';
     trendValue?: number;
     onClick?: () => void;
}

const BrutalCard = ({ title, value, subValue, icon: Icon, colorClass = "bg-white", textColor = "text-black", trend, trendValue, onClick }: BrutalCardProps) => (
     <div
          onClick={onClick}
          className={`border-2 border-black ${colorClass} p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group h-full flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${onClick ? 'cursor-pointer' : ''}`}
     >
          <div className="flex justify-between items-start mb-4 relative z-10">
               <h3 className={`font-bold text-xs uppercase tracking-widest ${textColor} opacity-80`}>{title}</h3>
               <div className={`border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${colorClass === 'bg-black' ? 'bg-orange-500' : 'bg-white'}`}>
                    <Icon className={`w-5 h-5 stroke-[2.5px]`} />
               </div>
          </div>
          <div className="relative z-10">
               <div className={`text-3xl md:text-4xl font-black font-mono tracking-tighter mb-2 ${textColor}`}>{value}</div>
               {trend && trendValue && (
                    <div className="flex items-center gap-2 mb-2">
                         {trend === 'up' ? (
                              <span className="flex items-center gap-1 text-green-600 text-xs font-black">
                                   <ArrowUpRight size={16} className="stroke-[3px]" />+{trendValue}%
                              </span>
                         ) : (
                              <span className="flex items-center gap-1 text-red-600 text-xs font-black">
                                   <ArrowDownRight size={16} className="stroke-[3px]" />-{trendValue}%
                              </span>
                         )}
                         <span className={`text-xs font-bold ${textColor} opacity-60`}>vs. semana anterior</span>
                    </div>
               )}
               {subValue && (
                    <div className={`text-xs font-bold font-mono border-t-2 ${colorClass === 'bg-black' ? 'border-gray-700' : 'border-black'} pt-2 mt-2 inline-block ${textColor} opacity-90`}>
                         {subValue}
                    </div>
               )}
          </div>
     </div>
);

const StatusBadge = ({ status }: { status: string }) => {
     const configs: Record<string, { styles: string; icon: React.ReactNode; label: string }> = {
          'COMPLETED': { styles: "bg-green-400 text-black", icon: <CheckCircle size={14} className="mr-1 stroke-[3px]" />, label: "COMPLETADO" },
          'PENDING': { styles: "bg-yellow-400 text-black", icon: <Clock size={14} className="mr-1 stroke-[3px]" />, label: "PENDIENTE" },
          'VERIFYING': { styles: "bg-blue-400 text-black", icon: <RefreshCw size={14} className="mr-1 stroke-[3px]" />, label: "VERIFICANDO" },
          'CANCELLED': { styles: "bg-red-500 text-white", icon: <XCircle size={14} className="mr-1 stroke-[3px]" />, label: "CANCELADO" }
     };
     const config = configs[status] || { styles: "bg-gray-200", icon: null, label: status };
     return (
          <span className={`flex items-center w-fit px-2 py-1 text-[10px] md:text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${config.styles}`}>
               {config.icon} {config.label}
          </span>
     );
};

const TabButton = ({ active, onClick, children, icon: Icon, badge }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ElementType; badge?: number | null }) => (
     <button
          onClick={onClick}
          className={`relative flex items-center gap-2 px-6 py-3 font-black uppercase tracking-wider text-sm border-2 border-black transition-all whitespace-nowrap ${active
               ? 'bg-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
               : 'bg-white text-black hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
               }`}
     >
          <Icon size={16} className={`${active ? "text-white" : "text-black"} stroke-[2.5px]`} />
          {children}
          {badge && badge > 0 && (
               <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${active ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-black'}`}>
                    {badge}
               </span>
          )}
     </button>
);

const SearchFilter = ({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (val: string) => void }) => (
     <div className="relative">
          <input
               type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
               className="w-full border-2 border-black px-4 py-2 pl-10 font-mono text-sm font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow placeholder:text-gray-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
     </div>
);

const ActionButton = ({ children, onClick, variant = 'primary', icon: Icon, disabled, type = 'button' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'success'; icon?: React.ElementType; disabled?: boolean; type?: 'button' | 'submit' }) => {
     const variants = {
          primary: 'bg-black text-white hover:bg-white hover:text-black',
          secondary: 'bg-white text-black hover:bg-black hover:text-white',
          danger: 'bg-red-500 text-white hover:bg-red-700',
          success: 'bg-green-500 text-black hover:bg-green-600'
     };
     return (
          <button
               type={type} onClick={onClick} disabled={disabled}
               className={`px-4 py-2 font-black uppercase text-xs tracking-wider border-2 border-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap ${variants[variant]}`}
          >
               {Icon && <Icon size={14} className="stroke-[3px]" />} {children}
          </button>
     );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export function EarningsPanel(props: EarningsPanelProps) {
     const router = useRouter();
     const [activeTab, setActiveTab] = useState('orders');
     const [searchTerm, setSearchTerm] = useState('');
     const [statusFilter, setStatusFilter] = useState('ALL');
     const [dateRange, setDateRange] = useState('7d');
     const [newCampaignCode, setNewCampaignCode] = useState('');
     const [newOfferTitle, setNewOfferTitle] = useState('');
     const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
     const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
     const [selectedOrder, setSelectedOrder] = useState<any>(null); // For detail view

     // History Filters
     const [historyFilterDate, setHistoryFilterDate] = useState('ALL');
     const [historyFilterStatus, setHistoryFilterStatus] = useState('ALL');
     const [historyFilterMinAmount, setHistoryFilterMinAmount] = useState('');

     // Internal State for Real Data
     const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>(props.campaigns || []);
     const [localOffers, setLocalOffers] = useState<Offer[]>([]); // Assuming offers are also managed locally

     // Map Real Data to Internal Format
     const data = useMemo(() => {
          // Helper to find registered email
          const getRegisteredEmail = (userId: string | null) => {
               if (!userId) return null;
               return props.userPaymentData?.find((p: any) => p.user_id === userId)?.email;
          };

          return {
               summary: {
                    exchangeRate: props.rates?.payRate || props.rates?.value || 0, // Use payRate specifically
                    parallelBalance: props.rates?.paralelo || 0, // Explicitly map 'paralelo'
                    bcvRate: props.rates?.oficial || 0, // Explicitly map 'oficial'
                    lastUpdate: props.rates?.timestamp ? new Date(props.rates.timestamp).toLocaleString() : 'N/A'
               },
               orders: props.orders?.map((o: ExchangeOrder) => {
                    const registeredEmail = getRegisteredEmail(o.user_id);
                    // Use registered email if available, otherwise fallback to PayPal email or guest
                    // This ensures all orders from one registered user are grouped together even if they use different PayPal emails
                    const userIdentifier = registeredEmail || o.paypal_email || 'guest@unknown';

                    return {
                         id: o.order_id.slice(0, 8),
                         fullId: o.order_id,
                         date: o.created_at.split('T')[0],
                         time: new Date(o.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                         type: 'Exchange', // Simplification
                         status: o.status === 'COMPLETED' ? 'COMPLETED' :
                              o.status === 'CANCELLED' ? 'CANCELLED' :
                                   o.status === 'VERIFYING' ? 'VERIFYING' : 'PENDING',
                         gross: Number(o.amount_sent),
                         fee_revenue: Number(o.amount_sent) * 0.12,
                         paypal_exp: (Number(o.amount_sent) * 0.054) + 0.30,
                         net: Number(o.amount_sent) * 0.12,
                         amountVES: Number(o.amount_received),
                         user: userIdentifier,
                         paypalEmail: o.paypal_email, // Store original PayPal email
                         isGuest: !!o.is_guest
                    };
               }) || [],
               campaigns: localCampaigns, // Use local state for campaigns
               offers: localOffers, // Use local state for offers
               disputes: props.disputes || []
          };
     }, [props.orders, props.campaigns, props.disputes, props.rates, localCampaigns, localOffers, props.userPaymentData]);

     // --- FILTER HANDLERS ---
     const handleFilterChange = (range: string) => {
          setDateRange(range);
     };

     // Only derived metrics logic remains below
     const metrics = useMemo(() => {
          const now = new Date();
          const limit = new Date();
          if (dateRange === '7d') limit.setDate(now.getDate() - 7);
          if (dateRange === '30d') limit.setDate(now.getDate() - 30);
          if (dateRange === '90d') limit.setDate(now.getDate() - 90);

          let completedOrders = data.orders.filter((o: any) => o.status === 'COMPLETED' && !blockedUsers.includes(o.user));

          if (dateRange !== 'all') { // 'all' means no date filtering
               completedOrders = completedOrders.filter((o: any) => new Date(o.date) >= limit);
          }

          const pendingOrders = data.orders.filter((o: any) => (o.status === 'PENDING' || o.status === 'VERIFYING') && !blockedUsers.includes(o.user));

          const totalGross = completedOrders.reduce((acc: number, curr: any) => acc + curr.gross, 0);
          const totalNet = completedOrders.reduce((acc: number, curr: any) => acc + curr.net, 0);

          const avgTicket = completedOrders.length > 0 ? totalGross / completedOrders.length : 0;
          const conversionRate = data.orders.length > 0 ? (completedOrders.length / data.orders.length) * 100 : 0;
          const daysToShow = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
          const dailyYield = totalNet / daysToShow;
          const monthlyYield = dailyYield * 30;
          const hourlyYield = dailyYield / 24;
          // Avoid division by zero for operation yield
          const operationYield = completedOrders.length > 0 ? (totalNet / completedOrders.length) : 0;

          const chartDataMap: Record<string, { date: string; net: number; gross: number; count: number }> = {};

          // Initialize chartDataMap with all dates in the range, even if no orders
          const today = new Date();
          const startDate = new Date(today);
          if (dateRange === '7d') startDate.setDate(today.getDate() - 6); // Last 7 days including today
          else if (dateRange === '30d') startDate.setDate(today.getDate() - 29); // Last 30 days including today
          else if (dateRange === '90d') startDate.setDate(today.getDate() - 89); // Last 90 days including today
          else startDate.setDate(today.getDate() - 6); // Default to 7 days if 'all' or unknown

          for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
               const dateStr = d.toISOString().split('T')[0];
               chartDataMap[dateStr] = { date: dateStr, net: 0, gross: 0, count: 0 };
          }

          // Populate chart data logic...
          completedOrders.forEach((o: any) => {
               if (chartDataMap[o.date]) { // Only add if date is within the selected range
                    chartDataMap[o.date].net += o.net;
                    chartDataMap[o.date].gross += o.gross;
                    chartDataMap[o.date].count += 1;
               }
          });

          const chartData = Object.values(chartDataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          // Hourly data logic
          const hourlyMap = new Array(24).fill(0).map((_, i) => ({ hour: i, net: 0, gross: 0, count: 0, label: `${i}:00` }));
          completedOrders.forEach((o: any) => {
               const h = getHourFromTime(o.time);
               if (h >= 0 && h < 24) {
                    hourlyMap[h].net += o.net;
                    hourlyMap[h].gross += o.gross;
                    hourlyMap[h].count += 1;
               }
          });
          const hourlyData = hourlyMap;

          // User list logic
          const usersMap: Record<string, UserInfo> = {};

          // Helper to find payment profile
          const getProfile = (email: string) => props.userPaymentData?.find((p: any) => p.email === email);

          data.orders.forEach((o: any) => {
               if (!usersMap[o.user]) {
                    const profile = getProfile(o.user);
                    usersMap[o.user] = {
                         email: o.user,
                         fullName: profile?.full_name || 'No registrado',
                         phone: profile?.whatsapp_primary || 'N/A',
                         document: profile?.id_number || 'N/A',
                         registeredAt: profile?.created_at ? profile.created_at.split('T')[0] : 'N/A',
                         lastAccess: '2025-12-31 06:30 PM', // Mocked as we don't track login sessions here
                         totalOrders: 0,
                         totalSpend: 0,
                         lastOrder: o.date,
                         firstOrder: o.date,
                         status: 'REGULAR',
                         isBlocked: blockedUsers.includes(o.user),
                         disputeCount: data.disputes.filter((d: any) => d.user_email === o.user && d.status === 'OPEN').length,
                         paymentMethods: profile ? [
                              { type: 'Pago Móvil', detail: `${profile.pago_movil_phone} (${profile.pago_movil_bank || 'Banco ?'})` },
                              { type: 'Cuenta Bancaria', detail: `${profile.bank_name} - ${profile.account_number?.slice(-4)}` }
                         ].filter(pm => pm.detail && !pm.detail.includes('undefined')) : []
                    };
               }
               usersMap[o.user].totalOrders += 1;
               if (o.status === 'COMPLETED') usersMap[o.user].totalSpend += o.gross;
               if (new Date(o.date) > new Date(usersMap[o.user].lastOrder)) usersMap[o.user].lastOrder = o.date;
               if (new Date(o.date) < new Date(usersMap[o.user].firstOrder)) usersMap[o.user].firstOrder = o.date;
               if (usersMap[o.user].totalSpend > 100) usersMap[o.user].status = 'VIP';
               usersMap[o.user].isBlocked = blockedUsers.includes(o.user);
          });
          const usersList = Object.values(usersMap).sort((a: UserInfo, b: UserInfo) => b.totalSpend - a.totalSpend);

          return { totalGross, totalNet, dailyYield, monthlyYield, hourlyYield, operationYield, chartData, hourlyData, avgTicket, conversionRate, usersList, pendingCount: pendingOrders.length, grossTrend: { direction: 'up' as const, value: 12.5 }, netTrend: { direction: 'up' as const, value: 12.5 } };
     }, [data, dateRange, blockedUsers, props.userPaymentData]);

     const filteredOrders = useMemo(() => {
          return data.orders.filter((order: any) => {
               const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || order.user.toLowerCase().includes(searchTerm.toLowerCase());
               const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
               return matchesSearch && matchesStatus;
          });
     }, [data.orders, searchTerm, statusFilter]);

     const selectedUserHistory = useMemo(() => {
          if (!selectedUser) return [];
          return data.orders.filter(o => o.user === selectedUser.email).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
     }, [selectedUser, data.orders]);

     const handleAddCampaign = (e: React.FormEvent) => {
          e.preventDefault();
          if (!newCampaignCode.trim()) return;
          const newCamp: Campaign = { id: `new-${Date.now()}`, code: newCampaignCode.toUpperCase(), type: 'USER_REFERRAL', owner: 'Admin', discount: 5, uses: 0, generated_rev: 0, active: true, created: new Date().toISOString().split('T')[0], discount_percent: 5, uses_count: 0 };
          setLocalCampaigns(prev => [newCamp, ...prev]);
          setNewCampaignCode('');
     };

     const handleAddOffer = (e: React.FormEvent) => {
          e.preventDefault();
          if (!newOfferTitle.trim()) return;
          const newOffer: Offer = { id: `offer-${Date.now()}`, title: newOfferTitle, discount: 10, duration: '24h', active: true };
          setLocalOffers(prev => [newOffer, ...prev]);
          setNewOfferTitle('');
     };

     const toggleBlockUser = (email: string) => {
          setBlockedUsers(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
     };

     return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 font-mono text-black p-4 md:p-8 selection:bg-orange-500 selection:text-white">
               <div className="max-w-[1600px] mx-auto space-y-8">
                    {/* Header */}
                    <header className="border-b-4 border-black pb-6">
                         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                              <div className="flex-1">
                                   <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <Link href="/admin" className="bg-gray-200 text-black font-black text-xs px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-gray-300 flex items-center gap-1">
                                             <ArrowLeft size={14} /> VOLVER
                                        </Link>
                                        <span className="bg-blue-600 text-white font-black text-xs px-3 py-1.5 border-2 border-black transform -rotate-1 shadow-[3px_3px_0px_0px_#000]">ADMIN v3.5</span>
                                        <span className="text-orange-600 font-bold text-xs tracking-widest uppercase">/// Sistema Financiero</span>
                                        <span className="bg-green-400 text-black font-black text-[10px] px-2 py-1 border border-black">LIVE</span>
                                   </div>
                                   <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-2">
                                        Panel de <br /><span className="text-blue-600">Control Financiero</span>
                                   </h1>
                                   <p className="text-sm text-gray-600 font-bold">Última actualización: <span className="text-black">{data.summary.lastUpdate}</span></p>
                              </div>
                              <div className="flex flex-col gap-3 w-full lg:w-auto">
                                   <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white text-black p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                                             <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dólar Paralelo</p>
                                             <p className="text-xl font-mono font-black">{Number(data.summary.parallelBalance).toFixed(2)} <span className="text-xs">VES</span></p>
                                        </div>
                                        <div className="bg-green-100 border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                             <p className="text-[10px] font-bold uppercase text-green-800 flex items-center gap-1"><Landmark size={10} className="stroke-[3px]" /> BCV Oficial</p>
                                             <p className="text-xl font-black text-green-900">{Number(data.summary.bcvRate).toFixed(2)} VES</p>
                                        </div>
                                   </div>
                                   <div className="bg-black border-2 border-black p-4 shadow-[4px_4px_0px_0px_#f97316]">
                                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">TASA</p>
                                        <p className="text-4xl font-black font-mono text-orange-500">{Number(data.summary.exchangeRate).toFixed(2)} <span className="text-lg text-white">VES/USD</span></p>
                                   </div>
                                   <div className="flex gap-2">
                                        <ActionButton onClick={() => { }} variant="secondary" icon={Download}>Exportar</ActionButton>
                                        <ActionButton onClick={() => { /* No longer resets to INITIAL_DATA, maybe refetch props? */ }} variant="primary" icon={RefreshCw}>Actualizar</ActionButton>
                                   </div>
                              </div>
                         </div>
                    </header>

                    {/* Tabs */}
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                         <TabButton active={activeTab === 'orders'} onClick={() => { setActiveTab('orders'); setSelectedUser(null); }} icon={BarChart3} badge={metrics.pendingCount > 0 ? metrics.pendingCount : null}>Dashboard Principal</TabButton>
                         <TabButton active={activeTab === 'marketing'} onClick={() => { setActiveTab('marketing'); setSelectedUser(null); }} icon={Zap} badge={data.campaigns.filter(c => c.active).length}>Marketing & Ofertas</TabButton>
                         <TabButton active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setSelectedUser(null); }} icon={Users} badge={metrics.usersList.length}>Clientes</TabButton>
                    </div>

                    {/* Dashboard Tab */}
                    {activeTab === 'orders' && (
                         <>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                   <BrutalCard title="Volumen Total Procesado" value={formatCurrency(metrics.totalGross)} subValue={`Promedio: ${formatCurrency(metrics.avgTicket)} por orden`} icon={Wallet} colorClass="bg-blue-600" textColor="text-white" trend={metrics.grossTrend.direction} trendValue={metrics.grossTrend.value} />
                                   <BrutalCard title="Ganancia Neta (12%)" value={formatCurrency(metrics.totalNet)} subValue={`Calculado sobre $${metrics.totalGross.toFixed(0)} Brutos`} icon={TrendingUp} colorClass="bg-white" trend={metrics.netTrend.direction} trendValue={metrics.netTrend.value} />
                                   <BrutalCard title="Disputas Abiertas" value={data.disputes.filter(d => d.status === 'OPEN').length} subValue="Requieren atención inmediata" icon={Gavel} colorClass="bg-red-500" textColor="text-white" />
                                   <BrutalCard title="Tasa de Conversión" value={`${metrics.conversionRate.toFixed(1)}%`} subValue={`${data.orders.filter(o => o.status === 'COMPLETED').length} de ${data.orders.length} completadas`} icon={Activity} colorClass="bg-orange-500" />
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                   <div className="lg:col-span-2 space-y-8">
                                        {/* Chart Section */}
                                        <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                             <div className="flex justify-between items-center mb-6">
                                                  <div>
                                                       <h2 className="text-2xl font-black uppercase flex items-center gap-2"><Activity size={24} className="stroke-[3px] text-blue-600" />Análisis de Operaciones</h2>
                                                       <p className="text-xs font-bold text-gray-500 uppercase mt-1">Desglose Financiero · Ganancia Neta Fija 12%</p>
                                                  </div>
                                                  <div className="flex gap-2">
                                                       {['7d', '30d', '90d'].map(period => (
                                                            <button key={period} onClick={() => setDateRange(period)} className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all ${dateRange === period ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>{period}</button>
                                                       ))}
                                                  </div>
                                             </div>
                                             <div className="w-full h-[350px] bg-stone-50 border-2 border-gray-200 p-4 mb-6">
                                                  <ResponsiveContainer width="100%" height="100%">
                                                       <ComposedChart data={metrics.chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                                                            <defs><linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0.3} /></linearGradient></defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                            <XAxis dataKey="date" tick={{ fontFamily: 'monospace', fontSize: 11, fill: '#000', fontWeight: 'bold' }} tickFormatter={formatDate} />
                                                            <YAxis tick={{ fontFamily: 'monospace', fontSize: 11, fill: '#000', fontWeight: 'bold' }} tickFormatter={(val) => `$${val}`} width={60} />
                                                            <Tooltip labelFormatter={formatDate} formatter={(value) => [formatCurrency(value as number), '']} contentStyle={{ border: '2px solid black', boxShadow: '4px 4px 0px 0px black' }} />
                                                            <Area type="monotone" dataKey="gross" stroke="#2563eb" strokeWidth={2} fill="url(#colorGross)" name="gross" />
                                                            <Line type="monotone" dataKey="net" stroke="#000000" strokeWidth={4} dot={{ r: 5, fill: "#000", strokeWidth: 2, stroke: "#fff" }} name="net" />
                                                       </ComposedChart>
                                                  </ResponsiveContainer>
                                             </div>
                                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                  <div className="bg-purple-50 border-2 border-black p-3 flex justify-between items-center cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleFilterChange('30d')} title="Ver rendimiento mensual (30 días)">
                                                       <div><span className="text-[10px] font-bold uppercase text-gray-500 block">Mensual (Est.)</span><span className="text-lg font-black text-purple-700">{formatCurrency(metrics.monthlyYield)}</span></div>
                                                       <Calendar className="text-purple-600 stroke-[2px]" />
                                                  </div>
                                                  <div className="bg-green-50 border-2 border-black p-3 flex justify-between items-center cursor-pointer hover:bg-green-100 transition-colors" onClick={() => handleFilterChange('all')} title="Ver rendimiento total">
                                                       <div><span className="text-[10px] font-bold uppercase text-gray-500 block">Diario (Prom.)</span><span className="text-lg font-black text-green-700">{formatCurrency(metrics.dailyYield)}</span></div>
                                                       <Calendar className="text-green-600 stroke-[2px]" />
                                                  </div>
                                                  <div className="bg-orange-50 border-2 border-black p-3 flex justify-between items-center cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => { }} title="Ver desglose por hora (Gráfico abajo)">
                                                       <div><span className="text-[10px] font-bold uppercase text-gray-500 block">Por Hora</span><span className="text-lg font-black text-orange-700">{formatCurrency(metrics.hourlyYield)}</span></div>
                                                       <Clock className="text-orange-600 stroke-[2px]" />
                                                  </div>
                                                  <div className="bg-blue-50 border-2 border-black p-3 flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => { }} title="Promedio de ganancia por operación">
                                                       <div><span className="text-[10px] font-bold uppercase text-gray-500 block">Por Operación</span><span className="text-lg font-black text-blue-700">{formatCurrency(metrics.operationYield)}</span></div>
                                                       <Calculator className="text-blue-600 stroke-[2px]" />
                                                  </div>
                                             </div>
                                             <div className="border-t-2 border-black pt-4">
                                                  <h4 className="text-sm font-black uppercase mb-3 flex items-center gap-2"><Clock size={16} /> Rendimiento por Hora</h4>
                                                  <div className="h-40 w-full">
                                                       <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart data={metrics.hourlyData}>
                                                                 <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 'bold' }} interval={0} />
                                                                 <Tooltip formatter={(val) => formatCurrency(val as number)} contentStyle={{ border: '2px solid black' }} />
                                                                 <Bar dataKey="gross" fill="#2563eb" name="Volumen" radius={[4, 4, 0, 0]} />
                                                                 <Bar dataKey="net" fill="#10b981" name="Ganancia (12%)" radius={[4, 4, 0, 0]} />
                                                            </BarChart>
                                                       </ResponsiveContainer>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Orders Table */}
                                        <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                             <div className="p-4 border-b-2 border-black bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center flex-wrap gap-4">
                                                  <h3 className="font-black uppercase text-lg flex items-center gap-2"><CreditCard size={20} className="stroke-[3px]" /> Registro de Operaciones</h3>
                                                  <div className="flex gap-2 w-full sm:w-auto">
                                                       <SearchFilter placeholder="ID / Email" value={searchTerm} onChange={setSearchTerm} />
                                                       <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-2 border-black px-3 py-2 font-bold text-xs uppercase focus:outline-none">
                                                            <option value="ALL">TODOS</option><option value="COMPLETED">COMPLETADO</option><option value="PENDING">PENDIENTE</option><option value="CANCELLED">CANCELADO</option>
                                                       </select>
                                                  </div>
                                             </div>
                                             <div className="overflow-x-auto">
                                                  <table className="w-full text-left border-collapse">
                                                       <thead><tr className="bg-black text-white uppercase text-xs"><th className="p-3 border-r border-gray-700">ID</th><th className="p-3 border-r border-gray-700">Fecha</th><th className="p-3 border-r border-gray-700 text-right">Volumen</th><th className="p-3 border-r border-gray-700 text-right text-green-400">Neto (12%)</th><th className="p-3 border-r border-gray-700">Estado</th></tr></thead>
                                                       <tbody className="text-xs font-bold">
                                                            {filteredOrders.slice(0, 10).map((order) => (
                                                                 <tr key={order.id} className="border-b border-gray-200 hover:bg-yellow-50">
                                                                      <td className="p-3 font-mono text-blue-600">#{order.id}</td>
                                                                      <td className="p-3 font-mono text-gray-600">{order.date} <span className="text-[10px] block">{order.time}</span></td>
                                                                      <td className="p-3 font-mono text-right font-black">{formatCurrency(order.gross)}</td>
                                                                      <td className="p-3 font-mono text-right font-black text-green-600">+{formatCurrency(order.gross * 0.12)}</td>
                                                                      <td className="p-3"><StatusBadge status={order.status} /></td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Sidebar */}
                                   <div className="space-y-8">
                                        <div className="border-2 border-black bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                             <h3 className="text-xl font-black uppercase mb-4 text-white flex items-center gap-2"><Zap className="stroke-[3px]" /> Panel Rápido</h3>
                                             <div className="space-y-3">
                                                  <div className="bg-white border-2 border-black p-4 flex justify-between items-center">
                                                       <div><span className="text-xs font-bold uppercase text-gray-500 block">Órdenes Pendientes</span><span className="text-sm text-gray-600 font-mono">Verificando</span></div>
                                                       <span className="text-3xl font-black bg-yellow-400 text-black px-3 py-1 border-2 border-black">{metrics.pendingCount}</span>
                                                  </div>
                                                  <div className="bg-red-100 border-2 border-black p-4 flex justify-between items-center">
                                                       <div className="flex items-center gap-2"><AlertTriangle className="text-red-600" size={20} /><div><span className="text-xs font-black uppercase text-red-800 block">Disputas Activas</span><span className="text-[10px] text-red-600 font-bold uppercase">Requieren Acción</span></div></div>
                                                       <span className="text-3xl font-black bg-red-600 text-white px-3 py-1 border-2 border-black">{data.disputes.filter(d => d.status === 'OPEN').length}</span>
                                                  </div>
                                                  <ActionButton onClick={() => { }} variant="primary" icon={Download}>Descargar PDF</ActionButton>
                                             </div>
                                        </div>
                                        <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                             <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-2"><PieChart size={20} className="stroke-[3px]" /> Estado de Órdenes</h3>
                                             <div className="relative w-48 h-48 mx-auto mb-6">
                                                  <div className="absolute inset-0 rounded-full border-4 border-black flex items-center justify-center overflow-hidden" style={{ background: `conic-gradient(#10b981 0% ${metrics.conversionRate}%, #ef4444 ${metrics.conversionRate}% ${metrics.conversionRate + 6}%, #eab308 ${metrics.conversionRate + 6}% 100%)` }}>
                                                       <div className="absolute inset-6 bg-white rounded-full border-4 border-black flex flex-col items-center justify-center z-10">
                                                            <span className="text-3xl font-black">{metrics.conversionRate.toFixed(0)}%</span><span className="text-[10px] font-bold uppercase text-gray-500">Éxito</span>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </>
                    )}

                    {/* Marketing Tab */}
                    {activeTab === 'marketing' && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Create Campaign / Referral Card */}
                              <div className="border-2 border-black bg-gradient-to-br from-yellow-300 to-yellow-400 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
                                   <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-3">
                                        <Target className="w-6 h-6 stroke-[3px]" />
                                        <h3 className="text-xl font-black uppercase">Crear Campaña / Referido</h3>
                                   </div>
                                   <form onSubmit={handleAddCampaign} className="space-y-4">
                                        <div>
                                             <label className="text-[10px] font-bold uppercase mb-1 block">Código</label>
                                             <input type="text" value={newCampaignCode} onChange={(e) => setNewCampaignCode(e.target.value)} placeholder="EJ: VERANO2025" className="w-full border-2 border-black p-3 font-mono font-bold uppercase focus:outline-none" />
                                        </div>
                                        <div className="flex gap-2">
                                             <div className="w-2/3">
                                                  <label className="text-[10px] font-bold uppercase mb-1 block">Tipo</label>
                                                  <select className="w-full border-2 border-black p-3 font-bold uppercase focus:outline-none bg-white">
                                                       <option value="USER_REFERRAL">Referido de Usuario</option>
                                                       <option value="COUPON">Cupón de Descuento</option>
                                                       <option value="SEASONAL">Oferta Estacional</option>
                                                  </select>
                                             </div>
                                             <div className="w-1/3">
                                                  <label className="text-[10px] font-bold uppercase mb-1 block">Desc. %</label>
                                                  <input type="number" placeholder="5" className="w-full border-2 border-black p-3 font-bold text-center focus:outline-none" />
                                             </div>
                                        </div>
                                        <ActionButton type="submit" variant="primary" icon={Plus}>Guardar</ActionButton>
                                   </form>
                              </div>

                              {/* Create Flash Offer Card */}
                              <div className="border-2 border-black bg-gradient-to-br from-purple-300 to-purple-400 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
                                   <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-3">
                                        <Tag className="w-6 h-6 stroke-[3px]" />
                                        <h3 className="text-xl font-black uppercase">Crear Oferta Flash</h3>
                                   </div>
                                   <form onSubmit={handleAddOffer} className="space-y-4">
                                        <input type="text" value={newOfferTitle} onChange={(e) => setNewOfferTitle(e.target.value)} placeholder="TÍTULO OFERTA" className="w-full border-2 border-black p-3 font-mono font-bold uppercase focus:outline-none" />
                                        <div className="flex gap-2">
                                             <select className="w-1/2 border-2 border-black p-2 font-bold uppercase bg-white"><option>24h</option><option>48h</option><option>1 Semana</option></select>
                                             <input type="number" placeholder="%" className="w-1/2 border-2 border-black p-2 font-bold text-center bg-white" />
                                        </div>
                                        <ActionButton type="submit" variant="primary" icon={Zap}>Publicar Oferta</ActionButton>
                                   </form>
                              </div>

                              {/* Active Campaigns List */}
                              <div className="lg:col-span-2 space-y-4">
                                   <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-2 inline-block">Campañas y Referidos Activos</h3>
                                   {data.campaigns.length === 0 ? (
                                        <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300">
                                             <Tag className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                             <p className="font-bold text-gray-400 uppercase">No hay campañas activas</p>
                                             <p className="text-xs text-gray-400">Crea una nueva campaña o referido arriba para comenzar.</p>
                                        </div>
                                   ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {data.campaigns.map(c => (
                                                  <div key={c.id} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] transition-transform">
                                                       <div className="flex justify-between font-black uppercase mb-2">
                                                            <div className="flex items-center gap-2">
                                                                 <span className="bg-yellow-300 px-2 border border-black text-xs">{c.type === 'USER_REFERRAL' ? 'REFERIDO' : 'CAMPAÑA'}</span>
                                                                 <span>{c.code}</span>
                                                            </div>
                                                            <span className={`text-xs px-2 py-0.5 border border-black ${c.active ? 'bg-green-400 text-black' : 'bg-gray-200 text-gray-500'}`}>{c.active ? 'ACTIVA' : 'PAUSADA'}</span>
                                                       </div>
                                                       <div className="flex justify-between items-end mt-4">
                                                            <div className="text-xs font-bold text-gray-500">
                                                                 <div className="flex items-center gap-1"><Percent size={12} /> Descuento: <span className="text-black">{c.discount || c.discount_percent}%</span></div>
                                                                 <div className="flex items-center gap-1"><Users size={12} /> Usos Totales: <span className="text-black">{c.uses || c.uses_count}</span></div>
                                                            </div>
                                                            <button className="text-[10px] font-black uppercase underline hover:text-blue-600">Gestinar</button>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </div>

                              {/* Flash Offers List */}
                              <div className="lg:col-span-2 space-y-4">
                                   <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-2 inline-block">Ofertas Flash</h3>
                                   {data.offers.length === 0 ? (
                                        <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300">
                                             <Zap className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                             <p className="font-bold text-gray-400 uppercase">No hay ofertas flash</p>
                                             <p className="text-xs text-gray-400 uppercase tracking-widest">Próximamente</p>
                                        </div>
                                   ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {data.offers.map(o => (
                                                  <div key={o.id} className="border-2 border-black bg-purple-50 p-4 shadow-[4px_4px_0px_0px_#000]">
                                                       <div className="flex justify-between font-black uppercase mb-2">
                                                            <span>{o.title}</span><span className="text-purple-600">{o.duration}</span>
                                                       </div>
                                                       <div className="text-xs font-bold text-gray-500">Descuento: {o.discount}%</div>
                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </div>
                         </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                         <div className="min-h-[500px]">
                              {selectedUser ? (
                                   <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="flex flex-col lg:flex-row gap-6 mb-8 border-b-2 border-gray-200 pb-8">
                                             <div className="flex-shrink-0"><div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-black flex items-center justify-center text-4xl font-black text-white shadow-[4px_4px_0px_0px_#000]">{selectedUser.email.charAt(0).toUpperCase()}</div></div>
                                             <div className="flex-1 space-y-4">
                                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                       <div><div className="flex items-center gap-3"><h2 className="text-3xl font-black uppercase">{selectedUser.fullName || selectedUser.email}</h2>{selectedUser.isBlocked && <span className="bg-red-600 text-white text-xs px-2 py-1 font-black uppercase border border-black flex items-center gap-1"><Lock size={12} /> Bloqueado</span>}</div><p className="font-mono text-gray-500 font-bold mt-1">ID CLIENTE: #{selectedUser.email.split('@')[0]}</p></div>
                                                       <div className="flex gap-2">
                                                            <ActionButton onClick={() => setSelectedUser(null)} variant="secondary" icon={ArrowLeft}>Volver</ActionButton>
                                                            <ActionButton onClick={() => toggleBlockUser(selectedUser.email)} variant={selectedUser.isBlocked ? "success" : "danger"} icon={selectedUser.isBlocked ? Unlock : Lock}>{selectedUser.isBlocked ? "Desbloquear" : "Bloquear"}</ActionButton>
                                                       </div>
                                                  </div>
                                                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase">
                                                       <span className={`px-3 py-1 border border-black ${selectedUser.status === 'VIP' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{selectedUser.status === 'VIP' ? 'Nivel VIP Elite' : 'Nivel Regular'}</span>
                                                       <span className="px-3 py-1 border border-black bg-blue-100 text-blue-800 flex items-center gap-1"><MapPin size={12} /> Venezuela</span>
                                                       <span className="px-3 py-1 border border-black bg-green-100 text-green-800 flex items-center gap-1"><Smartphone size={12} /> Verificado</span>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* A. SECCIÓN DE INFORMACIÓN PERSONAL */}
                                        <div className="mb-8 p-4 border-2 border-black bg-blue-50 relative">
                                             <span className="absolute -top-3 left-4 bg-black text-white px-2 text-xs font-bold uppercase tracking-widest">Información Personal</span>
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                  <div className="flex justify-between border-b border-blue-200 pb-1">
                                                       <span className="font-bold text-gray-600">Nombre Completo:</span>
                                                       <span className="font-mono">{selectedUser.fullName}</span>
                                                  </div>
                                                  <div className="flex justify-between border-b border-blue-200 pb-1">
                                                       <span className="font-bold text-gray-600">Email Registrado:</span>
                                                       <span className="font-mono">{selectedUser.email}</span>
                                                  </div>
                                                  <div className="flex justify-between border-b border-blue-200 pb-1">
                                                       <span className="font-bold text-gray-600">Teléfono:</span>
                                                       <span className="font-mono">{selectedUser.phone}</span>
                                                  </div>
                                                  <div className="flex justify-between border-b border-blue-200 pb-1">
                                                       <span className="font-bold text-gray-600">Documento ID:</span>
                                                       <span className="font-mono">{selectedUser.document}</span>
                                                  </div>
                                                  <div className="flex justify-between border-b border-blue-200 pb-1">
                                                       <span className="font-bold text-gray-600">Registro:</span>
                                                       <span className="font-mono">{selectedUser.registeredAt}</span>
                                                  </div>
                                                  <div className="flex justify-between border-b border-blue-200 pb-1">
                                                       <span className="font-bold text-gray-600">Último Acceso:</span>
                                                       <span className="font-mono text-green-600">{selectedUser.lastAccess}</span>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                             <div className="bg-gray-50 p-4 border-2 border-black"><p className="text-[10px] font-black uppercase text-gray-500">Gasto Total</p><p className="text-2xl font-black text-green-600">{formatCurrency(selectedUser.totalSpend)}</p></div>
                                             <div className="bg-gray-50 p-4 border-2 border-black"><p className="text-[10px] font-black uppercase text-gray-500">Total Órdenes</p><p className="text-2xl font-black text-blue-600">{selectedUser.totalOrders}</p></div>
                                             <div className="bg-gray-50 p-4 border-2 border-black"><p className="text-[10px] font-black uppercase text-gray-500">Ticket Promedio</p><p className="text-2xl font-black text-purple-600">{formatCurrency(selectedUser.totalOrders > 0 ? selectedUser.totalSpend / selectedUser.totalOrders : 0)}</p></div>
                                             <div className="bg-gray-50 p-4 border-2 border-black"><p className="text-[10px] font-black uppercase text-gray-500">Primera Actividad</p><p className="text-lg font-black text-gray-700">{selectedUser.firstOrder}</p></div>
                                        </div>
                                        <div className="space-y-4">
                                             <div className="flex justify-between items-end border-b-4 border-black pb-2">
                                                  <h3 className="text-xl font-black uppercase flex items-center gap-2"><Activity className="stroke-[3px]" /> Historial de Operaciones</h3>
                                                  {/* C. FILTROS EN HISTORIAL */}
                                                  <div className="flex gap-2">
                                                       <select value={historyFilterDate} onChange={e => setHistoryFilterDate(e.target.value)} className="text-[10px] font-bold uppercase border-2 border-black p-1 bg-white focus:outline-none"><option value="ALL">Todas las fechas</option><option value="7d">Últimos 7 días</option><option value="30d">Últimos 30 días</option></select>
                                                       <select value={historyFilterStatus} onChange={e => setHistoryFilterStatus(e.target.value)} className="text-[10px] font-bold uppercase border-2 border-black p-1 bg-white focus:outline-none"><option value="ALL">Todos los estados</option><option value="COMPLETED">Completadas</option><option value="PENDING">Pendientes</option></select>
                                                       <input type="number" placeholder="Monto Min" value={historyFilterMinAmount} onChange={e => setHistoryFilterMinAmount(e.target.value)} className="w-20 text-[10px] font-bold border-2 border-black p-1 bg-white focus:outline-none text-center" />
                                                  </div>
                                             </div>

                                             <div className="overflow-x-auto border-2 border-black">
                                                  <table className="w-full text-left border-collapse">
                                                       <thead className="bg-black text-white text-xs uppercase"><tr><th className="p-3">ID</th><th className="p-3">Fecha</th><th className="p-3">Tipo</th><th className="p-3 text-right">Monto</th><th className="p-3 text-center">Estado</th></tr></thead>
                                                       <tbody className="text-sm font-mono bg-white">
                                                            {/* B. FILAS CLICKABLES */}
                                                            {selectedUserHistory
                                                                 .filter(o => (historyFilterDate === 'ALL' || (historyFilterDate === '7d' && new Date(o.date) >= new Date(Date.now() - 7 * 86400000)) || (historyFilterDate === '30d' && new Date(o.date) >= new Date(Date.now() - 30 * 86400000))) && (historyFilterStatus === 'ALL' || o.status === historyFilterStatus) && (!historyFilterMinAmount || o.gross >= Number(historyFilterMinAmount)))
                                                                 .length > 0 ?
                                                                 selectedUserHistory
                                                                      .filter(o => (historyFilterDate === 'ALL' || (historyFilterDate === '7d' && new Date(o.date) >= new Date(Date.now() - 7 * 86400000)) || (historyFilterDate === '30d' && new Date(o.date) >= new Date(Date.now() - 30 * 86400000))) && (historyFilterStatus === 'ALL' || o.status === historyFilterStatus) && (!historyFilterMinAmount || o.gross >= Number(historyFilterMinAmount)))
                                                                      .map((order) => (
                                                                           <tr key={order.id} className="border-b border-gray-200 hover:bg-yellow-100 cursor-pointer transition-colors" onClick={() => setSelectedOrder(order)}>
                                                                                <td className="p-3 font-bold text-blue-600 flex items-center gap-1">
                                                                                     <XCircle size={12} className="opacity-0 w-0" /> {/* Hack for consistency if specific icon desired */}
                                                                                     #{order.id}
                                                                                </td>
                                                                                <td className="p-3 text-gray-600">{order.date} <span className="text-xs ml-1 opacity-70">{order.time}</span></td>
                                                                                <td className="p-3 font-bold uppercase text-xs">{order.type}</td>
                                                                                <td className="p-3 text-right font-black">{formatCurrency(order.gross)}</td>
                                                                                <td className="p-3 flex justify-center"><StatusBadge status={order.status} /></td>
                                                                           </tr>
                                                                      ))
                                                                 : <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-bold uppercase">Sin historial</td></tr>}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>

                                        <div className="space-y-4 mt-8">
                                             <h3 className="text-xl font-black uppercase flex items-center gap-2 border-b-4 border-black pb-2 inline-block text-red-600"><AlertTriangle className="stroke-[3px]" /> Disputas & Reclamos</h3>
                                             <div className="overflow-x-auto border-2 border-black bg-red-50">
                                                  <table className="w-full text-left border-collapse">
                                                       <thead className="bg-red-600 text-white text-xs uppercase"><tr><th className="p-3">ID Caso</th><th className="p-3">Orden Asociada</th><th className="p-3">Razón</th><th className="p-3">Estado</th><th className="p-3 text-center">Acción</th></tr></thead>
                                                       <tbody className="text-sm font-mono bg-white">
                                                            {data.disputes.filter(d => d.user_email === selectedUser.email).length > 0 ?
                                                                 data.disputes.filter(d => d.user_email === selectedUser.email).map((dispute) => (
                                                                      <tr key={dispute.id} className="border-b border-red-100 hover:bg-red-50">
                                                                           <td className="p-3 font-bold text-gray-800">#{dispute.id.slice(0, 8)}</td>
                                                                           <td className="p-3 font-mono text-blue-600 cursor-pointer hover:underline">#{dispute.order_id.slice(0, 8)}</td>
                                                                           <td className="p-3 font-bold uppercase text-xs">{dispute.reason}</td>
                                                                           <td className="p-3"><span className={`px-2 py-1 text-[10px] font-black uppercase border border-black ${dispute.status === 'OPEN' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{dispute.status === 'OPEN' ? 'ABIERTA' : 'RESUELTA'}</span></td>
                                                                           <td className="p-3 text-center"><button className="text-[10px] font-black uppercase underline hover:text-red-600">Ver Caso</button></td>
                                                                      </tr>
                                                                 ))
                                                                 : <tr><td colSpan={5} className="p-4 text-center text-gray-400 font-bold uppercase italic">Este usuario no tiene disputas registradas</td></tr>
                                                            }
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>
                                        {/* D. SECCIÓN MÉTODOS DE PAGO */}
                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                             <div>
                                                  <h4 className="font-black uppercase mb-3 flex items-center gap-2 text-sm"><CreditCard size={16} /> Métodos de Pago Registrados</h4>
                                                  <div className="bg-white border-2 border-black p-0 space-y-0 text-sm">
                                                       {selectedUser.paymentMethods.length > 0 ? selectedUser.paymentMethods.map((pm, idx) => (
                                                            <div key={idx} className="flex justify-between p-3 border-b border-gray-200 last:border-b-0">
                                                                 <span className="font-bold uppercase text-xs text-gray-500">{pm.type}</span>
                                                                 <span className="font-mono font-bold">{pm.detail}</span>
                                                            </div>
                                                       )) : <div className="p-3 text-gray-400 italic text-xs">No hay métodos registrados</div>}
                                                  </div>
                                             </div>
                                             <div><h4 className="font-black uppercase mb-3 flex items-center gap-2 text-sm"><Globe size={16} /> Notas</h4><textarea className="w-full h-24 border border-black p-2 text-xs font-mono resize-none focus:outline-none" placeholder="Añadir nota..."></textarea></div>
                                        </div>
                                   </div>
                              ) : (
                                   <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black uppercase">Directorio de Clientes</h2><SearchFilter placeholder="Buscar..." value={searchTerm} onChange={setSearchTerm} /></div>
                                        <table className="w-full text-left border-collapse">
                                             <thead className="bg-black text-white text-xs uppercase"><tr><th className="p-3">Usuario</th><th className="p-3 text-center">Estado</th><th className="p-3 text-right">Gasto Total</th><th className="p-3 text-center">Última Actividad</th><th className="p-3 text-center">Acciones</th></tr></thead>
                                             <tbody className="text-sm font-mono">
                                                  {metrics.usersList.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((u, i) => (
                                                       <tr key={i} className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedUser(u)}>
                                                            <td className="p-3 font-bold flex items-center gap-3"><div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-black rounded-full">{u.email.charAt(0).toUpperCase()}</div><div>{u.email}{u.isBlocked && <span className="ml-2 text-[10px] bg-red-600 text-white px-1 font-bold">BLOQUEADO</span>}</div></td>
                                                            <td className="p-3 text-center"><span className={`text-[10px] font-black px-2 py-0.5 border border-black uppercase ${u.status === 'VIP' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>{u.status}</span></td>
                                                            <td className="p-3 text-right font-black text-green-600">{formatCurrency(u.totalSpend)}</td>
                                                            <td className="p-3 text-center text-gray-500 text-xs">{u.lastOrder}</td>
                                                            <td className="p-3 text-center"><button className="text-xs font-black uppercase underline hover:text-blue-600">Ver Perfil</button></td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              )}
                         </div>
                    )}
               </div>

               {/* RENDER MODAL */}
               <OrderDetailModal />
          </div>
     );

     // --- ORDER DETAIL MODAL ---
     function OrderDetailModal() {
          if (!selectedOrder) return null;
          return (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                         <button className="absolute top-4 right-4 p-2 bg-black text-white hover:bg-red-600 transition-colors" onClick={() => setSelectedOrder(null)}><XCircle size={20} /></button>
                         <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2"><CreditCard className="stroke-[3px]" /> Detalle de Operación #{selectedOrder.id}</h2>

                         <div className="grid grid-cols-2 gap-6 mb-6">
                              <div className="space-y-1">
                                   <span className="text-xs font-bold uppercase text-gray-500">Estado</span>
                                   <StatusBadge status={selectedOrder.status} />
                              </div>
                              <div className="space-y-1">
                                   <span className="text-xs font-bold uppercase text-gray-500">Fecha</span>
                                   <p className="font-mono font-bold">{selectedOrder.date} {selectedOrder.time}</p>
                              </div>
                              <div className="space-y-1">
                                   <span className="text-xs font-bold uppercase text-gray-500">Usuario Registrado</span>
                                   <p className="font-bold">{selectedOrder.user}</p>
                                   {selectedOrder.paypalEmail && selectedOrder.paypalEmail !== selectedOrder.user && (
                                        <div className="mt-1 border-t border-gray-300 pt-1">
                                             <span className="text-[10px] font-bold uppercase text-gray-400 block">Email PayPal</span>
                                             <p className="font-mono text-xs font-bold text-blue-600">{selectedOrder.paypalEmail}</p>
                                        </div>
                                   )}
                              </div>
                              <div className="space-y-1">
                                   <span className="text-xs font-bold uppercase text-gray-500">ID Completo</span>
                                   <p className="font-mono text-xs break-all">{selectedOrder.fullId}</p>
                              </div>
                         </div>

                         <div className="bg-gray-50 border-2 border-black p-4 mb-6">
                              <h3 className="font-black uppercase text-sm mb-3 border-b border-black pb-1">Desglose Financiero</h3>
                              <div className="space-y-2 text-sm">
                                   <div className="flex justify-between"><span>Monto Enviado (PayPal)</span><span className="font-mono font-bold">${formatCurrency(selectedOrder.gross)}</span></div>
                                   <div className="flex justify-between text-red-600"><span>Comisiones (-12%)</span><span className="font-mono font-bold">-${formatCurrency(selectedOrder.fee_revenue)}</span></div>
                                   <div className="flex justify-between text-blue-600"><span>Comisiones PayPal (Est.)</span><span className="font-mono font-bold">-${formatCurrency(selectedOrder.paypal_exp)}</span></div>
                                   <div className="flex justify-between border-t border-black pt-2 font-black text-lg"><span>Neto Recibido</span><span>${formatCurrency(selectedOrder.gross - selectedOrder.fee_revenue)}</span></div>
                                   <div className="flex justify-between text-gray-500 text-xs mt-1"><span>Tasa Aplicada</span><span>{data.summary.exchangeRate} VES/$</span></div>
                                   <div className="flex justify-between font-black text-green-600 text-lg"><span>Bolívares Entregados</span><span>{formatCurrency(selectedOrder.amountVES)} VES</span></div>
                              </div>
                         </div>

                         <div className="flex justify-end gap-3">
                              <button className="bg-gray-200 border-2 border-black px-4 py-2 font-bold uppercase hover:bg-gray-300 flex items-center gap-2"><Download size={16} /> Comprobante</button>
                              <button className="bg-black text-white px-4 py-2 font-bold uppercase border-2 border-transparent hover:bg-gray-800" onClick={() => setSelectedOrder(null)}>Cerrar</button>
                         </div>
                    </div>
               </div>
          );
     }
}

export default EarningsPanel;
