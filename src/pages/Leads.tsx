
import React, { useState } from 'react';
import { Phone, MessageCircle, MoreHorizontal, CheckCircle, Clock, XCircle, Sparkles, Send, Plus, Search, Filter } from 'lucide-react';
import { Lead } from '../types';
import { generateLeadFollowUp } from '../services/geminiService';
import { useStore } from '../context/StoreContext';

const Leads = () => {
  const { leads, addLead } = useStore();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [aiMessage, setAiMessage] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Lead Form State
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    source: 'Walk-in',
    status: 'New',
    score: 'Warm',
    notes: ''
  });

  const handleGenerateMessage = async (lead: Lead) => {
    setSelectedLead(lead);
    setLoadingAI(true);
    setAiMessage('');
    
    const msg = await generateLeadFollowUp(lead.name, lead.status, lead.notes);
    setAiMessage(msg);
    setLoadingAI(false);
  };

  const handleAddLead = () => {
    const lead: Lead = {
      id: Math.random().toString(),
      name: newLead.name || 'Unknown',
      source: newLead.source || 'Walk-in',
      status: newLead.status as any,
      score: newLead.score as any,
      notes: newLead.notes || ''
    };
    addLead(lead);
    setShowAddModal(false);
    setNewLead({ name: '', source: 'Walk-in', status: 'New', score: 'Warm', notes: '' });
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Lead Pipeline</h1>
           <p className="text-gray-500 mt-1">Manage inquiries and potential customers.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-maroon-900 text-white rounded-xl hover:bg-maroon-800 transition-colors shadow-lg shadow-maroon-900/20"
        >
          <Plus size={20} /> New Lead
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Leads..." 
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map(lead => (
          <div key={lead.id} className="bg-white p-5 rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col hover:border-gold-300 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold">
                    {lead.name.charAt(0)}
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-800">{lead.name}</h3>
                   <span className="text-xs text-gray-500">{lead.source}</span>
                 </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
               <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                 lead.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                 lead.status === 'Contacted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                 lead.status === 'Converted' ? 'bg-green-50 text-green-700 border-green-200' :
                 'bg-purple-50 text-purple-700 border-purple-200'
               }`}>
                 {lead.status}
               </span>
               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                 lead.score === 'Hot' ? 'bg-red-50 text-red-600' : 
                 lead.score === 'Warm' ? 'bg-orange-50 text-orange-600' :
                 'bg-gray-100 text-gray-600'
               }`}>
                 🔥 {lead.score}
               </span>
            </div>

            <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-2 rounded-lg italic line-clamp-2">
              "{lead.notes}"
            </p>

            <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
              <button 
                onClick={() => handleGenerateMessage(lead)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium hover:shadow-lg transition-shadow"
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
                <Phone size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredLeads.length === 0 && (
           <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p>No leads found matching your search.</p>
           </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white">
                 <h2 className="text-lg font-serif font-semibold">Add New Lead</h2>
                 <button onClick={() => setShowAddModal(false)} className="opacity-70 hover:opacity-100">✕</button>
              </div>
              
              <div className="p-6 space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Customer Name</label>
                    <input 
                       type="text" 
                       className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500"
                       value={newLead.name}
                       onChange={e => setNewLead({...newLead, name: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-semibold text-gray-500 uppercase">Source</label>
                       <select 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none bg-white"
                          value={newLead.source}
                          onChange={e => setNewLead({...newLead, source: e.target.value})}
                       >
                          <option>Walk-in</option>
                          <option>Instagram</option>
                          <option>Facebook</option>
                          <option>Referral</option>
                          <option>Website</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-semibold text-gray-500 uppercase">Score</label>
                       <select 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none bg-white"
                          value={newLead.score}
                          onChange={e => setNewLead({...newLead, score: e.target.value as any})}
                       >
                          <option>Hot</option>
                          <option>Warm</option>
                          <option>Cold</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                    <div className="flex gap-2 mt-1">
                       {['New', 'Contacted', 'Follow-up'].map(status => (
                          <button
                             key={status}
                             onClick={() => setNewLead({...newLead, status: status as any})}
                             className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${
                                newLead.status === status 
                                ? 'bg-maroon-900 text-white border-maroon-900' 
                                : 'bg-white text-gray-600 border-gray-200'
                             }`}
                          >
                             {status}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Notes / Interest</label>
                    <textarea 
                       rows={3}
                       className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-gold-500"
                       placeholder="E.g. Interested in Solitaire Ring..."
                       value={newLead.notes}
                       onChange={e => setNewLead({...newLead, notes: e.target.value})}
                    ></textarea>
                 </div>

                 <button 
                    onClick={handleAddLead}
                    className="w-full py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-all mt-2"
                 >
                    Save Lead
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <Sparkles size={18} className="text-yellow-300" />
                   <h3 className="font-semibold">AI Assistant Draft</h3>
                 </div>
                 <button onClick={() => setSelectedLead(null)} className="opacity-80 hover:opacity-100">✕</button>
              </div>
              
              <div className="p-6">
                 {loadingAI ? (
                   <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
                      <p className="text-sm text-gray-500">Drafting personalized message...</p>
                   </div>
                 ) : (
                   <>
                     <div className="bg-gray-100 p-4 rounded-xl rounded-tl-none mb-4 text-gray-800 text-sm leading-relaxed border border-gray-200">
                       {aiMessage}
                     </div>
                     <div className="flex gap-3">
                       <button className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium shadow-md hover:bg-emerald-700 flex items-center justify-center gap-2">
                          <Send size={16} /> Send to WhatsApp
                       </button>
                       <button 
                        onClick={() => handleGenerateMessage(selectedLead)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-medium"
                       >
                         Regenerate
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

export default Leads;
