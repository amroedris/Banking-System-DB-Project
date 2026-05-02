import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../assets/eui-logo.png';
import euiLogo2 from '../assets/EUI.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({ id: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // This console log helps track the data before it hits your Oracle DB
    console.log(`Logging in as ${role}:`, formData);
    
    // REDIRECT LOGIC: Move to the dashboard after clicking Login
    // In a real full-stack process, you'd only do this after a successful DB check
    navigate('/dashboard'); 
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f3f4f6] overflow-hidden px-4">
      
      {/* BACKGROUND ANIMATIONS */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-[#004a99] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-[#a37e2c] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob animation-delay-2000"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col lg:flex-row w-full max-w-4xl overflow-hidden border border-gray-100">

        {/* Left side: Professional Image Branding */}
        <div className="lg:w-1/2 hidden lg:block relative bg-gray-50">
          <img
            src={euiLogo2}
            alt="EUI Campus"
            className="w-full h-full object-cover"
          />
          {/* subtle white overlay to blend the image with the design */}
          <div className="absolute inset-0 bg-white/10"></div>
        </div>

        {/* Right side: Login Form */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center bg-[#f8f9fa]">
          
          {/* EUI LOGO INTEGRATION */}
          <div className="flex flex-col items-center mb-8">
            <img src={euiLogo} alt="EUI Logo" className="h-40 mb-1 object-contain" />
            <h1 className="text-xl font-bold text-[#004a99] text-center tracking-tight">Digital Banking Portal</h1>
            <p className="text-gray-400 text-sm">Secure Authentication System</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="flex bg-gray-200 p-1.5 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 py-2.5 px-4 rounded-xl transition-all duration-300 font-semibold text-sm ${role === 'customer' ? 'bg-[#004a99] text-white shadow-lg' : 'text-gray-500 hover:text-[#004a99]'}`}
            >
              Customer
            </button>
            <button 
              type="button"
              onClick={() => setRole('staff')}
              className={`flex-1 py-2.5 px-4 rounded-xl transition-all duration-300 font-semibold text-sm ${role === 'staff' ? 'bg-[#004a99] text-white shadow-lg' : 'text-gray-500 hover:text-[#004a99]'}`}
            >
              Staff
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-1">
              <input
                type="text"
                required
                placeholder={role === 'customer' ? "Account Number" : "Staff ID"}
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value})}
                className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a37e2c] transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <input
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a37e2c] transition-all"
              />
            </div>

            <button 
              type="submit" 
              className="py-4 px-4 mt-4 rounded-2xl bg-[#004a99] text-white font-bold shadow-xl hover:bg-[#003d7a] active:scale-95 transition-all duration-200"
            >
              Login to EUI Bank
            </button>

            <div className="flex justify-between items-center text-xs text-gray-500 mt-4 font-medium">
              <a href="#" className="hover:text-[#a37e2c] transition underline decoration-dotted">Security Policy</a>
              <span>© 2026 EUI Student Project</span>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}