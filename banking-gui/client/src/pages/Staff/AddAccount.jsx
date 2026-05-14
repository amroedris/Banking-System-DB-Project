import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, Save, AlertCircle, CheckCircle, Landmark, MapPin, Key } from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png';

export default function AddAccount() {
  const navigate = useNavigate();
  
  // 1. Explicit state for every single database column
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
    phone: '', // Kept this so your Customer_Phone insert doesn't break
    username: '',
    password: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 2. Direct mapping: exactly what is typed is exactly what is sent
      const response = await axios.post('http://localhost:3000/staff/customers', {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dob: formData.dob,
        street: formData.street,
        city: formData.city,
        governorate: formData.governorate,
        nationalId: formData.nationalId,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        password: formData.password
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

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
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
                  value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} disabled={isSubmitting} />
                  
                <InputGroup label="Middle Name" type="text" placeholder="Optional" 
                  value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value})} disabled={isSubmitting} required={false} />
                  
                <InputGroup label="Last Name" type="text" placeholder="e.g. Edris" 
                  value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} disabled={isSubmitting} />
                
                <InputGroup label="Date of Birth" type="date" 
                  value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} disabled={isSubmitting} />
                
                <InputGroup label="National ID" type="text" placeholder="14-digit number" 
                  value={formData.nationalId} onChange={(e) => setFormData({...formData, nationalId: e.target.value})} disabled={isSubmitting} />

                {/* --- CONTACT SECTION --- */}
                <div className="md:col-span-2 flex items-center gap-2 text-[#a37e2c] font-bold text-xs uppercase tracking-widest mb-2 mt-4 border-t pt-6">
                  <Landmark size={14} /> Contact Details
                </div>

                <InputGroup label="Email Address" type="email" placeholder="name@example.com" 
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={isSubmitting} />

                <InputGroup label="Phone Number" type="text" placeholder="010..." 
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={isSubmitting} />

                {/* --- ADDRESS SECTION --- */}
                <div className="md:col-span-2 flex items-center gap-2 text-[#a37e2c] font-bold text-xs uppercase tracking-widest mb-2 mt-4 border-t pt-6">
                  <MapPin size={14} /> Home Address
                </div>

                <div className="md:col-span-2">
                    <InputGroup label="Street Address" type="text" placeholder="e.g. 123 Academy St" 
                    value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} disabled={isSubmitting} />
                </div>
                
                <InputGroup label="City" type="text" placeholder="e.g. New Cairo" 
                  value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} disabled={isSubmitting} />

                <InputGroup label="Governorate" type="text" placeholder="e.g. Cairo" 
                  value={formData.governorate} onChange={(e) => setFormData({...formData, governorate: e.target.value})} disabled={isSubmitting} />

                {/* --- CREDENTIALS SECTION --- */}
                <div className="md:col-span-2 flex items-center gap-2 text-[#a37e2c] font-bold text-xs uppercase tracking-widest mb-2 mt-4 border-t pt-6">
                  <Key size={14} /> System Credentials
                </div>

                <InputGroup label="Username" type="text" placeholder="e.g. amr_customer" 
                  value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} disabled={isSubmitting} />

                <InputGroup label="Temporary Password" type="text" placeholder="e.g. 123" 
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} disabled={isSubmitting} />


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

// Updated InputGroup to accept 'required' flag (defaults to true)
function InputGroup({ label, required = true, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">
        {label} {!required && <span className="text-gray-300 normal-case font-normal">(Optional)</span>}
      </label>
      <input 
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold text-gray-700 placeholder:text-gray-300 transition-all" 
        {...props} 
        required={required} 
      />
    </div>
  );
}