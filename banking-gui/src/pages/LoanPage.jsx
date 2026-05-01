import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../assets/EUI-Cropped.jpg';

export default function LoanPage() {
        const navigate = useNavigate();
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
             onClick={() => navigate(-1)}
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
                  <button className="flex-1 py-3 bg-[#004a99] text-white font-bold rounded-xl shadow-md hover:bg-[#003d7a] transition-colors">Make a Payment</button>
                  <button className="flex-1 py-3 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">View Details</button>
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
                  <button className="text-[#004a99] font-bold text-sm hover:underline flex items-center gap-1">Apply Now <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
                </div>

                {/* Auto Loan */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#a37e2c] transition-all group">
                  <div className="w-12 h-12 bg-yellow-50 text-[#a37e2c] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#a37e2c] group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  </div>
                  <h3 className="font-black text-lg text-gray-900">Auto Loan</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Get pre-approved before you shop. Competitive rates for new and used cars.</p>
                  <button className="text-[#a37e2c] font-bold text-sm hover:underline flex items-center gap-1">Check Rates <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
                </div>
              </div>
            </section>

          </div>

        </div>
      </main>
    </div>
  );
}