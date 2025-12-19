
import React, { useState } from 'react';
import { 
  Save, 
  RefreshCw, 
  Server, 
  Shield, 
  Bell, 
  Database, 
  TrendingUp, 
  Lock,
  Globe,
  CheckCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { GoogleGenAI } from "@google/genai";
import { ShopProfile } from '../types';

const Settings = () => {
  const { rates, updateRates, shopProfile, updateShopProfile } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<string>('');
  
  // Mock Settings State
  const [apiKey, setApiKey] = useState('sk_live_xxxxxxxxxxxxxxxx');
  const [provider, setProvider] = useState('MetalPriceAPI');
  const [autoFetch, setAutoFetch] = useState(true);

  // Shop Profile State
  const [profile, setProfile] = useState<ShopProfile>(shopProfile);

  const handleSaveProfile = () => {
      updateShopProfile(profile);
      alert("Shop Profile Updated Successfully!");
  };

  // Simulate fetching from a reliable financial API
  const fetchLiveRates = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulating realistic market data with slight fluctuation
    const base24k = 7300 + Math.floor(Math.random() * 100 - 50);
    const mockResponse = {
      gold24k: base24k,
      gold22k: Math.floor(base24k * 0.916),
      gold18k: Math.floor(base24k * 0.750),
      silver: 88.5 + (Math.random() * 2 - 1),
      lastUpdated: new Date().toISOString()
    };

    updateRates(mockResponse);
    setIsLoading(false);
    generateMarketSentiment(mockResponse.gold24k);
  };

  const generateMarketSentiment = async (currentRate: number) => {
    setIsAnalyzing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        if (!process.env.API_KEY) {
            setMarketAnalysis("AI Market Analysis requires a valid API Key. Market appears stable with standard fluctuations expected in the coming week.");
            setIsAnalyzing(false);
            return;
        }
        const prompt = `The current Gold Rate (24K) is ₹${currentRate}/g in India. Provide a brief 2-sentence market sentiment analysis.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setMarketAnalysis(response.text || "Analysis unavailable.");
    } catch (error) {
        setMarketAnalysis("Could not generate analysis.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-maroon-900">System Settings</h1>
           <p className="text-gray-500 mt-1">Configure integrations, shop profile, and security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-gold-50 text-maroon-900 font-bold flex items-center gap-3">
                 <Globe size={18} /> Shop Profile
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3 transition-colors">
                 <TrendingUp size={18} /> Gold & Silver Rates
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3 transition-colors">
                 <Shield size={18} /> Roles & Permissions
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3 transition-colors">
                 <Bell size={18} /> Notifications
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3 transition-colors">
                 <Database size={18} /> Backup & Data
              </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Shop Profile */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                 <h3 className="font-bold text-gray-800">Shop Configuration (Invoice Details)</h3>
              </div>
              <div className="p-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Shop Name</label>
                        <input type="text" className="w-full mt-1 p-2 border rounded-lg" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">GSTIN</label>
                        <input type="text" className="w-full mt-1 p-2 border rounded-lg" value={profile.gstin} onChange={e => setProfile({...profile, gstin: e.target.value})} />
                    </div>
                 </div>
                 <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                     <input type="text" className="w-full mt-1 p-2 border rounded-lg" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                        <input type="text" className="w-full mt-1 p-2 border rounded-lg" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">City</label>
                        <input type="text" className="w-full mt-1 p-2 border rounded-lg" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
                    </div>
                 </div>
                 <div className="pt-2">
                    <button onClick={handleSaveProfile} className="px-6 py-2 bg-maroon-900 text-white rounded-lg font-bold shadow hover:bg-maroon-800 flex items-center gap-2">
                        <Save size={18} /> Update Profile
                    </button>
                 </div>
              </div>
           </div>

           {/* Rate Configuration Card */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold-100 text-gold-700 rounded-lg"><Server size={20} /></div>
                    <div>
                       <h3 className="font-bold text-gray-800">Live Rate API</h3>
                       <p className="text-xs text-gray-500">Automate daily rate updates</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Auto-Fetch</span>
                    <button 
                       onClick={() => setAutoFetch(!autoFetch)}
                       className={`w-12 h-6 rounded-full p-1 transition-colors ${autoFetch ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                       <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${autoFetch ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                 </div>
              </div>
              
              <div className="p-6 space-y-6">
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-8 text-sm">
                       <div>
                          <p className="text-gray-500 text-xs uppercase">Gold 24K</p>
                          <p className="font-bold text-gray-800 text-lg">₹{rates.gold24k.toLocaleString()}</p>
                       </div>
                       <div>
                          <p className="text-gray-500 text-xs uppercase">Gold 22K</p>
                          <p className="font-bold text-gray-800 text-lg">₹{rates.gold22k.toLocaleString()}</p>
                       </div>
                       <div>
                          <p className="text-gray-500 text-xs uppercase">Silver</p>
                          <p className="font-bold text-gray-800 text-lg">₹{rates.silver.toLocaleString()}</p>
                       </div>
                    </div>
                    
                    <button 
                       onClick={fetchLiveRates}
                       disabled={isLoading}
                       className="px-5 py-2.5 bg-gold-500 text-maroon-900 font-bold rounded-lg hover:bg-gold-600 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                       {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                       {isLoading ? 'Fetching...' : 'Fetch Live Rates'}
                    </button>
                 </div>
                 
                 {marketAnalysis && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3">
                        <Sparkles size={20} className="text-purple-600 shrink-0" />
                        <p className="text-sm text-purple-800 italic">{marketAnalysis}</p>
                    </div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
