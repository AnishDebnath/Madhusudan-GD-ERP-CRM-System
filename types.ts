import React from 'react';

// --- CORE ENUMS & MASTERS ---

export enum MetalType {
  Gold18K = '18K Gold',
  Gold22K = '22K Gold',
  Gold24K = '24K Gold',
  Silver = 'Silver',
  Platinum = 'Platinum',
}

export type GoldLedgerType = 'Std Bar' | 'Old Gold' | 'New Ornament' | 'Wastage';
export type DiamondShape = 'Round' | 'Polki' | 'Chauki' | 'Princess' | 'Emerald';
export type DiamondUnit = 'Carat' | 'Roti' | 'Cent';
export type Purity = '24K' | '22K' | '18K' | '14K';

export interface MetalRates {
  gold24k: number;
  gold22k: number;
  gold18k: number;
  silver: number;
  lastUpdated: string;
}

export interface MasterItem {
  id: string;
  type: 'Purity' | 'Category' | 'Stone' | 'Unit' | 'GST' | 'Making Charge';
  value: string;
  isActive: boolean;
}

export interface ShopProfile {
  name: string;
  address: string;
  city: string;
  phone: string;
  gstin: string;
  website?: string;
  terms?: string;
}

// --- RETAIL & SALES ---

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  metalType: MetalType;
  grossWeight: number;
  netWeight: number;
  price: number; // Retail price (Base Gold Value)
  costPrice: number;
  stock: number;
  description?: string;
  imageUrl?: string;
}

export interface Customer {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  email: string;
  type: 'VIP' | 'Regular' | 'New';
  totalSpend: number;
  lastVisit: string;
  dob?: string;
  anniversary?: string;
  address?: string;
  city?: string;
  pan?: string;
  notes?: string;
}

export interface CartItem extends Product {
  quantity: number;
  makingCharges: number; // Per item total making charge
  itemTotal: number; // (Price + Making) * Qty
}

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  status: 'Pending' | 'In Production' | 'Ready' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  advances: AdvanceReceipt[];
  totalValue: number;
  balanceDue: number;
}

export interface OrderItem {
  id: string;
  designCode: string;
  type: string; // Ring, Necklace
  purity: Purity;
  approxWeight: number;
  instructions: string;
}

export interface AdvanceReceipt {
  id: string;
  date: string;
  type: 'Cash' | 'Old Gold' | 'Stone';
  description: string;
  value: number;

  // Specifics for Old Gold
  goldWeight?: number;
  goldPurity?: string;
  goldRate?: number;
}

// --- TEJORI (WHOLESALE / WAREHOUSE) ---

export interface DiamondPacket {
  id: string;
  packetNo: string;
  shape: DiamondShape;
  quality: string; // e.g., VVS1, SI1
  weight: number;
  unit: DiamondUnit;
  pieces: number;
  ratePerUnit: number;
  totalAmount: number;
  status: 'QC Pending' | 'In Stock' | 'Issued' | 'Sold';
  location: 'Tejori' | 'Showroom' | 'Karigar';
}

export interface TejoriGoldStock {
  id: string;
  type: GoldLedgerType;
  purity: Purity;
  weight: number; // in grams
  location: 'Tejori' | 'Showroom' | 'Mint';
}

// --- PRODUCTION (KARIGAR) ---

export interface Karigar {
  id: string;
  name: string;
  skill: 'Gold' | 'Diamond' | 'Polki';
  phone: string;
  status: 'Active' | 'Inactive';
  goldBalance: number; // Grams owed
  cashBalance: number;
}

export interface WorkOrder {
  id: string;
  orderId: string;
  artisanId: string;
  issueDate: string;
  dueDate: string;
  designCode: string;
  status: 'Issued' | 'Completed';

  // Issued Material
  goldIssued: number; // Weight
  goldPurity: string;
  diamondsIssued?: {
    packetId: string;
    pieces: number;
    weight: number;
  }[];

  // Received
  finishedWeight?: number;
  netWeight?: number;
  wastage?: number; // Calculated
  loss?: number; // Calculated
  makingCharges?: number;
}

// --- PARTNERS & FINANCE ---

