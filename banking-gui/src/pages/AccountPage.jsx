import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../assets/EUI-Cropped.jpg';

export default function AccountPage() {
  const navigate = useNavigate();

  // Modal and Freeze States
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isCardFrozen, setIsCardFrozen] = useState(false);

  // Dummy Data for the specific account being viewed
  const [account] = useState({
    name: 'High-Yield Savings',
    type: 'Savings',
    status: 'Active',
    accountNumber: '1029 3847 5612 8831',
    routingNumber: '122 000 496',
    swiftCode: 'EUIB US33',
    availableBalance: 45200.75,
    currentBalance: 45200.75,
    interestRate: '4.25% APY',
    ytdInterest: 1245.50,
    openDate: 'Jan 14, 2023',
  });

  const [showFullNumber, setShowFullNumber] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
             <img src={euiLogo} alt="EUI Logo" className="h-16 w-16" />
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            <div>
              <h1 className="text-2xl font-black text-[#004a99] tracking-tight">Account Details</h1>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* TOP SECTION: Balance & Main Info */}
        <div className="bg-[#004a99] rounded-[2.5rem] p-8 sm:p-10 shadow-xl text-white mb-8 relative overflow-hidden">
          {/* Abstract Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-10 pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#a37e2c] rounded-full mix-blend-overlay filter blur-[50px] opacity-20 pointer-events-none -ml-10 -mb-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black tracking-tight">{account.name}</h2>
                <span className="bg-blue-800 text-blue-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {account.status}
                </span>
              </div>
              <p className="text-blue-200 font-mono text-lg flex items-center gap-2">
                {showFullNumber ? account.accountNumber : `•••• •••• •••• ${account.accountNumber.slice(-4)}`}
                <button 
                  onClick={() => setShowFullNumber(!showFullNumber)}
                  className="p-1 hover:bg-blue-800 rounded-md transition-colors text-blue-300 hover:text-white"
                  title="Toggle Account Number"
                >
                  {showFullNumber ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  )}
                </button>
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">Available Balance</p>
              <h3 className="text-5xl font-black drop-shadow-md">
                ${account.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => navigate('/transfers')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#004a99] transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 text-[#004a99] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#004a99] group-hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </div>
            <span className="font-bold text-gray-700 text-sm">Transfer</span>
          </button>
          
          <button 
            onClick={() => navigate('/history')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#004a99] transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 text-[#004a99] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#004a99] group-hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <span className="font-bold text-gray-700 text-sm">Statements</span>
          </button>
        </div>

        {/* BOTTOM SECTION: Account Numbers & Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Routing & Numbers */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#004a99] rounded-full"></span>
              Routing & Details
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Routing Number</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{account.routingNumber}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Account Number</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{account.accountNumber}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">SWIFT / BIC Code</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{account.swiftCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Account Specs */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#a37e2c] rounded-full"></span>
              Account Specs
            </h3>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Account Type</p>
                <p className="font-bold text-gray-900">{account.type}</p>
              </div>
              
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Interest Rate</p>
                <p className="font-bold text-green-600 bg-green-50 inline-block px-2 py-1 rounded-md">{account.interestRate}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Current Balance</p>
                <p className="font-bold text-gray-900">${account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">YTD Interest</p>
                <p className="font-bold text-gray-900">+${account.ytdInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="col-span-2 pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Opened On</p>
                <p className="font-bold text-gray-900">{account.openDate}</p>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}