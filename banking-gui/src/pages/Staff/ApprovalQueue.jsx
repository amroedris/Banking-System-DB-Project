import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, 
  FileText, ArrowUpRight, Landmark, Clock 
} from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png';

export default function ApprovalQueue() {
  const navigate = useNavigate();

  /* 
    SQL BACKEND LOGIC:
    1. SELECT * FROM approvals_view WHERE status = 'PENDING';
    2. JOIN users ON approvals.user_id = users.id;
  */
  const [requests, setRequests] = useState([
    { 
      id: 101, 
      type: "Loan Application", 
      user: "Sarah Connor", 
      amount: "250,000", 
      date: "2026-05-01", 
      details: "Personal Home Loan - 5 Year Term" 
    },
    { 
      id: 102, 
      type: "Large Transfer", 
      user: "Ahmed Kamal", 
      amount: "85,000", 
      date: "2026-05-02", 
      details: "External Transfer to International Bank" 
    },
    { 
      id: 103, 
      type: "New Credit Card", 
      user: "John Doe", 
      amount: "15,000", 
      date: "2026-05-02", 
      details: "Platinum Card Limit Increase Request" 
    },
  ]);

  const handleAction = (id, action) => {
    /* 
      SQL BACKEND LOGIC:
      UPDATE approvals_table SET status = ?, reviewed_by = ?, review_date = NOW() WHERE id = ?;
    */
    alert(`Request #${id} has been ${action}ed.`);
    setRequests(requests.filter(req => req.id !== id));
  };

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
          <h1 className="text-lg font-bold text-[#004a99]">Approval Desk</h1>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
          <Clock size={16} className="text-[#004a99]" />
          <span className="text-xs font-bold text-[#004a99] uppercase">{requests.length} Pending Actions</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-8">
        
        {/* SUMMARY SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Pending" value={requests.length} color="blue" />
          <StatCard title="Weekly Volume" value="142" color="blue" />
          <StatCard title="Avg. Wait Time" value="4.2h" color="gray" />
        </div>

        {/* REQUEST LIST */}
        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map((req) => (
              <div 
                key={req.id} 
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between group hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className={`p-4 rounded-2xl ${req.type === 'Loan Application' ? 'bg-blue-50 text-[#004a99]' : 'bg-gray-50 text-gray-500'}`}>
                    {req.type === 'Loan Application' ? <Landmark size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">#{req.id} • {req.type}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{req.user}</h3>
                    <p className="text-sm text-gray-500">{req.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-12 w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase">Requested Amount</p>
                    <p className="text-xl font-bold text-gray-800">${req.amount}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'Approve')}
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Approve Request"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'Reject')}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Reject Request"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
              <div className="inline-flex p-6 bg-emerald-50 text-emerald-500 rounded-full mb-4">
                <Check size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Queue is Clear</h2>
              <p className="text-gray-400">All pending approvals have been processed.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// UI HELPER COMPONENTS
function StatCard({ title, value, color }) {
  const colors = {
    blue: "text-[#004a99] bg-blue-50",
    gray: "text-gray-500 bg-gray-50"
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</p>
      <p className={`text-3xl font-black ${colors[color].split(' ')[0]}`}>{value}</p>
    </div>
  );
}