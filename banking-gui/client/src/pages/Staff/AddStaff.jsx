import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Mail, Briefcase, Lock, Building2,
  ShieldCheck, CheckCircle, AlertCircle 
} from 'lucide-react';
import euiLogo from '../../assets/EUI-Cropped.jpg';
import {
  validateEgyptianPhone, validatePhones,
  validateEmail, validateName, validateUsername,
  validatePassword, validateSalary
} from '../../utils/validation.js';
import { getJobDropdownOptions, stripJobPrefix, getPrefixForDepartment } from '../../utils/jobMappings.js';

export default function AddStaff() {
  const navigate = useNavigate();

  const [salaryRanges, setSalaryRanges] = useState({});
  const [departments, setDepartments] = useState([]);
  const [allJobs, setAllJobs] = useState([]);

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
        console.error("Failed to load data");
      }
    };
    fetchData();
  }, []);
  
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
    role: '',
    salary: '',
    username: '',
    tempPassword: '',
    phones: [''],
    depId: ''
  });

  // Determine role options based on selected department
  const roleOptions = formData?.depId
    ? getJobDropdownOptions(allJobs, formData.depId)
    : [];

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [phoneErrors, setPhoneErrors] = useState(['']);

  // Field-level validation
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '', lastName: '', email: '', username: '',
    tempPassword: '', salary: ''
  });
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName': return validateName(value, 'First name');
      case 'lastName': return validateName(value, 'Last name');
      case 'email': return validateEmail(value);
      case 'username': return validateUsername(value);
      case 'tempPassword': return validatePassword(value, 'Temporary password');
      case 'salary':
        return validateSalary(value, formData.role, salaryRanges);
      default: return '';
    }
  };

  const handleFieldChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setFieldErrors({ ...fieldErrors, [name]: validateField(name, value) });
    }
  };

  const handleFieldBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    setFieldErrors({ ...fieldErrors, [name]: validateField(name, formData[name]) });
  };

  const getInputClass = (name) => {
    const hasError = fieldErrors[name] && touched[name];
    return `w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 transition-all font-medium ${
      hasError
        ? 'bg-red-50 border border-red-300 focus:ring-red-400'
        : 'bg-gray-50 border border-gray-200 focus:ring-[#004a99]'
    }`;
  };

  const handleDepartmentChange = (depId) => {
    const id = depId ? Number(depId) : '';
    const options = id ? getJobDropdownOptions(allJobs, id) : [];
    const role = options.length > 0 ? options[0].value : '';
    setFormData({ ...formData, depId: id, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const fieldsToCheck = ['firstName', 'lastName', 'email', 'username', 'tempPassword', 'salary'];
    const newErrors = {};
    let hasFieldError = false;
    fieldsToCheck.forEach(name => {
      const err = validateField(name, formData[name]);
      newErrors[name] = err;
      if (err) hasFieldError = true;
    });
    setFieldErrors(newErrors);
    setTouched(Object.fromEntries(fieldsToCheck.map(f => [f, true])));

    // Validate role is selected
    if (!formData.role) {
      setError('Please select a department and role.');
      return;
    }

    // Validate all phones before submitting
    const errors = validatePhones(formData.phones);
    setPhoneErrors(errors);
    const hasEmptyFirst = !formData.phones[0] || formData.phones[0].trim() === '';
    const hasAnyError = errors.some(err => err !== '');
    if (hasFieldError || hasEmptyFirst || hasAnyError) {
      setError('Please fix the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const staffData = JSON.parse(localStorage.getItem('staff') || '{}');
      
await axios.post('http://localhost:3000/staff', {
  firstName:    formData.firstName,
  lastName:     formData.lastName,
  email:        formData.email,
  role:         formData.role,
  salary:       Number(formData.salary) || 5000,
  username:     formData.username,
  password:     formData.tempPassword,
  phones:       formData.phones,
  depId:        formData.depId || null,
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
    setPhoneErrors([...phoneErrors, '']);
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
  // Validate on change
  const newErrors = [...phoneErrors];
  if (value.trim() === '') {
    newErrors[index] = index === 0 ? 'Primary phone is required.' : '';
  } else {
    newErrors[index] = validateEgyptianPhone(value);
  }
  setPhoneErrors(newErrors);
};

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
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
            <p className="text-gray-500 mt-2"><b>{formData.firstName} {formData.lastName}</b> has been added as <b>{stripJobPrefix(formData.role)}</b>.</p>
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
              )}                <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                    <ShieldCheck size={14} className="text-[#a37e2c]" /> First Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ahmed"
                    className={getInputClass('firstName')}
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    onBlur={() => handleFieldBlur('firstName')}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.firstName && touched.firstName && (
                    <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                    <ShieldCheck size={14} className="text-[#a37e2c]" /> Last Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Kamal"
                    className={getInputClass('lastName')}
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    onBlur={() => handleFieldBlur('lastName')}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.lastName && touched.lastName && (
                    <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                    <Mail size={14} className="text-[#a37e2c]" /> Work Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="username@eui.bank"
                    className={getInputClass('email')}
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.email && touched.email && (
                    <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.email}
                    </p>
                  )}
                </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                  <Building2 size={14} className="text-[#a37e2c]" /> Department
                </label>
                <select
                  value={formData.depId || ''}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] appearance-none font-medium"
                  disabled={isSubmitting}
                >
                  <option value="">Select Department</option>
                  {departments.map(dep => (
                    <option key={dep.DEP_ID} value={dep.DEP_ID}>{dep.DEP_NAME}</option>
                  ))}
                </select>
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
                    disabled={isSubmitting || !formData.depId}
                  >
                    {!formData.depId ? (
                      <option value="">Select a department first</option>
                    ) : roleOptions.length === 0 ? (
                      <option value="">No roles available</option>
                    ) : (
                      roleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Salary ($)</label>
                  <input
                    type="number"
                    min={salaryRanges[formData.role]?.min || 1000}
                    max={salaryRanges[formData.role]?.max || undefined}
                    placeholder={salaryRanges[formData.role] ? `${salaryRanges[formData.role].min.toLocaleString()} - ${salaryRanges[formData.role].max.toLocaleString()}` : '5000'}
                    className={getInputClass('salary')}
                    value={formData.salary}
                    onChange={(e) => handleFieldChange('salary', e.target.value)}
                    onBlur={() => handleFieldBlur('salary')}
                    disabled={isSubmitting}
                  />
                  {!fieldErrors.salary && salaryRanges[formData.role] && (
                    <p className="text-[10px] text-gray-400 font-medium ml-1 flex items-center gap-1">
                      <Briefcase size={10} className="text-[#a37e2c]" />
                      Range for {stripJobPrefix(formData.role)}: <b>${salaryRanges[formData.role].min.toLocaleString()}</b> — <b>${salaryRanges[formData.role].max.toLocaleString()}</b>
                    </p>
                  )}
                  {fieldErrors.salary && touched.salary && (
                    <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.salary}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
   <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
     <ShieldCheck size={14} className="text-[#a37e2c]" /> Username
   </label>    <input
      required
      type="text"
      placeholder="ahmed.kamal"
      className={getInputClass('username')}
      value={formData.username}
      onChange={(e) => handleFieldChange('username', e.target.value)}
      onBlur={() => handleFieldBlur('username')}
      disabled={isSubmitting}
    />
    {fieldErrors.username && touched.username && (
      <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
        <AlertCircle size={12} /> {fieldErrors.username}
      </p>
    )}
 </div>

 <div className="space-y-2">
   <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
     <Lock size={14} className="text-[#a37e2c]" /> Temporary Password
   </label>    <input
      required
      type="text"
      placeholder="e.g. EUI@2025"
      className={getInputClass('tempPassword')}
      value={formData.tempPassword}
      onChange={(e) => handleFieldChange('tempPassword', e.target.value)}
      onBlur={() => handleFieldBlur('tempPassword')}
      disabled={isSubmitting}
    />
    {fieldErrors.tempPassword && touched.tempPassword && (
      <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
        <AlertCircle size={12} /> {fieldErrors.tempPassword}
      </p>
    )}
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
    <div key={index} className="flex flex-col gap-1">
      <div className="flex gap-2 items-center">
        <input
          type="tel"
          placeholder={`Phone ${index + 1} (e.g. 01012345678)`}
          className={`flex-1 px-6 py-4 rounded-2xl outline-none focus:ring-2 transition-all font-medium ${
            phoneErrors[index]
              ? 'bg-red-50 border border-red-300 focus:ring-red-400'
              : 'bg-gray-50 border border-gray-200 focus:ring-[#004a99]'
          }`}
          value={phone}
          onChange={(e) => updatePhone(index, e.target.value)}
          disabled={isSubmitting}
        />
        {formData.phones.length > 1 && (
          <button
            type="button"
            onClick={() => {
              const newErrors = [...phoneErrors];
              newErrors.splice(index, 1);
              setPhoneErrors(newErrors);
              removePhone(index);
            }}
            className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-all"
          >
            ✕
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
