import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages
import CustomerDashboard from './pages/HomePage';
import TransferPage from './pages/TransfersPage';
import LoanPage from './pages/LoanPage';
import EditProfilePage from './pages/EditPage';
import LoginPage from './pages/LoginPage';
import CardsPage from './pages/CardsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. SET LOGIN AS THE DEFAULT PAGE */}
        <Route path="/" element={<LoginPage />} />
        
        {/* 2. DASHBOARD PATH (Moved to /dashboard) */}
        <Route path="/dashboard" element={<CustomerDashboard />} />
        
        {/* 3. SUB-PAGES */}
        <Route path="/transfers" element={<TransferPage />} />
        <Route path="/loans" element={<LoanPage />} />
        <Route path="/settings" element={<EditProfilePage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/history" element={<TransactionsPage />} />
         <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
}