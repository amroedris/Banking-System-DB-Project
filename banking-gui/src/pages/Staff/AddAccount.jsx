import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, Landmark, Save, AlertCircle } from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png'; // Using the fixed path

export default function AddAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    email: '',
    phone: '',
    initialDeposit: '',
    accountType: 'Savings'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    /* 
      SQL BACKEND LOGIC:
      1. INSERT INTO users (name, national_id, email, phone) VALUES (...);
      2. INSERT INTO accounts (user_id, balance, type) VALUES (...);
    */
    console.log("New Account Data:", formData);
    alert("Account Created Successfully!");
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
        <h1 className="text-lg font-bold text-[#004a99]">New Customer Onboarding</h1>
      </nav>

      <main className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#004a99] p-8 text-white flex items-center gap-6">
            <div className="bg-white/10 p-4 rounded-2xl">
              <UserPlus size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Open New Account</h2>
              <p className="text-blue-100 text-sm">Register a new client into the EUI Banking System</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PERSONAL INFO SECTION */}
            <div className="md:col-span-2 flex items-center gap-2 text-[#a37e2c] font-bold text-xs uppercase tracking-widest mb-2">
              <Shield size={14} /> Personal Identity
            </div>
            
            <InputGroup label="Full Name" type="text" placeholder="e.g. Amr Edris" 
              value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
            
            <InputGroup label="National ID" type="text" placeholder="14-digit number" 
              value={formData.nationalId} onChange={(e) => setFormData({...formData, nationalId: e.target.value})} />

            <InputGroup label="Email Address" type="email" placeholder="name@example.com" 
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />

            <InputGroup label="Phone Number" type="text" placeholder="+20 123..." 
              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />

            {/* ACCOUNT INFO SECTION */}
            <div className="md:col-span-2 flex items-center gap-2 text-[#a37e2c] font-bold text-xs uppercase tracking-widest mt-4 mb-2">
              <Landmark size={14} /> Account Setup
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Account Type</label>
              <select 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold text-gray-700"
                value={formData.accountType}
                onChange={(e) => setFormData({...formData, accountType: e.target.value})}
              >
                <option>Savings</option>
                <option>Checking</option>
                <option>Business</option>
              </select>
            </div>

            <InputGroup label="Initial Deposit ($)" type="number" placeholder="Min. 500" 
              value={formData.initialDeposit} onChange={(e) => setFormData({...formData, initialDeposit: e.target.value})} />

            <div className="md:col-span-2 pt-6 border-t border-gray-50 flex gap-4">
              <button 
                type="submit" 
                className="flex-1 bg-[#004a99] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#003d7a] transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> Create Account
              </button>
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-8 bg-gray-50 text-gray-400 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function InputGroup({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">{label}</label>
      <input 
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold text-gray-700 placeholder:text-gray-300 transition-all" 
        {...props} 
        required 
      />
    </div>
  );
}