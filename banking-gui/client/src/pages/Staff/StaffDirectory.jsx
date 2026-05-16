import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, UserPlus, Search, ShieldCheck,
  Mail, Briefcase, Phone, Edit, Trash2, Lock, Eye, EyeOff, X, Save, AlertTriangle, Plus, Trash2Icon, AlertCircle, Building2, Filter
} from 'lucide-react';
import axios from 'axios';
import euiLogo from '../../assets/EUI-Cropped.jpg';
import { validateEgyptianPhone, validatePhones, validateEmail, validateName, validateSalary } from '../../utils/validation.js';
import { getJobDropdownOptions, stripJobPrefix, getPrefixForDepartment } from '../../utils/jobMappings.js';

export default function StaffManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [error, setError] = useState('');
  const [phoneErrors, setPhoneErrors] = useState([]);
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editTouched, setEditTouched] = useState({});
  const [editSaveError, setEditSaveError] = useState('');
  const [salaryRanges, setSalaryRanges] = useState({});
  const [allJobs, setAllJobs] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Super admin filter state
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterJobTitle, setFilterJobTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, depsRes] = await Promise.all([
          axios.get('http://localhost:3000/jobs'),
          axios.get('http://localhost:3000/departments')
        ]);
        const ranges = {};
        jobsRes.data.forEach(job => {
          ranges[job.JOB_TITLE] = { min: job.MIN_SALARY, max: job.MAX_SALARY };
        });
        setSalaryRanges(ranges);
        setAllJobs(jobsRes.data);
        setDepartments(depsRes.data);
      } catch (err) {
        console.error("Failed to load job/department data");
      }
    };
    fetchData();
  }, []);

  const staffData = JSON.parse(localStorage.getItem('staff') || '{}');
  const staffEmployeeId = staffData.EMPLOYEE_ID;
  const jobId = staffData.JOB_ID;

  useEffect(() => {
    fetchStaff();
  }, [filterDepartment, filterJobTitle]);

  // Build dynamic role dropdown options based on editing staff's department
  const editRoleOptions = editingStaff && editingStaff.DEP_ID
    ? getJobDropdownOptions(allJobs, editingStaff.DEP_ID)
    : [];

  const validateEditField = (name, value) => {
    switch (name) {
      case 'FIRST_NAME': return value?.trim() ? '' : 'First name is required.';
      case 'LAST_NAME': return value?.trim() ? '' : 'Last name is required.';
      case 'EMAIL': return validateEmail(value || '');
      case 'SALARY':
        return validateSalary(value, editingStaff?.JOB_TITLE || '', salaryRanges);
      default: return '';
    }
  };

  const getEditClass = (name) => {
    const hasError = editFieldErrors[name] && editTouched[name];
    return `w-full px-4 py-3 rounded-xl border outline-none font-semibold transition-all ${
      hasError
        ? 'bg-red-50 border-red-300 focus:ring-2 focus:ring-red-400'
        : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#a37e2c]'
    }`;
  };

  const handleEditBlur = (name) => {
    setEditTouched({ ...editTouched, [name]: true });
    setEditFieldErrors({ ...editFieldErrors, [name]: validateEditField(name, editingStaff ? editingStaff[name] : '') });
  };

  const handleEditChange = (name, value) => {
    setEditingStaff({ ...editingStaff, [name]: value });
    if (editTouched[name]) {
      setEditFieldErrors({ ...editFieldErrors, [name]: validateEditField(name, value) });
    }
  };

  const fetchStaff = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (staffEmployeeId) {
        params.supervisorId = staffEmployeeId;
      }
      // Add admin filters for system admins
      if (jobId === 3) {
        if (filterDepartment) params.departmentName = filterDepartment;
        if (filterJobTitle) params.jobTitle = filterJobTitle;
      }
      const response = await axios.get('http://localhost:3000/staff', { params });
      setStaff(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch staff');
      console.error('Failed to fetch staff:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditPanel = async (member) => {
    // Reset validation state
    setEditFieldErrors({});
    setEditTouched({});
    setEditSaveError('');
    setError('');
    // Fetch phone numbers for this employee
    try {
      const phoneResponse = await axios.get(`http://localhost:3000/staff/${member.EMPLOYEE_ID}/phones`);
      const phones = phoneResponse.data || [];
      setEditingStaff({
        ...member,
        phones: phones.length > 0 ? phones : [''],
        password: ''
      });
      setPhoneErrors(new Array(phones.length > 0 ? phones.length : 1).fill(''));
    } catch (err) {
      setEditingStaff({
        ...member,
        phones: [''],
        password: ''
      });
      setPhoneErrors(['']);
    }
    setIsPanelOpen(true);
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...editingStaff.phones];
    newPhones[index] = value;
    setEditingStaff({...editingStaff, phones: newPhones});
    const newErrors = [...phoneErrors];
    if (value.trim() === '') {
      newErrors[index] = index === 0 ? 'Primary phone is required.' : '';
    } else {
      newErrors[index] = validateEgyptianPhone(value);
    }
    setPhoneErrors(newErrors);
  };

  const addPhoneField = () => {
    if (editingStaff.phones.length < 3) {
      setEditingStaff({...editingStaff, phones: [...editingStaff.phones, '']});
      setPhoneErrors([...phoneErrors, '']);
    }
  };

  const removePhoneField = (index) => {
    const newPhones = editingStaff.phones.filter((_, i) => i !== index);
    const newErrors = [...phoneErrors];
    newErrors.splice(index, 1);
    setEditingStaff({...editingStaff, phones: newPhones.length > 0 ? newPhones : ['']});
    setPhoneErrors(newErrors.length > 0 ? newErrors : ['']);
  };

  const handleDepartmentChange = (depId) => {
    const id = depId ? Number(depId) : null;
    const newRoleOptions = id ? getJobDropdownOptions(allJobs, id) : [];
    let newJobTitle = editingStaff.JOB_TITLE;
    
    // If current role doesn't match the new department prefix, auto-select first option
    if (newRoleOptions.length > 0) {
      const prefix = getPrefixForDepartment(id);
      if (!newJobTitle.startsWith(prefix)) {
        newJobTitle = newRoleOptions[0].value;
      }
    }

    setEditingStaff({
      ...editingStaff,
      DEP_ID: id,
      JOB_TITLE: newJobTitle
    });
  };

  const handleSave = async () => {
    setEditSaveError('');

    // Validate all text fields
    const fieldsToCheck = ['FIRST_NAME', 'LAST_NAME', 'EMAIL', 'SALARY'];
    const newErrors = {};
    let hasFieldError = false;
    fieldsToCheck.forEach(name => {
      const err = validateEditField(name, editingStaff[name]);
      newErrors[name] = err;
      if (err) hasFieldError = true;
    });
    setEditFieldErrors(newErrors);
    setEditTouched(Object.fromEntries(fieldsToCheck.map(f => [f, true])));

    // Validate all phones before saving
    const errors = validatePhones(editingStaff.phones);
    setPhoneErrors(errors);
    const hasEmptyFirst = !editingStaff.phones[0] || editingStaff.phones[0].trim() === '';
    const hasAnyError = errors.some(err => err !== '');
    if (hasFieldError || hasEmptyFirst || hasAnyError) {
      setEditSaveError('Please fix the highlighted fields before saving.');
      return;
    }

    try {
      const validPhones = editingStaff.phones.filter(phone => phone && phone.trim() !== '');
      const payload = {
        firstName: editingStaff.FIRST_NAME,
        lastName: editingStaff.LAST_NAME,
        email: editingStaff.EMAIL,
        role: editingStaff.JOB_TITLE,
        salary: editingStaff.SALARY,
        password: editingStaff.password || null,
        phones: validPhones,
        depId: editingStaff.DEP_ID || null
      };
      await axios.put(`http://localhost:3000/staff/${editingStaff.EMPLOYEE_ID}`, payload);
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
      (member.JOB_TITLE && stripJobPrefix(member.JOB_TITLE).toLowerCase().includes(query))
    );
  });

  // ── Teller Access Denied View ──
  // Let tellers hit the route but show full-screen denied view (like ApprovalQueue styling)
  if (jobId === 2) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-red-100">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8">
            Only <b>Managers and Administrators</b> can access Staff Management. You are logged in with a Teller role.
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

  // Show error-based denied view for managers with no reports
  if (error && error.includes("don't supervise")) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-amber-100">
          <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Permission Not Granted</h2>
          <p className="text-gray-500 mb-8">
            You don't supervise any employees. Only managers with direct reports can manage staff.
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
            <img 
              src={euiLogo} 
              alt="EUI Logo" 
              className="h-20 w-20" 
            />
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

          {/* Super Admin Filter Toolbar — only visible to System Administrators (JOB_ID=3) */}
          {jobId === 3 && (
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#a37e2c] font-medium text-sm"
              >
                <option value="">All Departments</option>
                {departments.map(dep => (
                  <option key={dep.DEP_ID} value={dep.DEP_NAME}>{dep.DEP_NAME}</option>
                ))}
              </select>
              <select
                value={filterJobTitle}
                onChange={(e) => setFilterJobTitle(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#a37e2c] font-medium text-sm"
              >
                <option value="">All Roles</option>
                {allJobs.map(job => (
                  <option key={job.JOB_ID} value={job.JOB_TITLE}>{stripJobPrefix(job.JOB_TITLE)}</option>
                ))}
              </select>
            </div>
          )}

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
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{stripJobPrefix(member.JOB_TITLE)}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Mail size={14} className="text-indigo-300" /> {member.EMAIL}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Phone size={14} className="text-indigo-300" /> {(member.PHONES && member.PHONES.length > 0) ? member.PHONES.join(', ') : member.PHONE || 'N/A'}</div>
                    {member.DEP_NAME && (
                      <div className="flex items-center gap-2 text-xs text-gray-500"><Building2 size={14} className="text-indigo-300" /> {member.DEP_NAME}</div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Briefcase size={14} className="text-indigo-300" /> ID: {member.EMPLOYEE_ID}</div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-50">
                    <button onClick={() => navigate(`/staff/${member.EMPLOYEE_ID}`)} className="flex-1 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 font-bold text-xs flex items-center justify-center gap-2 transition-all">
                      <Eye size={14} /> View
                    </button>
                    {/* Allow self-editing — removed the member.EMPLOYEE_ID !== staffEmployeeId restriction */}
                    <button onClick={() => openEditPanel(member)} className="flex-1 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-[#004a99] font-bold text-xs flex items-center justify-center gap-2 transition-all">
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => triggerDeleteRequest(member)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                      <Trash2 size={16} />
                    </button>
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
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
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
              {editSaveError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">{editSaveError}</span>
                </div>
              )}

              {/* Safety Intercept: If editing self, show warning */}
              {editingStaff.EMPLOYEE_ID === staffEmployeeId && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-700 text-sm flex items-start gap-3">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Editing Your Own Profile</p>
                    <p className="text-amber-600 text-xs mt-1">Role, Department, and Salary changes are locked for self-editing. Contact an administrator to change your position or compensation.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">First Name</label>
                  <input
                    className={getEditClass('FIRST_NAME')}
                    value={editingStaff.FIRST_NAME || ''}
                    onChange={(e) => handleEditChange('FIRST_NAME', e.target.value)}
                    onBlur={() => handleEditBlur('FIRST_NAME')}
                  />
                  {editFieldErrors.FIRST_NAME && editTouched.FIRST_NAME && (
                    <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {editFieldErrors.FIRST_NAME}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Last Name</label>
                  <input
                    className={getEditClass('LAST_NAME')}
                    value={editingStaff.LAST_NAME || ''}
                    onChange={(e) => handleEditChange('LAST_NAME', e.target.value)}
                    onBlur={() => handleEditBlur('LAST_NAME')}
                  />
                  {editFieldErrors.LAST_NAME && editTouched.LAST_NAME && (
                    <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {editFieldErrors.LAST_NAME}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Email</label>
                <input
                  className={getEditClass('EMAIL')}
                  value={editingStaff.EMAIL || ''}
                  onChange={(e) => handleEditChange('EMAIL', e.target.value)}
                  onBlur={() => handleEditBlur('EMAIL')}
                />
                {editFieldErrors.EMAIL && editTouched.EMAIL && (
                  <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {editFieldErrors.EMAIL}
                  </p>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase ml-1">
                  <Building2 size={14} className="text-[#a37e2c]" /> Department
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold"
                  value={editingStaff.DEP_ID || ''}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={editingStaff.EMPLOYEE_ID === staffEmployeeId}
                >
                  <option value="">Select Department</option>
                  {departments.map(dep => (
                    <option key={dep.DEP_ID} value={dep.DEP_ID}>{dep.DEP_NAME}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Role</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold"
                    value={editingStaff.JOB_TITLE || ''}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setEditingStaff({...editingStaff, JOB_TITLE: newRole});
                      const err = validateSalary(editingStaff.SALARY, newRole, salaryRanges);
                      setEditFieldErrors({...editFieldErrors, SALARY: err});
                      setEditTouched({...editTouched, SALARY: true});
                    }}
                    disabled={editingStaff.EMPLOYEE_ID === staffEmployeeId}
                  >
                    {!editingStaff.DEP_ID ? (
                      <option value="">Select department first</option>
                    ) : editRoleOptions.length === 0 ? (
                      <option value="">No roles available</option>
                    ) : (
                      editRoleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Salary ($)</label>
                  <input
                    type="number"
                    min={salaryRanges[editingStaff.JOB_TITLE]?.min || 0}
                    max={salaryRanges[editingStaff.JOB_TITLE]?.max || undefined}
                    placeholder={salaryRanges[editingStaff.JOB_TITLE] ? `${salaryRanges[editingStaff.JOB_TITLE].min.toLocaleString()} - ${salaryRanges[editingStaff.JOB_TITLE].max.toLocaleString()}` : 'Enter salary'}
                    className={getEditClass('SALARY')}
                    value={editingStaff.SALARY || ''}
                    onChange={(e) => handleEditChange('SALARY', e.target.value)}
                    onBlur={() => handleEditBlur('SALARY')}
                    disabled={editingStaff.EMPLOYEE_ID === staffEmployeeId}
                  />
                  {!editFieldErrors.SALARY && salaryRanges[editingStaff.JOB_TITLE] && (
                    <p className="text-[10px] text-gray-400 font-medium ml-1 flex items-center gap-1">
                      <Briefcase size={10} className="text-[#a37e2c]" />
                      Range for {stripJobPrefix(editingStaff.JOB_TITLE)}: <b>${salaryRanges[editingStaff.JOB_TITLE].min.toLocaleString()}</b> — <b>${salaryRanges[editingStaff.JOB_TITLE].max.toLocaleString()}</b>
                    </p>
                  )}
                  {editFieldErrors.SALARY && editTouched.SALARY && (
                    <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {editFieldErrors.SALARY}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Username (Read-Only)</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 font-semibold text-gray-500 cursor-not-allowed"
                  value={editingStaff.USERNAME || ''}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Change Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold"
                  value={editingStaff.password || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, password: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">
                    Phone Numbers (Max 3)
                  </label>
                  {editingStaff.phones.length < 3 && (
                    <button
                      type="button"
                      onClick={addPhoneField}
                      className="text-xs font-bold text-[#004a99] hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>

                {editingStaff.phones.map((phone, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Phone ${index + 1} (e.g. 01012345678)`}
                        className={`flex-1 px-4 py-3 rounded-xl outline-none font-semibold transition-all ${
                          phoneErrors[index]
                            ? 'bg-red-50 border border-red-300 focus:ring-2 focus:ring-red-400'
                            : 'bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c]'
                        }`}
                        value={phone || ''}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                      />
                      {editingStaff.phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhoneField(index)}
                          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2Icon size={16} />
                        </button>
                      )}
                    </div>
                    {phoneErrors[index] && (
                      <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {phoneErrors[index]}
                      </p>
                    )}
                  </div>
                ))}
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
