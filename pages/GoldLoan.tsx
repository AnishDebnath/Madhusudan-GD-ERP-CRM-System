
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Coins, 
  Scale, 
  FileText,
  X,
  History,
  Edit2,
  Banknote,
  Save,
  Phone,
  MapPin,
  ArrowRight,
  User,
  CheckCircle,
  Camera,
  Upload
} from 'lucide-react';
import { GoldLoan, InterestPayment } from '../types';
import { useStore } from '../context/StoreContext';

const GoldLoanPage = () => {
  const { loans, addLoan, updateLoan, rates } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<GoldLoan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<InterestPayment>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'Interest',
    note: ''
  });

  // New Loan Form State
  const [newLoan, setNewLoan] = useState<Partial<GoldLoan>>({
    customerName: '',
    phone: '',
    address: '',
    itemsDescription: '',
    grossWeight: 0,
    netWeight: 0,
    purity: '22K',
    interestRate: 1.5,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  const goldRate22K = rates.gold22k; // Using dynamic rate from store

  const calculateValuation = () => {
    const weight = Number(newLoan.netWeight) || 0;
    return weight * goldRate22K;
  };

  const handleOpenNewLoan = () => {
    setImagePreview(null);
    setNewLoan({
       customerName: '', phone: '', address: '', itemsDescription: '', grossWeight: 0, netWeight: 0, purity: '22K', interestRate: 1.5, startDate: new Date().toISOString().split('T')[0], dueDate: ''
    });
    setShowNewLoanModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSaveLoan = () => {
    const valuation = calculateValuation();
    const maxLoan = valuation * 0.75;
    
    const loan: GoldLoan = {
      id: Math.random().toString(),
      loanId: `GL-24-${100 + loans.length + 1}`,
      customerId: 'NEW',
      customerName: newLoan.customerName || 'Unknown',
      phone: newLoan.phone || '',
      address: newLoan.address || '',
      itemsDescription: newLoan.itemsDescription || '',
      grossWeight: Number(newLoan.grossWeight),
      netWeight: Number(newLoan.netWeight),
      purity: newLoan.purity || '22K',
      valuationAmount: valuation,
      loanAmount: Number(newLoan.loanAmount) || maxLoan,
      interestRate: Number(newLoan.interestRate),
      startDate: newLoan.startDate || '',
      dueDate: newLoan.dueDate || '',
      status: 'Active',
      payments: [],
      images: imagePreview ? [imagePreview] : ['https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 100)]
    };
    
    addLoan(loan);
    setShowNewLoanModal(false);
    setImagePreview(null);
  };

  const handleAddPayment = () => {
    if (!selectedLoan) return;

    const payment: InterestPayment = {
      id: Math.random().toString(),
      date: newPayment.date!,
      amount: Number(newPayment.amount),
      type: newPayment.type as any,
      note: newPayment.note
    };

    const updatedLoan: GoldLoan = {
      ...selectedLoan,
      payments: [payment, ...(selectedLoan.payments || [])],
      status: newPayment.type === 'Settlement' ? 'Closed' : selectedLoan.status
    };

    updateLoan(updatedLoan);
    setSelectedLoan(updatedLoan);
    setShowPaymentModal(false);
    setNewPayment({ date: new Date().toISOString().split('T')[0], amount: 0, type: 'Interest', note: '' });
  };

  const handleUpdateLoanDetails = () => {
    if(!selectedLoan) return;
    updateLoan(selectedLoan);
    setIsEditing(false);
  };

  const filteredLoans = loans.filter(l => 
    l.loanId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalInterestPaid = (loan: GoldLoan) => {
    return loan.payments ? loan.payments.filter(p => p.type === 'Interest').reduce((sum, p) => sum + p.amount, 0) : 0;
  };

  const getEstInterestAccrued = (loan: GoldLoan) => {
    const start = new Date(loan.startDate);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const period = Math.max(1, months); 
    return Math.round(loan.loanAmount * (loan.interestRate / 100) * period);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Gold Loans</h1>
           <p className="text-gray-500 mt-1">Manage collateral, valuations, and interest tracking.</p>
        </div>
        <button 
          onClick={handleOpenNewLoan}
          className="flex items-center gap-2 px-6 py-2.5 bg-maroon-900 text-white rounded-xl hover:bg-maroon-800 transition-colors shadow-lg shadow-maroon-900/20"
        >
          <Plus size={20} /> New Loan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
             <Coins size={24} />
           </div>
           <div>
             <p className="text-sm text-gray-500">Total Disbursed</p>
             <p className="text-2xl font-bold text-gray-800">₹{loans.reduce((acc, curr) => acc + curr.loanAmount, 0).toLocaleString('en-IN')}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <FileText size={24} />
           </div>
           <div>
             <p className="text-sm text-gray-500">Active Loans</p>
             <p className="text-2xl font-bold text-gray-800">{loans.filter(l => l.status === 'Active').length}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="p-3 bg-green-50 text-green-600 rounded-xl">
             <Banknote size={24} />
           </div>
           <div>
             <p className="text-sm text-gray-500">Interest Collected</p>
             <p className="text-2xl font-bold text-gray-800">
               ₹{loans.reduce((acc, curr) => acc + getTotalInterestPaid(curr), 0).toLocaleString('en-IN')}
             </p>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Loan ID or Customer..." 
                className="w-full pl-10 py-2 rounded-lg bg-gray-50 border-none focus:ring-1 focus:ring-gold-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-600 hover:border-gold-500">
              <Filter size={18} /> Filter
           </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                 <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan Details</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Collateral</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredLoans.map((loan) => (
                    <tr 
                      key={loan.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => { setSelectedLoan(loan); setIsEditing(false); }}
                    >
                       <td className="px-6 py-4">
                          <p className="font-bold text-maroon-900 group-hover:text-gold-600 transition-colors">{loan.loanId}</p>
                          <p className="text-xs text-gray-500">{loan.interestRate}% Int.</p>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div>
                                <p className="text-sm font-medium text-gray-800">{loan.customerName}</p>
                                <p className="text-xs text-gray-500">{loan.phone}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <p className="text-sm text-gray-800 line-clamp-1">{loan.itemsDescription}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                             <Scale size={12} /> {loan.netWeight}g Net
                          </p>
                       </td>
                       <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">₹{loan.loanAmount.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-green-600">Val: ₹{loan.valuationAmount.toLocaleString('en-IN')}</p>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                             loan.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                             loan.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                             'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                             {loan.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-gray-400">
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* Detail & Edit Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 h-[85vh] flex">
              
              {/* Left Panel: Info & Edit */}
              <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                 <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                       <h2 className="text-2xl font-serif font-bold text-maroon-900">{selectedLoan.loanId}</h2>
                       <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-maroon-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-maroon-900'}`}
                       >
                         {isEditing ? <Save size={18} onClick={handleUpdateLoanDetails} /> : <Edit2 size={18} />}
                       </button>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                       selectedLoan.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                       selectedLoan.status === 'Overdue' ? 'bg-red-100 text-red-700 border-red-200' :
                       'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                       {selectedLoan.status.toUpperCase()}
                    </span>
                 </div>

                 <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* Customer Details Section */}
                    <div>
                       <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                          <User size={14} /> Customer Details
                       </h3>
                       <div className="space-y-3">
                          <div>
                             <label className="text-xs text-gray-500">Name</label>
                             {isEditing ? (
                                <input 
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                  value={selectedLoan.customerName}
                                  onChange={e => setSelectedLoan({...selectedLoan, customerName: e.target.value})}
                                />
                             ) : (
                                <p className="font-medium text-gray-800">{selectedLoan.customerName}</p>
                             )}
                          </div>
                          <div>
                             <label className="text-xs text-gray-500">Phone</label>
                             {isEditing ? (
                                <input 
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                  value={selectedLoan.phone}
                                  onChange={e => setSelectedLoan({...selectedLoan, phone: e.target.value})}
                                />
                             ) : (
                                <p className="font-medium text-gray-800 flex items-center gap-2"><Phone size={12} /> {selectedLoan.phone}</p>
                             )}
                          </div>
                          <div>
                             <label className="text-xs text-gray-500">Address</label>
                             {isEditing ? (
                                <textarea 
                                  rows={2}
                                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                                  value={selectedLoan.address}
                                  onChange={e => setSelectedLoan({...selectedLoan, address: e.target.value})}
                                />
                             ) : (
                                <p className="text-sm text-gray-600 flex items-start gap-2"><MapPin size={12} className="mt-1 shrink-0" /> {selectedLoan.address || 'No address provided'}</p>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Loan Terms Section */}
                    <div className="pt-4 border-t border-gray-200">
                       <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                          <FileText size={14} /> Loan Terms
                       </h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-xs text-gray-500">Start Date</label>
                             <p className="font-medium text-gray-800 text-sm">{selectedLoan.startDate}</p>
                          </div>
                          <div>
                             <label className="text-xs text-gray-500">Due Date</label>
                             <p className="font-medium text-red-600 text-sm">{selectedLoan.dueDate}</p>
                          </div>
                          <div>
                             <label className="text-xs text-gray-500">Interest Rate</label>
                             <p className="font-medium text-gray-800 text-sm">{selectedLoan.interestRate}% / Month</p>
                          </div>
                          <div>
                             <label className="text-xs text-gray-500">Est. Interest</label>
                             <p className="font-medium text-gray-800 text-sm">₹{Math.round(selectedLoan.loanAmount * (selectedLoan.interestRate/100)).toLocaleString()}/mo</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Panel: Financials & History */}
              <div className="w-2/3 flex flex-col bg-white">
                 <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">Loan Overview</h3>
                    <button onClick={() => setSelectedLoan(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="p-8 overflow-y-auto">
                    {/* Collateral Card */}
                    <div className="bg-white border border-gold-200 rounded-2xl p-5 mb-8 shadow-sm flex items-start gap-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-20 h-20 bg-gold-50 rounded-bl-full -mr-4 -mt-4"></div>
                       <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                          <img src={selectedLoan.images?.[0]} alt="Item" className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 relative z-10">
                          <h4 className="font-bold text-lg text-maroon-900 mb-1">{selectedLoan.itemsDescription}</h4>
                          <div className="flex gap-4 text-sm text-gray-600 mb-3">
                             <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">Net: {selectedLoan.netWeight}g</span>
                             <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">Purity: {selectedLoan.purity}</span>
                          </div>
                          <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                             <div>
                                <p className="text-xs text-gray-400 uppercase">Valuation</p>
                                <p className="font-bold text-gray-800">₹{selectedLoan.valuationAmount.toLocaleString('en-IN')}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase">Loan Amount</p>
                                <p className="text-xl font-bold text-maroon-900">₹{selectedLoan.loanAmount.toLocaleString('en-IN')}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                          <p className="text-xs text-gray-500 uppercase mb-1">Total Paid</p>
                          <p className="text-lg font-bold text-green-600">₹{getTotalInterestPaid(selectedLoan).toLocaleString('en-IN')}</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                          <p className="text-xs text-gray-500 uppercase mb-1">Accrued (Est)</p>
                          <p className="text-lg font-bold text-orange-600">₹{getEstInterestAccrued(selectedLoan).toLocaleString('en-IN')}</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                          <p className="text-xs text-gray-500 uppercase mb-1">Balance Principal</p>
                          {/* Logic for reducing principal if partial payments exist would go here */}
                          <p className="text-lg font-bold text-gray-800">₹{selectedLoan.loanAmount.toLocaleString('en-IN')}</p>
                       </div>
                    </div>

                    {/* Payment History */}
                    <div className="mb-6">
                       <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2"><History size={18} /> Payment History</h3>
                          <button 
                             onClick={() => setShowPaymentModal(true)}
                             className="px-4 py-2 bg-maroon-900 text-white rounded-lg text-sm font-medium hover:bg-maroon-800 transition-colors flex items-center gap-2"
                          >
                             <Plus size={16} /> Receive Payment
                          </button>
                       </div>
                       
                       <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <table className="w-full text-sm text-left">
                             <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                   <th className="px-4 py-3">Date</th>
                                   <th className="px-4 py-3">Type</th>
                                   <th className="px-4 py-3">Note</th>
                                   <th className="px-4 py-3 text-right">Amount</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                                {selectedLoan.payments && selectedLoan.payments.length > 0 ? (
                                   selectedLoan.payments.map(payment => (
                                      <tr key={payment.id} className="hover:bg-gray-50">
                                         <td className="px-4 py-3 text-gray-600">{payment.date}</td>
                                         <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                               payment.type === 'Interest' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                               {payment.type}
                                            </span>
                                         </td>
                                         <td className="px-4 py-3 text-gray-500 italic">{payment.note || '-'}</td>
                                         <td className="px-4 py-3 text-right font-bold text-gray-800">₹{payment.amount.toLocaleString('en-IN')}</td>
                                      </tr>
                                   ))
                                ) : (
                                   <tr>
                                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                         No payments recorded yet.
                                      </td>
                                   </tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4">
                       <button className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50">
                          Mark as Default
                       </button>
                       <button className="flex-1 py-3 border border-maroon-900 text-maroon-900 rounded-xl font-medium hover:bg-maroon-50">
                          Print Statement
                       </button>
                       <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 shadow-md">
                          Settle & Close Loan
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Receive Payment Modal (Nested) */}
      {showPaymentModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 animate-in zoom-in-95 duration-200">
               <h3 className="text-lg font-bold text-gray-800 mb-4">Record Payment</h3>
               <div className="space-y-4">
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Amount</label>
                     <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input 
                           type="number" 
                           className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 font-bold text-maroon-900"
                           value={newPayment.amount}
                           onChange={e => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                           autoFocus
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Payment Type</label>
                     <div className="flex gap-2 mt-1">
                        {['Interest', 'Principal', 'Settlement'].map(type => (
                           <button
                              key={type}
                              onClick={() => setNewPayment({...newPayment, type: type as any})}
                              className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${
                                 newPayment.type === type 
                                 ? 'bg-maroon-900 text-white border-maroon-900' 
                                 : 'bg-white text-gray-600 border-gray-200'
                              }`}
                           >
                              {type}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                     <input 
                        type="date"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                        value={newPayment.date}
                        onChange={e => setNewPayment({...newPayment, date: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Note</label>
                     <input 
                        type="text" 
                        placeholder="e.g. UPI Ref..."
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                        value={newPayment.note}
                        onChange={e => setNewPayment({...newPayment, note: e.target.value})}
                     />
                  </div>
                  <div className="pt-2 flex gap-3">
                     <button 
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={handleAddPayment}
                        className="flex-1 py-2 bg-maroon-900 text-white rounded-lg font-medium shadow-md hover:bg-maroon-800"
                     >
                        Save
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* New Loan Modal (Existing) */}
      {showNewLoanModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
               <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white sticky top-0">
                  <h2 className="text-lg font-serif font-semibold">New Gold Loan</h2>
                  <button onClick={() => setShowNewLoanModal(false)} className="opacity-70 hover:opacity-100">✕</button>
               </div>
               
               <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                     <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Borrower Details</h3>
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Customer Name</label>
                           <input 
                             type="text" 
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                             value={newLoan.customerName}
                             onChange={e => setNewLoan({...newLoan, customerName: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Phone Number</label>
                           <input 
                             type="text" 
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                             value={newLoan.phone}
                             onChange={e => setNewLoan({...newLoan, phone: e.target.value})}
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Address</label>
                        <input 
                           type="text" 
                           className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                           value={newLoan.address}
                           onChange={e => setNewLoan({...newLoan, address: e.target.value})}
                        />
                     </div>
                  </div>

                  {/* Collateral Info */}
                  <div>
                     <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Collateral Valuation</h3>
                     
                     {/* Product Photo Upload */}
                     <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Item Photo</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors relative h-32 bg-gray-50 w-full">
                           {imagePreview ? (
                               <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                           ) : (
                               <div className="flex flex-col items-center">
                                   <Camera size={24} className="mb-2" />
                                   <span className="text-xs">Click to upload photo</span>
                               </div>
                           )}
                           <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Items Description</label>
                           <input 
                             type="text" 
                             placeholder="e.g. 2 Gold Chains"
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                             value={newLoan.itemsDescription}
                             onChange={e => setNewLoan({...newLoan, itemsDescription: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Purity</label>
                           <select 
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none bg-white"
                             value={newLoan.purity}
                             onChange={e => setNewLoan({...newLoan, purity: e.target.value})}
                           >
                             <option>24K</option>
                             <option>22K</option>
                             <option>18K</option>
                           </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Gross Wt (g)</label>
                           <input 
                             type="number" 
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                             value={newLoan.grossWeight}
                             onChange={e => setNewLoan({...newLoan, grossWeight: Number(e.target.value)})}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Net Wt (g)</label>
                           <input 
                             type="number" 
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                             value={newLoan.netWeight}
                             onChange={e => setNewLoan({...newLoan, netWeight: Number(e.target.value)})}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Current Rate</label>
                           <div className="p-2 bg-gray-100 rounded-lg text-gray-700 text-sm">₹{goldRate22K}/g</div>
                        </div>
                     </div>
                     
                     <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-yellow-800">Calculated Valuation</span>
                        <span className="text-lg font-bold text-maroon-900">₹{calculateValuation().toLocaleString('en-IN')}</span>
                     </div>
                  </div>

                  {/* Loan Details */}
                  <div>
                     <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Loan Terms</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Loan Amount</label>
                           <input 
                             type="number" 
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500 font-bold text-maroon-900"
                             value={newLoan.loanAmount}
                             onChange={e => setNewLoan({...newLoan, loanAmount: Number(e.target.value)})}
                           />
                           <p className="text-[10px] text-gray-500 mt-1">Max Eligible: ₹{(calculateValuation() * 0.75).toLocaleString('en-IN')} (75% LTV)</p>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Interest Rate (%) / Mo</label>
                           <input 
                             type="number" 
                             step="0.1"
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                             value={newLoan.interestRate}
                             onChange={e => setNewLoan({...newLoan, interestRate: Number(e.target.value)})}
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Start Date</label>
                           <input 
                             type="date" 
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                             value={newLoan.startDate}
                             onChange={e => setNewLoan({...newLoan, startDate: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Due Date</label>
                           <input 
                             type="date" 
                             className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                             value={newLoan.dueDate}
                             onChange={e => setNewLoan({...newLoan, dueDate: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>

                  <div className="pt-2">
                     <button 
                       onClick={handleSaveLoan}
                       className="w-full py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-all flex items-center justify-center gap-2"
                     >
                       <CheckCircle size={20} /> Approve & Disburse Loan
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default GoldLoanPage;
