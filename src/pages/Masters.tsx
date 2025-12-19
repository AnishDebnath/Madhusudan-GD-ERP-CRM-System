
import React, { useState } from 'react';
import { Database, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MasterItem } from '../types';

const Masters = () => {
  const { masters, addMaster, deleteMaster } = useStore();
  const [activeType, setActiveType] = useState<string>('Purity');
  const [newItemValue, setNewItemValue] = useState('');

  const types = ['Purity', 'Category', 'Stone', 'Unit', 'GST', 'Making Charge'];
  const filteredMasters = masters.filter(m => m.type === activeType);

  const handleAdd = () => {
    if(!newItemValue) return;
    addMaster({
        id: Math.random().toString(),
        type: activeType as any,
        value: newItemValue,
        isActive: true
    });
    setNewItemValue('');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">Masters Setup</h1>
           <p className="text-gray-500 mt-1">Configure system dropdowns and lists.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {/* Sidebar */}
         <div className="col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-4 px-2">Configuration Type</h3>
            <div className="space-y-1">
                {types.map(t => (
                    <button 
                      key={t}
                      onClick={() => setActiveType(t)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeType === t ? 'bg-maroon-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                        {t}
                    </button>
                ))}
            </div>
         </div>

         {/* Content */}
         <div className="col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-800">{activeType} List</h2>
             </div>
             
             <div className="flex gap-2 mb-6">
                 <input 
                   type="text" 
                   className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-gold-500"
                   placeholder={`Add new ${activeType}...`}
                   value={newItemValue}
                   onChange={e => setNewItemValue(e.target.value)}
                 />
                 <button onClick={handleAdd} className="bg-gold-500 text-maroon-900 px-4 py-2 rounded-lg font-bold hover:bg-gold-600">
                    <Plus size={20} />
                 </button>
             </div>

             <div className="space-y-2">
                 {filteredMasters.length > 0 ? (
                     filteredMasters.map(item => (
                         <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-gold-300">
                             <span className="font-medium text-gray-700">{item.value}</span>
                             <button onClick={() => deleteMaster(item.id)} className="text-gray-400 hover:text-red-500">
                                 <Trash2 size={16} />
                             </button>
                         </div>
                     ))
                 ) : (
                     <p className="text-center text-gray-400 py-8">No items found.</p>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default Masters;
