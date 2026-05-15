import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Mail, Briefcase, Lock,
  ShieldCheck, CheckCircle, AlertCircle 
} from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png';

export default function AddStaff() {
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
            Only <b>Managers</b> can add new staff members.
          </p>
          <button 
            onClick={() => navigate('/staff-directory')} 
            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Staff Directory
          </button>
        </div>
      </div>
    );
  }

const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  role: 'Teller',
  salary: '',
  username: '',
  tempPassword: '',
  phones: ['']
});

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');      try {
      const staffData = JSON.parse(localStorage.getItem('staff') || '{}');
      
await axios.post('http://localhost:3000/staff', {
  firstName:    formData.firstName,
  lastName:     formData.lastName,
  email:        formData.email,
  role:         formData.role,
  salary:       Number(formData.salary) || 5000,
  username:     formData.username,
  password:     formData.tempPassword,
  phones:       formData.phones,             // ← add this
  supervisorId: staffData.EMPLOYEE_ID || null
});

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/staff-directory');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff member.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

const addPhone = () => {
  if (formData.phones.length < 3) {
    setFormData({ ...formData, phones: [...formData.phones, ''] });
  }
};

const removePhone = (index) => {
  const updated = formData.phones.filter((_, i) => i !== index);
  setFormData({ ...formData, phones: updated });
};

const updatePhone = (index, value) => {
  const updated = [...formData.phones];
  updated[index] = value;
  setFormData({ ...formData, phones: updated });
};

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      
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
            <p className="text-gray-500 mt-2"><b>{formData.firstName} {formData.lastName}</b> has been added as <b>{formData.role}</b>.</p>
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
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                  <AlertCircle size={18} />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                    <ShieldCheck size={14} className="text-[#a37e2c]" /> First Name
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ahmed"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] transition-all font-medium"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                    <ShieldCheck size={14} className="text-[#a37e2c]" /> Last Name
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="Kamal"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] transition-all font-medium"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

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
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                    <Briefcase size={14} className="text-[#a37e2c]" /> System Role
                  </label>
<select
  value={formData.role}
  onChange={(e) => setFormData({...formData, role: e.target.value})}
  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] appearance-none font-medium"
  disabled={isSubmitting}
>
  <option value="Teller">Teller</option>
  <option value="Branch Manager">Branch Manager</option>
</select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Salary ($)</label>
                  <input
                    type="number"
                    min="1000"
                    placeholder="5000"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] font-medium"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
   <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
     <ShieldCheck size={14} className="text-[#a37e2c]" /> Username
   </label>
   <input
     required
     type="text"
     placeholder="ahmed.kamal"
     className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] transition-all font-medium"
     value={formData.username}
     onChange={(e) => setFormData({...formData, username: e.target.value})}
     disabled={isSubmitting}
   />
 </div>

 <div className="space-y-2">
   <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
     <Lock size={14} className="text-[#a37e2c]" /> Temporary Password
   </label>
   <input
     required
     type="text"
     placeholder="e.g. EUI@2025"
     className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] transition-all font-medium"
     value={formData.tempPassword}
     onChange={(e) => setFormData({...formData, tempPassword: e.target.value})}
     disabled={isSubmitting}
   />
 </div>

 <div className="space-y-3">
  <div className="flex items-center justify-between">
    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
      <Mail size={14} className="text-[#a37e2c]" /> Phone Numbers
    </label>
    {formData.phones.length < 3 && (
      <button
        type="button"
        onClick={addPhone}
        className="text-xs text-[#004a99] font-bold hover:underline"
      >
        + Add another
      </button>
    )}
  </div>

  {formData.phones.map((phone, index) => (
    <div key={index} className="flex gap-2 items-center">
      <input
        type="tel"
        placeholder={`Phone ${index + 1}`}
        className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] transition-all font-medium"
        value={phone}
        onChange={(e) => updatePhone(index, e.target.value)}
        disabled={isSubmitting}
      />
      {formData.phones.length > 1 && (
        <button
          type="button"
          onClick={() => removePhone(index)}
          className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-all"
        >
          ✕
        </button>
      )}
    </div>
  ))}
</div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[#004a99] text-white rounded-3xl font-bold shadow-xl shadow-blue-100 hover:bg-[#003d7a] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <UserPlus size={20} /> Register Employee
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
