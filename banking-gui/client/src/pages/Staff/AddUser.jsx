import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, Save, AlertCircle, CheckCircle, Landmark, MapPin, Key, Plus, Trash2 } from 'lucide-react';
import euiLogo from '../../assets/EUI-Cropped.jpg';
import {
  validateEgyptianPhone, validatePhones,
  validateEmail, validateName, validateUsername,
  validatePassword, validateNationalId
} from '../../utils/validation.js';

export default function AddUser() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    street: '',
    city: '',
    governorate: '',
    nationalId: '',
    email: '',
    phones: [''], // Upgraded to array for multiple phones
    username: '',
    password: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [phoneErrors, setPhoneErrors] = useState(['']);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState(null);

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '', lastName: '', email: '', nationalId: '',
    username: '', password: '', street: '', city: '', governorate: ''
  });

  // Validation helper
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName': return validateName(value, 'First name');
      case 'lastName': return validateName(value, 'Last name');
      case 'email': return validateEmail(value);
      case 'nationalId': return validateNationalId(value);
      case 'username': return validateUsername(value);
      case 'password': return validatePassword(value, 'Password');
      case 'street': return value?.trim() ? '' : 'Street address is required.';
      case 'city': return value?.trim() ? '' : 'City is required.';
      case 'governorate': return value?.trim() ? '' : 'Governorate is required.';
      default: return '';
    }
  };

  // Instantly validate exactly like the phone numbers
  const handleFieldChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: validateField(name, value) });
  };

  // --- PHONE ARRAY HANDLERS ---
  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData({ ...formData, phones: newPhones });
    
    const newPhoneErrors = [...phoneErrors];
    if (value.trim() === '') {
      newPhoneErrors[index] = index === 0 ? 'Primary phone is required.' : '';
    } else {
      newPhoneErrors[index] = validateEgyptianPhone(value);
    }
    setPhoneErrors(newPhoneErrors);
  };

  const addPhoneField = () => {
    if (formData.phones.length < 3) {
      setFormData({ ...formData, phones: [...formData.phones, ''] });
    }
  };

  const removePhoneField = (index) => {
    const newPhones = formData.phones.filter((_, i) => i !== index);
    setFormData({ ...formData, phones: newPhones });
    
    const newErrors = [...phoneErrors];
    newErrors.splice(index, 1);
    setPhoneErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields right before submission
    const fieldsToCheck = ['firstName', 'lastName', 'email', 'nationalId', 'username', 'password', 'street', 'city', 'governorate'];
    const newErrors = {};
    let hasFieldError = false;
    fieldsToCheck.forEach(name => {
      const err = validateField(name, formData[name]);
      newErrors[name] = err;
      if (err) hasFieldError = true;
    });
    setFieldErrors(newErrors);

    // Validate all phones before submitting
    const errors = validatePhones(formData.phones);
    setPhoneErrors(errors);
    const hasEmptyFirst = !formData.phones[0] || formData.phones[0].trim() === '';
    const hasPhoneError = hasEmptyFirst || errors.some(err => err !== '');
    
    if (hasFieldError || hasPhoneError) {
      setError('Please fix the highlighted fields before submitting.');
      return;
    }

    const validPhones = formData.phones.filter(phone => phone && phone.trim() !== '');

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:3000/staff/customers', {
        ...formData,
        phones: validPhones
      });
      
      setNewCustomerId(response.data.customerId);
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the max allowable date (exactly 16 years ago today)
  const maxAllowableDate = new Date();
  maxAllowableDate.setFullYear(maxAllowableDate.getFullYear() - 16);
  const maxDateString = maxAllowableDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={20} />
        </button>
            <img 
              src={euiLogo} 
              alt="EUI Logo" 
              className="h-20 w-20" 
            />
        <h1 className="text-lg font-bold text-[#004a99]">New Customer Onboarding</h1>
      </nav>

      <main className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {isSuccess ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Customer Registered!</h2>
              <p className="text-gray-500 mb-2">Customer #{newCustomerId} has been created successfully.</p>
              <p className="text-sm text-gray-400 mb-8">You can now add an account for this customer from their details page.</p>
              <button 
                onClick={() => navigate(-1)}
                className="px-10 py-4 bg-[#004a99] text-white rounded-2xl font-bold shadow-lg hover:bg-[#003d7a] transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="bg-[#004a99] p-8 text-white flex items-center gap-6">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <UserPlus size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">New Customer Registration</h2>
                  <p className="text-blue-100 text-sm">Register a new client into the EUI Banking System</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {error && (
                  <div className="md:col-span-2 flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {/* --- IDENTITY SECTION --- */}
                <div className="md:col-span-2 flex items-center gap-2 text-[#a37e2c] font-bold text-xs uppercase tracking-widest mb-2 mt-2">
                  <Shield size={14} /> Personal Identity
                </div>
                
                <InputGroup label="First Name" type="text" placeholder="e.g. Amr" 
                  value={formData.firstName} onChange={(e) => handleFieldChange('firstName', e.target.value)} disabled={isSubmitting} error={fieldErrors.firstName} />
                  
                <InputGroup label="Middle Name" type="text" placeholder="Optional" 
                  value={formData.middleName} onChange={(e) => handleFieldChange('middleName', e.target.value)} disabled={isSubmitting} required={false} />
                  
                <InputGroup label="Last Name" type="text" placeholder="e.g. Edris" 
                  value={formData.lastName} onChange={(e) => handleFieldChange('lastName', e.target.value)} disabled={isSubmitting} error={fieldErrors.lastName} />
                
                <InputGroup label="Date of Birth" type="date" max={maxDateString} 
                  value={formData.dob} onChange={(e) => handleFieldChange('dob', e.target.value)} disabled={isSubmitting} error={fieldErrors.dob} />
                
                <InputGroup label="National ID" type="text" placeholder="14-digit number" 
                  value={formData.nationalId} onChange={(e) => handleFieldChange('nationalId', e.target.value)} disabled={isSubmitting} error={fieldErrors.nationalId} />

                
                {/* --- CONTACT SECTION --- */}
                <div className="md:col-span-2 flex items-center gap-2 text-[#a37e2c] font-bold text-xs uppercase tracking-widest mb-2 mt-4 border-t pt-6">
                  <Landmark size={14} /> Contact Details
                </div>

                <InputGroup label="Email Address" type="email" placeholder="name@example.com" 
                  value={formData.email} onChange={(e) => handleFieldChange('email', e.target.value)} disabled={isSubmitting} error={fieldErrors.email} />

                {/* DYNAMIC PHONE FIELDS */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">
                    Phone Numbers (Max 3)
                  </label>
                  {formData.phones.map((phone, index) => (
                    <div key={index} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          placeholder={index === 0 ? "e.g. 01012345678" : `Alternative phone ${index + 1}...`}
                          className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-gray-700 placeholder:text-gray-300 transition-all ${
                            phoneErrors[index]
                              ? 'bg-red-50 border-red-300 focus:ring-2 focus:ring-red-400'
                              : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#a37e2c]'
                          }`}
                          value={phone}
                          onChange={(e) => handlePhoneChange(index, e.target.value)}
                          disabled={isSubmitting}
                          required={index === 0}
                        />
                        {index > 0 && (
                          <button 
                            type="button" 
                            onClick={() => removePhoneField(index)}
                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Remove phone number"
                          >
                            <Trash2 size={20} />
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
                  
                  {formData.phones.length < 3 && (
                    <button 
                      type="button"
                      onClick={() => {
                        setPhoneErrors([...phoneErrors, '']);
                        addPhoneField();
                      }}
                      className="text-xs font-bold text-[#004a99] self-start flex items-center gap-1 hover:underline mt-1"
                    >
                      <Plus size={14} /> Add another number
                    </button>
                  )}
                </div>

                {/* --- ADDRESS SECTION --- */}
                <div className="md:col-span-2 flex items-center gap-2 text-[#a37e2c] font-bold text-xs uppercase tracking-widest mb-2 mt-4 border-t pt-6">
                  <MapPin size={14} /> Home Address
                </div>

                <div className="md:col-span-2">
                    <InputGroup label="Street Address" type="text" placeholder="e.g. 123 Academy St" 
                    value={formData.street} onChange={(e) => handleFieldChange('street', e.target.value)} disabled={isSubmitting} error={fieldErrors.street} />
                </div>
                
                <InputGroup label="City" type="text" placeholder="e.g. New Cairo" 
                  value={formData.city} onChange={(e) => handleFieldChange('city', e.target.value)} disabled={isSubmitting} error={fieldErrors.city} />

                <InputGroup label="Governorate" type="text" placeholder="e.g. Cairo" 
                  value={formData.governorate} onChange={(e) => handleFieldChange('governorate', e.target.value)} disabled={isSubmitting} error={fieldErrors.governorate} />

                {/* --- CREDENTIALS SECTION --- */}
                <div className="md:col-span-2 flex items-center gap-2 text-[#a37e2c] font-bold text-xs uppercase tracking-widest mb-2 mt-4 border-t pt-6">
                  <Key size={14} /> System Credentials
                </div>

                <InputGroup label="Username" type="text" placeholder="e.g. amr_customer" 
                  value={formData.username} onChange={(e) => handleFieldChange('username', e.target.value)} disabled={isSubmitting} error={fieldErrors.username} />

                <InputGroup label="Temporary Password" type="text" placeholder="e.g. 123" 
                  value={formData.password} onChange={(e) => handleFieldChange('password', e.target.value)} disabled={isSubmitting} error={fieldErrors.password} />


                {/* --- SUBMIT BUTTONS --- */}
                <div className="md:col-span-2 pt-6 border-t border-gray-50 flex gap-4 mt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-[#004a99] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#003d7a] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} /> {isSubmitting ? 'Registering...' : 'Register Customer'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => navigate(-1)}
                    className="px-8 bg-gray-50 text-gray-400 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------
// UPGRADED INPUT GROUP COMPONENT
// Handles the styling and rendering of the red error automatically
// ----------------------------------------------------
function InputGroup({ label, required = true, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">
          {label} {!required && <span className="text-gray-300 normal-case font-normal">(Optional)</span>}
        </label>
        <input 
          className={`w-full px-4 py-3 rounded-xl border outline-none font-semibold text-gray-700 placeholder:text-gray-300 transition-all ${
            error 
              ? 'bg-red-50 border-red-300 focus:ring-2 focus:ring-red-400' 
              : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#a37e2c]'
          }`} 
          {...props} 
          required={required} 
        />
      </div>
      {/* If there is an error passed in, render the red warning text */}
      {error && (
        <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}