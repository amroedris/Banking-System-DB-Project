import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import euiLogo from '../../assets/EUI-Cropped.jpg';

export default function LoanPage() {
  const navigate = useNavigate();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState(5000);
  const [loanTerm, setLoanTerm] = useState(24);
  
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  
  const [activeLoans, setActiveLoans] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [selectedPendingLoanId, setSelectedPendingLoanId] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user')) || { CUSTOMER_ID: 1 };

  // --- EFFECT 1: Fetch and Split Loans by State ---
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/loans/${user.CUSTOMER_ID}`)
      .then(res => res.json())
      .then(data => {
        const allLoans = Array.isArray(data) ? data : [];
        const active  = allLoans.filter(l => l.STATUS?.toLowerCase() === 'approved');
const pending = allLoans.filter(l => l.STATUS?.toLowerCase() === 'pending');
        setActiveLoans(active);
        setPendingLoans(pending);
        if (active.length > 0)  setSelectedLoanId(String(active[0].LOAN_ID));
        if (pending.length > 0) setSelectedPendingLoanId(String(pending[0].LOAN_ID));
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [user.CUSTOMER_ID]);

  // --- EFFECT 2: Fetch Accounts for Payment Modal ---
  useEffect(() => {
    if (isPaymentModalOpen) {
      fetch(`http://localhost:3000/accounts/${user.CUSTOMER_ID}`)
        .then(res => res.json())
        .then(data => {
          const accounts = Array.isArray(data) ? data.filter(acc => acc.STATUS !== 'Closed') : [];
          setUserAccounts(accounts);
          if (accounts.length > 0) setSelectedAccount(accounts[0].ACCOUNT_NUMBER);
        })
        .catch(err => {
          console.error("Failed to load accounts:", err);
          setUserAccounts([]);
        });
    }
  }, [isPaymentModalOpen, user.CUSTOMER_ID]);

  const activeLoan  = activeLoans.find(l => String(l.LOAN_ID) === String(selectedLoanId)) || null;

  // --- CALCULATIONS (active loan only) ---
  const totalLoanWithInterest = activeLoan
    ? Number(activeLoan.LOAN_AMOUNT) + (Number(activeLoan.LOAN_AMOUNT) * Number(activeLoan.INTEREST_RATE) / 100)
    : 0;
  const totalPaid          = Number(activeLoan?.TOTAL_PAID_OFF || 0);
  const remainingBalance   = totalLoanWithInterest - totalPaid;
  const progressPercentage = totalLoanWithInterest > 0 ? (totalPaid / totalLoanWithInterest) * 100 : 0;
  const monthlyPayment     = activeLoan?.MONTHLY_PAYMENT ? Number(activeLoan.MONTHLY_PAYMENT).toFixed(2) : "0.00";

  const monthsRemaining = activeLoan?.DUE_DATE
    ? Math.max(
        ((new Date(activeLoan.DUE_DATE).getFullYear() - new Date().getFullYear()) * 12) +
        (new Date(activeLoan.DUE_DATE).getMonth() - new Date().getMonth()), 0
      )
    : 0;

  const nextInstallmentDate = activeLoan?.START_DATE
    ? new Date(new Date().setMonth(new Date().getMonth() + 1))
    : null;

  const daysUntilNextInstallment = nextInstallmentDate
    ? Math.ceil((nextInstallmentDate - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const estimatedMonthly = ((loanAmount * 1.05) / loanTerm).toFixed(2);

  // --- HANDLERS ---
  const handleApply = async () => {
    try {
      const response = await fetch('http://localhost:3000/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user.CUSTOMER_ID, amount: loanAmount, term: loanTerm, interestRate: 5.0 })
      });
      const result = await response.json();
      if (response.ok) { alert("Application Submitted!"); window.location.reload(); }
      else alert("Application failed: " + (result.message || "Unknown error. Please contact support."));
    } catch {
      alert("Could not connect to the server. Please ensure the backend is running.");
    }
  };

  const handlePayment = async () => {
    if (!activeLoan) return alert("System Error: No active loan found.");
    if (!selectedAccount) return alert("Please select an account to pay from.");
    if (!paymentAmount || Number(paymentAmount) <= 0) { setPaymentError('Please enter a valid payment amount greater than 0.'); return; }
    if (Number(paymentAmount) > remainingBalance) { setPaymentError(`Payment cannot exceed the remaining balance of $${remainingBalance.toFixed(2)}.`); return; }
    setPaymentError('');
    try {
      const response = await fetch('http://localhost:3000/loans/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId: activeLoan.LOAN_ID, accountNumber: selectedAccount, amount: Number(paymentAmount) })
      });
      const result = await response.json();
      if (response.ok) { alert("Payment Successful!"); setIsPaymentModalOpen(false); window.location.reload(); }
      else alert("Payment failed: " + (result.message || "Unknown error"));
    } catch {
      alert("Could not connect to the server. Is your backend running?");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Loan Data...</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <img src={euiLogo} alt="EUI Logo" className="h-20 w-20" />
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            <h1 className="text-2xl font-black text-[#004a99] tracking-tight">Loan Center</h1>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* ======================== */}
            {/* SECTION 1: ACTIVE LOANS  */}
            {/* ======================== */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-6 bg-[#004a99] rounded-full"></span>
                  Active Loans
                </h2>
                {activeLoans.length > 1 && (
                  <select
                    value={selectedLoanId}
                    onChange={(e) => setSelectedLoanId(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 font-bold bg-white shadow-sm outline-none focus:border-[#004a99] text-sm"
                  >
                    {activeLoans.map(loan => (
                      <option key={loan.LOAN_ID} value={loan.LOAN_ID}>
                        Loan #{loan.LOAN_ID} — ${Number(loan.LOAN_AMOUNT).toFixed(2)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {activeLoan ? (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#a37e2c] rounded-full mix-blend-multiply filter blur-[60px] opacity-10"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 relative z-10">
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{activeLoan.STATUS || 'Personal'}</p>
                      <p className="text-4xl font-black text-gray-900">${remainingBalance.toFixed(2)}</p>
                      <p className="text-sm font-medium text-gray-500 mt-1">Remaining Balance</p>
                    </div>
                    <div className="mt-4 sm:mt-0 text-left sm:text-right bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-sm font-bold text-[#004a99]">Due Date: {activeLoan.DUE_DATE ? new Date(activeLoan.DUE_DATE).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-xl font-black text-gray-900">${monthlyPayment}</p>
                      <p className="text-xs text-gray-500 font-bold mt-1">Monthly Installment</p>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                      <span>Paid: ${totalPaid.toFixed(2)}</span>
                      <span>Total: ${totalLoanWithInterest.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                      <div className="bg-[#004a99] h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-gray-500 font-bold">Loan Duration</p>
                      <p className="text-lg font-black text-gray-900">{activeLoan.LOAN_TERM} Months</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-gray-500 font-bold">Remaining Time</p>
                      <p className="text-lg font-black text-gray-900">{monthsRemaining} Months</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-gray-500 font-bold">Next Installment</p>
                      <p className="text-md font-black text-gray-900">{nextInstallmentDate ? nextInstallmentDate.toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-gray-500 font-bold">Days Left</p>
                      <p className="text-lg font-black text-gray-900">{daysUntilNextInstallment} Days</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3 relative z-10">
                    <button onClick={() => setIsPaymentModalOpen(true)} className="flex-1 py-3 bg-[#004a99] text-white font-bold rounded-xl shadow-md hover:bg-[#003d7a] transition-colors">Make a Payment</button>
                    <button onClick={() => setIsDetailsModalOpen(true)} className="flex-1 py-3 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">View Details</button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] p-10 text-center border-2 border-dashed border-gray-200 text-gray-400 font-bold">
                  No active loans found.
                </div>
              )}
            </section>

            {/* ========================= */}
            {/* SECTION 2: PENDING LOANS  */}
            {/* ========================= */}
            {pendingLoans.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-4">
                  <span className="w-2 h-6 bg-yellow-400 rounded-full"></span>
                  Pending Applications
                  <span className="ml-1 px-2.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-black rounded-full">
                    {pendingLoans.length}
                  </span>
                </h2>

                <div className="space-y-4">
                  {pendingLoans.map(loan => {
                    const loanTotal  = Number(loan.LOAN_AMOUNT) + (Number(loan.LOAN_AMOUNT) * Number(loan.INTEREST_RATE) / 100);
                    const monthly    = loan.MONTHLY_PAYMENT
                      ? Number(loan.MONTHLY_PAYMENT).toFixed(2)
                      : (loanTotal / loan.LOAN_TERM).toFixed(2);
                    const isExpanded = selectedPendingLoanId === String(loan.LOAN_ID);

                    return (
                      <div key={loan.LOAN_ID} className="bg-white rounded-2xl border-2 border-yellow-100 shadow-sm overflow-hidden">
                        
                        {/* Row — click to expand / collapse */}
                        <button
                          onClick={() => setSelectedPendingLoanId(isExpanded ? null : String(loan.LOAN_ID))}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-yellow-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-yellow-600 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-black text-gray-900">Loan #{loan.LOAN_ID}</p>
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-black rounded-full">Awaiting Approval</span>
                              </div>
                              <p className="text-sm text-gray-500 font-medium mt-0.5">
                                ${Number(loan.LOAN_AMOUNT).toLocaleString()} &middot; {loan.LOAN_TERM} months &middot; {loan.INTEREST_RATE}% interest
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-gray-400 font-bold">Est. Monthly</p>
                              <p className="text-lg font-black text-gray-900">${monthly}</p>
                            </div>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-6 pb-6 border-t border-yellow-100">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase">Amount</p>
                                <p className="text-base font-black text-gray-900 mt-1">${Number(loan.LOAN_AMOUNT).toLocaleString()}</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase">Term</p>
                                <p className="text-base font-black text-gray-900 mt-1">{loan.LOAN_TERM} mo.</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase">Rate</p>
                                <p className="text-base font-black text-gray-900 mt-1">{loan.INTEREST_RATE}%</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase">Total</p>
                                <p className="text-base font-black text-gray-900 mt-1">${loanTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                              </div>
                            </div>

                            {loan.START_DATE && (
                              <p className="text-xs text-gray-400 font-medium mt-4">
                                Applied on: <span className="font-bold text-gray-600">{new Date(loan.START_DATE).toLocaleDateString()}</span>
                              </p>
                            )}

                            <div className="mt-4 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-yellow-800 font-medium">
                                Your application is being reviewed by a bank employee. You'll be notified once a decision is made. This usually takes 1–3 business days.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ========================= */}
            {/* SECTION 3: APPLY NEW LOAN */}
            {/* ========================= */}
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#a37e2c] rounded-full"></span>
                Apply for a New Loan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#004a99] transition-all group">
                  <div className="w-12 h-12 bg-blue-50 text-[#004a99] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#004a99] group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  <h3 className="font-black text-lg text-gray-900">Personal Loan</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Rates as low as 5.99% APR. Fund your next big project.</p>
                  <button onClick={() => setIsApplyModalOpen(true)} className="text-[#004a99] font-bold text-sm hover:underline flex items-center gap-1">
                    Apply Now <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* ==================== */}
      {/* MODALS               */}
      {/* ==================== */}

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsApplyModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-2xl font-black text-gray-900 mb-6">Loan Application</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold text-gray-700">Loan Amount</label>
                  <span className="text-2xl font-black text-[#004a99]">${loanAmount.toLocaleString()}</span>
                </div>
                <input type="range" min="1000" max="50000" step="500" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#004a99]" />
                <div className="flex justify-between text-xs text-gray-400 font-medium mt-1"><span>$1,000</span><span>$50,000</span></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Loan Term</label>
                <div className="grid grid-cols-3 gap-3">
                  {[12, 24, 36].map(term => (
                    <button key={term} onClick={() => setLoanTerm(term)} className={`py-3 rounded-xl font-black text-sm border-2 transition-all ${loanTerm === term ? 'bg-[#004a99] border-[#004a99] text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {term} mo.
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-bold text-gray-500 uppercase">Estimated Monthly</p>
                  <span className="text-xs font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">5% interest · {loanTerm} months</span>
                </div>
                <p className="text-4xl font-black text-gray-900">${estimatedMonthly}</p>
                <p className="text-xs text-gray-400 mt-2">Total repayment: <span className="font-bold text-gray-600">${(loanAmount * 1.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
              </div>
              <button onClick={handleApply} className="w-full py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-colors">Submit Application</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Make a Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pay From:</label>
                {userAccounts && userAccounts.length > 0 ? (
                  <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-[#004a99] outline-none font-medium">
                    {userAccounts.map((acc, index) => (
                      <option key={`${acc.ACCOUNT_NUMBER}-${index}`} value={acc.ACCOUNT_NUMBER}>
                        {acc.ACCOUNT_TYPE} (***{String(acc.ACCOUNT_NUMBER || "").slice(-4)}) - ${acc.BALANCE}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">No linked accounts found. Please link an account first.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount to Pay:</label>
                <input
                  type="number" placeholder="0.00" value={paymentAmount}
                  onChange={(e) => { setPaymentAmount(e.target.value); if (paymentError) setPaymentError(''); }}
                  className={`w-full p-3 rounded-xl border-2 outline-none font-black text-xl ${paymentError ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-100 focus:border-[#004a99]'}`}
                />
                {paymentError && (
                  <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {paymentError}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl">Cancel</button>
                <button type="button" onClick={handlePayment} disabled={!userAccounts || userAccounts.length === 0} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${!userAccounts || userAccounts.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#004a99] hover:bg-[#003d7a]'}`}>
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && activeLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-2xl font-black text-gray-900 mb-6">Loan Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Loan ID</span><span className="font-bold text-gray-900">#LN-{activeLoan.LOAN_ID}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Interest Rate</span><span className="font-bold text-green-600">{activeLoan.INTEREST_RATE}% Fixed</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Total Term</span><span className="font-bold text-gray-900">{activeLoan.LOAN_TERM} Months</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Status</span><span className="px-3 py-1 bg-blue-100 text-[#004a99] text-xs font-black rounded-full uppercase">{activeLoan.LOAN_STATE}</span></div>
            </div>
            <button onClick={() => setIsDetailsModalOpen(false)} className="w-full mt-8 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200">Close Details</button>
          </div>
        </div>
      )}
    </div>
  );
}