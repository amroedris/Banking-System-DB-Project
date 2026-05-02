import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../../assets/EUI-Cropped.jpg';

export default function TransferPage() {
    const navigate = useNavigate();
  // Dummy account data
  const accounts = [
    { id: '1', name: 'Main Checking', number: '•••• 4092', balance: 12450.00 },
    { id: '2', name: 'High-Yield Savings', number: '•••• 8831', balance: 45200.75 },
  ];

  // Transfer Type State
  const [transferType, setTransferType] = useState('internal'); // 'internal' or 'external'

  // Shared Form State
  const [fromAccount, setFromAccount] = useState(accounts[0].id);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  // Internal Specific State
  const [toAccount, setToAccount] = useState(accounts[1].id);

  // External Specific State
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');

  const handleTransfer = (e) => {
    e.preventDefault();
    
    if (transferType === 'internal') {
      console.log("Internal Transfer:", { from: fromAccount, to: toAccount, amount, memo });
      alert(`Successfully transferred $${amount} internally.`);
    } else {
      console.log("External Transfer:", { from: fromAccount, recipientName, recipientBank, recipientAccountNumber, amount, memo });
      alert(`Successfully initiated external transfer of $${amount} to ${recipientName}.`);
    }

    // Reset common fields
    setAmount('');
    setMemo('');
    setRecipientName('');
    setRecipientBank('');
    setRecipientAccountNumber('');
  };

  const selectedFromAccount = accounts.find(acc => acc.id === fromAccount);

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <img src={euiLogo} alt="EUI Logo" className="h-16 w-16" />
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            <div>
              <h1 className="text-2xl font-black text-[#004a99] tracking-tight">Fund Transfers</h1>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
        
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#004a99] rounded-full mix-blend-multiply filter blur-[80px] opacity-5"></div>
          
          <div className="p-8 sm:p-12 relative z-10">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Move Money</h2>

            {/* TRANSFER TYPE TOGGLE */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => setTransferType('internal')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${transferType === 'internal' ? 'bg-white text-[#004a99] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Between My Accounts
              </button>
              <button 
                onClick={() => setTransferType('external')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${transferType === 'external' ? 'bg-[#004a99] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                To Someone Else
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-6">
              
              {/* FROM ACCOUNT (Shared) */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">From Account</label>
                <select 
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 text-lg rounded-xl focus:ring-[#004a99] focus:border-[#004a99] block p-3.5 shadow-sm font-semibold transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.number})
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-500">Available Balance:</span>
                  <span className="font-bold text-[#004a99]">
                    ${selectedFromAccount?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* DOWN ARROW ICON */}
              <div className="flex justify-center -my-2 relative z-20">
                <div className="bg-white border border-gray-200 p-2 rounded-full shadow-sm text-[#a37e2c]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </div>
              </div>

              {/* DYNAMIC "TO" SECTION */}
              {transferType === 'internal' ? (
                /* INTERNAL TO ACCOUNT */
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">To Account</label>
                  <select 
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 text-lg rounded-xl focus:ring-[#004a99] focus:border-[#004a99] block p-3.5 shadow-sm font-semibold transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id} disabled={acc.id === fromAccount}>
                        {acc.name} ({acc.number}) {acc.id === fromAccount ? '(Selected)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* EXTERNAL RECIPIENT DETAILS */
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">Recipient Details</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input type="text" required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#004a99] focus:outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bank Name</label>
                      <input type="text" required value={recipientBank} onChange={(e) => setRecipientBank(e.target.value)} placeholder="e.g. Chase" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#004a99] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account Number / IBAN</label>
                      <input type="text" required value={recipientAccountNumber} onChange={(e) => setRecipientAccountNumber(e.target.value)} placeholder="Account Number" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#004a99] focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* AMOUNT & MEMO (Shared) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold text-xl">$</span>
                    </div>
                    <input type="number" step="0.01" min="1" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-10 pr-4 py-4 bg-white border-2 border-gray-200 text-gray-900 text-2xl font-black rounded-xl focus:ring-0 focus:border-[#004a99] transition-colors placeholder-gray-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Memo (Optional)</label>
                  <input type="text" maxLength={50} placeholder="What is this for?" value={memo} onChange={(e) => setMemo(e.target.value)} className="w-full px-4 py-4 bg-white border-2 border-gray-200 text-gray-900 text-lg font-medium rounded-xl focus:ring-0 focus:border-[#004a99] transition-colors" />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={!amount || (transferType === 'internal' && fromAccount === toAccount)}
                  className="w-full py-4 px-6 bg-[#004a99] hover:bg-[#003d7a] text-white text-xl font-black rounded-2xl shadow-lg shadow-[#004a99]/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  Send Money
                </button>
              </div>

            </form>
          </div>
        </div>

      </main>
    </div>
  );
}