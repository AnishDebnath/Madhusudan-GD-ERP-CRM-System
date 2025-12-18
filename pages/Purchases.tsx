import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  Package, 
  FileText, 
  CheckCircle,
  Clock,
  Trash2,
  Download,
  Repeat,
  Coins
} from 'lucide-react';
import { PurchaseOrder } from '../types';
import { useStore } from '../context/StoreContext';

const Purchases = () => {
  const { purchases, addPurchase } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'Invoices' | 'Old Gold'>('Invoices');

  // New Purchase Form State
  const [newPurchase, setNewPurchase] = useState<{
    purchaseType: 'Vendor Invoice' | 'Old Gold';
    supplierName: string;
    customerMobile: string;
    invoiceNo: string;
    date: string;
    items: any[];
  }>({
    purchaseType: 'Vendor Invoice',
    supplierName: '',
    customerMobile: '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
  });

  const [currentItem, setCurrentItem] = useState({
    itemName: '',
    category: 'Gold',
    weight: 0,
    purity: '22K',
    rate: 0,
  });

  const addItem = () => {
    if (!currentItem.itemName || !currentItem.weight || !currentItem.rate) return;
    const amount = currentItem.weight * currentItem.rate;
    setNewPurchase(prev => ({
      ...prev,
      items: [...prev.items, { ...currentItem, amount }]
    }));
    // Reset item input
    setCurrentItem({ 
      itemName: '', 
      category: newPurchase.purchaseType === 'Old Gold' ? 'Old Gold' : 'Gold', 
      weight: 0, 
      purity: '22K', 
      rate: 0 
    });
  };

  const removeNewItem = (idx: number) => {
    setNewPurchase(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const savePurchase = () => {
    const total = newPurchase.items.reduce((sum, item) => sum + item.amount, 0);
    const order: PurchaseOrder = {
      id: Math.random().toString(),
      purchaseType: newPurchase.purchaseType,
      invoiceNo: newPurchase.invoiceNo || (newPurchase.purchaseType === 'Old Gold' ? `OG-${Date.now()}` : `PO-${Date.now()}`),
      supplierName: newPurchase.supplierName || (newPurchase.purchaseType === 'Old Gold' ? 'Walk-in Customer' : 'Unknown Supplier'),
      customerMobile: newPurchase.customerMobile,
      date: newPurchase.date,
      totalAmount: total,
      paidAmount: newPurchase.purchaseType === 'Old Gold' ? total : 0, // Old Gold is usually cash paid immediately
      status: newPurchase.purchaseType === 'Old Gold' ? 'Received' : 'Pending',
      items: newPurchase.items
    };
    addPurchase(order);
    setShowAddModal(false);
    // Reset Form
    setNewPurchase({ 
      purchaseType: 'Vendor Invoice',
      supplierName: '', 
      customerMobile: '',
      invoiceNo: '', 
      date: new Date().toISOString().split('T')[0], 
      items: [] 
    });
  };

  const filteredPurchases = purchases.filter(p => {
    const typeMatch = activeTab === 'Invoices' ? p.purchaseType === 'Vendor Invoice' : p.purchaseType === 'Old Gold';
    const searchMatch = p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Purchases & Inward</h1>
           <p className="text-gray-500 mt-1">Manage supplier invoices and old gold buybacks.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-maroon-900 text-white rounded-xl hover:bg-maroon-800 transition-colors shadow-lg shadow-maroon-900/20"
        >
          <Plus size={20} /> New Purchase
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
               <Truck size={24} />
            </div>
            <div>
               <p className="text-sm text-gray-500">Total Purchases</p>
               <p className="text-2xl font-bold text-gray-800">₹{purchases.filter(p => p.purchaseType === 'Vendor Invoice').reduce((acc, p) => acc + p.totalAmount, 0).toLocaleString('en-IN')}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
               <Clock size={24} />
            </div>
            <div>
               <p className="text-sm text-gray-500">Pending Payments</p>
               <p className="text-2xl font-bold text-gray-800">
                  ₹{purchases.filter(p => p.purchaseType === 'Vendor Invoice').reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0).toLocaleString('en-IN')}
               </p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
               <Repeat size={24} />
            </div>
            <div>
               <p className="text-sm text-gray-500">Old Gold Bought</p>
               <p className="text-2xl font-bold text-gray-800">
                  ₹{purchases.filter(p => p.purchaseType === 'Old Gold').reduce((acc, p) => acc + p.totalAmount, 0).toLocaleString('en-IN')}
               </p>
            </div>
         </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('Invoices')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Supplier Invoices
              </button>
              <button 
                onClick={() => setActiveTab('Old Gold')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Old Gold' ? 'bg-white text-yellow-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Old Gold (Exchange)
              </button>
           </div>
           
           <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                   type="text" 
                   placeholder={activeTab === 'Invoices' ? "Search Invoice or Supplier..." : "Search Customer Name..."}
                   className="w-full pl-10 py-2 rounded-lg bg-gray-50 border-none focus:ring-1 focus:ring-gold-500"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-600 hover:border-gold-500">
                 <Filter size={18} /> Filter
              </button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                 <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{activeTab === 'Invoices' ? 'Invoice Info' : 'Receipt Info'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{activeTab === 'Invoices' ? 'Supplier' : 'Customer'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredPurchases.map((po) => {
                    const balance = po.totalAmount - po.paidAmount;
                    return (
                    <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{po.invoiceNo}</p>
                          <p className="text-xs text-gray-500">{po.date}</p>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="font-medium">{po.supplierName}</div>
                          {po.customerMobile && <div className="text-xs text-gray-400">{po.customerMobile}</div>}
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-600">
                          {po.items.length} Items ({po.items.reduce((a,b)=>a+b.weight,0)}g)
                       </td>
                       <td className="px-6 py-4 font-bold text-maroon-900">
                          ₹{po.totalAmount.toLocaleString('en-IN')}
                       </td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                             po.status === 'Received' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                             {po.status}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <button className="text-gray-400 hover:text-maroon-900">
                             <FileText size={18} />
                          </button>
                       </td>
                    </tr>
                 )})}
                 {filteredPurchases.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No records found.
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {showAddModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
               <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                  <h2 className="text-lg font-serif font-semibold">New Purchase Entry</h2>
                  <button onClick={() => setShowAddModal(false)} className="opacity-70 hover:opacity-100">✕</button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Purchase Type Toggle */}
                  <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                     <button 
                        onClick={() => setNewPurchase({...newPurchase, purchaseType: 'Vendor Invoice', items: []})}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${newPurchase.purchaseType === 'Vendor Invoice' ? 'bg-white shadow-sm text-maroon-900' : 'text-gray-500'}`}
                     >
                        Supplier Invoice (Inward)
                     </button>
                     <button 
                        onClick={() => setNewPurchase({...newPurchase, purchaseType: 'Old Gold', items: []})}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${newPurchase.purchaseType === 'Old Gold' ? 'bg-yellow-100 shadow-sm text-yellow-800' : 'text-gray-500'}`}
                     >
                        Old Gold Purchase (Exchange)
                     </button>
                  </div>

                  {/* Header Info */}
                  <div className="grid grid-cols-3 gap-4">
                     <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{newPurchase.purchaseType === 'Old Gold' ? 'Receipt No (Auto)' : 'Invoice No'}</label>
                        <input 
                           type="text" 
                           className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                           value={newPurchase.invoiceNo}
                           placeholder={newPurchase.purchaseType === 'Old Gold' ? 'Auto-Generated' : 'Enter Invoice No'}
                           onChange={e => setNewPurchase({...newPurchase, invoiceNo: e.target.value})}
                           disabled={newPurchase.purchaseType === 'Old Gold'}
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{newPurchase.purchaseType === 'Old Gold' ? 'Customer Name' : 'Supplier Name'}</label>
                        <input 
                           type="text" 
                           className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                           value={newPurchase.supplierName}
                           onChange={e => setNewPurchase({...newPurchase, supplierName: e.target.value})}
                        />
                     </div>
                     {newPurchase.purchaseType === 'Old Gold' && (
                        <div className="col-span-1">
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Customer Phone</label>
                           <input 
                              type="text" 
                              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                              value={newPurchase.customerMobile}
                              onChange={e => setNewPurchase({...newPurchase, customerMobile: e.target.value})}
                           />
                        </div>
                     )}
                     <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date</label>
                        <input 
                           type="date" 
                           className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                           value={newPurchase.date}
                           onChange={e => setNewPurchase({...newPurchase, date: e.target.value})}
                        />
                     </div>
                  </div>

                  {/* Add Items Section */}
                  <div className={`p-4 rounded-xl border ${newPurchase.purchaseType === 'Old Gold' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                     <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        {newPurchase.purchaseType === 'Old Gold' ? <Coins size={16} /> : <Package size={16} />}
                        Add {newPurchase.purchaseType === 'Old Gold' ? 'Old Gold Items' : 'Stock Items'}
                     </h3>
                     <div className="grid grid-cols-5 gap-3 items-end">
                        <div className="col-span-2">
                           <label className="block text-xs font-medium text-gray-500 mb-1">Item Description</label>
                           <input 
                              type="text" 
                              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500 text-sm"
                              placeholder="e.g. Broken Chain"
                              value={currentItem.itemName}
                              onChange={e => setCurrentItem({...currentItem, itemName: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-500 mb-1">Weight (g)</label>
                           <input 
                              type="number" 
                              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500 text-sm"
                              value={currentItem.weight}
                              onChange={e => setCurrentItem({...currentItem, weight: Number(e.target.value)})}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-500 mb-1">{newPurchase.purchaseType === 'Old Gold' ? 'Rate (Buyback)' : 'Rate / g'}</label>
                           <input 
                              type="number" 
                              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500 text-sm"
                              value={currentItem.rate}
                              onChange={e => setCurrentItem({...currentItem, rate: Number(e.target.value)})}
                           />
                        </div>
                        <button 
                           onClick={addItem}
                           className="p-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors h-10 flex items-center justify-center"
                        >
                           <Plus size={20} />
                        </button>
                     </div>
                  </div>

                  {/* Items List */}
                  <div>
                     <h3 className="text-sm font-bold text-gray-800 mb-2">Summary</h3>
                     <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-gray-100">
                              <tr>
                                 <th className="p-3 font-semibold text-gray-600">Item</th>
                                 <th className="p-3 font-semibold text-gray-600">Weight</th>
                                 <th className="p-3 font-semibold text-gray-600">Rate</th>
                                 <th className="p-3 font-semibold text-gray-600">Total</th>
                                 <th className="p-3 font-semibold text-gray-600 w-10"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y">
                              {newPurchase.items.length === 0 ? (
                                 <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-400">No items added yet.</td>
                                 </tr>
                              ) : (
                                 newPurchase.items.map((item, idx) => (
                                    <tr key={idx}>
                                       <td className="p-3">{item.itemName}</td>
                                       <td className="p-3">{item.weight}g</td>
                                       <td className="p-3">₹{item.rate}</td>
                                       <td className="p-3 font-bold">₹{item.amount.toLocaleString('en-IN')}</td>
                                       <td className="p-3 text-center">
                                          <button onClick={() => removeNewItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                       </td>
                                    </tr>
                                 ))
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                     <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase">
                           {newPurchase.purchaseType === 'Old Gold' ? 'Total Payable to Customer' : 'Grand Total'}
                        </p>
                        <p className="text-2xl font-serif font-bold text-maroon-900">
                           ₹{newPurchase.items.reduce((sum, i) => sum + i.amount, 0).toLocaleString('en-IN')}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                  <button 
                     onClick={savePurchase}
                     disabled={newPurchase.items.length === 0}
                     className="w-full py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {newPurchase.purchaseType === 'Old Gold' ? 'Complete Purchase & Add to Tejori' : 'Create Purchase Order'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Purchases;