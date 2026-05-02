import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../assets/EUI-Cropped.jpg'; // Importing your logo

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [userData] = useState({
    name: 'Sarah',
    totalBalance: '57,650.75'
  });

  const [accounts] = useState([
    { id: '1', name: 'Main Checking', number: '•••• 4092', balance: '12,450.00', type: 'checking' },
    { id: '2', name: 'High-Yield Savings', number: '•••• 8831', balance: '45,200.75', type: 'savings' },
  ]);

  const [recentTransactions] = useState([
    { id: 't1', desc: 'Amazon.com', date: 'Oct 24', amount: '-$45.99', type: 'debit' },
    { id: 't2', desc: 'Salary Deposit', date: 'Oct 22', amount: '+$3,200.00', type: 'credit' },
    { id: 't3', desc: 'Coffee Shop', date: 'Oct 21', amount: '-$4.50', type: 'debit' },
  ]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">
      
      {/* 1. BIG LOGO & BANK NAME HEADER */}
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo Section */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <img 
              src={euiLogo} 
              alt="EUI Logo" 
              className="h-20 w-20" 
            />
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div> {/* Subtle divider */}
            <div>
              <h1 className="text-3xl font-black text-[#004a99] tracking-tight">EUI Bank Portal</h1>
              <p className="text-sm font-medium text-[#a37e2c] uppercase tracking-[0.2em]">Excellence in Digital Banking</p>
            </div>
          </div>

          {/* 2. WELCOME TEXT & LOGOUT */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-lg font-bold text-gray-800">Hello, {userData.name}</p>
              <p className="text-sm text-gray-500 font-medium">Customer Account</p>
            </div>
            
            <button 
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:border-red-100 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* TOP ROW: Total Balance & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Total Balance Summary Card */}
          <div className="bg-[#004a99] text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[180px]">
            {/* Abstract background shapes for premium look */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#a37e2c]/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
            
            <p className="text-blue-100 font-semibold mb-2 opacity-80 uppercase tracking-wider text-xs">Total Available Balance</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold opacity-90">$</span>
              <span className="text-5xl font-black">{userData.totalBalance.split('.')[0]}</span>
              <span className="text-2xl font-bold text-blue-200">.{userData.totalBalance.split('.')[1]}</span>
            </div>
          </div>

          {/* QUICK ACTION BUTTONS (Routing Grid) */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Money Transfers Button */}
            <button 
            onClick={() => navigate('/transfers')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#004a99] transition-all group active:scale-95">
              <div className="w-14 h-14 bg-blue-50 text-[#004a99] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#004a99] group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Transfers</span>
            </button>

            {/* Cards Button */}
            <button
            onClick={() => navigate('/cards')}
             className="flex flex-col items-center justify-center p-4 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#004a99] transition-all group active:scale-95">
              <div className="w-14 h-14 bg-blue-50 text-[#004a99] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#004a99] group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">My Cards</span>
            </button>

            {/* Loan Button */}
            <button 
            onClick={() => navigate('/loans')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#004a99] transition-all group active:scale-95">
              <div className="w-14 h-14 bg-blue-50 text-[#004a99] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#004a99] group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Loans</span>
            </button>

            {/* Edit Account Button */}
            <button 
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#a37e2c] transition-all group active:scale-95">
              <div className="w-14 h-14 bg-yellow-50 text-[#a37e2c] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#a37e2c] group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Edit Info</span>
            </button>

          </div>
        </div>

{/* BOTTOM SECTION: Accounts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ACCOUNTS LIST */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#a37e2c] rounded-full"></span>
              Your Accounts
            </h2>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div 
                  key={account.id} 
                  onClick={() => navigate('/account')} 
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-all border-l-4 border-l-[#004a99] cursor-pointer group"
                >
                  <div>
                    {/* Added group-hover to change text color when the card is hovered */}
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#004a99] transition-colors">
                      {account.name}
                    </h3>
                    <p className="text-gray-400 font-mono text-sm tracking-widest">{account.number}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Balance</p>
                    <p className="text-2xl font-black text-gray-900">${account.balance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY & HISTORY */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-black text-gray-900">Activity</h2>
              <button 
              onClick={() => navigate('/history')}
              className="text-sm font-bold text-[#004a99] hover:text-[#a37e2c] transition-colors underline decoration-2 underline-offset-4">
                View History
              </button>
            </div>
            
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
              <div className="space-y-6">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${tx.type === 'credit' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-[#004a99] transition-colors">{tx.desc}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}