import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../../assets/EUI-Cropped.jpg'; // Make sure this path is correct

export default function EditProfilePage() {
const navigate = useNavigate();
  // Navigation State
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'security'

  // Form State (Dummy Data)
  const [personalData, setPersonalData] = useState({
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah.connor@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 EUI Campus Drive, Apt 4B',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePersonalSave = (e) => {
    e.preventDefault();
    console.log("Saving Personal Data:", personalData);
    alert("Personal information updated successfully!");
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    console.log("Saving Security Data:", securityData);
    alert("Password updated successfully!");
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <img src={euiLogo} alt="EUI Logo" className="h-16 w-16" />
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            <div>
              <h1 className="text-2xl font-black text-[#004a99] tracking-tight">Account Settings</h1>
            </div>
          </div>
          
          <button 
             onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <nav className="flex flex-col">
                <button 
                  onClick={() => setActiveTab('personal')}
                  className={`flex items-center gap-3 px-6 py-4 font-bold text-left transition-all ${activeTab === 'personal' ? 'bg-[#004a99] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Personal Info
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 px-6 py-4 font-bold text-left transition-all border-t border-gray-100 ${activeTab === 'security' ? 'bg-[#004a99] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Security
                </button>
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative min-h-[500px]">
              
              {/* Background Blob Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#004a99] rounded-full mix-blend-multiply filter blur-[80px] opacity-5 pointer-events-none"></div>

              <div className="p-8 sm:p-12 relative z-10">
                
                {/* ----------------- PERSONAL INFO TAB ----------------- */}
                {activeTab === 'personal' && (
                  <div className="animate-fade-in">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Personal Information</h2>
                    <p className="text-gray-500 font-medium mb-8">Update your contact details and how we reach you.</p>

                    <form onSubmit={handlePersonalSave} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                          <input type="text" required value={personalData.firstName} onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004a99] focus:outline-none font-semibold transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                          <input type="text" required value={personalData.lastName} onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004a99] focus:outline-none font-semibold transition-all" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                          <input type="email" required value={personalData.email} onChange={(e) => setPersonalData({...personalData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004a99] focus:outline-none font-semibold transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                          <input type="tel" required value={personalData.phone} onChange={(e) => setPersonalData({...personalData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004a99] focus:outline-none font-semibold transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Home Address</label>
                        <input type="text" required value={personalData.address} onChange={(e) => setPersonalData({...personalData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004a99] focus:outline-none font-semibold transition-all" />
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button type="submit" className="py-3 px-8 bg-[#004a99] text-white font-bold rounded-xl shadow-md hover:bg-[#003d7a] transition-all active:scale-95">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ----------------- SECURITY TAB ----------------- */}
                {activeTab === 'security' && (
                  <div className="animate-fade-in">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Security Settings</h2>
                    <p className="text-gray-500 font-medium mb-8">Update your password and secure your account.</p>

                    <form onSubmit={handleSecuritySave} className="space-y-6 max-w-lg">
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                        <input type="password" required value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004a99] focus:outline-none font-semibold transition-all" placeholder="••••••••" />
                      </div>

                      <div className="border-t border-gray-100 pt-6 mt-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                        <input type="password" required value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004a99] focus:outline-none font-semibold transition-all" placeholder="••••••••" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input type="password" required value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004a99] focus:outline-none font-semibold transition-all" placeholder="••••••••" />
                      </div>

                      <div className="pt-4 flex justify-start">
                        <button type="submit" disabled={!securityData.currentPassword || !securityData.newPassword} className="py-3 px-8 bg-[#004a99] text-white font-bold rounded-xl shadow-md hover:bg-[#003d7a] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                          Update Password
                        </button>
                      </div>
                    </form>

                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}