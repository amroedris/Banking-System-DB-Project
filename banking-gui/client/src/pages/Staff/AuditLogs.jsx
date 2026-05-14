import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, Calendar, Lock,
  User, Activity, FileText, RefreshCcw 
} from 'lucide-react';
import axios from 'axios';
import euiLogo from '../../assets/eui-logo.png';

export default function AuditLogs() {
  const navigate = useNavigate();
  
  const staffData = JSON.parse(localStorage.getItem('staff') || '{}');
  const isManager = staffData.JOB_ID === 1;

  if (!isManager) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-red-100">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8">
            Only <b>Managers</b> can access Audit Logs.
          </p>
          <button 
            onClick={() => navigate('/staff-dashboard')} 
            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/staff/audit-logs');
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const query = searchTerm.toLowerCase();
    return (
      String(log.TRANSACTION_ID || '').toLowerCase().includes(query) ||
      (log.ACTION && log.ACTION.toLowerCase().includes(query)) ||
      String(log.SENDER_ACCOUNT_NUMBER || '').includes(searchTerm) ||
      String(log.RECEIVER_ACCOUNT_NUMBER || '').includes(searchTerm) ||
      (log.STATUS && log.STATUS.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <h1 className="text-lg font-bold text-[#004a99]">System Audit Logs</h1>
        </div>
        <button onClick={fetchAuditLogs} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all">
          <RefreshCcw size={14} /> Refresh
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search transaction ID, action, or status..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a37e2c] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 items-center text-xs text-gray-400 font-bold uppercase tracking-widest">
            <Calendar size={16} className="text-[#a37e2c]" />
            All Time
            <div className="h-4 w-[1px] bg-gray-200"></div>
            {isLoading ? 'Loading...' : `${filteredLogs.length} Events Logged`}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading audit trail...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp & ID</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accounts</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.TRANSACTION_ID} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-800">{new Date(log.ACTION_TIME || log.TRANSACTION_TIME).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-tighter">LOG_{log.TRANSACTION_ID}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#004a99]">
                              <Activity size={16} />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{log.ACTION || log.TRANSACTION_TYPE}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-medium text-gray-600">${Number(log.AMOUNT || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-xs font-mono bg-gray-50 px-2 py-1 rounded-md w-fit text-gray-500">
                            <FileText size={12} />
                            {log.SENDER_ACCOUNT_NUMBER ? `#${log.SENDER_ACCOUNT_NUMBER}` : ''}
                            {log.SENDER_ACCOUNT_NUMBER && log.RECEIVER_ACCOUNT_NUMBER ? ' \u2192 ' : ''}
                            {log.RECEIVER_ACCOUNT_NUMBER ? `#${log.RECEIVER_ACCOUNT_NUMBER}` : ''}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <CategoryBadge status={log.STATUS} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center text-gray-400 italic">
                        No system events found matching your search.
                      </td>
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

function CategoryBadge({ status }) {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Failed: "bg-red-50 text-red-600 border-red-100",
    Pending: "bg-blue-50 text-[#004a99] border-blue-100",
    Canceled: "bg-gray-50 text-gray-500 border-gray-100"
  };
  const s = status || 'Pending';
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[s] || styles.Pending}`}>
      {s}
    </span>
  );
}
