import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../assets/EUI-Cropped.jpg';

export default function LoanPage() {
  const navigate = useNavigate();
  
  // Popup/Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false); // NEW: Apply Modal State

  // Calculator State
  const [loanAmount, setLoanAmount] = useState(5000);
  const [loanTerm, setLoanTerm] = useState(24); // in months
  const interestRate = 0.05; // 5% flat rate for demo purposes

  // Simple monthly payment calculation for the UI mockup
  const totalRepayment = loanAmount * (1 + interestRate);
  const estimatedMonthly = (totalRepayment / loanTerm).toFixed(2);

  // Dummy Active Loan Data
  const activeLoan = {
    type: 'Student Loan',
    totalAmount: 15000,
    paidAmount: 4500,
    nextPaymentDate: 'May 15, 2026',
    nextPaymentAmount: 350.00,
    interestRate: '4.5% APR',
    loanTerm: '60 Months',
    accountNumber: '•••• 7392'
  };

  const progressPercentage = (activeLoan.paidAmount / activeLoan.totalAmount) * 100;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <img src={euiLogo} alt="EUI Logo" className="h-16 w-16" />
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            <div>
              <h1 className="text-2xl font-black text-[#004a99] tracking-tight">Loan Center</h1>
            </div>
          </div>
          
          <button 
             onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Active Loans & Offers */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ACTIVE LOAN CARD */}
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#004a99] rounded-full"></span>
                Your Active Loans
              </h2>
              
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#a37e2c] rounded-full mix-blend-multiply filter blur-[60px] opacity-10"></div>
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 relative z-10">
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{activeLoan.type}</p>
                    <p className="text-4xl font-black text-gray-900">${(activeLoan.totalAmount - activeLoan.paidAmount).toLocaleString()}</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Remaining Balance</p>
                  </div>
                  <div className="mt-4 sm:mt-0 text-left sm:text-right bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm font-bold text-[#004a99]">Next Payment: {activeLoan.nextPaymentDate}</p>
                    <p className="text-xl font-black text-gray-900">${activeLoan.nextPaymentAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative z-10">
                  <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                    <span>Paid: ${activeLoan.paidAmount.toLocaleString()}</span>
                    <span>Total: ${activeLoan.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                    <div 
                      className="bg-[#004a99] h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3 relative z-10">
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex-1 py-3 bg-[#004a99] text-white font-bold rounded-xl shadow-md hover:bg-[#003d7a] transition-colors"
                  >
                    Make a Payment
                  </button>
                  <button 
                    onClick={() => setIsDetailsModalOpen(true)}
                    className="flex-1 py-3 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </section>

            {/* LOAN OFFERS */}
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#a37e2c] rounded-full"></span>
                Apply for a New Loan
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Personal Loan */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#004a99] transition-all group">
                  <div className="w-12 h-12 bg-blue-50 text-[#004a99] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#004a99] group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <h3 className="font-black text-lg text-gray-900">Personal Loan</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Rates as low as 5.99% APR. Fund your next big project or consolidate debt.</p>
                  
                  {/* NEW: OnClick triggers the apply modal */}
                  <button 
                    onClick={() => setIsApplyModalOpen(true)}
                    className="text-[#004a99] font-bold text-sm hover:underline flex items-center gap-1"
                  >
                    Apply Now <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
  
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* --- MODALS SECTION --- */}

      {/* Make Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h3 className="text-2xl font-black text-[#004a99] mb-2">Make a Payment</h3>
            <p className="text-gray-500 text-sm mb-6">Pay towards your {activeLoan.type}</p>

            <div className="space-y-5">
              {/* Amount to Pay */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#004a99] uppercase">Payment Amount</p>
                  <p className="text-sm text-gray-600">Due by {activeLoan.nextPaymentDate}</p>
                </div>
                <p className="text-2xl font-black text-gray-900">${activeLoan.nextPaymentAmount.toFixed(2)}</p>
              </div>

              {/* Pay From Account */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pay From</label>
                <select className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 focus:ring-2 focus:ring-[#004a99] outline-none font-medium appearance-none">
                  <option>Main Checking (•••• 4092) - $12,450.00</option>
                  <option>High-Yield Savings (•••• 8831) - $45,200.75</option>
                </select>
              </div>

              {/* Submit Button */}
              <button 
                onClick={() => {
                  alert("Payment processed successfully!");
                  setIsPaymentModalOpen(false);
                }}
                className="w-full py-4 bg-[#004a99] text-white font-black rounded-xl shadow-md hover:bg-[#003d7a] transition-all active:scale-95 mt-4"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h3 className="text-2xl font-black text-gray-900 mb-2">Loan Details</h3>
            <p className="text-gray-500 text-sm mb-6">{activeLoan.type} ({activeLoan.accountNumber})</p>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Original Amount</span>
                <span className="font-bold text-gray-900">${activeLoan.totalAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Current Balance</span>
                <span className="font-black text-[#004a99]">${(activeLoan.totalAmount - activeLoan.paidAmount).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Interest Rate</span>
                <span className="font-bold text-gray-900 bg-green-50 text-green-700 px-2 py-1 rounded-md">{activeLoan.interestRate}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Loan Term</span>
                <span className="font-bold text-gray-900">{activeLoan.loanTerm}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Total Paid to Date</span>
                <span className="font-bold text-green-600">${activeLoan.paidAmount.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setIsDetailsModalOpen(false)}
              className="w-full py-4 bg-gray-100 text-gray-800 font-black rounded-xl hover:bg-gray-200 transition-colors mt-8"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* NEW: Apply for a Loan Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="w-12 h-12 bg-blue-50 text-[#004a99] rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2">Personal Loan Info</h3>
            <p className="text-gray-500 text-sm mb-6">Customize your loan terms to see your estimated monthly payments.</p>

            <div className="space-y-6">
              
              {/* Amount Slider */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold text-gray-700">I want to borrow:</label>
                  <span className="text-2xl font-black text-[#004a99]">${loanAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="50000" 
                  step="500" 
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#004a99]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                  <span>$1k</span>
                  <span>$50k</span>
                </div>
              </div>

              {/* Term Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Over a period of:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[12, 24, 36].map(months => (
                    <button
                      key={months}
                      onClick={() => setLoanTerm(months)}
                      className={`py-2 px-4 rounded-xl border-2 font-bold transition-all ${loanTerm === months ? 'border-[#004a99] bg-blue-50 text-[#004a99]' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                    >
                      {months} mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Estimated Monthly</p>
                <p className="text-4xl font-black text-gray-900 mb-2">${estimatedMonthly}</p>
                <p className="text-xs text-gray-500">Based on a 5.00% fixed flat interest rate. Total repayment will be ${(loanAmount * 1.05).toLocaleString()}.</p>
              </div>

              {/* Submit Button */}
              <button 
                onClick={() => {
                  alert("Your application has been submitted securely! Our team will review it and get back to you within 24 hours.");
                  setIsApplyModalOpen(false);
                }}
                className="w-full py-4 bg-gray-900 text-white font-black rounded-xl shadow-md hover:bg-black transition-all active:scale-95"
              >
                Submit Application
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}