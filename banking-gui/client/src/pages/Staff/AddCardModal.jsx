import React, { useState } from 'react';
import { X, CreditCard, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { validateCreditLimit } from '../../utils/validation.js';

export default function AddCardModal({ accountNumber, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    cardType: 'Debit',
    cardLimit: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [limitError, setLimitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.cardType === 'Credit') {
      const err = validateCreditLimit(formData.cardLimit);
      setLimitError(err);
      if (err) return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`http://localhost:3000/staff/account/${accountNumber}/cards`, {
        cardType: formData.cardType,
        cardLimit: formData.cardType === 'Credit' ? (Number(formData.cardLimit) || 5000) : null
      });

      if (response.data.success) {
        onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create card. Please try again.');
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
              <h2 className="text-2xl font-bold">New Card</h2>
              <p className="text-blue-100 text-sm mt-1">for Account #{accountNumber}</p>
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
              <CreditCard size={14} className="text-[#a37e2c]" /> Card Type
            </label>
            <select
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] font-medium"
              value={formData.cardType}
              onChange={(e) => setFormData({...formData, cardType: e.target.value})}
              disabled={isSubmitting}
            >
              <option value="Debit">Debit</option>
              <option value="Credit">Credit</option>
              <option value="Prepaid">Prepaid</option>
            </select>
          </div>

          {formData.cardType === 'Credit' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
                <CreditCard size={14} className="text-[#a37e2c]" /> Card Limit ($)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                placeholder="5000"
                className={`w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 font-medium ${
                  limitError
                    ? 'bg-red-50 border border-red-300 focus:ring-red-400'
                    : 'bg-gray-50 border border-gray-200 focus:ring-[#004a99]'
                }`}
                value={formData.cardLimit}
                onChange={(e) => {
                  setFormData({...formData, cardLimit: e.target.value});
                  if (limitError) setLimitError('');
                }}
                disabled={isSubmitting}
              />
              {limitError && (
                <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {limitError}
                </p>
              )}
            </div>
          )}

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-xs text-amber-700 font-medium">
              A new card number, CVV, and expiry date will be auto-generated. The card will be issued as <strong>Active</strong>.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-[#004a99] text-white rounded-3xl font-bold shadow-xl shadow-blue-100 hover:bg-[#003d7a] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSubmitting ? 'Creating Card...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
