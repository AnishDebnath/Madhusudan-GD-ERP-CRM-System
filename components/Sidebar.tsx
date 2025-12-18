import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  ClipboardList, 
  Settings, 
  Gem,
  Megaphone,
  Wrench,
  Landmark,
  Coins,
  Truck,
  Briefcase,
  Box,
  Store,
  Hammer,
  UserCheck,
  Database
} from 'lucide-react';

const Sidebar = () => {
  const navSections = [
    {
      title: 'Retail',
      items: [
        { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
        { name: 'Customer Orders', icon: <ClipboardList size={18} />, path: '/orders' },
        { name: 'POS Billing', icon: <Calculator size={18} />, path: '/pos' },
        { name: 'Customers', icon: <Users size={18} />, path: '/customers' },
        { name: 'Gold Loans', icon: <Coins size={18} />, path: '/gold-loan' },
        { name: 'Repairs', icon: <Wrench size={18} />, path: '/repairs' },
        { name: 'Leads', icon: <Megaphone size={18} />, path: '/leads' },
      ]
    },
    {
      title: 'Wholesale (Tejori)',
      items: [
        { name: 'Tejori Stock', icon: <Box size={18} />, path: '/tejori' },
        { name: 'Inventory', icon: <Store size={18} />, path: '/inventory' },
        { name: 'Purchases', icon: <Truck size={18} />, path: '/purchases' },
      ]
    },
    {
      title: 'Production',
      items: [
        { name: 'Artisans', icon: <Hammer size={18} />, path: '/artisans' },
        { name: 'Mint & Refining', icon: <Briefcase size={18} />, path: '/partners' },
      ]
    },
    {
      title: 'Finance & Admin',
      items: [
        { name: 'Accounts', icon: <Landmark size={18} />, path: '/accounts' },
        { name: 'HR & Payroll', icon: <UserCheck size={18} />, path: '/hr' },
        { name: 'Masters', icon: <Database size={18} />, path: '/masters' },
        { name: 'Settings', icon: <Settings size={18} />, path: '/settings' },
      ]
    }
  ];

  return (
    <div className="h-screen w-64 bg-maroon-900 text-white flex flex-col fixed left-0 top-0 z-20 shadow-2xl overflow-hidden">
      <div className="p-6 flex items-center justify-center border-b border-maroon-800 shrink-0">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-gold-400 to-gold-600 mb-2 shadow-lg shadow-gold-500/30">
            <Gem className="text-maroon-900" size={20} />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-wider text-gold-400">MADHUSUDAN G&D</h1>
          <p className="text-[10px] text-gold-200/60 uppercase tracking-widest mt-1">ERP & CRM System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-maroon-800">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-3 mb-2 text-xs font-bold text-maroon-400 uppercase tracking-wider">{section.title}</h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-maroon-900 font-semibold shadow-md'
                        : 'text-gray-300 hover:bg-maroon-800 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-maroon-800 bg-maroon-950/30 shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="https://picsum.photos/40/40" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-gold-500"
          />
          <div>
            <p className="text-sm font-medium text-gold-100">Admin</p>
            <p className="text-xs text-gray-400">Head Office</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;