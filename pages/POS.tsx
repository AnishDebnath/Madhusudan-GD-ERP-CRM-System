
import React, { useState } from 'react';
import { Search, Plus, Trash2, Scan, CreditCard, Banknote, Smartphone, Printer, User, X, Edit2, CheckCircle, Calculator, History, FileText } from 'lucide-react';
import { Product, CartItem, Transaction, Customer } from '../types';
import { useStore } from '../context/StoreContext';

const POS = () => {
  const { products, updateProductStock, addTransaction, customers, addCustomer, transactions, shopProfile } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [activeTab, setActiveTab] = useState<'Catalog' | 'History'>('Catalog');
  
  // Invoice Modal State
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  // New Customer State
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Edit Item State
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    // Default Making Charges logic (e.g., ₹800 per gram)
    const defaultMakingRate = 800; 
    const makingCharge = product.netWeight * defaultMakingRate;

    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        const newQty = existing.quantity + 1;
        return prev.map(p => p.id === product.id ? { 
            ...p, 
            quantity: newQty,
            makingCharges: p.makingCharges, 
            itemTotal: (p.price + (p.makingCharges/p.quantity)) * newQty 
        } : p);
      }
      return [...prev, { 
          ...product, 
          quantity: 1, 
          makingCharges: makingCharge,
          itemTotal: product.price + makingCharge 
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartItem = (item: CartItem) => {
      // Recalculate Total
      const updatedTotal = (item.price * item.quantity) + item.makingCharges;
      const updatedItem = { ...item, itemTotal: updatedTotal };
      
      setCart(prev => prev.map(p => p.id === item.id ? updatedItem : p));
      setEditingItem(null);
  };

  // Calculations
  const totalItemValue = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalMakingCharges = cart.reduce((acc, item) => acc + item.makingCharges, 0);
  const subtotal = totalItemValue + totalMakingCharges;
  const tax = subtotal * 0.03; // 3% GST
  const grandTotal = Math.round(subtotal + tax - globalDiscount);

  const handleCheckout = (mode: 'Cash' | 'Card' | 'UPI') => {
    if (cart.length === 0) return;

    const tx: Transaction = {
      id: Math.random().toString(),
      date: new Date().toISOString().split('T')[0],
      description: `POS Sale: ${cart.length} Items`,
      category: 'Sales',
      type: 'Credit',
      amount: grandTotal,
      paymentMode: mode,
      status: 'Completed',
      referenceId: `INV-${Date.now().toString().slice(-6)}`,
      items: cart,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      subtotal,
      tax,
      discount: globalDiscount,
      makingChargesTotal: totalMakingCharges
    };

    addTransaction(tx);
    setLastTransaction(tx);
    setShowInvoice(true);
    setCart([]);
    setSelectedCustomer(null);
    setGlobalDiscount(0);
  };

  const handleQuickAddCustomer = () => {
    if (!newCustName || !newCustPhone) return;
    const newCust: Customer = {
       id: Math.random().toString(),
       customerId: `C-${Date.now()}`,
       name: newCustName,
       phone: newCustPhone,
       email: '',
       type: 'New',
       totalSpend: 0,
       lastVisit: new Date().toISOString().split('T')[0]
    };
    addCustomer(newCust);
    setSelectedCustomer(newCust);
    setShowAddCustomer(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvoices = transactions.filter(t => 
      t.category === 'Sales' && 
      (t.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="h-screen pt-4 pb-4 pr-4 pl-0 flex gap-6 bg-gray-50 overflow-hidden">
      {/* Left Side: Product Grid / History */}
      <div className="flex-1 flex flex-col h-full rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar & Tabs */}
        <div className="p-6 border-b border-gray-100 bg-white z-10 space-y-4">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
              <button 
                onClick={() => setActiveTab('Catalog')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'Catalog' ? 'bg-white text-maroon-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Product Catalog
              </button>
              <button 
                onClick={() => setActiveTab('History')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'History' ? 'bg-white text-maroon-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Invoice History
              </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={activeTab === 'Catalog' ? "Search by SKU, Name or Scan Barcode..." : "Search Invoice No or Customer..."}
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-gold-500/50 text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {activeTab === 'Catalog' && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gray-200 hover:bg-gold-500 hover:text-white transition-colors">
                  <Scan size={18} />
                </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'Catalog' ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className={`group bg-white rounded-xl border p-3 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden ${product.stock === 0 ? 'border-red-200 opacity-60' : 'border-gray-100 hover:border-gold-300'}`}
                    onClick={() => addToCart(product)}
                  >
                    <div className="aspect-square rounded-lg bg-gray-100 mb-3 overflow-hidden relative">
                       <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       {product.stock === 0 && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center font-bold text-red-600">OUT</div>
                       )}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-maroon-900">₹{product.price.toLocaleString('en-IN')}</span>
                      <button className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
          ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                          <tr>
                              <th className="px-6 py-4">Invoice No</th>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Customer</th>
                              <th className="px-6 py-4">Amount</th>
                              <th className="px-6 py-4">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {filteredInvoices.map(inv => (
                              <tr key={inv.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 font-mono text-maroon-900 font-medium">{inv.referenceId || 'N/A'}</td>
                                  <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                                  <td className="px-6 py-4 font-medium text-gray-800">{inv.customerName || 'Walk-in'}</td>
                                  <td className="px-6 py-4 font-bold text-gray-900">₹{inv.amount.toLocaleString('en-IN')}</td>
                                  <td className="px-6 py-4">
                                      <button 
                                          onClick={() => { setLastTransaction(inv); setShowInvoice(true); }}
                                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-xs"
                                      >
                                          <Printer size={14} /> Print
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {filteredInvoices.length === 0 && (
                              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No invoices found.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          )}
        </div>
      </div>

      {/* Right Side: Cart / Billing */}
      <div className="w-[450px] flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 bg-maroon-900 text-white">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-serif font-bold">New Sale</h2>
             <button onClick={() => setCart([])} className="text-xs text-gold-400 hover:text-white underline">Clear Cart</button>
          </div>
          
          {selectedCustomer ? (
             <div className="bg-maroon-800 p-3 rounded-lg flex justify-between items-center border border-maroon-700">
                <div className="flex items-center gap-2">
                   <User size={16} className="text-gold-400" />
                   <div>
                      <p className="text-sm font-bold text-gold-50">{selectedCustomer.name}</p>
                      <p className="text-[10px] opacity-70">{selectedCustomer.phone}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-xs text-red-300 hover:text-white bg-maroon-900 p-1 rounded"><X size={14}/></button>
             </div>
          ) : (
             <div className="flex gap-2">
                <div className="relative flex-1">
                   <select 
                     className="w-full p-2.5 rounded-lg bg-maroon-800 text-sm border border-maroon-700 outline-none text-white focus:border-gold-500"
                     onChange={(e) => {
                        const c = customers.find(c => c.id === e.target.value);
                        if(c) setSelectedCustomer(c);
                     }}
                     value=""
                   >
                      <option value="" disabled>Select Existing Customer</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <button 
                  onClick={() => setShowAddCustomer(true)}
                  className="bg-gold-500 text-maroon-900 px-3 rounded-lg text-sm font-bold hover:bg-gold-400"
                >
                  + New
                </button>
             </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <Scan size={48} className="mb-4 opacity-50" />
               <p>Scan items or select from grid</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative group">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.grossWeight}g • {item.metalType}</p>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-maroon-900 text-sm">₹{item.itemTotal?.toLocaleString('en-IN')}</p>
                      <button onClick={() => setEditingItem(item)} className="text-[10px] text-blue-600 hover:underline flex items-center justify-end gap-1">
                         <Edit2 size={10} /> Edit Charges
                      </button>
                   </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                   <span>Qty: {item.quantity}</span>
                   <span>Rate: ₹{item.price.toLocaleString()}</span>
                   <span>M.C: ₹{item.makingCharges.toLocaleString()}</span>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"
                >
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Calculations */}
        <div className="p-5 bg-white border-t border-gray-200 text-sm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="space-y-2 mb-4">
             <div className="flex justify-between text-gray-600">
               <span>Gross Total</span>
               <span>₹{totalItemValue.toLocaleString('en-IN')}</span>
             </div>
             <div className="flex justify-between text-gray-600">
               <span>Total Making Charges</span>
               <span>₹{totalMakingCharges.toLocaleString('en-IN')}</span>
             </div>
             <div className="flex justify-between text-gray-600">
               <span>Tax (GST 3%)</span>
               <span>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
             </div>
             <div className="flex justify-between text-green-600 items-center bg-green-50 p-2 rounded-lg">
               <span className="font-medium">Discount</span>
               <div className="flex items-center gap-1">
                  <span>- ₹</span>
                  <input 
                    type="number" 
                    className="w-20 p-1 text-right text-sm border border-green-200 rounded bg-white outline-none focus:border-green-400 font-bold"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                  />
               </div>
             </div>
           </div>
           
           <div className="flex justify-between items-end mb-6 pt-3 border-t border-gray-100">
             <span className="text-gray-500 font-medium">Grand Total</span>
             <span className="font-serif font-bold text-2xl text-maroon-900">₹{grandTotal.toLocaleString('en-IN')}</span>
           </div>

           {/* Payment Buttons */}
           <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleCheckout('Cash')} className="py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex flex-col items-center justify-center gap-1"><Banknote size={18}/> <span className="text-[10px]">CASH</span></button>
              <button onClick={() => handleCheckout('UPI')} className="py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex flex-col items-center justify-center gap-1"><Smartphone size={18}/> <span className="text-[10px]">UPI</span></button>
              <button onClick={() => handleCheckout('Card')} className="py-3 bg-maroon-900 text-white rounded-lg font-bold hover:bg-maroon-800 flex flex-col items-center justify-center gap-1 shadow-lg"><Printer size={18}/> <span className="text-[10px]">PRINT & SAVE</span></button>
           </div>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">Edit Item Details</h3>
                  <button onClick={() => setEditingItem(null)}><X size={20} className="text-gray-500 hover:text-red-500" /></button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="mb-4">
                     <p className="text-sm font-bold text-gray-800">{editingItem.name}</p>
                     <p className="text-xs text-gray-500">{editingItem.grossWeight}g | ₹{editingItem.price}/unit base</p>
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Quantity</label>
                     <input 
                        type="number" 
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        value={editingItem.quantity}
                        onChange={e => setEditingItem({...editingItem, quantity: Number(e.target.value)})}
                     />
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Total Making Charges (₹)</label>
                     <input 
                        type="number" 
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        value={editingItem.makingCharges}
                        onChange={e => setEditingItem({...editingItem, makingCharges: Number(e.target.value)})}
                     />
                  </div>
                  <button 
                     onClick={() => updateCartItem(editingItem)}
                     className="w-full py-2 bg-maroon-900 text-white rounded-lg font-bold mt-2"
                  >
                     Update Item
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Professional Invoice Modal */}
      {showInvoice && lastTransaction && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[90vh]">
               <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Printer size={20} /> Tax Invoice</h3>
                  <button onClick={() => setShowInvoice(false)}><X size={24} className="opacity-70 hover:opacity-100" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                  <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[800px]" id="invoice-preview">
                     {/* Invoice Header */}
                     <div className="flex justify-between border-b-2 border-maroon-900 pb-6 mb-6">
                        <div>
                           <h1 className="text-3xl font-serif font-bold text-maroon-900">{shopProfile.name}</h1>
                           <p className="text-sm text-gray-500 mt-1">{shopProfile.address}</p>
                           <p className="text-sm text-gray-500">{shopProfile.city}</p>
                           <p className="text-sm text-gray-500">GSTIN: {shopProfile.gstin}</p>
                           <p className="text-sm text-gray-500">Phone: {shopProfile.phone}</p>
                        </div>
                        <div className="text-right">
                           <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest">Tax Invoice</h2>
                           <p className="text-sm font-medium text-gray-600 mt-2">Invoice #: <span className="text-black">{lastTransaction.referenceId}</span></p>
                           <p className="text-sm font-medium text-gray-600">Date: <span className="text-black">{lastTransaction.date}</span></p>
                        </div>
                     </div>

                     {/* Customer Details */}
                     <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Bill To</h3>
                        <p className="font-bold text-gray-800 text-lg">{lastTransaction.customerName}</p>
                        {selectedCustomer && (
                           <>
                              <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                              <p className="text-sm text-gray-600">{selectedCustomer.address || 'Address not provided'}</p>
                           </>
                        )}
                     </div>

                     {/* Line Items */}
                     <table className="w-full text-left text-sm mb-8">
                        <thead className="bg-maroon-50 text-maroon-900 font-bold uppercase">
                           <tr>
                              <th className="p-3 rounded-l-lg">Description</th>
                              <th className="p-3 text-center">Qty</th>
                              <th className="p-3 text-right">Rate</th>
                              <th className="p-3 text-right">M.C.</th>
                              <th className="p-3 text-right rounded-r-lg">Amount</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {lastTransaction.items?.map((item, i) => (
                              <tr key={i}>
                                 <td className="p-3">
                                    <p className="font-bold text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.grossWeight}g {item.metalType}</p>
                                 </td>
                                 <td className="p-3 text-center">{item.quantity}</td>
                                 <td className="p-3 text-right">₹{item.price.toLocaleString()}</td>
                                 <td className="p-3 text-right">₹{item.makingCharges.toLocaleString()}</td>
                                 <td className="p-3 text-right font-bold">₹{item.itemTotal?.toLocaleString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>

                     {/* Summary */}
                     <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                           <div className="flex justify-between text-sm text-gray-600">
                              <span>Sub Total</span>
                              <span>₹{lastTransaction.subtotal?.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-sm text-gray-600">
                              <span>Making Charges</span>
                              <span>₹{lastTransaction.makingChargesTotal?.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-sm text-gray-600">
                              <span>SGST (1.5%)</span>
                              <span>₹{(lastTransaction.tax! / 2).toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                           </div>
                           <div className="flex justify-between text-sm text-gray-600">
                              <span>CGST (1.5%)</span>
                              <span>₹{(lastTransaction.tax! / 2).toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                           </div>
                           {lastTransaction.discount! > 0 && (
                              <div className="flex justify-between text-sm text-green-600 font-medium">
                                 <span>Discount</span>
                                 <span>- ₹{lastTransaction.discount?.toLocaleString()}</span>
                              </div>
                           )}
                           <div className="flex justify-between text-lg font-bold text-maroon-900 border-t-2 border-maroon-900 pt-2 mt-2">
                              <span>Total</span>
                              <span>₹{lastTransaction.amount.toLocaleString()}</span>
                           </div>
                        </div>
                     </div>

                     {/* Footer */}
                     <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                        <p className="font-medium text-gray-700 mb-1">Terms & Conditions</p>
                        <p>{shopProfile.terms}</p>
                        <p className="mt-4 font-serif italic text-maroon-900">Thank you for shopping with {shopProfile.name}!</p>
                     </div>
                  </div>
               </div>

               <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
                  <button onClick={() => window.print()} className="px-6 py-2 bg-maroon-900 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-maroon-800"><Printer size={18}/> Print Invoice</button>
                  <button onClick={() => setShowInvoice(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Close</button>
               </div>
            </div>
         </div>
      )}

      {/* Add Customer Modal (Same as before) */}
      {showAddCustomer && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
               <h3 className="font-bold text-lg mb-4">Quick Add Customer</h3>
               <div className="space-y-3">
                  <input type="text" placeholder="Full Name" className="w-full p-2 border rounded" value={newCustName} onChange={e => setNewCustName(e.target.value)} />
                  <input type="text" placeholder="Phone Number" className="w-full p-2 border rounded" value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} />
                  <button onClick={handleQuickAddCustomer} className="w-full py-2 bg-maroon-900 text-white rounded font-bold">Save & Select</button>
                  <button onClick={() => setShowAddCustomer(false)} className="w-full py-2 text-gray-500">Cancel</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default POS;
