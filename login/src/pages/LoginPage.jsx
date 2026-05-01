import React, { useState } from 'react';
import euiLogo from '../assets/eui-logo.png';
import euiLogo2 from '../assets/EUI.jpg';

export default function LoginPage() {
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({ id: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Logging in as ${role}:`, formData);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f3f4f6] overflow-hidden px-4">
      
      {/* BACKGROUND ANIMATIONS */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-[#004a99] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-[#a37e2c] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob animation-delay-2000"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row w-full max-w-4xl overflow-hidden border border-white/5">

        {/* Left side: Professional Image */}
        <div className="lg:w-1/2 hidden lg:block relative">
          <img
            src={euiLogo2}
            alt="Banking"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#FFFFFFF]"></div>
        </div>

        {/* Right side: Login Form */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center bg-[#f8f9fa]">
          
          {/* EUI LOGO INTEGRATION */}
          <div className="flex flex-col items-center mb-8">
            <img src={euiLogo} alt="EUI Logo" className="h-48 mb-1 object-contain" />
            <h1 className="text-xl font-bold text-[#004a99] text-center">Digital Banking Portal</h1>
          </div>

          {/* Role Selection Tabs using EUI Blue */}
          <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setRole('customer')}
              className={`flex-1 py-2 px-4 rounded-lg transition font-semibold ${role === 'customer' ? 'bg-[#004a99] text-white shadow-md' : 'text-gray-500 hover:text-[#004a99]'}`}
            >
              Customer
            </button>
            <button 
              onClick={() => setRole('staff')}
              className={`flex-1 py-2 px-4 rounded-lg transition font-semibold ${role === 'staff' ? 'bg-[#004a99] text-white shadow-md' : 'text-gray-500 hover:text-[#004a99]'}`}
            >
              Staff
            </button>
          </div>

          {/* Form with EUI Focus Colors */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              required
              placeholder={role === 'customer' ? "Account Number" : "Staff ID"}
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#a37e2c] transition"
            />
            
            <input
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#a37e2c] transition"
            />

            <button type="submit" className="py-3 px-4 mt-2 rounded-xl bg-[#004a99] text-white font-bold shadow-lg hover:bg-[#003d7a] active:scale-95 transition-all">
              Login to EUI Bank
            </button>

            <p className="flex justify-between text-xs text-gray-500 mt-4 font-medium">
              <a href="#" className="hover:text-[#a37e2c] transition">Security Policy</a>
              <span>© 2026 EUI Student Project</span>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}