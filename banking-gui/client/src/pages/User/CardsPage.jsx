import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import euiLogo from '../../assets/EUI-Cropped.jpg';

export default function CardsPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);

  // Apply modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyCardType, setApplyCardType] = useState('Debit');
  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState(null); // { success, message }

  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Fetch Accounts first
  const fetchAccounts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/accounts/${user.CUSTOMER_ID}`);
      const data = await response.json();
      setAccounts(data);
      if (data.length > 0) setSelectedAccountId(data[0].ACCOUNT_NUMBER);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  // 2. Fetch Cards based on Account ID
  const fetchCards = async (accId) => {
    if (!accId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/cards/account/${accId}`);
      const data = await response.json();

      const mappedCards = data.map(dbCard => ({
        id: dbCard.CARD_ID,
        type: dbCard.CARD_TYPE,
        name: `${dbCard.CARD_TYPE} Card`,
        cardholder: dbCard.CARDHOLDER,
        number: dbCard.CARD_NUMBER,
        maskedNumber: `•••• •••• •••• ${dbCard.CARD_NUMBER != null ? String(dbCard.CARD_NUMBER).slice(-4) : '****'}`,
        expiry: dbCard.EXPIRY_DATE ? new Date(dbCard.EXPIRY_DATE).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : 'MM/YY',
        cvv: dbCard.CVV,
        linkedAccount: dbCard.ACCOUNT_NUMBER,
        status: dbCard.CARD_STATUS === 'Blocked' ? 'Frozen' :
                dbCard.CARD_STATUS === 'Suspended' ? 'Cancelled' :
                dbCard.CARD_STATUS,
        color: dbCard.CARD_TYPE === 'Credit'
          ? 'from-[#a37e2c] to-[#7a5c1a]'
          : 'from-[#004a99] to-[#002a59]'
      }));

      setCards(mappedCards);
      if (mappedCards.length > 0) {
        setSelectedCardId(mappedCards[0].id);
      } else {
        setSelectedCardId(null);
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.CUSTOMER_ID) fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) fetchCards(selectedAccountId);
  }, [selectedAccountId]);

  const activeCard = cards.find(card => card.id === selectedCardId);
  const isCardFrozen = activeCard?.status === 'Frozen';
  const isCardCancelled = activeCard?.status === 'Cancelled';

  // --- HANDLERS ---
  const handleToggleFreeze = async () => {
    const newStatus = isCardFrozen ? 'Active' : 'Frozen';
    try {
      await fetch('http://localhost:3000/cards/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: activeCard.id, newStatus })
      });
      fetchCards(selectedAccountId);
      setIsFreezeModalOpen(false);
    } catch (err) { alert("Failed to update status"); }
  };

  const handleReportLost = async () => {
    try {
      await fetch('http://localhost:3000/cards/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: activeCard.id, newStatus: 'Cancelled' })
      });
      fetchCards(selectedAccountId);
      setIsLostModalOpen(false);
    } catch (err) { alert("Error reporting lost card."); }
  };

  const handleOpenApplyModal = () => {
    setApplyCardType('Debit');
    setApplyResult(null);
    setIsApplyModalOpen(true);
  };

  const handleApplyCard = async () => {
    setIsApplying(true);
    setApplyResult(null);
    try {
      const response = await fetch('http://localhost:3000/cards/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber: selectedAccountId, cardType: applyCardType })
      });
      const data = await response.json();
      setApplyResult({ success: data.success, message: data.message });
      if (data.success) {
        fetchCards(selectedAccountId); // Refresh so the new Pending card shows up
      }
    } catch (err) {
      setApplyResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsApplying(false);
    }
  };

  // Card type info used in the apply modal
  const cardInfo = {
    Debit: {
      color: 'from-[#004a99] to-[#002a59]',
      limit: 'No limit',
      perks: [
        'Linked directly to your account balance',
        'No credit checks required',
        'Instant approval after staff review',
      ],
    },
    Credit: {
      color: 'from-[#a37e2c] to-[#7a5c1a]',
      limit: 'EGP 50,000',
      perks: [
        'Up to EGP 50,000 revolving credit limit',
        'Buy now, pay later flexibility',
        'Subject to credit approval by staff',
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 pb-10">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src={euiLogo} alt="EUI Logo" className="h-12 w-12" />
            <h1 className="text-xl font-black text-[#004a99]">My Cards</h1>
          </div>

          {/* ACCOUNT DROPDOWN */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 w-full md:w-auto">
            <label className="text-[10px] font-black uppercase text-gray-400">Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-transparent font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              {accounts.filter(acc => acc.STATUS !== 'Closed').map((acc) => (
                <option key={acc.ACCOUNT_NUMBER} value={acc.ACCOUNT_NUMBER}>
                  {acc.ACCOUNT_TYPE} (***{String(acc.ACCOUNT_NUMBER).slice(-4)})
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
            Back
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDE: Visuals */}
          <div className="lg:col-span-5 space-y-6">
            {loading ? (
              <div className="animate-pulse w-full aspect-[1.586/1] bg-gray-200 rounded-3xl" />
            ) : cards.length > 0 && activeCard ? (
              /* --- EXISTING CARD VISUAL --- */
              <div className="perspective-1000">
                <div className={`relative w-full aspect-[1.586/1] rounded-3xl p-8 shadow-2xl text-white transition-all duration-500 bg-gradient-to-br ${isCardCancelled ? 'from-gray-500 to-gray-800 grayscale' : activeCard.color}`}>
                  {/* Status Overlays */}
                  {isCardFrozen && !isCardCancelled && (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-20 rounded-3xl">
                      <div className="bg-white/90 text-gray-900 px-6 py-2 rounded-full font-black text-sm shadow-lg">Card Frozen</div>
                    </div>
                  )}
                  {activeCard.status === 'Pending' && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-3xl">
                      <div className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-black text-sm">Pending Approval</div>
                      <p className="text-white/80 text-xs mt-2">Being reviewed by our team</p>
                    </div>
                  )}
                  {isCardCancelled && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-3xl">
                      <div className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-sm">Cancelled</div>
                    </div>
                  )}

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-black italic">EUI BANK</h2>
                    </div>
                    <p className="text-2xl font-mono tracking-widest">
                      {showDetails ? activeCard.number : activeCard.maskedNumber}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] opacity-70">CARDHOLDER</p>
                        <p className="text-sm font-bold tracking-widest uppercase">{activeCard.cardholder}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] opacity-70">EXPIRES</p>
                        <p className="text-sm font-bold">{activeCard.expiry}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* --- EMPTY STATE CARD --- */
              <div className="relative w-full aspect-[1.586/1] rounded-3xl p-8 border-4 border-dashed border-gray-300 bg-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-black text-gray-400">No Cards Found</h3>
                <p className="text-sm text-gray-500 mt-2">There are no cards linked to this account yet.</p>
                <button
                  onClick={handleOpenApplyModal}
                  className="mt-6 px-6 py-2 bg-white text-[#004a99] font-bold border border-gray-200 rounded-full hover:bg-gray-50 shadow-sm transition-all"
                >
                  Apply for a Card
                </button>
              </div>
            )}

            {/* Card selector pills (shown when user has multiple cards) */}
            {cards.length > 1 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      selectedCardId === card.id
                        ? 'bg-[#004a99] text-white border-[#004a99]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {card.name}
                  </button>
                ))}
              </div>
            )}

            {/* View Details Toggle */}
            {cards.length > 0 && activeCard && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm font-bold text-[#004a99] bg-white px-6 py-2 rounded-full border border-gray-200"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Details */}
          <div className="lg:col-span-7">
            {cards.length > 0 && activeCard ? (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black">{activeCard.name}</h2>
                    <p className="text-gray-500 text-sm font-medium">Account: {activeCard.linkedAccount}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
                    activeCard.status === 'Active'  ? 'bg-green-100 text-green-700'  :
                    activeCard.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                      'bg-orange-100 text-orange-700'
                  }`}>
                    {activeCard.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">CVV</p>
                    <p className="text-xl font-mono font-bold">{showDetails && !isCardCancelled ? activeCard.cvv : '•••'}</p>
                  </div>
                </div>

                {/* Apply for another card */}
                <div className="mb-6">
                  <button
                    onClick={handleOpenApplyModal}
                    className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-2xl hover:border-[#004a99] hover:text-[#004a99] hover:bg-blue-50 transition-all text-sm"
                  >
                    + Apply for Another Card
                  </button>
                </div>

                <h3 className="font-black text-gray-900 mb-4">Management</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsFreezeModalOpen(true)}
                    disabled={isCardCancelled || activeCard.status === 'Pending'}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <div><p className="font-bold text-sm">{isCardFrozen ? 'Unfreeze' : 'Freeze'}</p></div>
                  </button>

                  <button
                    onClick={() => setIsLostModalOpen(true)}
                    disabled={isCardCancelled || activeCard.status === 'Pending'}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <div><p className="font-bold text-sm text-red-600">Report Lost</p></div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-black text-gray-900">Get a new card</h2>
                <p className="text-gray-500 mt-2 max-w-xs">
                  Order a physical or virtual card for your {accounts.find(a => a.ACCOUNT_NUMBER === selectedAccountId)?.ACCOUNT_TYPE} account.
                </p>
                <button
                  onClick={handleOpenApplyModal}
                  className="mt-8 w-full py-4 bg-[#004a99] text-white font-bold rounded-2xl shadow-lg hover:bg-[#003a7a] transition-colors"
                >
                  Apply for a Card
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ============================= */}
      {/* APPLY FOR CARD MODAL          */}
      {/* ============================= */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">

            {/* Success State */}
            {applyResult?.success ? (
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Your <span className="font-bold text-gray-700">{applyCardType} Card</span> request has been received.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-800 font-medium mb-8 w-full">
                  A bank employee will review and activate your card. This usually takes 1–3 business days.
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="w-full py-4 bg-[#004a99] text-white font-black rounded-xl hover:bg-[#003a7a] transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-br from-[#004a99] to-[#002a59] p-8 text-white">
                  <h3 className="text-2xl font-black mb-1">Apply for a Card</h3>
                  <p className="text-white/70 text-sm">Choose your card type below</p>
                </div>

                <div className="p-8">
                  {/* Card Type Toggle */}
                  <div className="flex gap-3 mb-6">
                    {['Debit', 'Credit'].map(type => (
                      <button
                        key={type}
                        onClick={() => { setApplyCardType(type); setApplyResult(null); }}
                        className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition-all ${
                          applyCardType === type
                            ? type === 'Credit'
                              ? 'bg-[#a37e2c] border-[#a37e2c] text-white'
                              : 'bg-[#004a99] border-[#004a99] text-white'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Live Card Preview */}
                  <div className={`w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${cardInfo[applyCardType].color} p-6 text-white mb-6 shadow-lg transition-all duration-300`}>
                    <div className="h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <p className="font-black italic text-lg">EUI BANK</p>
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">{applyCardType}</span>
                      </div>
                      <p className="font-mono text-xl tracking-widest">•••• •••• •••• ••••</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] opacity-60">CARDHOLDER</p>
                          <p className="text-sm font-bold uppercase tracking-wider">
                            {user?.FIRST_NAME} {user?.LAST_NAME}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] opacity-60">EXPIRES</p>
                          <p className="text-sm font-bold">
                            {new Date(new Date().setFullYear(new Date().getFullYear() + 4))
                              .toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Card Limit</span>
                      <span className="font-black text-gray-800">{cardInfo[applyCardType].limit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Validity</span>
                      <span className="font-black text-gray-800">4 Years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Initial Status</span>
                      <span className="font-black text-yellow-600">Pending Approval</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Linked Account</span>
                      <span className="font-black text-gray-800">***{String(selectedAccountId).slice(-4)}</span>
                    </div>
                  </div>

                  {/* Perks */}
                  <ul className="space-y-2 mb-6">
                    {cardInfo[applyCardType].perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  {/* Error message */}
                  {applyResult && !applyResult.success && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium mb-4">
                      {applyResult.message}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsApplyModalOpen(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyCard}
                      disabled={isApplying}
                      className={`flex-1 py-4 text-white font-black rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-60 ${
                        applyCardType === 'Credit'
                          ? 'bg-[#a37e2c] hover:bg-[#8a6a24]'
                          : 'bg-[#004a99] hover:bg-[#003a7a]'
                      }`}
                    >
                      {isApplying ? 'Submitting…' : 'Submit Application'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Freeze Modal */}
      {isFreezeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">{isCardFrozen ? 'Unfreeze Card?' : 'Freeze this card?'}</h3>
            <p className="text-gray-500 text-center text-sm mb-8">
              {isCardFrozen
                ? `Your ${activeCard.name} will be active again and you can use it for purchases immediately.`
                : "This will temporarily prevent any new purchases or withdrawals. Autopayments may also be declined. You can easily unfreeze it later."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsFreezeModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleToggleFreeze} className={`flex-1 py-4 text-white font-black rounded-xl shadow-md transition-all active:scale-95 ${isCardFrozen ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                {isCardFrozen ? 'Yes, Unfreeze' : 'Yes, Freeze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Lost Modal */}
      {isLostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative border-2 border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">Report Card Missing?</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              This will <span className="font-bold text-red-600">permanently cancel</span> your current card. A replacement card with a new number will be shipped to your address.
            </p>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-8 text-xs text-red-800 flex gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p>Are you just looking for a misplaced card? Use the <strong>Freeze</strong> feature instead, which can be reversed.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsLostModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors">Go Back</button>
              <button onClick={handleReportLost} className="flex-1 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 shadow-md transition-all active:scale-95">Cancel Card</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}