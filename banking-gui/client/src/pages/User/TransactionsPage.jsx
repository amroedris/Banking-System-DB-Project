import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import euiLogo from '../../assets/EUI-Cropped.jpg';

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [accounts, setAccounts] = useState(state?.accounts || []);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState(
    state?.accounts?.[0]?.ACCOUNT_NUMBER || ''
  );
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // If accounts weren't passed via state (e.g. direct URL visit), fetch them
  useEffect(() => {
    if (accounts.length > 0) return; // already have them from dashboard

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/');
      return;
    }

    axios
      .get(`http://localhost:3000/accounts/${storedUser.CUSTOMER_ID}`)
      .then((res) => {
        setAccounts(res.data);
        if (res.data.length > 0) {
          setSelectedAccountNumber(res.data[0].ACCOUNT_NUMBER);
        }
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  // Fetch transactions whenever the selected account changes
  useEffect(() => {
    if (!selectedAccountNumber) return;
    setLoading(true);
    axios
      .get(`http://localhost:3000/transactions/${selectedAccountNumber}`)
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedAccountNumber]);

  const activeAccount = accounts.find(
    (acc) => String(acc.ACCOUNT_NUMBER) === String(selectedAccountNumber)
  );

  const displayedTransactions = transactions.filter((tx) =>
    tx.TRANSACTION_TYPE?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'TRANSFER':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'WITHDRAWAL':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H3m0 0l4-4m-4 4l4 4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">

        {/* ACCOUNT SELECTOR CARD */}
        <div className="bg-[#004a99] rounded-[2rem] p-8 shadow-lg text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-10 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Dropdown */}
            <div className="w-full md:w-1/2">
              <label className="block text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">
                Select Account
              </label>
              <div className="relative">
                <select
                  value={selectedAccountNumber}
                  onChange={(e) => setSelectedAccountNumber(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white text-lg rounded-xl focus:ring-2 focus:ring-white focus:outline-none block p-3.5 font-bold transition-all appearance-none backdrop-blur-sm cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  {accounts.map((acc) => (
                    <option
                      key={acc.ACCOUNT_NUMBER}
                      value={acc.ACCOUNT_NUMBER}
                      className="text-gray-900 font-medium"
                    >
                      {acc.ACCOUNT_TYPE} (•••• {String(acc.ACCOUNT_NUMBER).slice(-4)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm text-right w-full md:w-auto">
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">Available Balance</p>
              <p className="text-3xl font-black">
                ${Number(activeAccount?.BALANCE || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by transaction type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004a99] focus:outline-none font-medium shadow-sm transition-all"
            />
          </div>
        </div>

        {/* TRANSACTION LIST */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">

          {loading ? (
            <div className="p-12 text-center text-gray-400 font-bold">Loading transactions...</div>
          ) : displayedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">No transactions found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or selecting a different account.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayedTransactions.map((tx) => {
                // Incoming = this account is the RECEIVER
                const isIncoming =
                  String(tx.RECEIVER_ACCOUNT_NUMBER) === String(selectedAccountNumber);

                return (
                  <div
                    key={tx.TRANSACTION_ID}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    {/* Left: Icon & Details */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {getCategoryIcon(tx.TRANSACTION_TYPE)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                          {tx.TRANSACTION_TYPE}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {new Date(tx.TRANSACTION_TIME).toLocaleDateString()}
                          </span>
                          {tx.STATUS && (
                            <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="text-sm text-gray-500">{tx.STATUS}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className="text-right">
                      <p className={`text-lg sm:text-xl font-black ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncoming ? '+' : '-'}${Number(tx.AMOUNT).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      {tx.STATUS === 'Pending' && (
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mt-1">Pending</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}