import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../assets/EUI-Cropped.jpg';

export default function TransactionHistoryPage() {
  const navigate = useNavigate();

  // Dummy Accounts
  const accounts = [
    { id: '1', name: 'Main Checking', number: '•••• 4092', balance: 12450.00 },
    { id: '2', name: 'High-Yield Savings', number: '•••• 8831', balance: 45200.75 },
  ];

  // Dummy Transactions (Tied to specific Account IDs)
  const allTransactions = [
    { id: 't1', accountId: '1', date: 'May 02, 2026', description: 'Whole Foods Market', category: 'Groceries', type: 'debit', amount: 84.50, status: 'Pending' },
    { id: 't2', accountId: '1', date: 'May 01, 2026', description: 'Netflix Subscription', category: 'Entertainment', type: 'debit', amount: 15.99, status: 'Completed' },
    { id: 't3', accountId: '1', date: 'Apr 28, 2026', description: 'TechCorp Salary', category: 'Income', type: 'credit', amount: 4250.00, status: 'Completed' },
    { id: 't4', accountId: '1', date: 'Apr 26, 2026', description: 'Uber Rides', category: 'Transport', type: 'debit', amount: 24.10, status: 'Completed' },
    { id: 't5', accountId: '2', date: 'Apr 30, 2026', description: 'Monthly Interest', category: 'Interest', type: 'credit', amount: 142.10, status: 'Completed' },
    { id: 't6', accountId: '2', date: 'Apr 15, 2026', description: 'Transfer from Checking', category: 'Transfer', type: 'credit', amount: 500.00, status: 'Completed' },
  ];

  // State
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  // Derived Data: Filter by the chosen account, THEN filter by the search term
  const activeAccount = accounts.find(acc => acc.id === selectedAccountId);
  
  const displayedTransactions = allTransactions
    .filter(t => t.accountId === selectedAccountId)
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()));

  // Helper for icons based on category
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Income': return <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
      case 'Groceries': return <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
      case 'Transfer': return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>;
      default: return <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>;
    }
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
              <h1 className="text-2xl font-black text-[#004a99] tracking-tight">Transaction History</h1>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* TOP SECTION: Account Selector Card */}
        <div className="bg-[#004a99] rounded-[2rem] p-8 shadow-lg text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="w-full md:w-1/2">
              <label className="block text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">Select Account</label>
              <div className="relative">
                <select 
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white text-lg rounded-xl focus:ring-2 focus:ring-white focus:outline-none block p-3.5 font-bold transition-all appearance-none backdrop-blur-sm cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id} className="text-gray-900 font-medium">
                      {acc.name} ({acc.number})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm text-right w-full md:w-auto">
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">Available Balance</p>
              <p className="text-3xl font-black">${activeAccount?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004a99] focus:outline-none font-medium shadow-sm transition-all"
            />
          </div>
        </div>

        {/* BOTTOM SECTION: Transaction List */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          
          {displayedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">No transactions found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or selecting a different account.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayedTransactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer">
                  
                  {/* Left Side: Icon & Details */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">{tx.description}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{tx.date}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-sm text-gray-500">{tx.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Amount & Status */}
                  <div className="text-right">
                    <p className={`text-lg sm:text-xl font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    {tx.status === 'Pending' && (
                      <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mt-1">Pending</p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
          
        </div>

      </main>
    </div>
  );
}