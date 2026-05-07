import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Search, ShieldCheck, 
  Mail, Briefcase, Edit, Trash2, Lock, Eye, EyeOff, X, Save, AlertTriangle 
} from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png';

export default function StaffManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [testRole, setTestRole] = useState('manager'); 
  const teamId = "BRANCH_CAIRO_01";

  // --- UI STATES ---
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  // NEW: Delete Confirmation States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const [staff, setStaff] = useState([
    { id: "S101", name: "Sarah Staff", role: "Teller", email: "s.staff@eui.bank", teamId: "BRANCH_CAIRO_01" },
    { id: "S102", name: "John Teller", role: "Teller", email: "j.teller@eui.bank", teamId: "BRANCH_CAIRO_01" },
    { id: "S103", name: "Ahmed Admin", role: "Analyst", email: "a.admin@eui.bank", teamId: "BRANCH_ALEX_02" }, 
    { id: "S104", name: "Nour Manager", role: "Manager", email: "n.manager@eui.bank", teamId: "BRANCH_ALEX_02" },
  ]);

  // --- LOGIC HANDLERS ---
  const openEditPanel = (member) => {
    setEditingStaff({ ...member });
    setIsPanelOpen(true);
  };

  const handleSave = () => {
    setStaff(staff.map(s => s.id === editingStaff.id ? editingStaff : s));
    setIsPanelOpen(false);
  };

  const triggerDeleteRequest = (member) => {
    setStaffToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setStaff(staff.filter(s => s.id !== staffToDelete.id));
    setIsDeleteModalOpen(false);
    setStaffToDelete(null);
  };

  const myTeam = staff.filter(member => 
    member.teamId === teamId && 
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- 1. ACCESS DENIED SCREEN ---
  if (testRole !== 'manager') {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-red-100">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Manager Access Required</h2>
          <p className="text-gray-500 mb-8">
            You are currently logged in as a <b>Teller</b>. Only Managers can manage team members.
          </p>

          <div className="flex flex-col gap-3">
            {/* PERMANENT EXIT BUTTON */}
            <button 
              onClick={() => navigate('/staff-dashboard')} 
              className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} /> Back to Dashboard
            </button>

            {/* TESTING BUTTON (To be removed later) */}
            <button 
              onClick={() => setTestRole('manager')} 
              className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold border border-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
            >
              <Eye size={18} /> Switch to Manager (For Testing)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12 relative overflow-hidden">
      
      {/* HEADER */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={20} /></button>
          <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
          <h1 className="text-lg font-bold text-[#004a99]">Team Management</h1>
        </div>
        <button onClick={() => setTestRole('teller')} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100">
          <EyeOff size={14} /> Test: Demote to Teller
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Search team members..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => navigate('/add-staff')}
            className="flex items-center gap-2 px-8 py-3 bg-[#004a99] text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-[#003d7a] transition-all"
          >
            <UserPlus size={18} /> Add Team Member
          </button>
        </div>

        {/* TEAM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTeam.map((member) => (
            <div key={member.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
              <div className="relative z-10">
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl mb-4">{member.name.charAt(0)}</div>
                <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{member.role}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Mail size={14} className="text-indigo-300" /> {member.email}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Briefcase size={14} className="text-indigo-300" /> ID: {member.id}</div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-50">
                  <button onClick={() => openEditPanel(member)} className="flex-1 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-[#004a99] font-bold text-xs flex items-center justify-center gap-2 transition-all">
                    <Edit size={14} /> Edit
                  </button>
                  {/* Updated Delete Trigger */}
                  <button onClick={() => triggerDeleteRequest(member)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- CONFIRM DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsDeleteModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-gray-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Are you sure?</h2>
            <p className="text-sm text-gray-500 mb-8">
              You are about to remove <b>{staffToDelete?.name}</b> from your team. This action cannot be undone.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDelete}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
              >
                Yes, Remove Member
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                No, Keep Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SLIDE EDIT PANEL --- */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isPanelOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${isPanelOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsPanelOpen(false)} />
        <div className={`absolute right-0 top-0 w-full max-w-md bg-white h-full shadow-2xl transition-transform duration-500 ease-in-out transform ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Edit Team Member</h2>
              <p className="text-[10px] text-[#004a99] font-black uppercase tracking-widest bg-blue-50 px-2 py-1 rounded mt-1 w-fit">Staff ID: {editingStaff?.id}</p>
            </div>
            <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Full Name</label>
              <input type="text" value={editingStaff?.name || ''} onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email</label>
              <input type="email" value={editingStaff?.email || ''} onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Role</label>
              <select value={editingStaff?.role || ''} onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl appearance-none outline-none focus:ring-2 focus:ring-[#004a99]">
                <option value="Teller">Teller</option>
                <option value="Analyst">Analyst</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-gray-100 bg-white grid grid-cols-2 gap-4">
            <button onClick={() => setIsPanelOpen(false)} className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold">Cancel</button>
            <button onClick={handleSave} className="py-4 bg-[#004a99] text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"><Save size={18} /> Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}