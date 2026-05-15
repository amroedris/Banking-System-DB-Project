import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import euiLogo from '../../assets/EUI-Cropped.jpg';
import {
  validateName, validateEmail, validateEgyptianPhone,
  validatePassword, validateConfirmPassword
} from '../../utils/validation.js';

export default function EditProfilePage() {

  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState('personal');
  const [personalError, setPersonalError] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [personalSuccess, setPersonalSuccess] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Form State
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    governorate: '',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Personal info validation
  const [personalErrors, setPersonalErrors] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', governorate: ''
  });
  const [personalTouched, setPersonalTouched] = useState({});

  // Security validation
  const [secErrors, setSecErrors] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [secTouched, setSecTouched] = useState({});

  const validatePersonalField = (name, value) => {
    switch (name) {
      case 'firstName': return validateName(value, 'First name');
      case 'lastName': return validateName(value, 'Last name');
      case 'email': return validateEmail(value);
      case 'phone': return value.trim() === '' ? '' : validateEgyptianPhone(value);
      case 'street': return value.trim() ? '' : 'Street address is required.';
      case 'city': return value.trim() ? '' : 'City is required.';
      case 'governorate': return value.trim() ? '' : 'Governorate is required.';
      default: return '';
    }
  };

  const getPersonalClass = (name) => {
    const hasError = personalErrors[name] && personalTouched[name];
    return `w-full px-4 py-3 rounded-xl border outline-none font-semibold transition-all focus:bg-white focus:ring-2 focus:outline-none ${
      hasError
        ? 'bg-red-50 border-red-300 focus:ring-red-400'
        : 'bg-gray-50 border-gray-200 focus:ring-[#004a99]'
    }`;
  };

  const handlePersonalBlur = (name) => {
    setPersonalTouched({ ...personalTouched, [name]: true });
    setPersonalErrors({ ...personalErrors, [name]: validatePersonalField(name, personalData[name]) });
  };

  const handlePersonalChange = (name, value) => {
    setPersonalData({ ...personalData, [name]: value });
    if (personalTouched[name]) {
      setPersonalErrors({ ...personalErrors, [name]: validatePersonalField(name, value) });
    }
  };

  const validateSecField = (name, value) => {
    switch (name) {
      case 'currentPassword': return value ? '' : 'Current password is required.';
      case 'newPassword': return validatePassword(value, 'New password');
      case 'confirmPassword': return validateConfirmPassword(securityData.newPassword, value);
      default: return '';
    }
  };

  const getSecClass = (name) => {
    const hasError = secErrors[name] && secTouched[name];
    return `w-full px-4 py-3 rounded-xl border outline-none font-semibold transition-all ${
      hasError
        ? 'bg-red-50 border-red-300 focus:ring-2 focus:ring-red-400'
        : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#004a99]'
    }`;
  };

  const handleSecBlur = (name) => {
    setSecTouched({ ...secTouched, [name]: true });
    setSecErrors({ ...secErrors, [name]: validateSecField(name, securityData[name]) });
  };

  const handleSecChange = (name, value) => {
    const newData = { ...securityData, [name]: value };
    setSecurityData(newData);
    if (secTouched[name]) {
      setSecErrors({ ...secErrors, [name]: validateSecField(name, value) });
    }
    // Re-validate confirmPassword when newPassword changes
    if (name === 'newPassword' && secTouched.confirmPassword && newData.confirmPassword) {
      setSecErrors(prev => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, newData.confirmPassword)
      }));
    }
  };

  // ---------------- PERSONAL INFO SAVE ----------------
  const handlePersonalSave = async (e) => {

    e.preventDefault();
    setPersonalError('');
    setPersonalSuccess('');

    // Validate all fields
    const fields = ['firstName', 'lastName', 'email', 'street', 'city', 'governorate'];
    const newErrors = {};
    let hasError = false;
    fields.forEach(name => {
      const err = validatePersonalField(name, personalData[name]);
      newErrors[name] = err;
      if (err) hasError = true;
    });
    // Phone is optional but validate if filled
    const phoneErr = validatePersonalField('phone', personalData.phone);
    newErrors.phone = phoneErr;
    if (phoneErr) hasError = true;

    setPersonalErrors(newErrors);
    setPersonalTouched(Object.fromEntries([...fields, 'phone'].map(f => [f, true])));

    if (hasError) return;

    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    try {

      await axios.put(
        `http://localhost:3000/customer/${storedUser.CUSTOMER_ID}`,
        {
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          email: personalData.email,
          phone: personalData.phone,
          street: personalData.street,
          city: personalData.city,
          governorate: personalData.governorate
        }
      );

      // Update localStorage too
      const updatedUser = {
        ...storedUser,
        FIRST_NAME: personalData.firstName,
        LAST_NAME: personalData.lastName,
        EMAIL: personalData.email
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setPersonalSuccess("Personal information updated successfully!");

    } catch (err) {

      console.error(err);
      setPersonalError(
        err.response?.data?.message ||
        "Failed to update information"
      );

    }
  };

  // ---------------- PASSWORD SAVE ----------------
  const handleSecuritySave = async (e) => {

    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    // Validate all fields
    const fields = ['currentPassword', 'newPassword', 'confirmPassword'];
    const newErrors = {};
    let hasError = false;
    fields.forEach(name => {
      const err = validateSecField(name, securityData[name]);
      newErrors[name] = err;
      if (err) hasError = true;
    });
    setSecErrors(newErrors);
    setSecTouched(Object.fromEntries(fields.map(f => [f, true])));

    if (hasError) return;

    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    try {

      const response = await axios.put(
        `http://localhost:3000/customer-password/${storedUser.CUSTOMER_ID}`,
        {
          currentPassword:
            securityData.currentPassword,

          newPassword:
            securityData.newPassword
        }
      );

      setSecuritySuccess(response.data.message);

      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (err) {

      console.error(err);
      setSecurityError(
        err.response?.data?.message ||
        "Password update failed"
      );

    }
  };

  // ---------------- LOAD CUSTOMER DATA ----------------
  useEffect(() => {

    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (!storedUser) {
      navigate('/');
      return;
    }

    axios
      .get(
        `http://localhost:3000/customer/${storedUser.CUSTOMER_ID}`
      )
      .then((response) => {

        const data = response.data;

        setPersonalData({
          firstName: data.FIRST_NAME || '',
          lastName: data.LAST_NAME || '',
          email: data.EMAIL || '',
          phone: data.PHONE || '',
          street: data.STREET || '',
          city: data.CITY || '',
          governorate: data.GOVERNORATE || '',
        });

      })
      .catch((err) => {
        console.error(err);
      });

  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <img src={euiLogo} alt="EUI Logo" className="h-16 w-16" />
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            <div>
              <h1 className="text-2xl font-black text-[#004a99] tracking-tight">
                Account Settings
              </h1>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>

            <span className="hidden sm:inline">
              Back to Dashboard
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 shrink-0">

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">

              <nav className="flex flex-col">

                <button 
                  onClick={() => setActiveTab('personal')}
                  className={`flex items-center gap-3 px-6 py-4 font-bold text-left transition-all ${
                    activeTab === 'personal'
                      ? 'bg-[#004a99] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>

                  Personal Info
                </button>

                <button 
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 px-6 py-4 font-bold text-left transition-all border-t border-gray-100 ${
                    activeTab === 'security'
                      ? 'bg-[#004a99] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>

                  Security
                </button>

              </nav>

            </div>

          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1">

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative min-h-[500px]">
              
              {/* Background Blob Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#004a99] rounded-full mix-blend-multiply filter blur-[80px] opacity-5 pointer-events-none"></div>

              <div className="p-8 sm:p-12 relative z-10">
                
                {/* PERSONAL INFO TAB */}
                {activeTab === 'personal' && (

                  <div className="animate-fade-in">

                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                      Personal Information
                    </h2>

                    <p className="text-gray-500 font-medium mb-8">
                      Update your contact details and how we reach you.
                    </p>

                    <form onSubmit={handlePersonalSave} className="space-y-6">

                      {personalSuccess && (
                        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                          <AlertCircle size={18} />
                          <span className="text-sm font-medium">{personalSuccess}</span>
                        </div>
                      )}

                      {personalError && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                          <AlertCircle size={18} />
                          <span className="text-sm font-medium">{personalError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            required
                            value={personalData.firstName}
                            onChange={(e) => handlePersonalChange('firstName', e.target.value)}
                            onBlur={() => handlePersonalBlur('firstName')}
                            className={getPersonalClass('firstName')}
                          />
                          {personalErrors.firstName && personalTouched.firstName && (
                            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {personalErrors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            required
                            value={personalData.lastName}
                            onChange={(e) => handlePersonalChange('lastName', e.target.value)}
                            onBlur={() => handlePersonalBlur('lastName')}
                            className={getPersonalClass('lastName')}
                          />
                          {personalErrors.lastName && personalTouched.lastName && (
                            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {personalErrors.lastName}
                            </p>
                          )}
                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={personalData.email}
                            onChange={(e) => handlePersonalChange('email', e.target.value)}
                            onBlur={() => handlePersonalBlur('email')}
                            className={getPersonalClass('email')}
                          />
                          {personalErrors.email && personalTouched.email && (
                            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {personalErrors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Phone (Optional)
                          </label>
                          <input
                            type="text"
                            value={personalData.phone}
                            onChange={(e) => handlePersonalChange('phone', e.target.value)}
                            onBlur={() => handlePersonalBlur('phone')}
                            className={getPersonalClass('phone')}
                            placeholder="01012345678"
                          />
                          {personalErrors.phone && personalTouched.phone && (
                            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {personalErrors.phone}
                            </p>
                          )}
                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Street
                          </label>
                          <input
                            type="text"
                            required
                            value={personalData.street}
                            onChange={(e) => handlePersonalChange('street', e.target.value)}
                            onBlur={() => handlePersonalBlur('street')}
                            className={getPersonalClass('street')}
                          />
                          {personalErrors.street && personalTouched.street && (
                            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {personalErrors.street}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            required
                            value={personalData.city}
                            onChange={(e) => handlePersonalChange('city', e.target.value)}
                            onBlur={() => handlePersonalBlur('city')}
                            className={getPersonalClass('city')}
                          />
                          {personalErrors.city && personalTouched.city && (
                            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {personalErrors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Governorate
                          </label>
                          <input
                            type="text"
                            required
                            value={personalData.governorate}
                            onChange={(e) => handlePersonalChange('governorate', e.target.value)}
                            onBlur={() => handlePersonalBlur('governorate')}
                            className={getPersonalClass('governorate')}
                          />
                          {personalErrors.governorate && personalTouched.governorate && (
                            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {personalErrors.governorate}
                            </p>
                          )}
                        </div>

                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          className="py-3 px-8 bg-[#004a99] text-white font-bold rounded-xl shadow-md hover:bg-[#003d7a] transition-all active:scale-95"
                        >
                          Save Changes
                        </button>
                      </div>

                    </form>

                  </div>

                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (

                  <div className="animate-fade-in">

                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                      Security Settings
                    </h2>

                    <p className="text-gray-500 font-medium mb-8">
                      Update your password and secure your account.
                    </p>

                    <form onSubmit={handleSecuritySave} className="space-y-6 max-w-lg">

                      {securitySuccess && (
                        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                          <AlertCircle size={18} />
                          <span className="text-sm font-medium">{securitySuccess}</span>
                        </div>
                      )}

                      {securityError && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                          <AlertCircle size={18} />
                          <span className="text-sm font-medium">{securityError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={securityData.currentPassword}
                          onChange={(e) => handleSecChange('currentPassword', e.target.value)}
                          onBlur={() => handleSecBlur('currentPassword')}
                          className={getSecClass('currentPassword')}
                          placeholder="••••••••"
                        />
                        {secErrors.currentPassword && secTouched.currentPassword && (
                          <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {secErrors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-6 mt-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={securityData.newPassword}
                          onChange={(e) => handleSecChange('newPassword', e.target.value)}
                          onBlur={() => handleSecBlur('newPassword')}
                          className={getSecClass('newPassword')}
                          placeholder="••••••••"
                        />
                        {secErrors.newPassword && secTouched.newPassword && (
                          <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {secErrors.newPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={securityData.confirmPassword}
                          onChange={(e) => handleSecChange('confirmPassword', e.target.value)}
                          onBlur={() => handleSecBlur('confirmPassword')}
                          className={getSecClass('confirmPassword')}
                          placeholder="••••••••"
                        />
                        {secErrors.confirmPassword && secTouched.confirmPassword && (
                          <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {secErrors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 flex justify-start">
                        <button
                          type="submit"
                          disabled={
                            !securityData.currentPassword ||
                            !securityData.newPassword
                          }
                          className="py-3 px-8 bg-[#004a99] text-white font-bold rounded-xl shadow-md hover:bg-[#003d7a] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                          Update Password
                        </button>
                      </div>

                    </form>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}