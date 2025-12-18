import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Diamond, 
  Coins, 
  Box, 
  CheckCircle,
  AlertTriangle,
  Scale,
  Microscope,
  Truck
} from 'lucide-react';
import { DiamondPacket, TejoriGoldStock, DiamondShape, DiamondUnit, PurchaseOrder } from '../types';
import { useStore } from '../context/StoreContext';

const Tejori = () => {
  const { diamondStock, goldStock, addDiamondPacket, purchases, addPurchase } = useStore();
  const [activeTab, setActiveTab] = useState<'Diamonds' | 'Gold'>('Diamonds');
  
  // Modals
  const [showDiamondModal, setShowDiamondModal] = useState(false);
  const [showGoldPurchaseModal, setShowGoldPurchaseModal] = useState(false);

  // New Diamond Form
  const [newPacket, setNewPacket] = useState<Partial<DiamondPacket>>({
    packetNo: `PKT-24-${Math.floor(Math.random()*1000)}`,
    shape: 'Round',
    quality: 'VVS1',
    weight: 0,
    unit: 'Carat',
    pieces: 0,
    ratePerUnit: 0,
    status: 'QC Pending',
    location: 'Tejori'
  });

  // New Gold Purchase Form
  const [goldPurchase, setGoldPurchase] = useState({
     supplier: '',
     invoice: '',
     type: 'Std Bar',
     weight: 0,
     purity: '24K',
     rate: 0
  });

  const handleAddPacket = () => {
    const total = (newPacket.weight || 0) * (newPacket.ratePerUnit || 0);
    const packet: DiamondPacket = {
      id: Math.random().toString(),
      packetNo: newPacket.packetNo!,
      shape: newPacket.shape as DiamondShape,
      quality: newPacket.quality!,
      weight: Number(newPacket.weight),
      unit: newPacket.unit as DiamondUnit,
      pieces: Number(newPacket.pieces),
      ratePerUnit: Number(newPacket.ratePerUnit),
      totalAmount: total,
      status: 'QC Pending',
      location: 'Tejori'
    };
    addDiamondPacket(packet);
    setShowDiamondModal(false);
    // Reset
    setNewPacket({
        packetNo: `PKT-24-${Math.floor(Math.random()*1000)}`,
        shape: 'Round', quality: 'VVS1', weight: 0, unit: 'Carat', pieces: 0, ratePerUnit: 0, status: 'QC Pending', location: 'Tejori'
    });
  };

  const handleGoldPurchase = () => {
      const amount = Number(goldPurchase.weight) * Number(goldPurchase.rate);
      const po: PurchaseOrder = {
          id: Math.random().toString(),
          invoiceNo: goldPurchase.invoice || `INV-${Date.now()}`,
          purchaseType: 'Vendor Invoice',
          supplierName: goldPurchase.supplier || 'Unknown Supplier',
          date: new Date().toISOString().split('T')[0],
          totalAmount: amount,
          paidAmount: 0,
          status: 'Pending',
          items: [{
              itemName: `${goldPurchase.type} (${goldPurchase.purity})`,
              category: goldPurchase.type, // 'Std Bar' or 'New Ornament'
              weight: Number(goldPurchase.weight),
              purity: goldPurchase.purity,
              rate: Number(goldPurchase.rate),
              amount: amount
          }]
      };
      addPurchase(po);
      setShowGoldPurchaseModal(false);
      setGoldPurchase({ supplier: '', invoice: '', type: 'Std Bar', weight: 0, purity: '24K', rate: 0 });
  };

  // Filter purchases for the Gold tab view
  const goldPurchases = purchases.filter(p => 
      p.items.some(i => i.category === 'Std Bar' || i.category === 'New Ornament' || i.category === 'Old Gold')
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Tejori Management</h1>
           <p className="text-gray-500 mt-1">Wholesale Warehouse: Gold Bullion & Diamond Packets.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setActiveTab('Diamonds')}
             className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'Diamonds' ? 'bg-maroon-900 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
           >
             Diamond Packets
           </button>
           <button 
             onClick={() => setActiveTab('Gold')}
             className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'Gold' ? 'bg-gold-500 text-maroon-900 shadow-lg font-bold' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
           >
             Gold Stock
           </button>
        </div>
      </div>

      {activeTab === 'Diamonds' ? (
        <div className="space-y-6">
           {/* Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Diamond size={24} /></div>
                 <div>
                    <p className="text-sm text-gray-500">Stock (Carats)</p>
                    <p className="text-2xl font-bold text-gray-800">
                       {diamondStock.filter(d => d.location === 'Tejori' && d.unit === 'Carat').reduce((acc, d) => acc + d.weight, 0).toFixed(2)} cts
                    </p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                 <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Microscope size={24} /></div>
                 <div>
                    <p className="text-sm text-gray-500">QC Pending</p>
                    <p className="text-2xl font-bold text-gray-800">{diamondStock.filter(d => d.status === 'QC Pending').length}</p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                 <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Coins size={24} /></div>
                 <div>
                    <p className="text-sm text-gray-500">Stock Value</p>
                    <p className="text-2xl font-bold text-gray-800">
                       ₹{(diamondStock.filter(d => d.location === 'Tejori').reduce((acc, d) => acc + d.totalAmount, 0)/100000).toFixed(2)} L
                    </p>
                 </div>
              </div>
           </div>

           {/* Table */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search Packet No..." className="w-full pl-10 py-2 bg-gray-50 rounded-lg border-none text-sm" />
                 </div>
                 <button 
                   onClick={() => setShowDiamondModal(true)}
                   className="flex items-center gap-2 px-4 py-2 bg-maroon-900 text-white rounded-lg hover:bg-maroon-800 transition-colors text-sm font-medium"
                 >
                   <Plus size={16} /> Purchase Packet (QC)
                 </button>
              </div>
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <tr>
                       <th className="px-6 py-4">Packet No</th>
                       <th className="px-6 py-4">Shape/Quality</th>
                       <th className="px-6 py-4">Weight & Pcs</th>
                       <th className="px-6 py-4">Rate</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {diamondStock.map(pkt => (
                       <tr key={pkt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono font-medium text-maroon-900">{pkt.packetNo}</td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="font-medium text-gray-800">{pkt.shape}</span>
                                <span className="text-xs text-gray-500">{pkt.quality}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="font-medium text-gray-800">{pkt.weight} {pkt.unit}</span>
                                <span className="text-xs text-gray-500">{pkt.pieces} pcs</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">₹{pkt.ratePerUnit.toLocaleString('en-IN')}/{pkt.unit}</td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                pkt.status === 'In Stock' ? 'bg-green-50 text-green-700 border-green-200' :
                                pkt.status === 'QC Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-gray-50 text-gray-600 border-gray-200'
                             }`}>
                                {pkt.status}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             {pkt.status === 'QC Pending' && (
                                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-bold">
                                   Accept
                                </button>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : (
        <div className="space-y-6">
           {/* Gold Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-6 rounded-2xl shadow-lg text-maroon-900">
                 <h3 className="font-bold text-lg mb-1">Total Gold Stock</h3>
                 <p className="text-3xl font-serif font-bold">{goldStock.reduce((acc, g) => acc + g.weight, 0).toLocaleString()} g</p>
                 <p className="text-sm opacity-80 mt-2">Tejori + Showroom + Wastage</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-gray-500 font-medium mb-1">Std Bar (24K)</h3>
                 <p className="text-3xl font-serif font-bold text-gray-800">
                    {goldStock.filter(g => g.type === 'Std Bar').reduce((acc, g) => acc + g.weight, 0).toLocaleString()} g
                 </p>
                 <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} /> Pure Bullion
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-gray-500 font-medium mb-1">Old Gold (Refining)</h3>
                 <p className="text-3xl font-serif font-bold text-gray-800">
                    {goldStock.filter(g => g.type === 'Old Gold').reduce((acc, g) => acc + g.weight, 0).toLocaleString()} g
                 </p>
                 <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                    <AlertTriangle size={12} /> Needs Refining
                 </div>
              </div>
           </div>

           {/* Gold Ledgers */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-serif font-bold text-lg text-gray-800">Gold Ledgers</h3>
                 <button 
                   onClick={() => setShowGoldPurchaseModal(true)}
                   className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-maroon-900 rounded-lg hover:bg-gold-600 shadow-md font-bold text-sm"
                 >
                   <Plus size={16} /> Purchase Stock
                 </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                       <tr>
                          <th className="px-6 py-3 rounded-l-lg">Ledger Type</th>
                          <th className="px-6 py-3">Purity</th>
                          <th className="px-6 py-3">Current Weight (g)</th>
                          <th className="px-6 py-3">Location</th>
                          <th className="px-6 py-3 rounded-r-lg">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {goldStock.map(stock => (
                          <tr key={stock.id} className="group hover:bg-gray-50">
                             <td className="px-6 py-4 font-medium text-gray-800">
                                {stock.type}
                                {stock.type === 'Wastage' && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Loss</span>}
                             </td>
                             <td className="px-6 py-4">
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">{stock.purity}</span>
                             </td>
                             <td className="px-6 py-4 font-mono font-bold text-lg text-maroon-900">{stock.weight.toFixed(3)}</td>
                             <td className="px-6 py-4 text-gray-500 text-sm">{stock.location}</td>
                             <td className="px-6 py-4">
                                <button className="text-blue-600 text-sm hover:underline mr-4">Transfer</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Recent Purchases List */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-serif font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                 <Truck size={20} /> Recent Gold Purchases (Inward)
              </h3>
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                       <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Invoice / Ref</th>
                          <th className="px-6 py-3">Supplier / Customer</th>
                          <th className="px-6 py-3">Item Details</th>
                          <th className="px-6 py-3">Weight (g)</th>
                          <th className="px-6 py-3">Type</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {goldPurchases.length > 0 ? (
                           goldPurchases.slice(0, 5).map(po => (
                             <tr key={po.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-600">{po.date}</td>
                                <td className="px-6 py-3 font-mono text-xs">{po.invoiceNo}</td>
                                <td className="px-6 py-3 text-gray-800 font-medium">{po.supplierName}</td>
                                <td className="px-6 py-3 text-gray-600">{po.items[0]?.itemName}</td>
                                <td className="px-6 py-3 font-bold text-maroon-900">
                                   {po.items.reduce((acc, i) => acc + i.weight, 0).toFixed(2)}
                                </td>
                                <td className="px-6 py-3">
                                   <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                      po.purchaseType === 'Old Gold' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-blue-50 border-blue-200 text-blue-800'
                                   }`}>
                                      {po.purchaseType}
                                   </span>
                                </td>
                             </tr>
                           ))
                       ) : (
                           <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-400">No recent gold transactions found.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* Add Diamond Packet Modal */}
      {showDiamondModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white">
                  <h2 className="text-lg font-serif font-semibold">New Diamond Packet Purchase</h2>
                  <button onClick={() => setShowDiamondModal(false)} className="opacity-70 hover:opacity-100">✕</button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Packet No</label>
                        <input 
                           type="text" 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none bg-gray-50"
                           value={newPacket.packetNo}
                           readOnly
                        />
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Unit</label>
                        <select 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none bg-white"
                           value={newPacket.unit}
                           onChange={e => setNewPacket({...newPacket, unit: e.target.value as DiamondUnit})}
                        >
                           <option>Carat</option>
                           <option>Roti</option>
                           <option>Cent</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Shape</label>
                        <select 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none bg-white"
                           value={newPacket.shape}
                           onChange={e => setNewPacket({...newPacket, shape: e.target.value as DiamondShape})}
                        >
                           <option>Round</option>
                           <option>Princess</option>
                           <option>Polki</option>
                           <option>Chauki</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Quality</label>
                        <input 
                           type="text" 
                           placeholder="e.g. VVS1"
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                           value={newPacket.quality}
                           onChange={e => setNewPacket({...newPacket, quality: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Total Weight</label>
                        <input 
                           type="number" 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                           value={newPacket.weight}
                           onChange={e => setNewPacket({...newPacket, weight: Number(e.target.value)})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">No. of Pieces</label>
                        <input 
                           type="number" 
                           className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                           value={newPacket.pieces}
                           onChange={e => setNewPacket({...newPacket, pieces: Number(e.target.value)})}
                        />
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Rate per {newPacket.unit}</label>
                     <input 
                        type="number" 
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                        value={newPacket.ratePerUnit}
                        onChange={e => setNewPacket({...newPacket, ratePerUnit: Number(e.target.value)})}
                     />
                  </div>

                  <button 
                     onClick={handleAddPacket}
                     className="w-full py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-all"
                  >
                     Add to QC Pending
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Gold Purchase Modal */}
      {showGoldPurchaseModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="bg-gold-500 px-6 py-4 flex justify-between items-center text-maroon-900">
                  <h2 className="text-lg font-serif font-bold">Purchase Gold Stock</h2>
                  <button onClick={() => setShowGoldPurchaseModal(false)} className="opacity-70 hover:opacity-100">✕</button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Supplier Name</label>
                      <input 
                          type="text" 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                          value={goldPurchase.supplier}
                          onChange={e => setGoldPurchase({...goldPurchase, supplier: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Invoice No</label>
                      <input 
                          type="text" 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                          value={goldPurchase.invoice}
                          onChange={e => setGoldPurchase({...goldPurchase, invoice: e.target.value})}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                          <select 
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none bg-white"
                              value={goldPurchase.type}
                              onChange={e => setGoldPurchase({...goldPurchase, type: e.target.value})}
                          >
                              <option>Std Bar</option>
                              <option>New Ornament</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Purity</label>
                          <select 
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none bg-white"
                              value={goldPurchase.purity}
                              onChange={e => setGoldPurchase({...goldPurchase, purity: e.target.value})}
                          >
                              <option>24K</option>
                              <option>22K</option>
                              <option>18K</option>
                          </select>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Weight (g)</label>
                          <input 
                              type="number" 
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                              value={goldPurchase.weight}
                              onChange={e => setGoldPurchase({...goldPurchase, weight: Number(e.target.value)})}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Rate / g</label>
                          <input 
                              type="number" 
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none"
                              value={goldPurchase.rate}
                              onChange={e => setGoldPurchase({...goldPurchase, rate: Number(e.target.value)})}
                          />
                      </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
                      <span className="text-gray-500">Total Amount:</span>
                      <span className="font-bold text-maroon-900">₹{(goldPurchase.weight * goldPurchase.rate).toLocaleString('en-IN')}</span>
                  </div>

                  <button 
                     onClick={handleGoldPurchase}
                     className="w-full py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-all mt-2"
                  >
                     Confirm Purchase
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Tejori;
