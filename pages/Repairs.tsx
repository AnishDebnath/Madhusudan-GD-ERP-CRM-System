import React, { useState } from 'react';
import { 
  Plus, Search, Wrench, Clock, CheckCircle, Truck, Camera, AlertCircle, X, User, FileText, ShieldCheck, ShieldAlert, RefreshCw, Save, Edit2, Upload, Banknote
} from 'lucide-react';
import { RepairJob, RepairStatus, Transaction } from '../types';
import { useStore } from '../context/StoreContext';

const STATUS_STEPS: RepairStatus[] = ['Received', 'Under Repair', 'Ready', 'Delivered'];

const Repairs = () => {
  const { repairs, addRepair, updateRepair, customers, addTransaction } = useStore();
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('Cash');

  // New Job Form State
  const [newJob, setNewJob] = useState<Partial<RepairJob>>({
    jobId: '',
    customerName: '',
    phoneNumber: '',
    productName: '',
    productWeight: 0,
    metalType: 'Gold 22K',
    issueDescription: '',
    status: 'Received',
    receivedDate: new Date().toISOString().split('T')[0],
    estimatedDelivery: '',
    cost: 0,
    advancePayment: 0,
    purchaseDate: '',
    warrantyUntil: '',
    images: []
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getStatusIcon = (status: RepairStatus) => {
    switch (status) {
      case 'Received': return <FileText size={16} />;
      case 'Under Repair': return <Wrench size={16} />;
      case 'Ready': return <CheckCircle size={16} />;
      case 'Delivered': return <Truck size={16} />;
    }
  };

  const filteredRepairs = repairs.filter(r => 
    (filterStatus === 'All' || r.status === filterStatus) &&
    (r.jobId.toLowerCase().includes(searchTerm.toLowerCase()) || r.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const generateJobId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const prefix = `REP-${year}-`;
    const existingSequences = repairs.filter(r => r.jobId.startsWith(prefix)).map(r => parseInt(r.jobId.split('-')[2])).filter(n => !isNaN(n));
    const maxSeq = existingSequences.length > 0 ? Math.max(...existingSequences) : 0;
    return `${prefix}${(maxSeq + 1).toString().padStart(4, '0')}`;
  };

  const handleOpenNewJobModal = () => {
    setNewJob({
      jobId: generateJobId(),
      customerName: '',
      phoneNumber: '',
      productName: '',
      productWeight: 0,
      metalType: 'Gold 22K',
      issueDescription: '',
      status: 'Received',
      receivedDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: '',
      cost: 0,
      advancePayment: 0,
      purchaseDate: '',
      warrantyUntil: '',
      images: []
    });
    setImagePreview(null);
    setShowNewJobModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setNewJob({ ...newJob, images: [url] });
    }
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setNewJob({
        ...newJob,
        customerName: cust.name,
        phoneNumber: cust.phone
      });
    }
  };

  const handleCreateJob = () => {
    if (!newJob.jobId || !newJob.customerName || !newJob.productName) {
        alert("Please fill in all required fields.");
        return;
    }
    const job: RepairJob = {
        id: Math.random().toString(),
        jobId: newJob.jobId,
        customerName: newJob.customerName || 'Unknown',
        phoneNumber: newJob.phoneNumber || '',
        productName: newJob.productName || 'Item',
        productWeight: Number(newJob.productWeight),
        metalType: newJob.metalType,
        issueDescription: newJob.issueDescription || '',
        status: 'Received',
        receivedDate: newJob.receivedDate || '',
        estimatedDelivery: newJob.estimatedDelivery || '',
        cost: Number(newJob.cost),
        advancePayment: Number(newJob.advancePayment),
        images: newJob.images && newJob.images.length > 0 ? newJob.images : ['https://picsum.photos/300/300?random=' + Math.floor(Math.random() * 100)],
        notes: [],
        warrantyUntil: newJob.warrantyUntil,
        purchaseDate: newJob.purchaseDate
    };
    
    // If advance payment exists, log it
    if (job.advancePayment && job.advancePayment > 0) {
        addTransaction({
            id: Math.random().toString(),
            date: new Date().toISOString().split('T')[0],
            description: `Repair Advance: ${job.jobId}`,
            category: 'Sales',
            type: 'Credit',
            amount: job.advancePayment,
            paymentMode: 'Cash',
            referenceId: job.jobId,
            status: 'Completed'
        });
    }

    addRepair(job);
    setShowNewJobModal(false);
  };

  const advanceStatus = () => {
    if (!selectedJob) return;
    const currentIndex = STATUS_STEPS.indexOf(selectedJob.status);
    
    if (currentIndex < STATUS_STEPS.length - 1) {
      const nextStatus = STATUS_STEPS[currentIndex + 1];
      
      // If moving to Delivered, check for balance payment
      if (nextStatus === 'Delivered') {
          const balance = selectedJob.cost - (selectedJob.advancePayment || 0);
          if (balance > 0) {
              setShowPaymentModal(true);
              return; // Stop here, wait for payment confirmation
          }
      }

      const updatedJob = { 
        ...selectedJob, 
        status: nextStatus,
        deliveredDate: nextStatus === 'Delivered' ? new Date().toISOString().split('T')[0] : selectedJob.deliveredDate
      };
      updateRepair(updatedJob);
      setSelectedJob(updatedJob);
    }
  };

  const confirmDeliveryPayment = () => {
      if (!selectedJob) return;
      
      const balance = selectedJob.cost - (selectedJob.advancePayment || 0);
      if (balance > 0) {
          addTransaction({
              id: Math.random().toString(),
              date: new Date().toISOString().split('T')[0],
              description: `Repair Final Payment: ${selectedJob.jobId}`,
              category: 'Sales',
              type: 'Credit',
              amount: balance,
              paymentMode: paymentMode as any,
              referenceId: selectedJob.jobId,
              status: 'Completed'
          });
      }

      const updatedJob = { 
        ...selectedJob, 
        status: 'Delivered' as RepairStatus,
        deliveredDate: new Date().toISOString().split('T')[0]
      };
      
      updateRepair(updatedJob);
      setSelectedJob(updatedJob);
      setShowPaymentModal(false);
  };
  
  const handleUpdateJobDetails = () => {
      if(!selectedJob) return;
      updateRepair(selectedJob);
      setIsEditing(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Repairs & Warranty</h1>
           <p className="text-gray-500 mt-1">Manage service requests and warranty claims.</p>
        </div>
        <button onClick={handleOpenNewJobModal} className="flex items-center gap-2 px-6 py-2.5 bg-maroon-900 text-white rounded-xl hover:bg-maroon-800 transition-colors shadow-lg">
          <Plus size={20} /> New Repair Job
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Received', 'Under Repair', 'Ready', 'Delivered'].map(status => (
              <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status ? 'bg-maroon-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{status}</button>
            ))}
         </div>
         <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Job ID or Name..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-gold-500" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepairs.map(job => (
            <div key={job.id} onClick={() => { setSelectedJob(job); setIsEditing(false); }} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl hover:border-gold-300 transition-all">
              <div className="relative h-40 bg-gray-100">
                 <img src={job.images[0]} alt="Item" className="w-full h-full object-cover" />
                 <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 bg-white/95 text-maroon-900 shadow-sm">{getStatusIcon(job.status)} {job.status}</div>
              </div>
              <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif font-bold text-gray-800 line-clamp-1">{job.productName}</h3>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{job.jobId}</span>
                 </div>
                 <p className="text-sm text-gray-500 mb-4">{job.customerName}</p>
                 <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-gray-400 uppercase">Est. Delivery</span>
                       <span className={`font-medium ${new Date(job.estimatedDelivery) < new Date() && job.status !== 'Delivered' ? 'text-red-500' : 'text-gray-800'}`}>
                         {job.estimatedDelivery}
                       </span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] text-gray-400 uppercase">Balance Due</span>
                       <span className="block font-bold text-maroon-900">₹{(job.cost - (job.advancePayment || 0)).toLocaleString()}</span>
                    </div>
                 </div>
              </div>
            </div>
        ))}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]">
            {/* Left Sidebar - Details */}
            <div className="w-full md:w-1/3 bg-gray-50 p-6 border-r border-gray-100 overflow-y-auto">
               <div className="aspect-square rounded-2xl overflow-hidden shadow-md mb-6 relative group">
                  <img src={selectedJob.images[0]} alt="Repair Item" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
               </div>
               
               <div className="space-y-6">
                 <div>
                   <h2 className="text-xl font-serif font-bold text-maroon-900 mb-1">{selectedJob.productName}</h2>
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="bg-white px-2 py-0.5 border rounded">{selectedJob.metalType || 'Metal N/A'}</span>
                      <span>{selectedJob.productWeight || 0} g</span>
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Profile</h4>
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-full bg-maroon-100 text-maroon-800 flex items-center justify-center font-bold">
                          {selectedJob.customerName.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-gray-800 text-sm">{selectedJob.customerName}</p>
                          <p className="text-xs text-gray-500">{selectedJob.phoneNumber}</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                   <div className="flex justify-between items-center mb-3">
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Financials</h4>
                       <button onClick={() => setIsEditing(!isEditing)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                           {isEditing ? <Save size={12}/> : <Edit2 size={12}/>} {isEditing ? 'Save' : 'Edit'}
                       </button>
                   </div>
                   <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                         <span className="text-gray-600">Repair Cost</span>
                         {isEditing ? (
                           <input type="number" className="w-20 text-right border rounded p-0.5" value={selectedJob.cost} onChange={e => setSelectedJob({...selectedJob, cost: Number(e.target.value)})} />
                         ) : (
                           <span className="font-bold">₹{selectedJob.cost.toLocaleString()}</span>
                         )}
                      </div>
                      <div className="flex justify-between text-green-600">
                         <span>Advance Paid</span>
                         {isEditing ? (
                           <input type="number" className="w-20 text-right border rounded p-0.5" value={selectedJob.advancePayment} onChange={e => setSelectedJob({...selectedJob, advancePayment: Number(e.target.value)})} />
                         ) : (
                           <span>- ₹{(selectedJob.advancePayment || 0).toLocaleString()}</span>
                         )}
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-maroon-900 text-base">
                         <span>Balance Due</span>
                         <span>₹{(selectedJob.cost - (selectedJob.advancePayment || 0)).toLocaleString()}</span>
                      </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Right Content */}
            <div className="w-full md:w-2/3 p-6 flex flex-col bg-white overflow-y-auto">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                       {selectedJob.jobId} 
                       <span className={`text-sm px-3 py-1 rounded-full border font-normal ${
                          selectedJob.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                       }`}>{selectedJob.status}</span>
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-500 mt-2">
                       <span className="flex items-center gap-1"><Clock size={14}/> In: {selectedJob.receivedDate}</span>
                       <span className="flex items-center gap-1"><Truck size={14}/> Exp: {selectedJob.estimatedDelivery}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} className="text-gray-400" /></button>
               </div>
               
               {/* Issue Description */}
               <div className="mb-6">
                   <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2"><Wrench size={16} /> Issue / Work Required</h4>
                   {isEditing ? (
                       <textarea 
                         className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-gold-500 outline-none" rows={4}
                         value={selectedJob.issueDescription}
                         onChange={e => setSelectedJob({...selectedJob, issueDescription: e.target.value})}
                       />
                   ) : (
                       <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl leading-relaxed border border-gray-100">
                         {selectedJob.issueDescription}
                       </p>
                   )}
               </div>

               {/* Dates */}
               <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                       <h5 className="text-xs font-bold text-gray-400 uppercase mb-1">Purchase Date</h5>
                       {isEditing ? (
                         <input type="date" className="w-full bg-white border rounded p-1" value={selectedJob.purchaseDate} onChange={e => setSelectedJob({...selectedJob, purchaseDate: e.target.value})} />
                       ) : (
                         <p className="font-medium text-gray-800">{selectedJob.purchaseDate || 'N/A'}</p>
                       )}
                   </div>
                   <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                       <h5 className="text-xs font-bold text-gray-400 uppercase mb-1">Warranty Expires</h5>
                       {isEditing ? (
                         <input type="date" className="w-full bg-white border rounded p-1" value={selectedJob.warrantyUntil} onChange={e => setSelectedJob({...selectedJob, warrantyUntil: e.target.value})} />
                       ) : (
                         <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800">{selectedJob.warrantyUntil || 'No Warranty'}</p>
                            {selectedJob.warrantyUntil && (
                                new Date(selectedJob.warrantyUntil) > new Date() 
                                ? <ShieldCheck size={16} className="text-green-500" />
                                : <ShieldAlert size={16} className="text-red-500" />
                            )}
                         </div>
                       )}
                   </div>
               </div>

               <div className="mt-auto flex gap-3 pt-6 border-t">
                  <button onClick={advanceStatus} className="flex-1 py-3 bg-maroon-900 text-white rounded-xl font-medium shadow-lg hover:bg-maroon-800 flex items-center justify-center gap-2 transition-transform active:scale-95">
                     <CheckCircle size={18} /> {selectedJob.status === 'Delivered' ? 'Job Completed' : 'Advance Status'}
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                     Print Receipt
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
      
      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
               <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                  <h2 className="text-lg font-serif font-semibold">Create New Repair Job</h2>
                  <button onClick={() => setShowNewJobModal(false)} className="opacity-70 hover:opacity-100">✕</button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                   
                   {/* Left Column: Customer & Item */}
                   <div className="space-y-6">
                       {/* Customer Lookup */}
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><User size={16}/> Customer Details</h3>
                          <div className="space-y-3">
                             <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Select Customer</label>
                                <select 
                                   className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-white outline-none"
                                   onChange={handleCustomerSelect}
                                   defaultValue=""
                                >
                                   <option value="" disabled>Search / Select Customer</option>
                                   {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                                </select>
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                                    <input type="text" className="w-full mt-1 p-2 border border-gray-300 rounded-lg" value={newJob.customerName} onChange={e => setNewJob({...newJob, customerName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                                    <input type="text" className="w-full mt-1 p-2 border border-gray-300 rounded-lg" value={newJob.phoneNumber} onChange={e => setNewJob({...newJob, phoneNumber: e.target.value})} />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Product Info */}
                       <div>
                          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Wrench size={16}/> Product Details</h3>
                          <div className="space-y-3">
                              <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase">Product Name</label>
                                  <input type="text" placeholder="e.g. Gold Necklace" className="w-full mt-1 p-2 border border-gray-300 rounded-lg" value={newJob.productName} onChange={e => setNewJob({...newJob, productName: e.target.value})} />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="text-xs font-semibold text-gray-500 uppercase">Weight (g)</label>
                                      <input type="number" className="w-full mt-1 p-2 border border-gray-300 rounded-lg" value={newJob.productWeight} onChange={e => setNewJob({...newJob, productWeight: Number(e.target.value)})} />
                                  </div>
                                  <div>
                                      <label className="text-xs font-semibold text-gray-500 uppercase">Metal Type</label>
                                      <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-white" value={newJob.metalType} onChange={e => setNewJob({...newJob, metalType: e.target.value})}>
                                          <option>Gold 22K</option>
                                          <option>Gold 18K</option>
                                          <option>Silver</option>
                                          <option>Platinum</option>
                                          <option>Other</option>
                                      </select>
                                  </div>
                              </div>
                              <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase">Issue Description</label>
                                  <textarea className="w-full mt-1 p-2 border border-gray-300 rounded-lg" rows={3} placeholder="Describe the repair needed..." value={newJob.issueDescription} onChange={e => setNewJob({...newJob, issueDescription: e.target.value})} />
                              </div>
                          </div>
                       </div>
                   </div>

                   {/* Right Column: Photo & Financials */}
                   <div className="space-y-6">
                       
                       {/* Image Upload */}
                       <div>
                           <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Camera size={16}/> Product Photo</h3>
                           <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors relative h-48 bg-gray-50">
                               {imagePreview ? (
                                   <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                               ) : (
                                   <>
                                       <Upload size={32} className="mb-2" />
                                       <span className="text-xs">Click to upload image</span>
                                   </>
                               )}
                               <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                           </div>
                       </div>

                       {/* Dates */}
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="text-xs font-semibold text-gray-500 uppercase">Received Date</label>
                               <input type="date" className="w-full mt-1 p-2 border border-gray-300 rounded-lg" value={newJob.receivedDate} onChange={e => setNewJob({...newJob, receivedDate: e.target.value})} />
                           </div>
                           <div>
                               <label className="text-xs font-semibold text-gray-500 uppercase">Delivery / Collect Date</label>
                               <input type="date" className="w-full mt-1 p-2 border border-gray-300 rounded-lg" value={newJob.estimatedDelivery} onChange={e => setNewJob({...newJob, estimatedDelivery: e.target.value})} />
                           </div>
                       </div>

                       {/* Financials */}
                       <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                          <h3 className="text-sm font-bold text-yellow-800 mb-3">Repair Charges</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-semibold text-yellow-700 uppercase">Estimated Cost</label>
                                  <div className="relative mt-1">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                      <input type="number" className="w-full pl-8 p-2 border border-yellow-300 rounded-lg" value={newJob.cost} onChange={e => setNewJob({...newJob, cost: Number(e.target.value)})} />
                                  </div>
                              </div>
                              <div>
                                  <label className="text-xs font-semibold text-yellow-700 uppercase">Advance Paid</label>
                                  <div className="relative mt-1">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                      <input type="number" className="w-full pl-8 p-2 border border-yellow-300 rounded-lg" value={newJob.advancePayment} onChange={e => setNewJob({...newJob, advancePayment: Number(e.target.value)})} />
                                  </div>
                              </div>
                          </div>
                       </div>
                   </div>
               </div>

               <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-4">
                   <button onClick={() => setShowNewJobModal(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium">Cancel</button>
                   <button onClick={handleCreateJob} className="flex-1 py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg hover:bg-maroon-800 transition-colors">Create Job Card</button>
               </div>
           </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showPaymentModal && selectedJob && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Banknote size={20} className="text-green-600"/> Collect Balance Payment
                  </h3>
                  <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-xs text-gray-500 uppercase">Balance Amount</p>
                          <p className="text-2xl font-bold text-maroon-900">₹{(selectedJob.cost - (selectedJob.advancePayment || 0)).toLocaleString()}</p>
                      </div>
                      
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Payment Mode</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['Cash', 'Card', 'UPI'].map(mode => (
                                  <button
                                      key={mode}
                                      onClick={() => setPaymentMode(mode)}
                                      className={`py-2 text-sm font-medium rounded-lg border ${
                                          paymentMode === mode 
                                          ? 'bg-maroon-900 text-white border-maroon-900' 
                                          : 'bg-white text-gray-600 border-gray-200'
                                      }`}
                                  >
                                      {mode}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="pt-2 flex gap-3">
                          <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
                          <button onClick={confirmDeliveryPayment} className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Confirm Payment</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Repairs;