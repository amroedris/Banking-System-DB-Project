import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, User, CreditCard, History, 
  Wallet, Shield, MapPin, Phone, Mail,
  CheckCircle, Snowflake, Pencil, X, Save
} from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png';

export default function CustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // --- MODAL STATE MANAGEMENT ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: "Sarah Connor",
    email: "sarah.connor@example.com",
    phone: "+20 123 456 7890",
    address: "123 EUI Campus Drive, New Cairo"
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    // SQL Logic would go here: UPDATE users SET ... WHERE user_id = id
    console.log("Saving to Database for ID:", id, editData);
    setIsEditOpen(false);
  };

  // Mock Data
  const customer = {
    name: editData.name, // Linked to edit state for demo purposes
    id: id || "299010121005",
    status: "active",
    accounts: [
      { type: "Main Checking", no: "4092-8831", balance: "12,450.00", status: "Active" },
      { type: "High-Yield Savings", no: "8831-2244", balance: "45,200.75", status: "Active" }
    ],
    personal: {
      email: editData.email,
      phone: editData.phone,
      address: editData.address,
      joined: "Oct 2024"
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12 relative overflow-x-hidden">
      
      {/* NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <h1 className="text-lg font-bold text-[#004a99]">Customer Profile</h1>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 rounded-xl border border-cyan-200 text-cyan-600 font-bold text-xs hover:bg-cyan-50 transition-all flex items-center gap-2">
             <Snowflake size={14} /> Freeze Account
           </button>
           <button 
             onClick={() => setIsEditOpen(true)}
             className="px-4 py-2 rounded-xl bg-[#004a99] text-white font-bold text-xs shadow-md hover:bg-[#003d7a] transition-all flex items-center gap-2"
           >
             <Pencil size={14} /> Edit Profile
           </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="h-24 w-24 rounded-3xl bg-blue-50 flex items-center justify-center text-[#004a99] text-4xl font-bold border-2 border-white shadow-inner">
            {customer.name.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
              <h2 className="text-3xl font-bold text-gray-800">{customer.name}</h2>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                <CheckCircle size={12} /> {customer.status}
              </span>
            </div>
            <p className="text-gray-400 font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
              <Shield size={14} /> National ID: {customer.id} • Member since {customer.personal.joined}
            </p>
          </div>
          <div className="flex gap-4">
             <div className="text-center px-6 border-r border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Assets</p>
                <p className="text-xl font-bold text-gray-800">$57,650.75</p>
             </div>
             <div className="text-center px-6">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Risk Score</p>
                <p className="text-xl font-bold text-[#a37e2c]">Low</p>
             </div>
          </div>
        </div>

        {/* TAB SELECTOR */}
        <div className="flex gap-8 mb-6 border-b border-gray-200 px-4">
           <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={<User size={18}/>} />
           <TabButton active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} label="Accounts & Cards" icon={<Wallet size={18}/>} />
           <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Activity Log" icon={<History size={18}/>} />
        </div>

        {/* TAB CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              {activeTab === 'overview' && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 transition-all">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-[#a37e2c] rounded-full"></div>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InfoBox label="Email Address" value={customer.personal.email} icon={<Mail size={16}/>} />
                    <InfoBox label="Phone Number" value={customer.personal.phone} icon={<Phone size={16}/>} />
                    <InfoBox label="Home Address" value={customer.personal.address} icon={<MapPin size={16}/>} />
                    <InfoBox label="Customer Type" value="Individual / Platinum" icon={<Shield size={16}/>} />
                  </div>
                </div>
              )}

              {activeTab === 'accounts' && (
                <div className="space-y-4">
                  {customer.accounts.map((acc, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center hover:border-[#004a99] transition-all cursor-default">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-[#004a99] rounded-2xl">
                          <Wallet size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{acc.type}</p>
                          <p className="text-xs text-gray-400 font-mono italic">{acc.no}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">${acc.balance}</p>
                        <p className="text-[10px] text-green-500 font-bold uppercase">{acc.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                  <p className="text-center text-gray-400 py-12 italic">No recent activity found.</p>
                </div>
              )}
           </div>

           <div className="space-y-6">
              <div className="bg-[#004a99] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
                 <div className="relative z-10">
                   <p className="text-blue-200 text-[10px] font-bold uppercase mb-4 tracking-widest">Active Debit Card</p>
                   <p className="text-xl font-mono tracking-widest mb-6">**** **** **** 4092</p>
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-blue-200 uppercase">Expiry</p>
                        <p className="font-bold">12/28</p>
                      </div>
                      <CreditCard size={32} className="opacity-40" />
                   </div>
                 </div>
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider">Internal Staff Notes</h4>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#a37e2c] resize-none" 
                  rows="4"
                  placeholder="Enter notes..."
                ></textarea>
                <button className="w-full mt-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200">
                  Update Notes
                </button>
              </div>
           </div>
        </div>
      </main>

      {/* --- SLIDING MODAL COMPONENTS --- */}
      
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isEditOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsEditOpen(false)}
      />

      {/* Sliding Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] transition-transform duration-500 ease-out transform ${isEditOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Edit Personal Details</h3>
            <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-8 space-y-6">
            <EditInput label="Full Name" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
            <EditInput label="Email Address" type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
            <EditInput label="Phone Number" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
            <EditInput label="Home Address" value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} />
          </form>

          <div className="p-6 border-t border-gray-100 flex gap-4">
            <button onClick={handleUpdate} className="flex-1 bg-[#004a99] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#003d7a] flex items-center justify-center gap-2">
              <Save size={18} /> Save Changes
            </button>
            <button onClick={() => setIsEditOpen(false)} className="px-6 bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// UI HELPERS
function TabButton({ active, label, icon, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 py-4 px-2 border-b-2 font-bold text-sm transition-all ${
        active ? 'border-[#004a99] text-[#004a99]' : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function InfoBox({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-400">{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-700">{value}</p>
      </div>
    </div>
  );
}

function EditInput({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">{label}</label>
      <input 
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold text-gray-700 transition-all"
        {...props}
      />
    </div>
  );
}