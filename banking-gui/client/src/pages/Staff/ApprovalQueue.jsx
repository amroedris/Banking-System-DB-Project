import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Lock, Landmark, Clock, CreditCard } from 'lucide-react';
import euiLogo from '../../assets/EUI-Cropped.jpg';

export default function ApprovalQueue() {
  const navigate = useNavigate();
  
  const staffData = JSON.parse(localStorage.getItem('staff') || '{}');
  const isManager = staffData.JOB_ID === 1 || staffData.JOB_ID === 3 || staffData.JOB_ID === 4;

  if (!isManager) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-red-100">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8">
            Only <b>Managers</b> can access the Approval Queue.
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

  const [requests, setRequests] = useState([]);
  const [totalToday, setTotalToday] = useState(0);
  const totalLoans = requests.filter(req => req.REQUEST_TYPE === 'loan').length;
  const totalCards = requests.filter(req => req.REQUEST_TYPE === 'card').length;
  
const handleAction = async (id, action, type) => {
  try {
    const url = type === 'card'
      ? `http://localhost:3000/approvals/card/${id}`
      : `http://localhost:3000/approvals/${id}`;

    await axios.put(url, { action: action.toLowerCase() });

    setRequests(requests.filter(req => req.ID !== id));
    if (totalToday > 0) setTotalToday(totalToday - 1);
  } catch (err) {
    console.error(err);
    alert("Failed to update approval");
  }
};

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://localhost:3000/approvals");
      setRequests(response.data.requests);
      setTotalToday(response.data.totalToday);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      
      {/* HEADER */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
            <img 
              src={euiLogo} 
              alt="EUI Logo" 
              className="h-20 w-20" 
            />
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <h1 className="text-lg font-bold text-[#004a99]">Approval Desk</h1>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
          <Clock size={16} className="text-[#004a99]" />
          <span className="text-xs font-bold text-[#004a99] uppercase">{requests.length} Pending Actions</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-8">
        
        {/* SUMMARY SECTION - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard title="Pending Loans" value={totalLoans} color="blue" />
          <StatCard title="Pending Cards" value={totalCards} color="blue" />
        </div>

        {/* REQUEST LIST */}
        <div className="space-y-4">
          {requests.length > 0 ? (
           requests.map((req) => (
  <div
    key={`${req.REQUEST_TYPE}-${req.ID}`}
    className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between group hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
  >
    <div className="flex items-center gap-6 w-full md:w-auto">
      <div className={`p-4 rounded-2xl ${req.REQUEST_TYPE === 'card' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#004a99]'}`}>
        {req.REQUEST_TYPE === 'card' ? <CreditCard size={24} /> : <Landmark size={24} />}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            #{req.ID} • {req.REQUEST_TYPE === 'card' ? 'Card Application' : 'Loan Application'}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-800">{req.CUSTOMER_NAME}</h3>
        <p className="text-sm text-gray-500">
          {req.REQUEST_TYPE === 'card'
            ? `${req.CARD_TYPE} Card${req.CARD_LIMIT ? ` — $${req.CARD_LIMIT.toLocaleString()} limit` : ''}`
            : `${req.LOAN_TERM} Month Loan`}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-12 w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50">
      {req.REQUEST_TYPE === 'loan' && (
        <div className="text-right">
          <p className="text-xs text-gray-400 font-bold uppercase">Requested Amount</p>
          <p className="text-xl font-bold text-gray-800">${req.LOAN_AMOUNT}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleAction(req.ID, 'Approve', req.REQUEST_TYPE)}
          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
          title="Approve"
        >
          <Check size={20} />
        </button>
        <button
          onClick={() => handleAction(req.ID, 'Reject', req.REQUEST_TYPE)}
          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
          title="Reject"
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
      <p className={`text-3xl font-black ${colors[color]?.split(' ')[0]}`}>{value}</p>
    </div>
  );
}