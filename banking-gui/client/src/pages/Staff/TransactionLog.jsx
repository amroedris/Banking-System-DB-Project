import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Download, Filter, 
  ArrowUpRight, ArrowDownLeft, RefreshCcw, 
  CheckCircle, XCircle, Clock
} from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png';

export default function TransactionLogs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for the logs
  const [transactions] = useState([
    { id: "TXN_9901", user: "Sarah Connor", accNo: "4092-8831", type: "Transfer", amount: "1,200.00", date: "2026-05-02 14:30", status: "Completed" },
    { id: "TXN_9902", user: "Ahmed Kamal", accNo: "1122-3344", type: "Deposit", amount: "5,000.00", date: "2026-05-02 13:15", status: "Completed" },
    { id: "TXN_9903", user: "John Doe", accNo: "5566-7788", type: "Withdrawal", amount: "450.00", date: "2026-05-02 12:00", status: "Failed" },
    { id: "TXN_9904", user: "Ellen Ripley", accNo: "9900-1122", type: "Transfer", amount: "8,500.00", date: "2026-05-01 18:45", status: "Pending" },
    { id: "TXN_9905", user: "Sarah Connor", accNo: "4092-8831", type: "Payment", amount: "120.50", date: "2026-05-01 16:20", status: "Completed" },
  ]);

  const filteredLogs = transactions.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.accNo.includes(searchTerm) ||
    log.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      
      {/* HEADER */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <h1 className="text-lg font-bold text-[#004a99]">Transaction Logs</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all">
          <Download size={16} /> Download CSV
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        
        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatBox title="Today's Volume" value="$15,270.50" color="blue" />
          <StatBox title="Successful" value="98.2%" color="emerald" />
          <StatBox title="Flagged Items" value="2" color="amber" />
        </div>

        {/* SEARCH & FILTERS */}
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
            Showing {filteredLogs.length} Transactions
          </div>
        </div>

        {/* LOG TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Date & ID</th>
                  <th className="px-8 py-5">Customer Info</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                  <th className="px-8 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-800">{log.date}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{log.id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-800">{log.user}</p>
                      <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{log.accNo}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <TypeIcon type={log.type} />
                        <span className="text-sm font-semibold text-gray-600">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-gray-800">
                      ${log.amount}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <StatusBadge status={log.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// UI HELPERS
function StatBox({ title, value, color }) {
  const colors = {
    blue: "text-[#004a99]",
    emerald: "text-emerald-500",
    amber: "text-[#a37e2c]"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className={`text-2xl font-black ${colors[color]}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Failed: "bg-red-50 text-red-600 border-red-100",
    Pending: "bg-blue-50 text-[#004a99] border-blue-100"
  };
  const icons = {
    Completed: <CheckCircle size={12} />,
    Failed: <XCircle size={12} />,
    Pending: <Clock size={12} />
  };
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[status]}`}>
      {icons[status]} {status}
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
  return <div className={`p-2 rounded-lg ${styles[type]}`}>{icons[type]}</div>;
}