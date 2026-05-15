import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, ClipboardCheck, ShieldCheck, 
  Search, History, Activity, LogOut
} from 'lucide-react';
import { stripJobPrefix } from '../../utils/jobMappings.js';
import euiLogo from '../../assets/eui-logo.png';

export default function AdminDashboard() {
  const navigate = useNavigate();

const [stats, setStats] = useState({
  liquidity: 0,
  activeUsers: 0,
  pendingApprovals: 0
});

const [activities, setActivities] = useState([]);

const staff = JSON.parse(localStorage.getItem("staff"));
const isManager = staff?.JOB_ID === 1 || staff?.JOB_ID === 3 || staff?.JOB_ID === 4;

useEffect(() => {

  fetchDashboardData();

}, []);

const fetchDashboardData = async () => {

  try {

    // Fetch stats
    const statsResponse = await axios.get(
      "http://localhost:3000/admin/stats"
    );

    setStats(statsResponse.data);

    // Fetch activities
    const activityResponse = await axios.get(
      "http://localhost:3000/admin/activity"
    );

    setActivities(activityResponse.data);

  } catch (err) {

    console.error(err);

  }

};

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      
      {/* TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src={euiLogo} alt="EUI Logo" className="h-12 object-contain" />
          <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
          <div>
            <h1 className="text-lg font-bold text-[#004a99]">Staff Portal</h1>
            <p className="text-xs text-[#a37e2c] font-semibold tracking-widest uppercase">Management Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-700"> {staff?.FIRST_NAME} {staff?.LAST_NAME}</p>
            <p className="text-xs text-gray-400 capitalize">
              {isManager 
                ? (staff?.JOB_ID === 3 ? 'Administrator' : 'Manager') 
                : (staff?.JOB_TITLE ? stripJobPrefix(staff.JOB_TITLE) : 'Staff')} Access
            </p>
          </div>
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        
        {/* TOP LEVEL STATS (BANK LIQUIDITY) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 lg:col-span-2 bg-[#004a99] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-2">Total Bank Liquidity</p>
              <h2 className="text-5xl font-bold italic">${Number(stats.liquidity).toLocaleString()}</h2>
              <div className="mt-6 flex gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                  <p className="text-[10px] uppercase text-blue-200">Active Customers</p>
                  <p className="font-bold">{stats.activeUsers}</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                  <p className="text-[10px] uppercase text-blue-200">System Status</p>
                  <p className="font-bold text-green-400">Online</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <div className="bg-amber-50 p-4 rounded-full mb-4">
              <Activity className="text-[#a37e2c]" size={32} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.pendingApprovals}</h3>
            <p className="text-gray-400 font-medium">Pending Approvals</p>
            <button onClick={() => navigate('/approval-queue')} className="mt-4 text-[#004a99] text-sm font-bold hover:underline">View Queue →</button>
          </div>
        </div>

        {/* ADMINISTRATIVE TOOLS GRID */}
        <h3 className="text-gray-800 font-bold mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[#a37e2c] rounded-full"></div>
          Management Tools
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {/* USER DIRECTORY */}
          <ToolCard 
            onClick={() => navigate('/user-directory')}
            icon={<Search size={28} />} 
            label="User Directory" 
            color="text-blue-600" 
            bg="bg-blue-50" 
          />

          {/* TRANSACTION LOGS (REPLACED FREEZE CENTER) */}
          <ToolCard 
            onClick={() => navigate('/transaction-log')}
            icon={<History size={28} />} 
            label="Transaction Logs" 
            color="text-cyan-600" 
            bg="bg-cyan-50" 
          />

          {/* ADD NEW ACCOUNT */}
          <ToolCard 
            onClick={() => navigate('/add-user')}
            icon={<UserPlus size={28} />} 
            label="New Onboarding" 
            color="text-emerald-600" 
            bg="bg-emerald-50" 
          />

          {/* APPROVALS */}
          <ToolCard 
            onClick={() => navigate('/approval-queue')}
            icon={<ClipboardCheck size={28} />} 
            label="Approval Desk" 
            color="text-[#a37e2c]" 
            bg="bg-amber-50" 
          />

          {/* STAFF MANAGEMENT — visible to all staff; tellers get access-denied on the page */}
          <ToolCard 
            onClick={() => navigate('/staff-directory')}
            icon={<ShieldCheck size={28} />} 
            label="Staff Management" 
            color="text-indigo-600" 
            bg="bg-indigo-50" 
          />
        </div>

        {/* RECENT ACTION LOGS (SYSTEM AUDIT) */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Global System Activity</h3>
          </div>
          
          <div className="space-y-4">
{activities.map((activity) => (

  <ActivityItem
    key={activity.TRANSACTION_ID}
    type="transaction"
    text={`${activity.TRANSACTION_TYPE} - $${activity.AMOUNT}`}
    time={
      new Date(activity.TRANSACTION_TIME)
        .toLocaleString()
    }
  />

))}
          </div>
        </div>
      </main>
    </div>
  );
}

// HELPER COMPONENTS
function ToolCard({ icon, label, color, bg, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-50 flex flex-col items-center group"
    >
      <div className={`${bg} ${color} p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="font-bold text-gray-700 text-sm text-center">{label}</span>
    </button>
  );
}

function ActivityItem({ type, text, time }) {
  const getIcon = () => {
    if (type === 'transaction') return <History size={16} className="text-cyan-500" />;
    if (type === 'onboard') return <UserPlus size={16} className="text-emerald-500" />;
    return <Activity size={16} className="text-[#a37e2c]" />;
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-50">
      <div className="bg-white p-2 rounded-lg shadow-sm">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{text}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{time}</p>
      </div>
    </div>
  );
}