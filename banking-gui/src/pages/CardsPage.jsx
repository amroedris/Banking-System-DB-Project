import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../assets/EUI-Cropped.jpg';

export default function CardsPage() {
  const navigate = useNavigate();

  // Dummy Cards Data
  const myCards = [
    {
      id: 'c1',
      type: 'Debit',
      name: 'EUI Premium Debit',
      cardholder: 'SARAH CONNOR',
      number: '4092 1122 3344 5566',
      maskedNumber: '•••• •••• •••• 5566',
      expiry: '12/28',
      cvv: '123',
      linkedAccount: 'Main Checking (•••• 4092)',
      status: 'Active',
      color: 'from-[#004a99] to-[#002a59]', // EUI Blue Gradient
    },
    {
      id: 'c2',
      type: 'Credit',
      name: 'EUI Rewards Visa',
      cardholder: 'SARAH CONNOR',
      number: '4147 8831 2290 1234',
      maskedNumber: '•••• •••• •••• 1234',
      expiry: '05/27',
      cvv: '456',
      linkedAccount: 'Credit Line: $8,500.00',
      status: 'Frozen',
      color: 'from-[#a37e2c] to-[#7a5c1a]', // EUI Gold Gradient
    }
  ];

  // State
  const [selectedCardId, setSelectedCardId] = useState(myCards[0].id);
  const [showDetails, setShowDetails] = useState(false);

  // Derived state
  const activeCard = myCards.find(card => card.id === selectedCardId);

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
                    <img src={euiLogo} alt="EUI Logo" className="h-16 w-16" />
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            <div>
              <h1 className="text-2xl font-black text-[#004a99] tracking-tight">My Cards</h1>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: Card Selector & Visuals */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Visual Card Representation */}
            <div className="perspective-1000">
              <div className={`relative w-full aspect-[1.586/1] rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden transition-all duration-500 bg-gradient-to-br ${activeCard.color}`}>
                
                {/* Card Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-16 -mb-16 blur-xl"></div>
                
                {/* Frozen Overlay */}
                {activeCard.status === 'Frozen' && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-20 rounded-3xl">
                    <div className="bg-white/90 text-gray-900 px-6 py-2 rounded-full font-black tracking-widest uppercase text-sm shadow-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      Card Frozen
                    </div>
                  </div>
                )}

                <div className="relative z-10 h-full flex flex-col justify-between">
                  
                  {/* Top Row: Bank Name & Contactless Icon */}
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl sm:text-2xl font-black italic tracking-wider opacity-90">EUI BANK</h2>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
                  </div>

                  {/* Middle: Chip & Card Number */}
                  <div>
                    <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md mb-4 opacity-90 flex items-center justify-center">
                      {/* Decorative chip lines */}
                      <div className="w-full h-px bg-yellow-600/50 absolute"></div>
                      <div className="w-px h-full bg-yellow-600/50 absolute"></div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-mono tracking-widest drop-shadow-md">
                      {showDetails ? activeCard.number : activeCard.maskedNumber}
                    </p>
                  </div>

                  {/* Bottom: Cardholder & Expiry */}
                  <div className="flex justify-between items-end font-mono">
                    <div>
                      <p className="text-xs opacity-70 mb-1">CARDHOLDER</p>
                      <p className="text-sm sm:text-base tracking-widest">{activeCard.cardholder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-70 mb-1">EXPIRES</p>
                      <p className="text-sm sm:text-base tracking-wider">{activeCard.expiry}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* View Details Toggle */}
            <div className="flex justify-center">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm font-bold text-[#004a99] hover:text-[#003d7a] transition-colors bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200"
              >
                {showDetails ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                    Hide Card Details
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Show Card Details
                  </>
                )}
              </button>
            </div>

            {/* Card Switcher / Carousel Dots */}
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {myCards.map((card) => (
                <button 
                  key={card.id}
                  onClick={() => {
                    setSelectedCardId(card.id);
                    setShowDetails(false); // Reset visibility on switch
                  }}
                  className={`flex-1 min-w-[140px] p-4 rounded-2xl border-2 text-left transition-all ${selectedCardId === card.id ? 'border-[#004a99] bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">{card.type}</p>
                  <p className="font-bold text-gray-900 truncate">{card.name}</p>
                  <p className="text-sm font-mono text-gray-400 mt-2">{card.maskedNumber.slice(-4)}</p>
                </button>
              ))}
            </div>

          </div>

          {/* RIGHT SIDE: Card Details & Management */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
              
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{activeCard.name}</h2>
                  <p className="text-gray-500 font-medium mt-1">Linked to: <span className="text-gray-800 font-bold">{activeCard.linkedAccount}</span></p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider ${activeCard.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {activeCard.status}
                </div>
              </div>

              {/* Secure Details Row (CVV & ZIP) */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">CVV / Security Code</p>
                  <p className="text-xl font-mono font-bold text-gray-900">{showDetails ? activeCard.cvv : '•••'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Billing Zip</p>
                  <p className="text-xl font-mono font-bold text-gray-900">10001</p>
                </div>
              </div>

              {/* Management Grid */}
              <h3 className="text-lg font-black text-gray-900 mb-4">Card Management</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Freeze Toggle */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeCard.status === 'Frozen' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Freeze Card</p>
                      <p className="text-xs text-gray-500">Temporarily disable</p>
                    </div>
                  </div>
                  {/* Visual Toggle Switch */}
                  <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activeCard.status === 'Frozen' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activeCard.status === 'Frozen' ? 'translate-x-6' : 'translate-x-1'}`}></span>
                  </button>
                </div>
                

                {/* Report Stolen */}
                <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm group-hover:text-red-700">Report Lost</p>
                    <p className="text-xs text-gray-500">Cancel and replace card</p>
                  </div>
                </button>
                
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}