
import React, { useState } from 'react';
import { 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Package,
  IndianRupee,
  Users,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Activity,
  Edit2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { KPICardProps, MetalRates } from '../types';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, icon, isPositive = true }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-maroon-50 text-maroon-900 group-hover:bg-maroon-900 group-hover:text-gold-400 transition-colors duration-300">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1 font-serif">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { totalSales, orders, transactions, goldStock, leads, products, repairs, cashInHand, rates, updateRates } = useStore();
  const navigate = useNavigate();
  const [showRateModal, setShowRateModal] = useState(false);
  const [newRates, setNewRates] = useState<MetalRates>(rates);

  // 1. Chart Data Aggregation (Last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const chartData = last7Days.map(date => {
    const daySales = transactions
      .filter(t => t.date === date && t.type === 'Credit' && t.category === 'Sales')
      .reduce((sum, t) => sum + t.amount, 0);
    const dayExpenses = transactions
      .filter(t => t.date === date && t.type === 'Debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Fallback for demo visualization if no real data exists for the day
    const hasData = daySales > 0 || dayExpenses > 0;
    
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      sales: hasData ? daySales : Math.floor(Math.random() * 300000) + 50000, 
      expense: hasData ? dayExpenses : Math.floor(Math.random() * 100000) + 20000
    };
  });

  // 2. Recent Transactions (Top 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // 3. Low Stock Alerts
  const lowStockItems = products.filter(p => p.stock <= 2).slice(0, 4);

  // 4. Today's Tasks
  const today = new Date().toISOString().split('T')[0];
  const dueOrders = orders.filter(o => o.deliveryDate === today && o.status !== 'Delivered');
  const dueRepairs = repairs.filter(r => r.estimatedDelivery === today && r.status !== 'Delivered');

  // KPI Calculations
  const totalGoldWeight = goldStock.reduce((acc, g) => acc + g.weight, 0);

  const handleUpdateRates = () => {
     updateRates({
       ...newRates,
       lastUpdated: new Date().toISOString()
     });
     setShowRateModal(false);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-maroon-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your jewelry business performance.</p>
        </div>
        <div 
          onClick={() => { setNewRates(rates); setShowRateModal(true); }}
          className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gold-200 flex gap-4 text-sm font-medium cursor-pointer hover:bg-gold-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span>
            </span>
            <span className="text-gray-600">Gold (22K): <span className="text-maroon-900 font-bold">₹{rates.gold22k.toLocaleString('en-IN')}/g</span></span>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Silver: <span className="text-maroon-900 font-bold">₹{rates.silver.toLocaleString('en-IN')}/g</span></span>
            <Edit2 size={14} className="text-gold-600 ml-2" />
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Sales" 
          value={`₹${totalSales.toLocaleString('en-IN')}`}
          trend="+12%" 
          icon={<IndianRupee size={24} />} 
        />
        <KPICard 
          title="Cash in Hand" 
          value={`₹${cashInHand.toLocaleString('en-IN')}`}
          trend="+5%"
          icon={<CreditCard size={24} />} 
        />
        <KPICard 
          title="Gold Stock" 
          value={`${totalGoldWeight.toFixed(2)} g`}
          icon={<Package size={24} />} 
        />
        <KPICard 
          title="Leads Pipeline" 
          value={`${leads.length} Active`} 
          icon={<Users size={24} />} 
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Charts & Tables) */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Chart Section */}
           <div className="bg-white p-6 rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100">
             <div className="flex justify-between items-center mb-6">
               <div>
                  <h2 className="text-lg font-serif font-bold text-gray-800">Financial Overview</h2>
                  <p className="text-xs text-gray-500">Sales vs Expenses (Last 7 Days)</p>
               </div>
               <button className="text-sm text-maroon-900 font-medium hover:underline">View Report</button>
             </div>
             <div className="h-[320px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} barSize={20}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#9ca3af', fontSize: 12}}
                     tickFormatter={(value) => `₹${value/1000}k`}
                   />
                   <Tooltip 
                     cursor={{fill: '#f9fafb'}}
                     contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                     formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, ""]}
                   />
                   <Legend iconType="circle" />
                   <Bar dataKey="sales" name="Income" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="expense" name="Expense" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Recent Transactions Table */}
           <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-lg font-serif font-bold text-gray-800">Recent Transactions</h2>
                 <button onClick={() => navigate('/accounts')} className="text-sm text-gray-500 hover:text-maroon-900 flex items-center gap-1">
                    View All <ArrowRight size={14} />
                 </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
                       <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Description</th>
                          <th className="px-6 py-3">Mode</th>
                          <th className="px-6 py-3 text-right">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                       {recentTransactions.length > 0 ? (
                          recentTransactions.map(tx => (
                             <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-500">{tx.date}</td>
                                <td className="px-6 py-3 font-medium text-gray-800">
                                   <div className="flex items-center gap-2">
                                      <div className={`p-1 rounded ${tx.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                         {tx.type === 'Credit' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                      </div>
                                      {tx.description}
                                   </div>
                                </td>
                                <td className="px-6 py-3 text-gray-600">{tx.paymentMode}</td>
                                <td className={`px-6 py-3 text-right font-bold ${tx.type === 'Credit' ? 'text-green-600' : 'text-gray-800'}`}>
                                   {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                </td>
                             </tr>
                          ))
                       ) : (
                          <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No transactions recorded yet.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6">

           {/* Quick Actions */}
           <div className="bg-white p-6 rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100">
             <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">Quick Actions</h2>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/pos')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-maroon-50 text-maroon-900 hover:bg-maroon-900 hover:text-white transition-all duration-300"
                >
                   <IndianRupee className="mb-2" size={20} />
                   <span className="text-xs font-semibold">New Sale</span>
                </button>
                <button 
                  onClick={() => navigate('/orders')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gold-50 text-yellow-700 hover:bg-yellow-600 hover:text-white transition-all duration-300"
                >
                   <Calendar className="mb-2" size={20} />
                   <span className="text-xs font-semibold">Order</span>
                </button>
                <button 
                  onClick={() => navigate('/purchases')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white transition-all duration-300"
                >
                   <Package className="mb-2" size={20} />
                   <span className="text-xs font-semibold">Purchase</span>
                </button>
                <button 
                  onClick={() => navigate('/leads')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white transition-all duration-300"
                >
                   <Users className="mb-2" size={20} />
                   <span className="text-xs font-semibold">Lead</span>
                </button>
             </div>
           </div>

           {/* Today's Tasks */}
           <div className="bg-white p-6 rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Clock size={20} className="text-maroon-900" /> Today's Tasks
              </h2>
              <div className="space-y-3">
                 {dueOrders.length > 0 && dueOrders.map(o => (
                    <div key={o.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                       <div className="mt-1 text-blue-600"><Package size={16} /></div>
                       <div>
                          <p className="text-sm font-bold text-gray-800">Order Due: {o.orderNo}</p>
                          <p className="text-xs text-gray-600">Customer: {o.customerName}</p>
                       </div>
                    </div>
                 ))}
                 {dueRepairs.length > 0 && dueRepairs.map(r => (
                    <div key={r.id} className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                       <div className="mt-1 text-purple-600"><Activity size={16} /></div>
                       <div>
                          <p className="text-sm font-bold text-gray-800">Repair Due: {r.jobId}</p>
                          <p className="text-xs text-gray-600">{r.productName}</p>
                       </div>
                    </div>
                 ))}
                 {dueOrders.length === 0 && dueRepairs.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                       <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                       <p>All caught up! No tasks due today.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Low Stock Alerts */}
           <div className="bg-white p-6 rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-serif font-bold text-gray-800 flex items-center gap-2">
                    <AlertCircle size={20} className="text-orange-600" /> Low Stock
                 </h2>
                 <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{lowStockItems.length}</span>
              </div>
              <div className="space-y-3">
                 {lowStockItems.length > 0 ? (
                    lowStockItems.map(item => (
                       <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                             <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />
                             <div>
                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-bold text-red-600">{item.stock} left</p>
                             <button onClick={() => navigate('/inventory')} className="text-[10px] text-blue-600 hover:underline">Restock</button>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="text-center py-4 text-gray-400 text-sm">
                       <CheckCircle size={24} className="mx-auto mb-1 opacity-50" />
                       <p>Inventory health is good.</p>
                    </div>
                 )}
              </div>
           </div>

        </div>
      </div>

      {/* Update Rates Modal */}
      {showRateModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white">
                  <h2 className="text-lg font-serif font-semibold">Update Daily Rates</h2>
                  <button onClick={() => setShowRateModal(false)} className="opacity-70 hover:opacity-100">✕</button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Gold 24K (Std)</label>
                     <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input 
                           type="number" 
                           className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500"
                           value={newRates.gold24k}
                           onChange={e => setNewRates({...newRates, gold24k: Number(e.target.value)})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Gold 22K (Ornament)</label>
                     <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input 
                           type="number" 
                           className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500"
                           value={newRates.gold22k}
                           onChange={e => setNewRates({...newRates, gold22k: Number(e.target.value)})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Gold 18K</label>
                     <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input 
                           type="number" 
                           className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500"
                           value={newRates.gold18k}
                           onChange={e => setNewRates({...newRates, gold18k: Number(e.target.value)})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Silver</label>
                     <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input 
                           type="number" 
                           step="0.01"
                           className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500"
                           value={newRates.silver}
                           onChange={e => setNewRates({...newRates, silver: Number(e.target.value)})}
                        />
                     </div>
                  </div>

                  <button 
                     onClick={handleUpdateRates}
                     className="w-full py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-all mt-2"
                  >
                     Update Rates
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Dashboard;
