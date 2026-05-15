import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

import euiLogo from '../assets/eui-logo.png';
import euiLogo2 from '../assets/EUI.jpg';

export default function LoginPage() {

  const navigate = useNavigate();

  const [role, setRole] = useState('customer');

  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  const [errors, setErrors] = useState({ id: '', password: '' });
  const [touched, setTouched] = useState({ id: false, password: false });

  const validateField = (name, value) => {
    if (!value || value.trim() === '') {
      return name === 'id' ? 'Username is required.' : 'Password is required.';
    }
    if (name === 'password' && value.length < 3) {
      return 'Password must be at least 3 characters.';
    }
    return '';
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, formData[name]) });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    // Validate all fields before submitting
    const idError = validateField('id', formData.id);
    const passError = validateField('password', formData.password);
    setErrors({ id: idError, password: passError });
    setTouched({ id: true, password: true });

    if (idError || passError) {
      return;
    }

    try {

      // =========================
      // CUSTOMER LOGIN
      // =========================
      if (role === 'customer') {

        const response = await axios.post(
          'http://localhost:3000/login',
          {
            us: formData.id,
            pass: formData.password
          }
        );

        if (response.data.success) {

          // Save user data locally
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );

          // Navigate to customer dashboard
          navigate('/dashboard');

        } else {

          alert(response.data.message);
        }
      }

      // =========================
      // STAFF LOGIN
      // =========================
      else {

        const response = await axios.post(
          'http://localhost:3000/staff-login',
          {
            us: formData.id,
            pass: formData.password
          }

        );

        if (response.data.success) {

          localStorage.setItem(
            "staff",
            JSON.stringify(response.data.user)
          );

          // Navigate to staff dashboard
          navigate('/staff-dashboard');

        } else {

          alert(response.data.message);
        }
      }

    } catch (error) {

      console.error(error);

      alert("Server error. Make sure backend is running.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f3f4f6] overflow-hidden px-4">

      {/* BACKGROUND ANIMATIONS */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-[#004a99] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob"></div>

      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-[#a37e2c] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob animation-delay-2000"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row w-full max-w-4xl overflow-hidden border border-white/5">

        {/* LEFT IMAGE */}
        <div className="lg:w-1/2 hidden lg:block relative">

          <img
            src={euiLogo2}
            alt="Banking"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-[#FFFFFF] opacity-10"></div>

        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center bg-[#f8f9fa]">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-8">

            <img
              src={euiLogo}
              alt="EUI Logo"
              className="h-48 mb-1 object-contain"
            />

            <h1 className="text-xl font-bold text-[#004a99] text-center">
              Digital Banking Portal
            </h1>

          </div>

          {/* ROLE TABS */}
          <div className="flex bg-gray-200 p-1 rounded-xl mb-6">

            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 py-2 px-4 rounded-lg transition font-semibold ${
                role === 'customer'
                  ? 'bg-[#004a99] text-white shadow-md'
                  : 'text-gray-500 hover:text-[#004a99]'
              }`}
            >
              Customer
            </button>

            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`flex-1 py-2 px-4 rounded-lg transition font-semibold ${
                role === 'staff'
                  ? 'bg-[#004a99] text-white shadow-md'
                  : 'text-gray-500 hover:text-[#004a99]'
              }`}
            >
              Staff
            </button>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >

            {/* ID FIELD */}
            <div className="flex flex-col gap-1">
              <input
                type="text"
                required
                placeholder={role === 'customer' ? "Username" : "Username"}
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                onBlur={() => handleBlur('id')}
                className={`w-full px-4 py-3 rounded-xl bg-white border focus:outline-none focus:ring-2 transition ${
                  errors.id && touched.id
                    ? 'border-red-300 focus:ring-red-400 bg-red-50'
                    : 'border-gray-300 focus:ring-[#a37e2c]'
                }`}
              />
              {errors.id && touched.id && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 ml-1">
                  <AlertCircle size={12} /> {errors.id}
                </p>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div className="flex flex-col gap-1">
              <input
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full px-4 py-3 rounded-xl bg-white border focus:outline-none focus:ring-2 transition ${
                  errors.password && touched.password
                    ? 'border-red-300 focus:ring-red-400 bg-red-50'
                    : 'border-gray-300 focus:ring-[#a37e2c]'
                }`}
              />
              {errors.password && touched.password && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 ml-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="py-3 px-4 mt-2 rounded-xl bg-[#004a99] text-white font-bold shadow-lg hover:bg-[#003d7a] active:scale-95 transition-all"
            >
              Login to EUI Bank
            </button>

            {/* FOOTER */}
            <p className="flex justify-between text-xs text-gray-500 mt-4 font-medium">

              <a
                href="#"
                className="hover:text-[#a37e2c] transition"
              >
                Security Policy
              </a>

              <span>
                © 2026 EUI Student Project
              </span>

            </p>

          </form>

        </div>
      </div>
    </div>
  );
}