import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, Calendar, 
  User, Activity, FileText, Download 
} from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png';

export default function AuditLogs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for the audit trail
  const [logs] = useState([
    { id: "LOG_8820", staff: "Amr Edris", action: "Account Frozen", target: "Acc #4092", date: "2026-05-02 19:53", category: "Security" },
    { id: "LOG_8819", staff: "Amr Edris", action: "New Customer Created", target: "Ahmed Kamal", date: "2026-05-02 19:10", category: "Onboarding" },
    { id: "LOG_8818", staff: "Sarah Staff", action: "Loan Approved", target: "Req #992", date: "2026-05-02 18:45", category: "Approvals" },
    { id: "LOG_8817", staff: "John Teller", action: "Balance Adjustment", target: "Acc #1122", date: "2026-05-02 17:30", category: "Finance" },
    { id: "LOG_8816", staff: "Amr Edris", action: "Login Success", target: "Staff Portal", date: "2026-05-02 17:00", category: "Access" },
  ]);

  // --- FILTER LOGIC ---
  const filteredLogs = logs.filter((log) => {
    const query = searchTerm.toLowerCase();
    return (
      log.staff.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.target.toLowerCase().includes(query) ||
      log.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      
      {/* HEADER */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <h1 className="text-lg font-bold text-[#004a99]">System Audit Logs</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#004a99] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#003d7a] transition-all">
          <Download size={16} /> Export Report
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        
        {/* SEARCH & FILTERS SECTION */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search staff, action, or category..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a37e2c] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 items-center text-xs text-gray-400 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#a37e2c]" />
              Last 24 Hours
            </div>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <span>{filteredLogs.length} Events Logged</span>
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp & ID</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Staff Member</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action Performed</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Object</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-800">{log.date}</p>
                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{log.id}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#004a99]">
                            <User size={16} />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{log.staff}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-medium text-gray-600">{log.action}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-mono bg-gray-50 px-2 py-1 rounded-md w-fit text-gray-500">
                          <Activity size={12} />
                          {log.target}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <CategoryBadge category={log.category} />
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
        </div>
      </main>
    </div>
  );
}

// UI HELPER COMPONENTS
function CategoryBadge({ category }) {
  const styles = {
    Security: "bg-red-50 text-red-600 border-red-100",
    Onboarding: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Approvals: "bg-amber-50 text-[#a37e2c] border-amber-100",
    Finance: "bg-blue-50 text-[#004a99] border-blue-100",
    Access: "bg-gray-50 text-gray-500 border-gray-100"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[category] || styles.Access}`}>
      {category}
    </span>
  );
}