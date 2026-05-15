import React, { useState } from 'react';
import { X, CreditCard, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function EditLimitModal({ cardId, currentLimit, onClose, onSuccess }) {
  const [newLimit, setNewLimit] = useState(currentLimit || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const limitValue = Number(newLimit);
    if (!limitValue || limitValue < 100) {
      setError("Limit must be a valid number of at least $100.");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.put(`http://localhost:3000/staff/cards/${cardId}/limit`, {
        newLimit: limitValue
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update limit.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#004a99] p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Edit Credit Limit</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
              <AlertCircle size={16} />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase ml-1">
              <CreditCard size={14} className="text-[#a37e2c]" /> New Limit ($)
            </label>
            <input
              type="number"
              min="100"
              step="100"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#004a99] font-bold text-gray-800 text-lg"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#004a99] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-[#003d7a] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}