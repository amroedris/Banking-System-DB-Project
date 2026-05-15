import React, { useState } from 'react';
import { X, Landmark, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AddAccountForCustomer({ customerId, customerName, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    accountType: 'Savings',
    initialDeposit: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 1. UPDATED URL to hit the exact route we made in index.js
      const response = await axios.post(`http://localhost:3000/staff/customer/${customerId}/accounts`, {
        accountType: formData.accountType,
        initialDeposit: Number(formData.initialDeposit) || 0
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

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
              <Landmark size={14} className="text-[#a37e2c]" /> Account Type
            </label>
            <select
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] font-medium"
              value={formData.accountType}
              onChange={(e) => setFormData({...formData, accountType: e.target.value})}
              disabled={isSubmitting}
            >
              <option value="Savings">Savings</option>
              <option value="Retail">Retail</option>
              <option value="Corporate">Corporate</option>
              <option value="Student">Student</option>
              <option value="Joint">Joint</option>
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
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] font-medium"
              value={formData.initialDeposit}
              onChange={(e) => setFormData({...formData, initialDeposit: e.target.value})}
              disabled={isSubmitting}
            />
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