export interface Dealer {
  id: string;
  name: string;
  companyName: string;
  type: 'Supplier' | 'Buyer' | 'Franchise';
  phone: string;
  city: string;
  gstin?: string;
  balance: number; // Credit/Debit
}

export interface MintJob {
  id: string;
  jobId: string;
  issueDate: string;
  oldGoldWeight: number;
  expectedPurity: number;
  receivedBarWeight?: number;
  status: 'Sent' | 'Received';
  refiningCost: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO date
  description: string;
  category: 'Sales' | 'Purchase' | 'Expense' | 'Salary' | 'Utility' | 'Other';
  type: 'Credit' | 'Debit';
  amount: number;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Other';
  referenceId?: string; // Invoice ID or Bill No
  status: 'Completed' | 'Pending';

  // Invoice Specifics
  items?: CartItem[];
  customerName?: string;
  customerId?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  makingChargesTotal?: number;
}

// --- LEGACY / UTILITY TYPES ---

export interface Lead {
  id: string;
  name: string;
  source: string;
  status: 'New' | 'Contacted' | 'Follow-up' | 'Converted' | 'Lost';
  score: 'Hot' | 'Warm' | 'Cold';
  notes: string;
}

export type RepairStatus = 'Received' | 'Under Repair' | 'Ready' | 'Delivered';

export interface RepairJob {
  id: string;
  jobId: string;
  customerName: string;
  phoneNumber: string;
  productName: string;
  issueDescription: string;
  status: RepairStatus;
  receivedDate: string;
  estimatedDelivery: string;
  cost: number;
  advancePayment?: number;
  productWeight?: number;
  metalType?: string;
  images: string[];
  warrantyUntil?: string;
  purchaseDate?: string;
  deliveredDate?: string;
  notes: string[];
}

export interface GoldLoan {
  id: string;
  loanId: string;
  customerId: string;
  customerName: string;
  phone: string;
  address?: string;
  itemsDescription: string;
  grossWeight: number;
  netWeight: number;
  purity: string;
  valuationAmount: number;
  loanAmount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  status: 'Active' | 'Closed' | 'Overdue';
  images?: string[];
  payments: InterestPayment[];
}

export interface InterestPayment {
  id: string;
  date: string;
  amount: number;
  type: 'Interest' | 'Principal' | 'Settlement';
  note?: string;
}

export interface PurchaseOrder {
  id: string;
  invoiceNo: string;
  purchaseType: 'Vendor Invoice' | 'Old Gold'; // Added Type
  supplierName: string; // Can be Customer Name for Old Gold
  customerMobile?: string; // For Old Gold
  date: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Received' | 'Pending' | 'Partial';
  items: {
    itemName: string;
    category: string;
    weight: number;
    purity: string;
    rate: number;
    amount: number;
  }[];
}

export interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  icon: React.ReactNode;
  isPositive?: boolean;
}

export type Department = 'Showroom' | 'Tejori' | 'Accounts' | 'Mint' | 'Karigar Dept' | 'Management';
export type Designation = 'Manager' | 'Sales Exec' | 'Cashier' | 'Tejori Incharge' | 'Karigar Coordinator' | 'QC Officer';
export type EmployeeStatus = 'Active' | 'Inactive' | 'Resigned' | 'On Hold';

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  designation: Designation;
  department: Department;
  dateOfJoining: string;
  status: EmployeeStatus;
  address?: string;
  dob?: string;
  emergencyContact?: string;
  idProofType?: string;
  idProofNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  allowances: number;
  deductions: number;
  roleId: string;
}

// --- ACCESS CONTROL ---

export type AppModule = 'Customer' | 'Karigar' | 'Dealer' | 'Mint' | 'Tejori' | 'Diamond' | 'Hallmark' | 'Accounts' | 'HR';
export type ActionType = 'View' | 'Add' | 'Edit' | 'Delete' | 'Approve';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Format: "Module:Action" (e.g. "Customer:View")
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Holiday';
  checkIn?: string;
  checkOut?: string;
  lateMinutes?: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  totalDays: number;
  presentDays: number;
  basicPay: number;
  additions: number;
  deductions: number;
  netPay: number;
  status: 'Draft' | 'Paid';
  generatedDate: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  employeeName: string;
  module: string;
  action: string;
  description: string;
}