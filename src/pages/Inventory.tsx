import React, { useState } from 'react';
import { Search, Plus, Filter, Sparkles, Loader2, Edit2, Trash2 } from 'lucide-react';
import { Product, MetalType } from '../types';
import { generateProductDescription } from '../services/geminiService';
import { useStore } from '../context/StoreContext';

const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Rings',
    metalType: MetalType.Gold18K,
    grossWeight: 0,
    price: 0,
    description: '',
    stock: 1,
    sku: '',
    costPrice: 0
  });

  const handleAIAutoGenerate = async () => {
    if (!newProduct.name || !newProduct.category) return;
    
    setIsGenerating(true);
    const desc = await generateProductDescription(
      newProduct.name || 'Jewelry Item',
      newProduct.category || 'Jewelry',
      newProduct.metalType || 'Gold',
      newProduct.grossWeight || 0,
      'Diamond, Ruby' // Hardcoded for demo
    );
    setNewProduct(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleOpenAdd = () => {
    setNewProduct({
        name: '',
        category: 'Rings',
        metalType: MetalType.Gold18K,
        grossWeight: 0,
        price: 0,
        description: '',
        stock: 1,
        sku: '',
        costPrice: 0
    });
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setNewProduct({ ...product });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        deleteProduct(id);
    }
  };

  const handleSaveProduct = () => {
    const product: Product = {
      id: isEditing ? newProduct.id! : Math.random().toString(),
      sku: newProduct.sku || `SKU-${Date.now()}`,
      name: newProduct.name || 'Unknown Item',
      category: newProduct.category || 'General',
      metalType: newProduct.metalType as MetalType,
      grossWeight: Number(newProduct.grossWeight),
      netWeight: Number(newProduct.grossWeight), // Simplified
      price: Number(newProduct.price),
      costPrice: Number(newProduct.costPrice),
      stock: Number(newProduct.stock),
      description: newProduct.description,
      imageUrl: newProduct.imageUrl || 'https://picsum.photos/100/100?random=' + Math.floor(Math.random()*100)
    };

    if (isEditing) {
        updateProduct(product);
    } else {
        addProduct(product);
    }
    
    setShowAddModal(false);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-serif font-bold text-maroon-900">Inventory</h1>
            <p className="text-gray-500 mt-1">Manage stock, prices, and product details.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-2.5 bg-maroon-900 text-white rounded-xl hover:bg-maroon-800 transition-colors shadow-lg shadow-maroon-900/20"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search Inventory..." 
               className="w-full pl-10 py-2 rounded-lg bg-gray-50 border-none focus:ring-1 focus:ring-gold-500"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-600 hover:border-gold-500">
             <Filter size={18} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {filteredProducts.map((item) => (
                 <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden">
                         <img src={item.imageUrl} alt="" className="w-full h-full object-cover"/>
                       </div>
                       <div>
                         <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                         <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                       </div>
                     </div>
                   </td>
                   <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                   <td className="px-6 py-4 text-sm text-gray-600">{item.stock} units</td>
                   <td className="px-6 py-4 text-sm text-gray-600">{item.grossWeight}g</td>
                   <td className="px-6 py-4 text-sm font-bold text-maroon-900">₹{item.price.toLocaleString('en-IN')}</td>
                   <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                       {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                     </span>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                        </button>
                     </div>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-serif font-semibold">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowAddModal(false)} className="opacity-70 hover:opacity-100">✕</button>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-6">
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                   <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                   <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" 
                    value={newProduct.sku}
                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                        value={newProduct.category}
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      >
                        <option>Rings</option>
                        <option>Necklaces</option>
                        <option>Earrings</option>
                        <option>Bangles</option>
                        <option>Chains</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Metal</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                        value={newProduct.metalType}
                        onChange={e => setNewProduct({...newProduct, metalType: e.target.value as any})}
                      >
                        <option>18K Gold</option>
                        <option>22K Gold</option>
                        <option>24K Gold</option>
                        <option>Platinum</option>
                        <option>Silver</option>
                      </select>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (g)</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                        value={newProduct.grossWeight}
                        onChange={e => setNewProduct({...newProduct, grossWeight: Number(e.target.value)})} 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                        value={newProduct.stock}
                        onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} 
                      />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                        value={newProduct.costPrice}
                        onChange={e => setNewProduct({...newProduct, costPrice: Number(e.target.value)})} 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} 
                      />
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <button 
                      onClick={handleAIAutoGenerate}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md hover:bg-purple-100 transition-colors border border-purple-200"
                    >
                      {isGenerating ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} />}
                      AI Generate
                    </button>
                  </div>
                  <textarea 
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none text-sm resize-none bg-gray-50"
                    placeholder="Click AI Generate to create a marketing description..."
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  ></textarea>
                  
                  <button 
                    onClick={handleSaveProduct}
                    className="w-full py-2.5 bg-maroon-900 text-white rounded-xl font-medium shadow-md hover:bg-maroon-800 transition-all mt-4"
                  >
                    {isEditing ? 'Update Product' : 'Save Product'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;