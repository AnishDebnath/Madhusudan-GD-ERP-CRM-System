
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Download,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Transaction } from '../types';
import { useStore } from '../context/StoreContext';

const Accounts = () => {
  const { transactions, addTransaction, totalSales, totalExpenses, netProfit, cashInHand } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Credit' | 'Debit'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Transaction State
  const [newEntry, setNewEntry] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Expense',
    type: 'Debit',
    amount: 0,
    paymentMode: 'Cash',
    status: 'Completed'
  });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.referenceId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddEntry = () => {
    const entry: Transaction = {
      id: Math.random().toString(),
      date: newEntry.date!,
      description: newEntry.description || 'N/A',
      category: newEntry.category as any,
      type: newEntry.type as any,
      amount: Number(newEntry.amount),
      paymentMode: newEntry.paymentMode as any,
      status: 'Completed',
      referenceId: newEntry.referenceId
    };
    addTransaction(entry);
    setShowAddModal(false);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'Expense',
      type: 'Debit',
      amount: 0,
      paymentMode: 'Cash',
      status: 'Completed'
    });
  };

  const getPaymentIcon = (mode: string) => {
    switch(mode) {
      case 'Cash': return <Banknote size={14} />;
      case 'Card': return <CreditCard size={14} />;
      case 'UPI': return <Smartphone size={14} />;
      default: return <Wallet size={14} />;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Accounts & Ledger</h1>
           <p className="text-gray-500 mt-1">Track daily income, expenses, and net profit.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              <Download size={18} /> Export
           </button>
           <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-maroon-900 text-white rounded-xl hover:bg-maroon-800 transition-colors shadow-lg shadow-maroon-900/20"
           >
            <Plus size={20} /> New Entry
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                 <TrendingUp size={24} />
              </div>
           </div>
           <p className="text-sm text-gray-500 uppercase font-medium">Total Income</p>
           <h3 className="text-2xl font-bold text-gray-900">₹{totalSales.toLocaleString('en-IN')}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                 <TrendingDown size={24} />
              </div>
           </div>
           <p className="text-sm text-gray-500 uppercase font-medium">Total Expenses</p>
           <h3 className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString('en-IN')}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                 <Wallet size={24} />
              </div>
           </div>
           <p className="text-sm text-gray-500 uppercase font-medium">Net Profit</p>
           <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
             ₹{netProfit.toLocaleString('en-IN')}
           </h3>
        </div>

        <div className="bg-gradient-to-br from-gold-500 to-gold-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <p className="text-gold-100 text-sm font-medium uppercase mb-1">Cash In Hand</p>
           <h3 className="text-3xl font-serif font-bold">₹{cashInHand.toLocaleString('en-IN')}</h3>
           <p className="text-xs text-gold-100/80 mt-2">Updated: Just now</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
         {/* Toolbar */}
         <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
               <button 
                 onClick={() => setFilterType('All')}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === 'All' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 All Transactions
               </button>
               <button 
                 onClick={() => setFilterType('Credit')}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === 'Credit' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Income
               </button>
               <button 
                 onClick={() => setFilterType('Debit')}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === 'Debit' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Expense
               </button>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search ledger..." 
                    className="w-full pl-10 py-2 rounded-lg bg-gray-50 border-none focus:ring-1 focus:ring-gold-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:border-gold-500 hover:text-gold-600 transition-colors">
                  <Calendar size={20} />
               </button>
               <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:border-gold-500 hover:text-gold-600 transition-colors">
                  <Filter size={20} />
               </button>
            </div>
         </div>

         {/* Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Particulars</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Mode</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map(transaction => (
                     <tr key={transaction.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                           {transaction.date}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                 transaction.type === 'Credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                              }`}>
                                 {transaction.type === 'Credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                              </div>
                              <div>
                                 <p className="font-medium text-gray-800 text-sm">{transaction.description}</p>
                                 {transaction.referenceId && (
                                    <p className="text-[10px] text-gray-400 font-mono">Ref: {transaction.referenceId}</p>
                                 )}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              {transaction.category}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                           <div className="flex items-center gap-2">
                              {getPaymentIcon(transaction.paymentMode)}
                              {transaction.paymentMode}
                           </div>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right ${
                           transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                           {transaction.type === 'Credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              transaction.status === 'Completed' 
                                 ? 'bg-green-50 text-green-700 border-green-200' 
                                 : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                           }`}>
                              {transaction.status === 'Completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                              {transaction.status}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white">
                  <h2 className="text-lg font-serif font-semibold">New Ledger Entry</h2>
                  <button onClick={() => setShowAddModal(false)} className="opacity-70 hover:opacity-100">✕</button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="flex gap-4 p-1 bg-gray-100 rounded-xl mb-4">
                     <button 
                        onClick={() => setNewEntry({...newEntry, type: 'Credit', category: 'Sales'})}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                           newEntry.type === 'Credit' 
                           ? 'bg-green-600 text-white shadow-md' 
                           : 'text-gray-500 hover:bg-gray-200'
                        }`}
                     >
                        Income (Credit)
                     </button>
                     <button 
                        onClick={() => setNewEntry({...newEntry, type: 'Debit', category: 'Expense'})}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                           newEntry.type === 'Debit' 
                           ? 'bg-red-600 text-white shadow-md' 
                           : 'text-gray-500 hover:bg-gray-200'
                        }`}
                     >
                        Expense (Debit)
                     </button>
                  </div>

                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Amount</label>
                     <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input 
                           type="number" 
                           className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-lg font-bold text-gray-800"
                           value={newEntry.amount}
                           onChange={e => setNewEntry({...newEntry, amount: Number(e.target.value)})}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                        <input 
                           type="date" 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                           value={newEntry.date}
                           onChange={e => setNewEntry({...newEntry, date: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
                        <select 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500 bg-white"
                           value={newEntry.category}
                           onChange={e => setNewEntry({...newEntry, category: e.target.value as any})}
                        >
                           {newEntry.type === 'Credit' ? (
                              <>
                                 <option>Sales</option>
                                 <option>Other</option>
                              </>
                           ) : (
                              <>
                                 <option>Purchase</option>
                                 <option>Expense</option>
                                 <option>Salary</option>
                                 <option>Utility</option>
                                 <option>Other</option>
                              </>
                           )}
                        </select>
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                     <input 
                        type="text" 
                        placeholder="e.g. Tea for guests, Shop cleaning..."
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                        value={newEntry.description}
                        onChange={e => setNewEntry({...newEntry, description: e.target.value})}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Payment Mode</label>
                        <select 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500 bg-white"
                           value={newEntry.paymentMode}
                           onChange={e => setNewEntry({...newEntry, paymentMode: e.target.value as any})}
                        >
                           <option>Cash</option>
                           <option>Card</option>
                           <option>UPI</option>
                           <option>Bank Transfer</option>
                           <option>Other</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Reference ID (Optional)</label>
                        <input 
                           type="text" 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                           value={newEntry.referenceId || ''}
                           onChange={e => setNewEntry({...newEntry, referenceId: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="pt-2">
                     <button 
                        onClick={handleAddEntry}
                        className="w-full py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-all"
                     >
                        Save Entry
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Accounts;
