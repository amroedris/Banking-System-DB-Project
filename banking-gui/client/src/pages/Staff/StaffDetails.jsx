import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Briefcase, Building2,  Calendar, User, ShieldCheck,
  Edit, Save, X, AlertCircle, Users, Plus, Trash2, MapPin, Award, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import euiLogo from '../../assets/EUI-Cropped.jpg';
import { validateEgyptianPhone, validatePhones, validateEmail, validateName, validateSalary } from '../../utils/validation.js';
import { getJobDropdownOptions, stripJobPrefix, getPrefixForDepartment } from '../../utils/jobMappings.js';

export default function StaffDetails() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [staff, setStaff] = useState(null);
  const [dependants, setDependants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [salaryRanges, setSalaryRanges] = useState({});
  const [allJobs, setAllJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loggedInStaff = JSON.parse(localStorage.getItem('staff') || '{}');
  const isSelfEdit = Number(loggedInStaff.EMPLOYEE_ID) === Number(employeeId);

  // Edit panel state - slides from right
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editPhones, setEditPhones] = useState(['']);
  const [editPhoneErrors, setEditPhoneErrors] = useState(['']);
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editTouched, setEditTouched] = useState({});
  const [editSaveError, setEditSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Dependant management
  const [showAddDependant, setShowAddDependant] = useState(false);
  const [dependantForm, setDependantForm] = useState({
    nationalId: '', firstName: '', middleName: '', lastName: '', relationship: 'Child'
  });
  const [dependantError, setDependantError] = useState('');
  const [isAddingDependant, setIsAddingDependant] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [staffRes, depsRes, jobsRes, depRes] = await Promise.all([
          axios.get(`http://localhost:3000/staff/${employeeId}/details`),
          axios.get(`http://localhost:3000/staff/${employeeId}/dependants`),
          axios.get('http://localhost:3000/jobs'),
          axios.get('http://localhost:3000/departments')
        ]);

        setStaff(staffRes.data);
        setDependants(depsRes.data);

        const ranges = {};
        jobsRes.data.forEach(job => {
          ranges[job.JOB_TITLE] = { min: job.MIN_SALARY, max: job.MAX_SALARY };
        });
        setSalaryRanges(ranges);
        setAllJobs(jobsRes.data);
        setDepartments(depRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load staff details');
        console.error('Failed to load staff details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) fetchData();
  }, [employeeId]);

  // Build dynamic role dropdown options based on selected department
  const editRoleOptions = editForm && editForm.DEP_ID
    ? getJobDropdownOptions(allJobs, editForm.DEP_ID)
    : [];

  const handleDepartmentChange = (depId) => {
    const id = depId ? Number(depId) : null;
    const newRoleOptions = id ? getJobDropdownOptions(allJobs, id) : [];
    let newJobTitle = editForm.JOB_TITLE;

    if (newRoleOptions.length > 0) {
      const prefix = getPrefixForDepartment(id);
      if (!newJobTitle.startsWith(prefix)) {
        newJobTitle = newRoleOptions[0].value;
      }
    }

    setEditForm({
      ...editForm,
      DEP_ID: id,
      JOB_TITLE: newJobTitle
    });
  };

  // Validation helpers for edit panel
  const validateEditField = (name, value) => {
    switch (name) {
      case 'FIRST_NAME': return value?.trim() ? '' : 'First name is required.';
      case 'LAST_NAME': return value?.trim() ? '' : 'Last name is required.';
      case 'EMAIL': return validateEmail(value || '');
      case 'SALARY':
        return validateSalary(value, editForm?.JOB_TITLE || '', salaryRanges);
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
    setEditFieldErrors({ ...editFieldErrors, [name]: validateEditField(name, editForm ? editForm[name] : '') });
  };

  const handleEditChange = (name, value) => {
    setEditForm({ ...editForm, [name]: value });
    if (editTouched[name]) {
      setEditFieldErrors({ ...editFieldErrors, [name]: validateEditField(name, value) });
    }
  };

  const openEditPanel = () => {
    setEditFieldErrors({});
    setEditTouched({});
    setEditSaveError('');
    setEditForm({ ...staff });
    setEditPhones(staff.PHONES && staff.PHONES.length > 0 ? [...staff.PHONES] : ['']);
    setEditPhoneErrors(new Array(staff.PHONES && staff.PHONES.length > 0 ? staff.PHONES.length : 1).fill(''));
    setIsEditPanelOpen(true);
  };

  const closeEditPanel = () => {
    setIsEditPanelOpen(false);
    setEditForm(null);
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...editPhones];
    newPhones[index] = value;
    setEditPhones(newPhones);
    const newErrors = [...editPhoneErrors];
    if (value.trim() === '') {
      newErrors[index] = index === 0 ? 'Primary phone is required.' : '';
    } else {
      newErrors[index] = validateEgyptianPhone(value);
    }
    setEditPhoneErrors(newErrors);
  };

  const addPhoneField = () => {
    if (editPhones.length < 3) {
      setEditPhones([...editPhones, '']);
      setEditPhoneErrors([...editPhoneErrors, '']);
    }
  };

  const removePhoneField = (index) => {
    const newPhones = editPhones.filter((_, i) => i !== index);
    const newErrors = [...editPhoneErrors];
    newErrors.splice(index, 1);
    setEditPhones(newPhones.length > 0 ? newPhones : ['']);
    setEditPhoneErrors(newErrors.length > 0 ? newErrors : ['']);
  };

  const handleSave = async () => {
    setEditSaveError('');
    const fieldsToCheck = ['FIRST_NAME', 'LAST_NAME', 'EMAIL', 'SALARY'];
    const newErrors = {};
    let hasFieldError = false;
    fieldsToCheck.forEach(name => {
      const err = validateEditField(name, editForm[name]);
      newErrors[name] = err;
      if (err) hasFieldError = true;
    });
    setEditFieldErrors(newErrors);
    setEditTouched(Object.fromEntries(fieldsToCheck.map(f => [f, true])));

    const errors = validatePhones(editPhones);
    setEditPhoneErrors(errors);
    const hasEmptyFirst = !editPhones[0] || editPhones[0].trim() === '';
    const hasAnyError = errors.some(err => err !== '');
    if (hasFieldError || hasEmptyFirst || hasAnyError) {
      setEditSaveError('Please fix the highlighted fields before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const validPhones = editPhones.filter(phone => phone && phone.trim() !== '');
      await axios.put(`http://localhost:3000/staff/${employeeId}`, {
        firstName: editForm.FIRST_NAME,
        lastName: editForm.LAST_NAME,
        email: editForm.EMAIL,
        role: editForm.JOB_TITLE,
        salary: editForm.SALARY,
        password: editForm.password || null,
        phones: validPhones,
        depId: editForm.DEP_ID || null
      });

      // Refresh staff details
      const staffRes = await axios.get(`http://localhost:3000/staff/${employeeId}/details`);
      setStaff(staffRes.data);
      closeEditPanel();
    } catch (err) {
      setEditSaveError(err.response?.data?.message || 'Failed to update staff member');
    } finally {
      setIsSaving(false);
    }
  };

  // Dependant management
  const handleAddDependant = async (e) => {
    e.preventDefault();
    setDependantError('');

    if (!dependantForm.nationalId.trim()) {
      setDependantError('National ID is required.');
      return;
    }
    if (dependantForm.nationalId.trim().length !== 14) {
      setDependantError('National ID must be exactly 14 digits.');
      return;
    }
    if (!dependantForm.firstName.trim()) {
      setDependantError('First name is required.');
      return;
    }
    if (!dependantForm.lastName.trim()) {
      setDependantError('Last name is required.');
      return;
    }
    if (!dependantForm.relationship.trim()) {
      setDependantError('Relationship is required.');
      return;
    }

    if (dependants.length >= 4) {
      setDependantError('Maximum of 4 dependants allowed.');
      return;
    }

    setIsAddingDependant(true);
    try {
      await axios.post(`http://localhost:3000/staff/${employeeId}/dependants`, {
        nationalId: dependantForm.nationalId.trim(),
        firstName: dependantForm.firstName.trim(),
        middleName: dependantForm.middleName.trim() || null,
        lastName: dependantForm.lastName.trim(),
        relationship: dependantForm.relationship
      });

      const depsRes = await axios.get(`http://localhost:3000/staff/${employeeId}/dependants`);
      setDependants(depsRes.data);
      setShowAddDependant(false);
      setDependantForm({ nationalId: '', firstName: '', middleName: '', lastName: '', relationship: 'Child' });
    } catch (err) {
      setDependantError(err.response?.data?.message || 'Failed to add dependant.');
    } finally {
      setIsAddingDependant(false);
    }
  };

  const handleRemoveDependant = async (nationalId) => {
    try {
      await axios.delete(`http://localhost:3000/staff/${employeeId}/dependants/${nationalId}`);
      const depsRes = await axios.get(`http://localhost:3000/staff/${employeeId}/dependants`);
      setDependants(depsRes.data);
    } catch (err) {
      console.error('Failed to remove dependant:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'N/A';
    return `$${Number(salary).toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-8">
        <div className="bg-white rounded-[3rem] p-12 text-center max-w-md shadow-sm border border-red-100">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Details</h2>
          <p className="text-gray-500 mb-6">{error || 'Staff member not found.'}</p>
          <button onClick={() => navigate('/staff-directory')} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
            <ArrowLeft size={18} className="inline mr-2" /> Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const initials = (staff.FIRST_NAME?.charAt(0) || '') + (staff.LAST_NAME?.charAt(0) || '');

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-directory')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all">
            <ArrowLeft size={20} />
          </button>
                      <img 
              src={euiLogo} 
              alt="EUI Logo" 
              className="h-20 w-20" 
            />
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <h1 className="text-lg font-bold text-[#004a99]">Staff Profile</h1>
        </div>
        <button
          onClick={openEditPanel}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#004a99] text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-[#003d7a] transition-all"
        >
          <Edit size={16} /> Edit Staff
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-8">
        {/* Profile Header */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#004a99] to-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{staff.FIRST_NAME} {staff.MIDDLE_NAME ? staff.MIDDLE_NAME + ' ' : ''}{staff.LAST_NAME}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-blue-50 text-[#004a99] rounded-full text-xs font-bold">{staff.JOB_TITLE}</span>
                {staff.DEP_NAME && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">{staff.DEP_NAME}</span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Mail size={14} className="text-gray-300" /> {staff.EMAIL}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Phone size={14} className="text-gray-300" /> {staff.PHONE || 'N/A'}
                  </p>
                  {staff.PHONES && staff.PHONES.length > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5 ml-5">{staff.PHONES.length} number(s) on file</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Employee ID</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Award size={14} className="text-gray-300" /> #{staff.EMPLOYEE_ID}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Salary</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-gray-300" /> {formatSalary(staff.SALARY)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Department</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Building2 size={14} className="text-gray-300" /> {staff.DEP_NAME || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hire Date</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-300" /> {formatDate(staff.HIRE_DATE)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Username</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <User size={14} className="text-gray-300" /> {staff.USERNAME || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supervisor</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-gray-300" /> {staff.SUPERVISOR_NAME || 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Branch ID</p>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-300" /> {staff.BRANCH_ID || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dependants Section */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users size={22} className="text-[#a37e2c]" />
              <h3 className="text-lg font-bold text-gray-800">Dependants</h3>
              <span className="text-xs text-gray-400 font-medium">({dependants.length}/4)</span>
            </div>
            {dependants.length < 4 && (
              <button
                onClick={() => setShowAddDependant(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-[#004a99] rounded-xl hover:bg-blue-50 font-bold text-xs transition-all"
              >
                <Plus size={14} /> Add Dependant
              </button>
            )}
          </div>

          {dependants.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl">
              <Users size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium text-sm">No dependants registered</p>
              <p className="text-gray-300 text-xs mt-1">Dependants can be added to staff profiles for benefits</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dependants.map((dep) => (
                <div key={dep.NATIONAL_ID} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 group hover:border-gray-200 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-sm">
                        {dep.FIRST_NAME?.charAt(0)}{dep.LAST_NAME?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{dep.FIRST_NAME} {dep.MIDDLE_NAME ? dep.MIDDLE_NAME + ' ' : ''}{dep.LAST_NAME}</p>
                        <p className="text-xs text-gray-400 font-medium">{dep.RELATIONSHIP}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDependant(dep.NATIONAL_ID)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove dependant"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-300 font-medium mt-2 ml-0.5">National ID: {dep.NATIONAL_ID}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Dependant Form */}
          {showAddDependant && (
            <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <Plus size={16} className="text-[#004a99]" /> New Dependant
              </h4>
              <form onSubmit={handleAddDependant} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">First Name *</label>
                    <input
                      type="text"
                      placeholder="First name"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#004a99] outline-none font-semibold text-sm"
                      value={dependantForm.firstName}
                      onChange={(e) => setDependantForm({...dependantForm, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Middle Name</label>
                    <input
                      type="text"
                      placeholder="Middle name (optional)"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#004a99] outline-none font-semibold text-sm"
                      value={dependantForm.middleName}
                      onChange={(e) => setDependantForm({...dependantForm, middleName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Last Name *</label>
                    <input
                      type="text"
                      placeholder="Last name"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#004a99] outline-none font-semibold text-sm"
                      value={dependantForm.lastName}
                      onChange={(e) => setDependantForm({...dependantForm, lastName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Relationship *</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#004a99] outline-none font-semibold text-sm"
                      value={dependantForm.relationship}
                      onChange={(e) => setDependantForm({...dependantForm, relationship: e.target.value})}
                    >
                      <option value="Child">Child</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">National ID *</label>
                  <input
                    type="text"
                    placeholder="14-digit national ID"
                    maxLength={14}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#004a99] outline-none font-semibold text-sm"
                    value={dependantForm.nationalId}
                    onChange={(e) => setDependantForm({...dependantForm, nationalId: e.target.value.replace(/\D/g, '')})}
                  />
                </div>

                {dependantError && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle size={12} /> {dependantError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isAddingDependant}
                    className="px-6 py-3 bg-[#004a99] text-white rounded-2xl font-bold text-sm hover:bg-[#003d7a] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAddingDependant ? 'Adding...' : <><Plus size={16} /> Add Dependant</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddDependant(false); setDependantError(''); }}
                    className="px-6 py-3 bg-white text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Edit Slide Panel from Right */}
      {isEditPanelOpen && editForm && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeEditPanel} />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  {editForm.FIRST_NAME?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Edit Staff</h3>
                  <p className="text-xs text-gray-400">{editForm.FIRST_NAME} {editForm.LAST_NAME}</p>
                </div>
              </div>
              <button onClick={closeEditPanel} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-5">
              {editSaveError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">{editSaveError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">First Name</label>
                  <input
                    className={getEditClass('FIRST_NAME')}
                    value={editForm.FIRST_NAME || ''}
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
                    value={editForm.LAST_NAME || ''}
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
                  value={editForm.EMAIL || ''}
                  onChange={(e) => handleEditChange('EMAIL', e.target.value)}
                  onBlur={() => handleEditBlur('EMAIL')}
                />
                {editFieldErrors.EMAIL && editTouched.EMAIL && (
                  <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {editFieldErrors.EMAIL}
                  </p>
                )}
              </div>

              {isSelfEdit && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-700 text-sm flex items-start gap-3">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Editing Your Own Profile</p>
                    <p className="text-amber-600 text-xs mt-1">Role, Department, and Salary changes are locked for self-editing. Contact an administrator to change your position or compensation.</p>
                  </div>
                </div>
              )}

              {/* Department Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase ml-1">
                  <Building2 size={14} className="text-[#a37e2c]" /> Department
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold"
                  value={editForm.DEP_ID || ''}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={isSelfEdit}
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
                    value={editForm.JOB_TITLE || ''}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setEditForm({...editForm, JOB_TITLE: newRole});
                      const err = validateSalary(editForm.SALARY, newRole, salaryRanges);
                      setEditFieldErrors({...editFieldErrors, SALARY: err});
                      setEditTouched({...editTouched, SALARY: true});
                    }}
                    disabled={isSelfEdit}
                  >
                    {!editForm.DEP_ID ? (
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
                    min={salaryRanges[editForm.JOB_TITLE]?.min || 0}
                    max={salaryRanges[editForm.JOB_TITLE]?.max || undefined}
                    placeholder={salaryRanges[editForm.JOB_TITLE] ? `${salaryRanges[editForm.JOB_TITLE].min.toLocaleString()} - ${salaryRanges[editForm.JOB_TITLE].max.toLocaleString()}` : 'Enter salary'}
                    className={getEditClass('SALARY')}
                    value={editForm.SALARY || ''}
                    onChange={(e) => handleEditChange('SALARY', e.target.value)}
                    onBlur={() => handleEditBlur('SALARY')}
                    disabled={isSelfEdit}
                  />
                  {!editFieldErrors.SALARY && salaryRanges[editForm.JOB_TITLE] && (
                    <p className="text-[10px] text-gray-400 font-medium ml-1">
                      Range: <b>${salaryRanges[editForm.JOB_TITLE].min.toLocaleString()}</b> — <b>${salaryRanges[editForm.JOB_TITLE].max.toLocaleString()}</b>
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
                  value={editForm.USERNAME || ''}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Change Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold"
                  value={editForm.password || ''}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                />
              </div>



              {/* Phones */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Phone Numbers (Max 3)</label>
                  {editPhones.length < 3 && (
                    <button type="button" onClick={addPhoneField} className="text-xs font-bold text-[#004a99] hover:underline flex items-center gap-1">
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>

                {editPhones.map((phone, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Phone ${index + 1} (e.g. 01012345678)`}
                        className={`flex-1 px-4 py-3 rounded-xl outline-none font-semibold transition-all ${
                          editPhoneErrors[index]
                            ? 'bg-red-50 border border-red-300 focus:ring-2 focus:ring-red-400'
                            : 'bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c]'
                        }`}
                        value={phone || ''}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                      />
                      {editPhones.length > 1 && (
                        <button type="button" onClick={() => removePhoneField(index)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    {editPhoneErrors[index] && (
                      <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {editPhoneErrors[index]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-5 flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3.5 bg-[#004a99] text-white rounded-2xl font-bold shadow-lg hover:bg-[#003d7a] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={closeEditPanel} className="px-8 py-3.5 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
