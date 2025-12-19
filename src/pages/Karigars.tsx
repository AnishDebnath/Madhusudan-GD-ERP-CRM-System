import React, { useState } from 'react';
import {
   Search,
   Plus,
   Hammer,
   ArrowDownLeft,
   ArrowUpRight,
   Package,
   AlertCircle,
   Banknote
} from 'lucide-react';
import { Karigar, WorkOrder } from '../types';
import { useStore } from '../context/StoreContext';

const Karigars = () => {
   const { karigars, workOrders, addWorkOrder, updateWorkOrder, addKarigar, updateKarigar, addTransaction } = useStore();
   const [selectedKarigar, setSelectedKarigar] = useState<Karigar | null>(null);
   const [showIssueModal, setShowIssueModal] = useState(false);
   const [showReceiveModal, setShowReceiveModal] = useState(false);
   const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
   const [showPayModal, setShowPayModal] = useState(false);
   const [paymentAmount, setPaymentAmount] = useState(0);

   // Issue Form
   const [newIssue, setNewIssue] = useState({
      designCode: '',
      goldWeight: 0,
      purity: '22K',
      dueDate: ''
   });

   // Receive Form
   const [receiveData, setReceiveData] = useState({
      finishedWeight: 0,
      netWeight: 0,
      makingCharges: 0
   });

   const handleIssueMaterial = () => {
      if (!selectedKarigar) return;

      const wo: WorkOrder = {
         id: Math.random().toString(),
         orderId: `WO-24-${100 + workOrders.length + 1}`,
         artisanId: selectedKarigar.id,
         issueDate: new Date().toISOString().split('T')[0],
         dueDate: newIssue.dueDate,
         designCode: newIssue.designCode,
         status: 'Issued',
         goldIssued: Number(newIssue.goldWeight),
         goldPurity: newIssue.purity
      };

      const updatedKarigar = {
         ...selectedKarigar,
         goldBalance: selectedKarigar.goldBalance + Number(newIssue.goldWeight)
      };

      addWorkOrder(wo);
      updateKarigar(updatedKarigar);
      setSelectedKarigar(updatedKarigar);
      setShowIssueModal(false);
      setNewIssue({ designCode: '', goldWeight: 0, purity: '22K', dueDate: '' });
   };

   const handleReceiveMaterial = () => {
      if (!selectedWO || !selectedKarigar) return;

      // Calculate Wastage/Loss
      const wastage = selectedWO.goldIssued - Number(receiveData.finishedWeight);

      const updatedWO: WorkOrder = {
         ...selectedWO,
         status: 'Completed',
         finishedWeight: Number(receiveData.finishedWeight),
         netWeight: Number(receiveData.netWeight),
         wastage: wastage,
         makingCharges: Number(receiveData.makingCharges)
      };

      // Credit Karigar Gold Balance (He returned the gold as items)
      // Credit Karigar Cash Balance (He earned making charges)
      const updatedKarigar = {
         ...selectedKarigar,
         goldBalance: selectedKarigar.goldBalance - selectedWO.goldIssued, // Full issued amount settled
         cashBalance: (selectedKarigar.cashBalance || 0) + Number(receiveData.makingCharges)
      };

      updateWorkOrder(updatedWO);
      updateKarigar(updatedKarigar);
      setSelectedKarigar(updatedKarigar);
      setShowReceiveModal(false);
      setSelectedWO(null);
      setReceiveData({ finishedWeight: 0, netWeight: 0, makingCharges: 0 });
   };

   const handlePayKarigar = () => {
      if (!selectedKarigar || paymentAmount <= 0) return;

      addTransaction({
         id: Math.random().toString(),
         date: new Date().toISOString().split('T')[0],
         description: `Payment to Karigar: ${selectedKarigar.name}`,
         category: 'Expense', // or 'Salary' / 'Making Charges'
         type: 'Debit',
         amount: paymentAmount,
         paymentMode: 'Cash',
         status: 'Completed'
      });

      const updatedKarigar = {
         ...selectedKarigar,
         cashBalance: selectedKarigar.cashBalance - paymentAmount
      };

      updateKarigar(updatedKarigar);
      setSelectedKarigar(updatedKarigar);
      setShowPayModal(false);
      setPaymentAmount(0);
   };

   return (
      <div className="p-8">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-serif font-bold text-maroon-900">Karigar Management</h1>
               <p className="text-gray-500 mt-1">Manage Karigars, Material Issues, and Production.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-maroon-900 text-white rounded-xl hover:bg-maroon-800 transition-colors shadow-lg shadow-maroon-900/20">
               <Plus size={20} /> Add Karigar
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Artisan List */}
            <div className="lg:col-span-1 space-y-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Search Karigar..." className="w-full pl-10 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-gold-500 outline-none shadow-sm" />
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {karigars.map(karigar => (
                     <div
                        key={karigar.id}
                        onClick={() => setSelectedKarigar(karigar)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${selectedKarigar?.id === karigar.id ? 'bg-gold-50 border-l-4 border-l-maroon-900' : ''}`}
                     >
                        <div className="flex justify-between items-start mb-1">
                           <h3 className="font-bold text-gray-800">{karigar.name}</h3>
                           <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{karigar.skill}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{karigar.phone}</p>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-gray-500">Gold Due:</span>
                           <span className="font-bold text-maroon-900">{karigar.goldBalance.toFixed(2)} g</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Right: Details & Transactions */}
            <div className="lg:col-span-2">
               {selectedKarigar ? (
                  <div className="space-y-6">
                     {/* Header Card */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                           <h2 className="text-2xl font-serif font-bold text-maroon-900">{selectedKarigar.name}</h2>
                           <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span>{selectedKarigar.phone}</span>
                              <span>•</span>
                              <span className="text-green-600 font-medium">{selectedKarigar.status}</span>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <div className="text-right mr-4">
                              <p className="text-xs text-gray-500">Payable Balance</p>
                              <p className="font-bold text-lg text-maroon-900">₹{selectedKarigar.cashBalance?.toLocaleString() || 0}</p>
                           </div>
                           <button
                              onClick={() => setShowPayModal(true)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 flex items-center gap-2"
                           >
                              <Banknote size={18} /> Pay
                           </button>
                           <button
                              onClick={() => setShowIssueModal(true)}
                              className="px-6 py-2 bg-gold-500 text-maroon-900 font-bold rounded-lg hover:bg-gold-600 shadow-md flex items-center gap-2"
                           >
                              <ArrowUpRight size={18} /> Issue Job
                           </button>
                        </div>
                     </div>

                     {/* Active Jobs */}
                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                           <h3 className="font-bold text-gray-800 flex items-center gap-2"><Package size={18} /> Active Work Orders</h3>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 text-gray-500">
                                 <tr>
                                    <th className="px-6 py-3">Order ID</th>
                                    <th className="px-6 py-3">Design</th>
                                    <th className="px-6 py-3">Issued</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Action</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                 {workOrders.filter(wo => wo.artisanId === selectedKarigar.id).map(wo => (
                                    <tr key={wo.id} className="hover:bg-gray-50">
                                       <td className="px-6 py-4 font-medium text-maroon-900">{wo.orderId}</td>
                                       <td className="px-6 py-4 font-mono text-gray-700">{wo.designCode}</td>
                                       <td className="px-6 py-4 font-bold">{wo.goldIssued}g <span className="text-xs font-normal text-gray-500">({wo.goldPurity})</span></td>
                                       <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${wo.status === 'Issued' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'
                                             }`}>
                                             {wo.status}
                                          </span>
                                          {wo.status === 'Completed' && wo.wastage !== undefined && (
                                             <div className="text-[10px] text-red-500 mt-1">Loss: {wo.wastage.toFixed(2)}g</div>
                                          )}
                                       </td>
                                       <td className="px-6 py-4">
                                          {wo.status === 'Issued' && (
                                             <button
                                                onClick={() => { setSelectedWO(wo); setShowReceiveModal(true); }}
                                                className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                                             >
                                                <ArrowDownLeft size={14} /> Receive
                                             </button>
                                          )}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 min-h-[400px]">
                     <Hammer size={48} className="mb-4 opacity-20" />
                     <p className="text-lg">Select a karigar to manage jobs</p>
                  </div>
               )}
            </div>
         </div>

         {/* Issue Modal */}
         {showIssueModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white">
                     <h2 className="text-lg font-serif font-semibold">Issue Material</h2>
                     <button onClick={() => setShowIssueModal(false)} className="opacity-70 hover:opacity-100">✕</button>
                  </div>

                  <div className="p-6 space-y-4">
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Design / Item Code</label>
                        <input
                           type="text"
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500"
                           value={newIssue.designCode}
                           onChange={e => setNewIssue({ ...newIssue, designCode: e.target.value })}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase">Gold Weight (g)</label>
                           <input
                              type="number"
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500"
                              value={newIssue.goldWeight}
                              onChange={e => setNewIssue({ ...newIssue, goldWeight: Number(e.target.value) })}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase">Purity</label>
                           <select
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none bg-white"
                              value={newIssue.purity}
                              onChange={e => setNewIssue({ ...newIssue, purity: e.target.value })}
                           >
                              <option>24K</option>
                              <option>22K</option>
                              <option>18K</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Due Date</label>
                        <input
                           type="date"
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500"
                           value={newIssue.dueDate}
                           onChange={e => setNewIssue({ ...newIssue, dueDate: e.target.value })}
                        />
                     </div>

                     <button
                        onClick={handleIssueMaterial}
                        className="w-full py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-all mt-2"
                     >
                        Confirm Issue
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Receive Modal */}
         {showReceiveModal && selectedWO && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="bg-green-700 px-6 py-4 flex justify-between items-center text-white">
                     <h2 className="text-lg font-serif font-semibold">Receive Finished Goods</h2>
                     <button onClick={() => setShowReceiveModal(false)} className="opacity-70 hover:opacity-100">✕</button>
                  </div>

                  <div className="p-6 space-y-4">
                     <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4">
                        Receiving against <strong>{selectedWO.orderId}</strong>. <br />
                        Issued: <strong>{selectedWO.goldIssued}g</strong> ({selectedWO.goldPurity})
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase">Finished Wt (g)</label>
                           <input
                              type="number"
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                              value={receiveData.finishedWeight}
                              onChange={e => setReceiveData({ ...receiveData, finishedWeight: Number(e.target.value) })}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase">Net Wt (g)</label>
                           <input
                              type="number"
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                              value={receiveData.netWeight}
                              onChange={e => setReceiveData({ ...receiveData, netWeight: Number(e.target.value) })}
                           />
                        </div>
                     </div>

                     {/* Auto Calc Loss */}
                     <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-100">
                        <span className="text-sm text-red-700 font-medium flex items-center gap-2">
                           <AlertCircle size={16} /> Loss / Wastage
                        </span>
                        <span className="font-bold text-red-800">
                           {Math.max(0, selectedWO.goldIssued - receiveData.finishedWeight).toFixed(2)} g
                        </span>
                     </div>

                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Making Charges (₹)</label>
                        <input
                           type="number"
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                           value={receiveData.makingCharges}
                           onChange={e => setReceiveData({ ...receiveData, makingCharges: Number(e.target.value) })}
                        />
                     </div>

                     <button
                        onClick={handleReceiveMaterial}
                        className="w-full py-3 bg-green-700 text-white rounded-xl font-bold shadow-lg hover:bg-green-800 transition-all mt-2"
                     >
                        Receive to Stock
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Pay Modal */}
         {showPayModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Settle Payment</h3>
                  <div className="bg-gray-50 p-3 rounded mb-4">
                     <span className="text-xs text-gray-500">Current Balance:</span>
                     <span className="block text-lg font-bold text-maroon-900">₹{selectedKarigar?.cashBalance?.toLocaleString()}</span>
                  </div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount to Pay</label>
                  <input
                     type="number"
                     className="w-full p-2 border rounded-lg mb-4 text-lg font-bold text-green-700 outline-none"
                     value={paymentAmount}
                     onChange={e => setPaymentAmount(Number(e.target.value))}
                  />
                  <div className="flex gap-2">
                     <button onClick={() => setShowPayModal(false)} className="flex-1 py-2 border rounded-lg text-gray-600">Cancel</button>
                     <button onClick={handlePayKarigar} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold">Confirm Pay</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Karigars;