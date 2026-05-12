import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import euiLogo from '../../assets/EUI-Cropped.jpg';

export default function TransferPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [transferType, setTransferType] = useState('internal');
  const [amount, setAmount] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate('/');
      return;
    }

    axios.get(`http://localhost:3000/accounts/${storedUser.CUSTOMER_ID}`)
      .then((response) => {
        setAccounts(response.data);
        if (response.data.length > 0) {
          setFromAccount(response.data[0].ACCOUNT_NUMBER);
          if (response.data.length > 1) {
            setToAccount(response.data[1].ACCOUNT_NUMBER);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  const selectedFromAccount = accounts.find(
    acc => String(acc.ACCOUNT_NUMBER) === String(fromAccount)
  );

  const handleTransfer = async (e) => {
    e.preventDefault();

    const finalToAccount = transferType === 'external'
      ? recipientAccountNumber
      : toAccount;

    if (!finalToAccount) {
      alert("Please select or enter a recipient account.");
      return;
    }

    if (String(fromAccount) === String(finalToAccount)) {
      alert("You cannot transfer to the same account.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/transfer", {
        fromAccount,
        toAccount: finalToAccount,
        amount: parseFloat(amount)
      });

      alert(response.data.message);

      // Reset fields
      setAmount('');
      setRecipientAccountNumber('');
      setRecipientName('');

      // Refresh to update balances
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <img src={euiLogo} alt="EUI Logo" className="h-16 w-16" />
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            <h1 className="text-2xl font-black text-[#004a99] tracking-tight">Fund Transfers</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sm:p-12">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Move Money</h2>

          {/* Transfer Type Toggle */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setTransferType('internal')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                transferType === 'internal'
                  ? 'bg-white text-[#004a99] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Between My Accounts
            </button>
            <button
              type="button"
              onClick={() => setTransferType('external')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                transferType === 'external'
                  ? 'bg-[#004a99] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              To Someone Else
            </button>
          </div>

          <form onSubmit={handleTransfer} className="space-y-6">

            {/* From Account */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                From Account
              </label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full bg-white border border-gray-300 p-3.5 rounded-xl font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-[#004a99]"
              >
                {accounts.map(acc => (
                  <option key={acc.ACCOUNT_NUMBER} value={acc.ACCOUNT_NUMBER}>
                    {acc.ACCOUNT_TYPE} (•••• {String(acc.ACCOUNT_NUMBER).slice(-4)})
                  </option>
                ))}
              </select>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-gray-500">Available Balance:</span>
                <span className="font-bold text-[#004a99]">
                  ${Number(selectedFromAccount?.BALANCE || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* To Account */}
            {transferType === 'internal' ? (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                  To Account
                </label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full bg-white border border-gray-300 p-3.5 rounded-xl font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-[#004a99]"
                >
                  {accounts.map(acc => (
                    <option
                      key={acc.ACCOUNT_NUMBER}
                      value={acc.ACCOUNT_NUMBER}
                      disabled={String(acc.ACCOUNT_NUMBER) === String(fromAccount)}
                    >
                      {acc.ACCOUNT_TYPE} (•••• {String(acc.ACCOUNT_NUMBER).slice(-4)})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Smith"
                    required
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#004a99]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Recipient Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100123456"
                    required
                    value={recipientAccountNumber}
                    onChange={e => setRecipientAccountNumber(e.target.value)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#004a99]"
                  />
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl text-2xl font-black focus:outline-none focus:ring-2 focus:ring-[#004a99] bg-white"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading ||
                !amount ||
                (transferType === 'internal' && String(fromAccount) === String(toAccount))
              }
              className="w-full py-4 bg-[#004a99] text-white text-xl font-black rounded-2xl hover:bg-[#003d7a] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Send Money'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}