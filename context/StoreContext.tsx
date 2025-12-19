import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product, Customer, Order, Transaction, Employee,
  GoldLoan, RepairJob, PurchaseOrder, Lead,
  DiamondPacket, TejoriGoldStock, Karigar, WorkOrder,
  Dealer, MintJob, Role, ActivityLog, MetalType, GoldLedgerType,
  InterestPayment, MetalRates, PayrollRecord, MasterItem, AttendanceRecord, ShopProfile
} from '../types';

interface StoreContextType {
  // Data
  shopProfile: ShopProfile;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  transactions: Transaction[];
  employees: Employee[];
  loans: GoldLoan[];
  repairs: RepairJob[];
  purchases: PurchaseOrder[];
  leads: Lead[];
  diamondStock: DiamondPacket[];
  goldStock: TejoriGoldStock[];
  karigars: Karigar[];
  workOrders: WorkOrder[];
  dealers: Dealer[];
  mintJobs: MintJob[];
  roles: Role[];
  logs: ActivityLog[];
  rates: MetalRates;
  payrolls: PayrollRecord[];
  masters: MasterItem[];
  attendance: AttendanceRecord[];

  // Actions
  updateShopProfile: (profile: ShopProfile) => void;
  addProduct: (item: Product) => void;
  updateProduct: (item: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, qty: number) => void;
  addCustomer: (customer: Customer) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  addTransaction: (tx: Transaction) => void;
  addEmployee: (emp: Employee) => void;
  addLoan: (loan: GoldLoan) => void;
  updateLoan: (loan: GoldLoan) => void;
  addRepair: (job: RepairJob) => void;
  updateRepair: (job: RepairJob) => void;
  addPurchase: (po: PurchaseOrder) => void;
  addLead: (lead: Lead) => void;
  addDiamondPacket: (packet: DiamondPacket) => void;
  addWorkOrder: (wo: WorkOrder) => void;
  updateWorkOrder: (wo: WorkOrder) => void;
  addKarigar: (karigar: Karigar) => void;
  updateKarigar: (karigar: Karigar) => void;
  addDealer: (dealer: Dealer) => void;
  logActivity: (module: string, action: string, description: string, user: string) => void;
  updateRates: (newRates: MetalRates) => void;
  addPayroll: (record: PayrollRecord) => void;
  addMaster: (item: MasterItem) => void;
  deleteMaster: (id: string) => void;
  markAttendance: (record: AttendanceRecord) => void;
  addRole: (role: Role) => void;
  updateRole: (role: Role) => void;

