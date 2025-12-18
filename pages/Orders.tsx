import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { Order, OrderItem, AdvanceReceipt, Transaction } from '../types';
import { useStore } from '../context/StoreContext';

const Orders = () => {
  const { orders, addOrder, updateOrder, customers, addTransaction } = useStore();
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [activeTab, setActiveTab] = useState<'Details' | 'Advances'>('Details');
  
  // New Order Form State
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    items: [],
    advances: []
  });

  // Temp Advance State
  const [advance, setAdvance] = useState<Partial<AdvanceReceipt>>({
    type: 'Cash',
    value: 0,
    description: '',
    goldWeight: 0,
    goldRate: 6200
  });

  const handleAddAdvance = () => {
    let value = advance.value || 0;
    if (advance.type === 'Old Gold') {
      value = (advance.goldWeight || 0) * (advance.goldRate || 0);
    }
    
    const newAdv: AdvanceReceipt = {
      id: Math.random().toString(),
      date: new Date().toISOString().split('T')[0],
      type: advance.type as any,
      description: advance.description || '',
      value: value,
      goldWeight: advance.goldWeight,
      goldRate: advance.goldRate,
      goldPurity: '22K' // Default for now
    };

    setNewOrder(prev => ({
      ...prev,
      advances: [...(prev.advances || []), newAdv]
    }));
    
    setAdvance({ type: 'Cash', value: 0, description: '', goldWeight: 0, goldRate: 6200 });
  };

  const handleCreateOrder = () => {
    const totalAdv = newOrder.advances?.reduce((sum, a) => sum + a.value, 0) || 0;
    
    const order: Order = {
      id: Math.random().toString(),
      orderNo: `ORD-24-${100 + orders.length + 1}`,
      customerId: 'NEW', // In real app, link to customer ID
      customerName: newOrder.customerName || 'Walk-in',
      orderDate: newOrder.orderDate || '',
      deliveryDate: newOrder.deliveryDate || '',
      status: 'Pending',
      items: newOrder.items || [],
      advances: newOrder.advances || [],
      totalValue: 50000, // Hardcoded for demo, normally calc from items
      balanceDue: 50000 - totalAdv
    };
    
    addOrder(order);
    setShowNewOrder(false);
    // Reset
    setNewOrder({
        customerName: '',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        items: [],
        advances: []
    });
  };

  const convertToInvoice = (order: Order) => {
      // 1. Create Transaction (Sale)
      const tx: Transaction = {
          id: Math.random().toString(),
          date: new Date().toISOString().split('T')[0],
          description: `Order Fulfillment: ${order.orderNo}`,
          category: 'Sales',
          type: 'Credit',
          amount: order.balanceDue, // Only balance is new cash flow
          paymentMode: 'Cash', // Defaulting for demo
          referenceId: order.orderNo,
          status: 'Completed',
          customerName: order.customerName,
          // We could add items here for the invoice structure
      };
      
      addTransaction(tx);

      // 2. Update Order Status
      const updatedOrder = { ...order, status: 'Delivered' as any, balanceDue: 0 };
      updateOrder(updatedOrder);
      
      alert(`Order ${order.orderNo} finalized. Invoice created for balance ₹${order.balanceDue}`);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Customer Orders</h1>
           <p className="text-gray-500 mt-1">Manage custom jewelry orders and advance receipts.</p>
        </div>
        <button 
          onClick={() => setShowNewOrder(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-maroon-900 text-white rounded-xl hover:bg-maroon-800 transition-colors shadow-lg shadow-maroon-900/20"
        >
          <Plus size={20} /> New Order
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search Order No or Customer..." className="w-full pl-10 py-2 bg-gray-50 rounded-lg border-none focus:ring-1 focus:ring-gold-500" />
           </div>
           <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-600">
              <Filter size={18} /> Filter
           </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                 <tr>
                    <th className="px-6 py-4">Order Details</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Delivery</th>
                    <th className="px-6 py-4 text-right">Advance / Total</th>
                    <th className="px-6 py-4">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {orders.map(order => {
                   const totalAdvance = order.advances.reduce((acc, curr) => acc + curr.value, 0);
                   return (
                     <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                           <p className="font-bold text-maroon-900">{order.orderNo}</p>
                           <p className="text-xs text-gray-500">{order.items.length} Items</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">{order.customerName}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                             order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                             order.status === 'In Production' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                             'bg-green-50 text-green-700 border-green-200'
                           }`}>
                              {order.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                           <div className="flex items-center gap-1">
                              <Calendar size={14} /> {order.deliveryDate}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <p className="text-sm font-bold text-gray-800">₹{order.totalValue.toLocaleString()}</p>
                           <p className="text-xs text-green-600">Adv: ₹{totalAdvance.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                           {order.status !== 'Delivered' ? (
                               <button 
                                 onClick={() => convertToInvoice(order)}
                                 className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 font-medium flex items-center gap-1"
                               >
                                   <CheckCircle size={12} /> Bill
                               </button>
                           ) : (
                               <span className="text-gray-400 text-xs">Billed</span>
                           )}
                        </td>
                     </tr>
                   );
                 })}
              </tbody>
           </table>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrder && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                  <h2 className="text-lg font-serif font-semibold">New Customer Order</h2>
                  <button onClick={() => setShowNewOrder(false)} className="opacity-70 hover:opacity-100">✕</button>
               </div>

               <div className="flex-1 overflow-y-auto p-6">
                  {/* Customer & Date */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Customer Name</label>
                        <input 
                           type="text" 
                           list="customers"
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                           value={newOrder.customerName}
                           onChange={e => setNewOrder({...newOrder, customerName: e.target.value})}
                        />
                        <datalist id="customers">
                            {customers.map(c => <option key={c.id} value={c.name} />)}
                        </datalist>
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Order Date</label>
                        <input 
                           type="date" 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                           value={newOrder.orderDate}
                           onChange={e => setNewOrder({...newOrder, orderDate: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Delivery Date</label>
                        <input 
                           type="date" 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                           value={newOrder.deliveryDate}
                           onChange={e => setNewOrder({...newOrder, deliveryDate: e.target.value})}
                        />
                     </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-4 mb-4 border-b border-gray-200">
                     <button 
                       onClick={() => setActiveTab('Details')}
                       className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'Details' ? 'text-maroon-900 border-b-2 border-maroon-900' : 'text-gray-500'}`}
                     >
                       Order Items
                     </button>
                     <button 
                       onClick={() => setActiveTab('Advances')}
                       className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'Advances' ? 'text-maroon-900 border-b-2 border-maroon-900' : 'text-gray-500'}`}
                     >
                       Advance Receipt
                     </button>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'Details' ? (
                     <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center text-gray-500 text-sm border-dashed">
                           <p>Order item selection interface.</p>
                           <p>(Add Items to define total value)</p>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {/* Advance Entry Form */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                           <h3 className="text-sm font-bold text-gray-800 mb-3">Add Advance Payment</h3>
                           
                           <div className="flex gap-2 mb-3">
                              {['Cash', 'Old Gold', 'Stone'].map(type => (
                                 <button 
                                   key={type}
                                   onClick={() => setAdvance({...advance, type: type as any})}
                                   className={`flex-1 py-1.5 text-xs font-medium rounded border ${
                                     advance.type === type ? 'bg-gold-100 text-gold-800 border-gold-300' : 'bg-white text-gray-600 border-gray-200'
                                   }`}
                                 >
                                    {type}
                                 </button>
                              ))}
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              {advance.type === 'Old Gold' && (
                                 <>
                                    <div>
                                       <label className="text-xs font-semibold text-gray-500">Weight (g)</label>
                                       <input 
                                          type="number" 
                                          className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                          value={advance.goldWeight}
                                          onChange={e => setAdvance({...advance, goldWeight: Number(e.target.value)})}
                                       />
                                    </div>
                                    <div>
                                       <label className="text-xs font-semibold text-gray-500">Rate / g</label>
                                       <input 
                                          type="number" 
                                          className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                          value={advance.goldRate}
                                          onChange={e => setAdvance({...advance, goldRate: Number(e.target.value)})}
                                       />
                                    </div>
                                 </>
                              )}
                              
                              <div className={`${advance.type === 'Old Gold' ? 'col-span-2' : ''}`}>
                                 <label className="text-xs font-semibold text-gray-500">
                                    {advance.type === 'Old Gold' ? 'Calculated Value' : 'Amount'}
                                 </label>
                                 <input 
                                    type="number" 
                                    className="w-full mt-1 p-2 border border-gray-300 rounded outline-none font-bold"
                                    value={advance.type === 'Old Gold' ? (advance.goldWeight || 0) * (advance.goldRate || 0) : advance.value}
                                    onChange={e => advance.type !== 'Old Gold' && setAdvance({...advance, value: Number(e.target.value)})}
                                    readOnly={advance.type === 'Old Gold'}
                                 />
                              </div>

                              <div className="col-span-2">
                                 <label className="text-xs font-semibold text-gray-500">Description</label>
                                 <input 
                                    type="text" 
                                    placeholder={advance.type === 'Old Gold' ? 'e.g. Broken Chain' : 'e.g. Booking Advance'}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                    value={advance.description}
                                    onChange={e => setAdvance({...advance, description: e.target.value})}
                                 />
                              </div>
                           </div>
                           
                           <button 
                             onClick={handleAddAdvance}
                             className="w-full mt-3 py-2 bg-gold-500 text-maroon-900 font-bold rounded-lg text-sm hover:bg-gold-600"
                           >
                              Add Advance
                           </button>
                        </div>

                        {/* List of Advances */}
                        <div>
                           <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Received Advances</h4>
                           <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-sm text-left">
                                 <thead className="bg-gray-100 text-gray-500">
                                    <tr>
                                       <th className="p-2">Type</th>
                                       <th className="p-2">Details</th>
                                       <th className="p-2 text-right">Value</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y">
                                    {newOrder.advances?.map((adv, i) => (
                                       <tr key={i}>
                                          <td className="p-2">{adv.type}</td>
                                          <td className="p-2 text-gray-500 text-xs">
                                             {adv.description} 
                                             {adv.type === 'Old Gold' && ` (${adv.goldWeight}g @ ${adv.goldRate})`}
                                          </td>
                                          <td className="p-2 text-right font-medium">₹{adv.value.toLocaleString()}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-4">
                  <button onClick={() => setShowNewOrder(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium">Cancel</button>
                  <button onClick={handleCreateOrder} className="flex-1 py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg">Confirm Order</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Orders;