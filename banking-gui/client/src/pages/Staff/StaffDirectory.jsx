import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Search, ShieldCheck, 
  Mail, Briefcase, Edit, Trash2, Lock, Eye, EyeOff, X, Save, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';
import euiLogo from '../../assets/eui-logo.png';

export default function StaffManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const staffData = JSON.parse(localStorage.getItem('staff') || '{}');
  const isManager = staffData.JOB_ID === 1;
  const staffEmployeeId = staffData.EMPLOYEE_ID;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (staffEmployeeId) {
        params.supervisorId = staffEmployeeId;
      }
      const response = await axios.get('http://localhost:3000/staff', { params });
      setStaff(response.data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditPanel = (member) => {
    setEditingStaff({ ...member });
    setIsPanelOpen(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3000/staff/${editingStaff.EMPLOYEE_ID}`, {
        firstName: editingStaff.FIRST_NAME,
        lastName: editingStaff.LAST_NAME,
        email: editingStaff.EMAIL,
        role: editingStaff.JOB_TITLE
      });
      fetchStaff();
      setIsPanelOpen(false);
    } catch (err) {
      console.error('Failed to update staff:', err);
      alert('Failed to update staff member');
    }
  };

  const triggerDeleteRequest = (member) => {
    setStaffToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/staff/${staffToDelete.EMPLOYEE_ID}`);
      fetchStaff();
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
    } catch (err) {
      console.error('Failed to delete staff:', err);
      alert('Failed to remove staff member');
    }
  };

  const filteredStaff = staff.filter(member => {
    const query = searchTerm.toLowerCase();
    return (
      (member.FIRST_NAME + ' ' + member.LAST_NAME).toLowerCase().includes(query) ||
      String(member.EMPLOYEE_ID).includes(searchTerm) ||
      (member.JOB_TITLE && member.JOB_TITLE.toLowerCase().includes(query))
    );
  });

  if (!isManager) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-red-100">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8">
            You are logged in with a non-manager role. Only <b>Managers</b> can access Staff Management.
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

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12 relative overflow-hidden">
      
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={20} /></button>
          <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
          <h1 className="text-lg font-bold text-[#004a99]">Team Management</h1>
        </div>
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

        {isLoading ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center">
            <div className="w-10 h-10 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading staff...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <div key={member.EMPLOYEE_ID} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl mb-4">{member.FIRST_NAME?.charAt(0)}</div>
                  <h3 className="text-lg font-bold text-gray-800">{member.FIRST_NAME} {member.LAST_NAME}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{member.JOB_TITLE}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Mail size={14} className="text-indigo-300" /> {member.EMAIL}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Briefcase size={14} className="text-indigo-300" /> ID: {member.EMPLOYEE_ID}</div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-50">
                    {member.EMPLOYEE_ID !== staffEmployeeId && (
                      <>
                        <button onClick={() => openEditPanel(member)} className="flex-1 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-[#004a99] font-bold text-xs flex items-center justify-center gap-2 transition-all">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => triggerDeleteRequest(member)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    {member.EMPLOYEE_ID === staffEmployeeId && (
                      <div className="flex-1 py-2.5 text-center text-xs text-gray-300 font-medium">
                        You
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center border border-gray-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Remove Team Member?</h3>
            <p className="text-gray-500 text-sm mb-8">
              This will permanently remove <b>{staffToDelete?.FIRST_NAME} {staffToDelete?.LAST_NAME}</b> from the system.
            </p>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all">
                Yes, Remove
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Panel */}
      {isPanelOpen && editingStaff && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setIsPanelOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-gray-100">
            <button onClick={() => setIsPanelOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                {editingStaff.FIRST_NAME?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Edit Staff Member</h3>
                <p className="text-sm text-gray-400">Update details for {editingStaff.FIRST_NAME} {editingStaff.LAST_NAME}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">First Name</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold"
                    value={editingStaff.FIRST_NAME || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, FIRST_NAME: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Last Name</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold"
                    value={editingStaff.LAST_NAME || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, LAST_NAME: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Email</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold"
                  value={editingStaff.EMAIL || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, EMAIL: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Role</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold"
                  value={editingStaff.JOB_TITLE || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, JOB_TITLE: e.target.value})}
                >
                  <option>Manager</option>
                  <option>Analyst</option>
                  <option>Teller</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-50">
              <button onClick={handleSave} className="flex-1 py-3.5 bg-[#004a99] text-white rounded-2xl font-bold shadow-lg hover:bg-[#003d7a] transition-all flex items-center justify-center gap-2">
                <Save size={18} /> Save Changes
              </button>
              <button onClick={() => setIsPanelOpen(false)} className="px-8 py-3.5 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