  // Financials
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  cashInHand: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper for local storage
const usePersistedState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(error);
    }
  }, [key, state]);

  return [state, setState];
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // --- SYSTEM CONFIG ---
  const [shopProfile, setShopProfile] = usePersistedState<ShopProfile>('shopProfile', {
    name: 'MADHUSUDAN G&D',
    address: '123, Gold Souk, Zaveri Bazaar, Mumbai - 400002',
    city: 'Mumbai',
    phone: '+91 22 2345 6789',
    gstin: '27AABCU9603R1Z',
    website: 'www.madhusudangd.com',
    terms: 'Goods once sold will not be taken back. Subject to Mumbai Jurisdiction.'
  });

  // --- INITIAL MOCK DATA ---
  const [products, setProducts] = usePersistedState<Product[]>('products', [
    { id: '1', sku: 'RG-001', name: 'Diamond Solitaire Ring', category: 'Rings', metalType: MetalType.Gold18K, grossWeight: 4.5, netWeight: 4.2, price: 45000, costPrice: 38000, stock: 5, imageUrl: 'https://picsum.photos/100/100?random=1' },
    { id: '2', sku: 'NK-022', name: 'Gold Filigree Necklace', category: 'Necklaces', metalType: MetalType.Gold22K, grossWeight: 25.5, netWeight: 25.5, price: 185000, costPrice: 160000, stock: 2, imageUrl: 'https://picsum.photos/100/100?random=2' },
  ]);

  const [customers, setCustomers] = usePersistedState<Customer[]>('customers', [
    { id: '1', customerId: 'C-001', name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@example.com', type: 'VIP', totalSpend: 1250000, lastVisit: '2024-03-01', city: 'Mumbai' },
  ]);

  const [orders, setOrders] = usePersistedState<Order[]>('orders', []);
  const [transactions, setTransactions] = usePersistedState<Transaction[]>('transactions', [
    { id: '1', date: '2024-03-15', description: 'Opening Balance', category: 'Other', type: 'Credit', amount: 500000, paymentMode: 'Cash', status: 'Completed' }
  ]);

  const [employees, setEmployees] = usePersistedState<Employee[]>('employees', [
    { id: '1', code: 'EMP-001', fullName: 'Admin User', email: 'admin@prema.com', phone: '9999999999', designation: 'Manager', department: 'Management', dateOfJoining: '2020-01-01', status: 'Active', basicSalary: 50000, hra: 20000, conveyance: 5000, allowances: 0, deductions: 0, roleId: 'admin' }
  ]);

  const [loans, setLoans] = usePersistedState<GoldLoan[]>('loans', []);
  const [repairs, setRepairs] = usePersistedState<RepairJob[]>('repairs', []);
  const [purchases, setPurchases] = usePersistedState<PurchaseOrder[]>('purchases', []);
  const [leads, setLeads] = usePersistedState<Lead[]>('leads', [
    { id: '1', name: 'Sarah Jenkins', source: 'Instagram', status: 'New', score: 'Hot', notes: 'Looking for engagement ring, budget ₹3 Lakhs' },
  ]);
  const [diamondStock, setDiamondStock] = usePersistedState<DiamondPacket[]>('diamondStock', [
    { id: '1', packetNo: 'PKT-24-001', shape: 'Round', quality: 'VVS1', weight: 12.5, unit: 'Carat', pieces: 50, ratePerUnit: 45000, totalAmount: 562500, status: 'In Stock', location: 'Tejori' },
  ]);
  const [goldStock, setGoldStock] = usePersistedState<TejoriGoldStock[]>('goldStock', [
    { id: 'g1', type: 'Std Bar', purity: '24K', weight: 1000, location: 'Tejori' },
    { id: 'g2', type: 'Old Gold', purity: '22K', weight: 450.5, location: 'Tejori' },
    { id: 'g3', type: 'Wastage', purity: '22K', weight: 12.4, location: 'Tejori' },
  ]);
  const [karigars, setKarigars] = usePersistedState<Karigar[]>('artisans', [
    { id: '1', name: 'Ramesh Karigar', skill: 'Gold', phone: '9876543210', status: 'Active', goldBalance: 0, cashBalance: 0 },
  ]);
  const [workOrders, setWorkOrders] = usePersistedState<WorkOrder[]>('workOrders', []);
  const [dealers, setDealers] = usePersistedState<Dealer[]>('dealers', [
    { id: '1', name: 'Rajesh Gold House', companyName: 'RGH Ltd', type: 'Supplier', phone: '9876543210', city: 'Mumbai', balance: -500000 },
  ]);
  const [mintJobs, setMintJobs] = usePersistedState<MintJob[]>('mintJobs', []);

  const [roles, setRoles] = usePersistedState<Role[]>('roles', [
    { id: 'admin', name: 'Administrator', description: 'Full System Access', permissions: ['*'] },
    { id: 'user', name: 'Staff', description: 'Limited Access', permissions: ['Customer:View', 'Customer:Add', 'Sales:Add'] },
  ]);

  const [logs, setLogs] = usePersistedState<ActivityLog[]>('logs', []);
  const [rates, setRates] = usePersistedState<MetalRates>('rates', {
    gold24k: 6850,
    gold22k: 6250,
    gold18k: 5100,
    silver: 78.5,
    lastUpdated: new Date().toISOString()
  });

  const [payrolls, setPayrolls] = usePersistedState<PayrollRecord[]>('payrolls', []);
  const [masters, setMasters] = usePersistedState<MasterItem[]>('masters', [
    { id: '1', type: 'Purity', value: '24K', isActive: true },
    { id: '2', type: 'Purity', value: '22K', isActive: true },
    { id: '3', type: 'Category', value: 'Ring', isActive: true },
    { id: '4', type: 'Category', value: 'Necklace', isActive: true },
  ]);
  const [attendance, setAttendance] = usePersistedState<AttendanceRecord[]>('attendance', []);

  // --- ACTIONS ---

  const updateShopProfile = (profile: ShopProfile) => setShopProfile(profile);

  const addProduct = (item: Product) => setProducts(prev => [item, ...prev]);
  const updateProduct = (item: Product) => setProducts(prev => prev.map(p => p.id === item.id ? item : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const updateProductStock = (id: string, qty: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock - qty } : p));
  };

  const addCustomer = (customer: Customer) => setCustomers(prev => [customer, ...prev]);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    order.advances.forEach(adv => {
      addTransaction({
        id: Math.random().toString(),
        date: adv.date,
        description: `Order Advance: ${order.orderNo} (${adv.type})`,
        category: 'Sales',
        type: 'Credit',
        amount: adv.value,
        paymentMode: adv.type === 'Cash' ? 'Cash' : 'Other',
        referenceId: order.orderNo,
        status: 'Completed'
      });
    });
    logActivity('Retail', 'Create Order', `Created Order ${order.orderNo}`, 'Admin');
  };

  const updateOrder = (order: Order) => setOrders(prev => prev.map(o => o.id === order.id ? order : o));

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);

    // Auto-update stock if it's a sale with items
    if (tx.items && tx.items.length > 0 && tx.category === 'Sales') {
      tx.items.forEach(item => updateProductStock(item.id, item.quantity));
    }

    // Auto-update customer stats if linked
    if (tx.customerId) {
      setCustomers(prev => prev.map(c =>
        c.id === tx.customerId
          ? { ...c, totalSpend: c.totalSpend + tx.amount, lastVisit: tx.date }
          : c
      ));
    }

    logActivity('Finance', 'New Transaction', `${tx.type} of ₹${tx.amount}`, 'Admin');
  };

  const addEmployee = (emp: Employee) => setEmployees(prev => [emp, ...prev]);

  const addLoan = (loan: GoldLoan) => {
    setLoans(prev => [loan, ...prev]);
    if (loan.status === 'Active') {
      addTransaction({
        id: Math.random().toString(),
        date: loan.startDate,
        description: `Gold Loan Disbursed: ${loan.loanId}`,
        category: 'Expense',
        type: 'Debit',
        amount: loan.loanAmount,
        paymentMode: 'Cash',
        referenceId: loan.loanId,
        status: 'Completed'
      });
    }
    logActivity('Gold Loan', 'Create', `Created Loan ${loan.loanId} (${loan.status})`, 'Admin');
  };

  const updateLoan = (updatedLoan: GoldLoan) => {
    setLoans(prev => prev.map(l => l.id === updatedLoan.id ? updatedLoan : l));
  };

  const addRepair = (job: RepairJob) => setRepairs(prev => [job, ...prev]);
  const updateRepair = (job: RepairJob) => {
    setRepairs(prev => prev.map(r => r.id === job.id ? job : r));
  };

  const addPurchase = (po: PurchaseOrder) => {
    setPurchases(prev => [po, ...prev]);
    const updateGoldStock = (type: GoldLedgerType, weight: number, purity: string) => {
      setGoldStock(prev => {
        const existing = prev.find(g => g.type === type && g.location === 'Tejori');
        if (existing) {
          return prev.map(g => g.id === existing.id ? { ...g, weight: g.weight + weight } : g);
        } else {
          return [...prev, {
            id: Math.random().toString(),
            type,
            purity: purity as any,
            weight,
            location: 'Tejori'
          }];
        }
      });
    };

    if (po.purchaseType === 'Old Gold') {
      const totalWeight = po.items.reduce((acc, item) => acc + item.weight, 0);
      updateGoldStock('Old Gold', totalWeight, '22K');
      addTransaction({
        id: Math.random().toString(),
        date: po.date,
        description: `Old Gold Purchase: ${po.invoiceNo}`,
        category: 'Purchase',
        type: 'Debit',
        amount: po.totalAmount,
        paymentMode: 'Cash',
        referenceId: po.invoiceNo,
        status: 'Completed'
      });
      logActivity('Tejori', 'Old Gold Purchase', `Bought ${totalWeight}g Old Gold from ${po.supplierName}`, 'Admin');
    } else {
      po.items.forEach(item => {
        if (item.category === 'Std Bar' || item.category === 'Bullion') {
          updateGoldStock('Std Bar', item.weight, item.purity);
        } else {
          updateGoldStock('New Ornament', item.weight, item.purity);
        }
      });
      addTransaction({
        id: Math.random().toString(),
        date: po.date,
        description: `Purchase Invoice: ${po.invoiceNo}`,
        category: 'Purchase',
        type: 'Debit',
        amount: po.totalAmount,
        paymentMode: 'Bank Transfer',
        referenceId: po.invoiceNo,
        status: 'Completed'
      });
      logActivity('Purchase', 'Vendor Invoice', `Added Invoice ${po.invoiceNo}`, 'Admin');
    }
  };

  const addLead = (lead: Lead) => setLeads(prev => [lead, ...prev]);
  const addDiamondPacket = (packet: DiamondPacket) => setDiamondStock(prev => [packet, ...prev]);
  const addWorkOrder = (wo: WorkOrder) => setWorkOrders(prev => [wo, ...prev]);
  const updateWorkOrder = (wo: WorkOrder) => setWorkOrders(prev => prev.map(w => w.id === wo.id ? wo : w));
  const addKarigar = (karigar: Karigar) => setKarigars(prev => [karigar, ...prev]);
  const updateKarigar = (karigar: Karigar) => setKarigars(prev => prev.map(a => a.id === karigar.id ? karigar : a));
  const addDealer = (dealer: Dealer) => setDealers(prev => [dealer, ...prev]);

  const addPayroll = (record: PayrollRecord) => setPayrolls(prev => [record, ...prev]);
  const addMaster = (item: MasterItem) => setMasters(prev => [item, ...prev]);
  const deleteMaster = (id: string) => setMasters(prev => prev.filter(m => m.id !== id));

  const addRole = (role: Role) => setRoles(prev => [role, ...prev]);
  const updateRole = (role: Role) => setRoles(prev => prev.map(r => r.id === role.id ? role : r));

  const markAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => {
      const existingIndex = prev.findIndex(a => a.employeeId === record.employeeId && a.date === record.date);
      if (existingIndex >= 0) {
        const newAtt = [...prev];
        newAtt[existingIndex] = record;
        return newAtt;
      }
      return [...prev, record];
    });
  };

  const logActivity = (module: string, action: string, description: string, user: string) => {
    const log: ActivityLog = {
      id: Math.random().toString(),
      timestamp: new Date().toISOString(),
      employeeName: user,
      module,
      action,
      description
    };
    setLogs(prev => [log, ...prev]);
  };

  const updateRates = (newRates: MetalRates) => {
    setRates(newRates);
    logActivity('Masters', 'Rate Update', 'Updated Daily Gold/Silver Rates', 'Admin');
  };

  // --- DERIVED STATE ---
  const totalSales = transactions.filter(t => t.type === 'Credit' && t.category === 'Sales').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const cashInHand = transactions.reduce((acc, t) => t.type === 'Credit' ? acc + t.amount : acc - t.amount, 0);

  return (
    <StoreContext.Provider value={{
      shopProfile, products, customers, orders, transactions, employees, loans, repairs, purchases, leads,
      diamondStock, goldStock, karigars, workOrders, dealers, mintJobs, roles, logs, rates,
      payrolls, masters, attendance,
      updateShopProfile, addProduct, updateProduct, deleteProduct, updateProductStock, addCustomer, addOrder, updateOrder,
      addTransaction, addEmployee,
      addLoan, updateLoan, addRepair, updateRepair, addPurchase, addLead, addDiamondPacket,
      addWorkOrder, updateWorkOrder, addKarigar, updateKarigar, addDealer, logActivity, updateRates,
      addPayroll, addMaster, deleteMaster, markAttendance, addRole, updateRole,
      totalSales, totalExpenses, netProfit, cashInHand
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};