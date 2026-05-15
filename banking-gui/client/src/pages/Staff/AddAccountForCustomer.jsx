import React, { useState, useMemo } from 'react';
import { X, Landmark, Save, AlertCircle, Info } from 'lucide-react';
import axios from 'axios';
import { validateNonNegative, validateAmount } from '../../utils/validation.js';

export default function AddAccountForCustomer({ customerId, customerName, customerDob, branchId, onClose, onSuccess }) {

  // Calculate customer age
  const { age, isUnder18, isUnder16 } = useMemo(() => {
    if (!customerDob) return { age: null, isUnder18: false, isUnder16: false };
    const dob = new Date(customerDob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return { age, isUnder18: age < 18, isUnder16: age < 16 };
  }, [customerDob]);

  const [formData, setFormData] = useState({
    accountType: isUnder18 ? 'Student' : 'Savings',
    initialDeposit: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [depositError, setDepositError] = useState('');

  if (isUnder16) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden">
          <div className="bg-red-50 p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Creation Restricted</h2>
            <p className="text-gray-600 mb-4">
              Customers must be at least 16 years old to create a bank account.
            </p>
            <p className="text-sm text-gray-500 mb-6">Customer age: {age} years</p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate deposit amount
    const depositErr = formData.initialDeposit !== ''
      ? validateNonNegative(formData.initialDeposit, 'Initial deposit')
      : '';
    setDepositError(depositErr);
    if (depositErr) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`http://localhost:3000/staff/customer/${customerId}/accounts`, {
        accountType: formData.accountType,
        initialDeposit: Number(formData.initialDeposit) || 0,
        branchId: branchId || undefined
      });

      if (response.data.success) {
        onSuccess(response.data.accountNumber);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#004a99] p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">New Account</h2>
              <p className="text-blue-100 text-sm mt-1">for {customerName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {isUnder18 && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-xs font-semibold flex items-start gap-2">
              <Info size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p>Customer age: {age} years</p>
                <p>Only Student accounts are available for customers under 18.</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
              <Landmark size={14} className="text-[#a37e2c]" /> Account Type
            </label>
            <select
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] font-medium"
              value={formData.accountType}
              onChange={(e) => setFormData({...formData, accountType: e.target.value})}
              disabled={isSubmitting || isUnder18}
            >
              {isUnder18 ? (
                <option value="Student">Student Account</option>
              ) : (
                <>
                  <option value="Savings">Savings Account</option>
                  <option value="Retail">Retail Account</option>
                  <option value="Corporate">Corporate Account</option>
                  <option value="Joint">Joint Account</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
              <Landmark size={14} className="text-[#a37e2c]" /> Initial Deposit ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 font-medium ${
                depositError
                  ? 'bg-red-50 border border-red-300 focus:ring-red-400'
                  : 'bg-gray-50 border border-gray-200 focus:ring-[#004a99]'
              }`}
              value={formData.initialDeposit}
              onChange={(e) => {
                setFormData({...formData, initialDeposit: e.target.value});
                if (depositError) setDepositError('');
              }}
              disabled={isSubmitting}
            />
            {depositError && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {depositError}
              </p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-[#004a99] text-white rounded-3xl font-bold shadow-xl shadow-blue-100 hover:bg-[#003d7a] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}