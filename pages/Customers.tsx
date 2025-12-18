import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  Crown,
  MoreHorizontal,
  Edit2,
  Gift,
  History,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { Customer } from '../types';
import { useStore } from '../context/StoreContext';

const Customers = () => {
  const { customers, addCustomer, transactions } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewHistory, setViewHistory] = useState(false);

  // Form State
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    type: 'New',
    city: '',
    dob: '',
    anniversary: '',
    pan: '',
    address: '',
    notes: ''
  });

  const handleAddCustomer = () => {
    const customer: Customer = {
      id: Math.random().toString(),
      customerId: `CUST-00${customers.length + 1}`,
      name: newCustomer.name || 'Unknown',
      phone: newCustomer.phone || '',
      email: newCustomer.email || '',
      type: newCustomer.type as 'VIP' | 'Regular' | 'New',
      totalSpend: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      city: newCustomer.city,
      dob: newCustomer.dob,
      anniversary: newCustomer.anniversary,
      pan: newCustomer.pan,
      address: newCustomer.address,
      notes: newCustomer.notes
    };
    addCustomer(customer);
    setShowAddModal(false);
    setNewCustomer({
      name: '', phone: '', email: '', type: 'New', city: '', dob: '', anniversary: '', pan: '', address: '', notes: ''
    });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    c.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customerTransactions = selectedCustomer 
    ? transactions.filter(t => t.customerId === selectedCustomer.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Client Master</h1>
           <p className="text-gray-500 mt-1">Manage customer profiles and history.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-maroon-900 text-white rounded-xl hover:bg-maroon-800 transition-colors shadow-lg shadow-maroon-900/20"
        >
          <Plus size={20} /> Add Client
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Clients</p>
            <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gold-50 text-gold-600 rounded-xl">
            <Crown size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">VIP Members</p>
            <p className="text-2xl font-bold text-gray-800">{customers.filter(c => c.type === 'VIP').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Gift size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Birthdays This Month</p>
            <p className="text-2xl font-bold text-gray-800">2</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Name, Phone or ID..." 
                className="w-full pl-10 py-2 rounded-lg bg-gray-50 border-none focus:ring-1 focus:ring-gold-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spend</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => { setSelectedCustomer(customer); setViewHistory(false); }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon-800 to-maroon-900 text-white flex items-center justify-center font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{customer.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{customer.customerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 flex flex-col gap-1">
                      <span className="flex items-center gap-1"><Phone size={12} /> {customer.phone}</span>
                      {customer.city && <span className="flex items-center gap-1 text-gray-400"><MapPin size={12} /> {customer.city}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      customer.type === 'VIP' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : customer.type === 'Regular'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {customer.type === 'VIP' && <Crown size={10} className="mr-1" />}
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-maroon-900">
                    ₹{customer.totalSpend.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.lastVisit}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-maroon-900 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white sticky top-0">
                <h2 className="text-lg font-serif font-semibold">Add New Client</h2>
                <button onClick={() => setShowAddModal(false)} className="opacity-70 hover:opacity-100">✕</button>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* Basic Info */}
                 <div>
                   <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Full Name *</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                          value={newCustomer.name}
                          onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Phone Number *</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                          value={newCustomer.phone}
                          onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                          value={newCustomer.email}
                          onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">City</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                          value={newCustomer.city}
                          onChange={e => setNewCustomer({...newCustomer, city: e.target.value})}
                        />
                      </div>
                   </div>
                 </div>

                 {/* Important Dates & KYC */}
                 <div>
                   <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Dates & KYC</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date of Birth</label>
                        <input 
                          type="date" 
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                          value={newCustomer.dob}
                          onChange={e => setNewCustomer({...newCustomer, dob: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Anniversary</label>
                        <input 
                          type="date" 
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500"
                          value={newCustomer.anniversary}
                          onChange={e => setNewCustomer({...newCustomer, anniversary: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">PAN Number</label>
                        <input 
                          type="text" 
                          placeholder="ABCDE1234F"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500 uppercase"
                          value={newCustomer.pan}
                          onChange={e => setNewCustomer({...newCustomer, pan: e.target.value})}
                        />
                      </div>
                   </div>
                 </div>

                 {/* Address & Notes */}
                 <div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Full Address</label>
                      <textarea 
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500 resize-none"
                        value={newCustomer.address}
                        onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Notes / Preferences</label>
                      <textarea 
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-gold-500 resize-none"
                        placeholder="E.g. Prefers Rose Gold, Ring size 6..."
                        value={newCustomer.notes}
                        onChange={e => setNewCustomer({...newCustomer, notes: e.target.value})}
                      ></textarea>
                    </div>
                 </div>

                 <div className="pt-2">
                   <button 
                    onClick={handleAddCustomer}
                    className="w-full py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-all"
                   >
                     Save Client Profile
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
              <div className="relative h-24 bg-gradient-to-r from-maroon-900 to-maroon-800 shrink-0">
                 <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 right-4 text-white opacity-70 hover:opacity-100">✕</button>
                 <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
                       <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">
                          {selectedCustomer.name.charAt(0)}
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="pt-12 px-6 pb-6 flex-1 overflow-y-auto">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
                        {selectedCustomer.name}
                        {selectedCustomer.type === 'VIP' && <Crown size={16} className="text-gold-500 fill-gold-500" />}
                      </h2>
                      <p className="text-sm text-gray-500 font-mono">{selectedCustomer.customerId}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-gray-400 uppercase">Total Spend</p>
                       <p className="text-lg font-bold text-maroon-900">₹{selectedCustomer.totalSpend.toLocaleString('en-IN')}</p>
                    </div>
                 </div>

                 {viewHistory ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <History size={16} /> Transaction History
                       </h3>
                       <div className="space-y-3">
                          {customerTransactions.length > 0 ? customerTransactions.map(tx => (
                             <div key={tx.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                                <div>
                                   <div className="flex items-center gap-2">
                                      <ShoppingBag size={14} className="text-gray-400" />
                                      <span className="text-sm font-bold text-gray-700">{tx.description}</span>
                                   </div>
                                   <p className="text-xs text-gray-500 ml-5">{tx.date} • {tx.items?.length || 0} Items</p>
                                </div>
                                <span className="font-bold text-maroon-900 text-sm">₹{tx.amount.toLocaleString()}</span>
                             </div>
                          )) : (
                             <p className="text-sm text-gray-400 text-center py-4">No transactions found.</p>
                          )}
                       </div>
                       <button onClick={() => setViewHistory(false)} className="mt-4 text-xs text-blue-600 hover:underline">Back to Profile</button>
                    </div>
                 ) : (
                    <>
                       <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                             <Phone size={14} /> {selectedCustomer.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                             <Mail size={14} /> {selectedCustomer.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                             <Gift size={14} /> DOB: {selectedCustomer.dob || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                             <CreditCard size={14} /> PAN: {selectedCustomer.pan || 'N/A'}
                          </div>
                       </div>

                       {selectedCustomer.notes && (
                         <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Notes</h4>
                            <p className="text-sm text-gray-600 italic bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                              "{selectedCustomer.notes}"
                            </p>
                         </div>
                       )}

                       <div className="flex gap-3 pt-4 border-t border-gray-100">
                          <button 
                            onClick={() => setViewHistory(true)}
                            className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                          >
                             <History size={16} /> View History
                          </button>
                          <button className="flex-1 py-2 bg-maroon-900 text-white rounded-lg font-medium hover:bg-maroon-800 flex items-center justify-center gap-2">
                             <Edit2 size={16} /> Edit Profile
                          </button>
                       </div>
                    </>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Customers;