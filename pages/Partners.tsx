
import React, { useState } from 'react';
import { 
  Search, 
  Flame, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus
} from 'lucide-react';
import { Dealer, MintJob } from '../types';
import { useStore } from '../context/StoreContext';

const Partners = () => {
  const { dealers, mintJobs, addDealer } = useStore();
  const [activeTab, setActiveTab] = useState<'Dealers' | 'Mint'>('Dealers');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Partner Management</h1>
           <p className="text-gray-500 mt-1">Manage B2B relationships with Dealers, Franchisees, and Refineries.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setActiveTab('Dealers')}
             className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'Dealers' ? 'bg-maroon-900 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
           >
             Dealers & Wholesale
           </button>
           <button 
             onClick={() => setActiveTab('Mint')}
             className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'Mint' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
           >
             Mint & Refining
           </button>
        </div>
      </div>

      {activeTab === 'Dealers' ? (
        <div className="space-y-6">
           {/* Dealer List */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search Dealer..." className="w-full pl-10 py-2 bg-gray-50 rounded-lg border-none text-sm" />
                 </div>
                 <button className="flex items-center gap-2 px-4 py-2 bg-maroon-900 text-white rounded-lg hover:bg-maroon-800 text-sm font-medium">
                   <Plus size={16} /> Add Dealer
                 </button>
              </div>
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <tr>
                       <th className="px-6 py-4">Company Name</th>
                       <th className="px-6 py-4">Contact</th>
                       <th className="px-6 py-4">Type</th>
                       <th className="px-6 py-4">City</th>
                       <th className="px-6 py-4 text-right">Balance</th>
                       <th className="px-6 py-4">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {dealers.map(dealer => (
                       <tr key={dealer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">
                             {dealer.companyName}
                             <div className="text-xs text-gray-400 font-normal">{dealer.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{dealer.phone}</td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                dealer.type === 'Supplier' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                dealer.type === 'Buyer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                             }`}>{dealer.type}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{dealer.city}</td>
                          <td className={`px-6 py-4 font-bold text-right ${dealer.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                             {dealer.balance < 0 ? 'Dr ' : 'Cr '}₹{Math.abs(dealer.balance).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                             <button className="text-maroon-900 hover:text-gold-600 font-medium text-xs">View Ledger</button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-6">
              <div className="p-4 bg-orange-100 rounded-full text-orange-600">
                 <Flame size={32} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-orange-900">Mint / Refining Dashboard</h2>
                 <p className="text-orange-800/70">Track Old Gold sent for melting and refining into Standard Bars.</p>
              </div>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-gray-800">Active Refining Jobs</h3>
                 <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
                   <ArrowUpRight size={16} /> Issue Old Gold
                 </button>
              </div>
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <tr>
                       <th className="px-6 py-4">Job ID</th>
                       <th className="px-6 py-4">Issue Date</th>
                       <th className="px-6 py-4">Old Gold Weight</th>
                       <th className="px-6 py-4">Exp. Purity</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {mintJobs.map(job => (
                       <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono font-medium text-gray-800">{job.jobId}</td>
                          <td className="px-6 py-4 text-gray-600">{job.issueDate}</td>
                          <td className="px-6 py-4 font-bold text-gray-800">{job.oldGoldWeight} g</td>
                          <td className="px-6 py-4 text-gray-600">{job.expectedPurity}%</td>
                          <td className="px-6 py-4">
                             <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
                                {job.status}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <button className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-xs">
                                <ArrowDownLeft size={14} /> Receive Bar
                             </button>
                          </td>
                       </tr>
                    ))}
                    {mintJobs.length === 0 && (
                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No active mint jobs.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
