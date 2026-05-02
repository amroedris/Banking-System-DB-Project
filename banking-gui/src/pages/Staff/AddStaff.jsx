import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Mail, Briefcase, 
  ShieldCheck, CheckCircle, AlertCircle 
} from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png';

export default function AddStaff() {
  const navigate = useNavigate();
  
  // In a real DB, this would be: SELECT MAX(id) FROM staff;
  const nextId = "S105"; 
  const managerTeam = "BRANCH_CAIRO_01";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Teller',
    teamId: managerTeam
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API/SQL Call: INSERT INTO staff (id, name, email, role, team_id) ...
    console.log("New Staff Member:", { id: nextId, ...formData });
    
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/staff-directory');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      
      {/* HEADER */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-directory')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all">
            <ArrowLeft size={20} />
          </button>
          <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <h1 className="text-lg font-bold text-[#004a99]">New Staff Onboarding</h1>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-8">
        {isSuccess ? (
          <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-emerald-100 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Registration Complete</h2>
            <p className="text-gray-500 mt-2"><b>{formData.name}</b> has been added to <b>{formData.teamId}</b>.</p>
            <p className="text-xs text-gray-400 mt-8 italic">Redirecting to Team Directory...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#004a99] p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Employee Profile</h2>
                  <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest font-bold">Internal System Access</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                  <p className="text-[10px] uppercase text-blue-100">Assigned ID</p>
                  <p className="font-mono font-bold">{nextId}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {/* FULL NAME */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                  <ShieldCheck size={14} className="text-[#a37e2c]" /> Full Name
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Ahmed Kamal"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* EMAIL ADDRESS */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                  <Mail size={14} className="text-[#a37e2c]" /> Work Email
                </label>
                <input 
                  required
                  type="email" 
                  placeholder="username@eui.bank"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] transition-all font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* ROLE SELECTION */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                    <Briefcase size={14} className="text-[#a37e2c]" /> System Role
                  </label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] appearance-none font-medium"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Teller">Teller</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                {/* TEAM ID (READ ONLY) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Assigned Team</label>
                  <div className="w-full px-6 py-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-400 font-mono text-sm">
                    {formData.teamId}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  className="w-full py-5 bg-[#004a99] text-white rounded-3xl font-bold shadow-xl shadow-blue-100 hover:bg-[#003d7a] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  <UserPlus size={20} />
                  Confirm Staff Registration
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <AlertCircle size={10} /> Action will be recorded in System Audit Logs
                </p>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}