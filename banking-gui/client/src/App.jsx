import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all the pages we just created
import CustomerDashboard from './pages/User/HomePage';
import TransferPage from './pages/User/TransfersPage';
import LoanPage from './pages/User/LoanPage';
import EditProfilePage from './pages/User/EditPage';
import LoginPage from './pages/LoginPage';
import CardsPage from './pages/User/CardsPage';
import TransactionsPage from './pages/User/TransactionsPage';
import AccountPage from './pages/User/AccountPage';
import StaffDashboard from './pages/Staff/AdminDashboard';
import UserDirectory from './pages/Staff/UserDirectory';
import CustomerDetails from './pages/Staff/CustomerDetails';
import AddUser from './pages/Staff/AddUser';
import ApprovalQueue from './pages/Staff/ApprovalQueue';
import TransactionLog from './pages/Staff/TransactionLog';
import StaffDirectory from './pages/Staff/StaffDirectory';
import AddStaff from './pages/Staff/AddStaff';


export default function App() {
  return (
    <Router>
      <Routes>
        {/* The Login is the home page ("/") */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        
        {/* The sub-pages */}
        <Route path="/transfers" element={<TransferPage />} />
        <Route path="/loans" element={<LoanPage />} />
        <Route path="/settings" element={<EditProfilePage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/history" element={<TransactionsPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/user-directory" element={<UserDirectory />} />
        <Route path="/customer/:id" element={<CustomerDetails />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/approval-queue" element={<ApprovalQueue />} />
        <Route path="/transaction-log" element={<TransactionLog />} />
        <Route path="/staff-directory" element={<StaffDirectory />} />
        <Route path="/add-staff" element={<AddStaff />} />
      </Routes>
    </Router>
  );
}