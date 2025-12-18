# Madhusudan G&D ERP

A comprehensive Enterprise Resource Planning (ERP) system tailored for the Jewelry, Gold, and Diamond industry. This application provides a full suite of tools to manage every aspect of a jewellery business, from Point of Sale (POS) and inventory to complex gold loans and artisan management.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=Madhusudan+ERP+Dashboard)

## 🚀 Key Features

### Core Business Operations
- **POS (Point of Sale)**: Streamlined sales interface for quick billing and invoicing.
- **Inventory Management**: Real-time tracking of jewelry, loose stones, and raw materials.
- **Orders & Purchases**: Manage custom orders and procurement processes efficiently.
- **Repairs**: Track repair jobs from intake to delivery.

### Financial Services
- **Gold Loan**: Specialized module for managing loans against gold collateral, including interest calculations and tracking.
- **Accounts**: Integrated financial accounting for daily transactions and ledgers.
- **Tejori (Vault)**: Secure logic for managing high-value assets in the safe/vault.

### Stakeholder Management
- **Customers & CRM**: Manage customer profiles and track leads.
- **Artisans (Karigars)**: Track work assigned to artisans and their payments.
- **Partners**: Manage business partnerships and profit nuances.
- **HR**: Human resource management for staff.

### Administration
- **Dashboard**: Analytics and insights into business performance.
- **Masters**: Configuration of product categories, purity standards, and other master data.
- **Settings**: System-wide preferences and configurations.

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Styling**: Tailwind CSS (presumed based on modern stack standards) & [Lucide React](https://lucide.dev/) for icons.
- **Charts**: [Recharts](https://recharts.org/) for data visualization.
- **AI Integration**: [Google Gemini AI](https://deepmind.google/technologies/gemini/) for intelligent features.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Madhusudan g&d erp"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```
   *Note: If you encounter issues with folder names containing `&` on Windows, the `dev` script has been configured to handle this automatically.*

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the Copyright License - see the LICENSE file for details.

---

*Developed for Madhusudan G&D ERP CRM System - "Anish Debnath"*
