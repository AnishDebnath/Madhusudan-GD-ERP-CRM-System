import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Leads from './pages/Leads';
import Repairs from './pages/Repairs';
import Customers from './pages/Customers';
import Accounts from './pages/Accounts';
import GoldLoan from './pages/GoldLoan';
import Purchases from './pages/Purchases';
import Tejori from './pages/Tejori';
import Karigars from './pages/Karigars';
import Partners from './pages/Partners';
import HR from './pages/HR';
import Orders from './pages/Orders';
import Masters from './pages/Masters';
import Settings from './pages/Settings';
import { StoreProvider } from './context/StoreContext';

const App = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="orders" element={<Orders />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="gold-loan" element={<GoldLoan />} />
            <Route path="leads" element={<Leads />} />
            <Route path="repairs" element={<Repairs />} />
            <Route path="customers" element={<Customers />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="settings" element={<Settings />} />

            {/* New Enterprise Modules */}
            <Route path="tejori" element={<Tejori />} />
            <Route path="karigars" element={<Karigars />} />
            <Route path="partners" element={<Partners />} />
            <Route path="hr" element={<HR />} />
            <Route path="masters" element={<Masters />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;