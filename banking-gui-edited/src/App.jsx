import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all the pages we just created
import CustomerDashboard from './pages/HomePage';
import TransferPage from './pages/TransfersPage';
import LoanPage from './pages/LoanPage';
import EditProfilePage from './pages/EditPage';
import LoginPage from './pages/LoginPage'
import CardsPage from './pages/CardsPage'
import TransactionsPage from './pages/TransactionsPage'
import AccountPage from './pages/AccountPage'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* The Dashboard is the home page ("/") */}
        <Route path="/" element={<CustomerDashboard />} />
        
        {/* The sub-pages */}
        <Route path="/transfers" element={<TransferPage />} />
        <Route path="/loans" element={<LoanPage />} />
        <Route path="/settings" element={<EditProfilePage />} />
        <Route path="/logout" element={<LoginPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/history" element={<TransactionsPage />} />
         <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
}