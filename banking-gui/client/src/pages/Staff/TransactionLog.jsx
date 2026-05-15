import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, RefreshCcw, Filter,
  ArrowUpRight, ArrowDownLeft, 
  CheckCircle, XCircle, Clock
} from 'lucide-react';
import axios from 'axios';
import euiLogo from '../../assets/eui-logo.png';

export default function TransactionLogs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/staff/transactions');
      setTransactions(response.data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = transactions.filter(log => {
    const query = searchTerm.toLowerCase();
    return (
      (log.SENDER_NAME && log.SENDER_NAME.toLowerCase().includes(query)) ||
      (log.RECEIVER_NAME && log.RECEIVER_NAME.toLowerCase().includes(query)) ||
      String(log.SENDER_ACCOUNT_NUMBER || '').includes(searchTerm) ||
      String(log.RECEIVER_ACCOUNT_NUMBER || '').includes(searchTerm) ||
      String(log.TRANSACTION_ID || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <h1 className="text-lg font-bold text-[#004a99]">Transaction Logs</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTransactions} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all">
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Name, Account, or ID..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase">
            <Filter size={16} />
            {isLoading ? 'Loading...' : `Showing ${filteredLogs.length} Transactions`}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading transactions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Date & ID</th>
                    <th className="px-8 py-5">Sender</th>
                    <th className="px-8 py-5">Receiver</th>
                    <th className="px-8 py-5">Type</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                    <th className="px-8 py-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.TRANSACTION_ID} className="hover:bg-gray-50/30 transition-all group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-800">{new Date(log.TRANSACTION_TIME).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 font-mono">#{log.TRANSACTION_ID}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-800">{log.SENDER_NAME || 'N/A'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{log.SENDER_ACCOUNT_NUMBER ? `#${log.SENDER_ACCOUNT_NUMBER}` : '\u2014'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-800">{log.RECEIVER_NAME || 'N/A'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{log.RECEIVER_ACCOUNT_NUMBER ? `#${log.RECEIVER_ACCOUNT_NUMBER}` : '\u2014'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <TypeIcon type={log.TRANSACTION_TYPE} />
                            <span className="text-sm font-semibold text-gray-600">{log.TRANSACTION_TYPE}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-gray-800">${Number(log.AMOUNT).toLocaleString()}</td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <StatusBadge status={log.STATUS} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center text-gray-400 italic">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Failed: "bg-red-50 text-red-600 border-red-100",
    Pending: "bg-blue-50 text-[#004a99] border-blue-100",
    Canceled: "bg-gray-50 text-gray-500 border-gray-100"
  };
  const icons = {
    Completed: <CheckCircle size={12} />,
    Failed: <XCircle size={12} />,
    Pending: <Clock size={12} />,
    Canceled: <XCircle size={12} />
  };
  const s = status || 'Pending';
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[s] || styles.Pending}`}>
      {icons[s] || icons.Pending} {s}
    </span>
  );
}

function TypeIcon({ type }) {
  const styles = {
    Transfer: "bg-blue-50 text-[#004a99]",
    Deposit: "bg-emerald-50 text-emerald-600",
    Withdrawal: "bg-red-50 text-red-600",
    Payment: "bg-purple-50 text-purple-600"
  };
  const icons = {
    Transfer: <ArrowUpRight size={14} />,
    Deposit: <ArrowDownLeft size={14} />,
    Withdrawal: <ArrowUpRight size={14} />,
    Payment: <RefreshCcw size={14} />
  };
  const t = type || 'Transfer';
  return <div className={`p-2 rounded-lg ${styles[t] || styles.Transfer}`}>{icons[t] || icons.Transfer}</div>;
}
