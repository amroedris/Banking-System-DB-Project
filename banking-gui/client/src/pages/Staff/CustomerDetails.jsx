import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, 
  CreditCard, Activity, Snowflake, Plus, Lock, Landmark, Edit2, Trash2
} from 'lucide-react';
import euiLogo from '../../assets/EUI-Cropped.jpg';
import AddCardModal from './AddCardModal';
import AddAccountForCustomer from './AddAccountForCustomer'; 
import EditLimitModal from './EditLimitModal';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [loans, setLoans] = useState([]);
  // MODAL STATES
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedAccountForCard, setSelectedAccountForCard] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false); 
  
  // NEW STATE FOR EDIT LIMIT MODAL
  const [isEditLimitModalOpen, setIsEditLimitModalOpen] = useState(false);
  const [limitModalData, setLimitModalData] = useState({ cardId: null, currentLimit: 0 });

  // Get logged-in staff's branch for cross-branch editing restrictions
  const staffData = JSON.parse(localStorage.getItem('staff') || '{}');
  const staffBranchId = staffData.BRANCH_ID;

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const [profileRes, cardsRes] = await Promise.all([
        axios.get(`http://localhost:3000/staff/customer/${id}`),
        axios.get(`http://localhost:3000/cards/${id}`)
      ]);

      setCustomer(profileRes.data.customer);
      setAccounts(profileRes.data.accounts || []);
      setTransactions(profileRes.data.transactions || []);
      setCards(cardsRes.data || []);
      setLoans(profileRes.data.loans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeAccount = async (accountNumber) => {
    if (!window.confirm("Close this account? This cannot be undone.")) return;
    try {
      await axios.put(`http://localhost:3000/staff/account/${accountNumber}/close`);
      await fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close account.");
    }
  };

  const toggleAccountFreeze = async (accountNumber, currentStatus) => {
    if (currentStatus === 'Closed') return;
    try {
      const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await axios.put(`http://localhost:3000/staff/account/${accountNumber}/freeze`, {
        status: nextStatus
      });
      await fetchDetails(); 
    } catch (err) {
      console.error(err);
      alert("Failed to update account status");
    }
  };

  const openIssueCardModal = (accountNumber) => {
    setSelectedAccountForCard(accountNumber);
    setIsCardModalOpen(true);
  };

  const openEditLimitModal = (cardId, currentLimit) => {
    setLimitModalData({ cardId, currentLimit });
    setIsEditLimitModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Profile...</div>;
  if (!customer) return <div className="p-8 text-center text-red-500 font-bold">Customer not found</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12 relative">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => navigate('/user-directory')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={20} />
        </button>
                    <img 
              src={euiLogo} 
              alt="EUI Logo" 
              className="h-20 w-20" 
            />
        <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
        <h1 className="text-lg font-bold text-[#004a99]">Customer Profile</h1>
      </nav>

      <main className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: CUSTOMER INFO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center">
            <div className="h-24 w-24 rounded-full bg-blue-50 text-[#004a99] flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {customer.FIRST_NAME?.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{customer.FIRST_NAME} {customer.LAST_NAME}</h2>
            <p className="text-sm text-gray-400 mb-6">ID: {customer.CUSTOMER_ID}</p>
            
            <div className="space-y-4 text-left border-t border-gray-50 pt-6">
              <InfoRow icon={<Mail size={16}/>} label="Email" value={customer.EMAIL} />
              <InfoRow icon={<Phone size={16}/>} label="Phone" value={customer.CUSTOMER_PHONE || 'N/A'} />
              {customer.PHONES && customer.PHONES.length > 1 && customer.PHONES.map((phone, idx) => (
                idx === 0 ? null : (
                  <InfoRow key={idx} icon={<Phone size={16}/>} label={`Phone ${idx + 1}`} value={phone} />
                )
              ))}
              <InfoRow icon={<MapPin size={16}/>} label="Address" value={`${customer.STREET || ''}, ${customer.CITY || ''}`} />
            </div>
          </div>
        </div>

        {/* RIGHT: ACCOUNTS, CARDS, & TRANSACTIONS */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Landmark className="text-[#a37e2c]" size={20}/> Bank Accounts
              </h3>
              <button 
                onClick={() => setIsAccountModalOpen(true)} 
                className="flex items-center gap-1 text-sm font-bold text-[#004a99] hover:underline"
              >
                <Plus size={16} /> Open Account
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const openAccounts = accounts.filter(acc => acc.STATUS !== 'Closed');

                if (openAccounts.length === 0) return (
                  <p className="text-gray-400 text-sm">No accounts found.</p>
                );

                return openAccounts.map((acc) => {
                  const accountCards = cards.filter(c => c.ACCOUNT_NUMBER === acc.ACCOUNT_NUMBER);
                  const isOwnBranch = staffBranchId && Number(acc.BRANCH_ID) === Number(staffBranchId);

                  return (
                    <div key={acc.ACCOUNT_NUMBER} className={`p-6 rounded-[1.5rem] flex flex-col justify-between group transition-all duration-300 border ${isOwnBranch ? 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-1' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{acc.ACCOUNT_TYPE}</p>
                            <p className="font-mono text-sm font-semibold text-gray-600 mt-1">{acc.ACCOUNT_NUMBER}</p>
                            {!isOwnBranch && (
                              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mt-1 flex items-center gap-1">
                                <Lock size={10} /> Branch #{acc.BRANCH_ID} — Read Only
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${acc.STATUS === 'Active' ? 'bg-emerald-100 text-emerald-700' : acc.STATUS === 'Closed' ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                            {acc.STATUS}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => toggleAccountFreeze(acc.ACCOUNT_NUMBER, acc.STATUS)}
                            disabled={acc.STATUS === 'Closed' || !isOwnBranch}
                            className={`p-2 rounded-lg transition-all ${!isOwnBranch ? 'text-gray-200 cursor-not-allowed' : acc.STATUS === 'Active' ? 'text-gray-400 hover:text-cyan-600 hover:bg-cyan-100' : acc.STATUS === 'Closed' ? 'text-gray-200 cursor-not-allowed' : 'text-cyan-600 bg-cyan-100 hover:bg-cyan-200'}`}
                            title={!isOwnBranch ? 'Read-only — account belongs to another branch' : acc.STATUS === 'Active' ? 'Freeze Account' : 'Unfreeze Account'}
                          >
                            <Snowflake size={18} />
                          </button>

                            <button
    onClick={() => closeAccount(acc.ACCOUNT_NUMBER)}
    disabled={Number(acc.BALANCE) > 0}
    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    title={Number(acc.BALANCE) > 0 ? "Clear balance before closing" : "Close Account"}
  >
    <Trash2 size={18} />
  </button>

              
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200/60">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Linked Cards</p>
                          <button
                            onClick={() => openIssueCardModal(acc.ACCOUNT_NUMBER)}
                            disabled={acc.STATUS !== 'Active' || !isOwnBranch}
                            className="text-[10px] font-bold text-[#004a99] bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            + Issue Card
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {accountCards.length > 0 ? accountCards.map(card => (
                            <div key={card.CARD_ID} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
                                  <CreditCard size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-700 leading-tight">{card.CARD_TYPE}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-[10px] text-gray-400 font-mono">•••• {String(card.CARD_NUMBER).slice(-4)}</p>
                                    {card.CARD_TYPE === 'Credit' && (
                                      <div className="flex items-center border border-blue-100 rounded overflow-hidden">
                                        <span className="bg-blue-50 text-[#004a99] text-[9px] font-bold px-1.5 py-0.5">
                                          Limit: ${card.CARD_LIMIT}
                                        </span>
                                        {card.CARD_STATUS === 'Active' && isOwnBranch && (
                                          <button 
                                            onClick={() => openEditLimitModal(card.CARD_ID, card.CARD_LIMIT)}
                                            className="bg-white hover:bg-[#004a99] text-[#004a99] hover:text-white px-1.5 py-0.5 transition-colors border-l border-blue-100"
                                            title="Edit Limit"
                                          >
                                            <Edit2 size={10} />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-md ${card.CARD_STATUS === 'Active' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                  {card.CARD_STATUS}
                                </span>
                              </div>
                            </div>
                          )) : (
                            <p className="text-[10px] text-gray-400 italic">No cards issued to this account.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
              <Activity className="text-cyan-500" size={20}/> Recent Transactions
            </h3>
            <div className="space-y-4">
              {transactions.length > 0 ? transactions.map((tx) => (
                <div key={tx.TRANSACTION_ID} className="flex justify-between items-center p-4 rounded-xl border border-gray-50 bg-gray-50/30">
                  <div>
                    <p className="font-bold text-sm text-gray-700">{tx.TRANSACTION_TYPE}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mt-0.5">{new Date(tx.TRANSACTION_TIME).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">${Number(tx.AMOUNT).toLocaleString()}</p>
                    <p className={`text-[10px] font-bold uppercase ${tx.STATUS === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{tx.STATUS}</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-400 text-sm">No recent transactions.</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
    <Landmark className="text-[#004a99]" size={20}/> Active Loans
  </h3>
  <div className="space-y-4">
    {loans.length > 0 ? loans.map((loan) => {
      const totalWithInterest = Number(loan.LOAN_AMOUNT) + (Number(loan.LOAN_AMOUNT) * Number(loan.INTEREST_RATE) / 100);
      const paid = Number(loan.TOTAL_PAID_OFF || 0);
      const remaining = totalWithInterest - paid;
      const progress = totalWithInterest > 0 ? (paid / totalWithInterest) * 100 : 0;

      return (
        <div key={loan.LOAN_ID} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loan #{loan.LOAN_ID}</p>
              <p className="text-lg font-black text-gray-800">${Number(loan.LOAN_AMOUNT).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{loan.LOAN_TERM} months · {loan.INTEREST_RATE}% interest</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">Remaining</p>
              <p className="text-lg font-bold text-[#004a99]">${remaining.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Due: {new Date(loan.DUE_DATE).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-[#004a99] h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
            <span>Paid: ${paid.toFixed(2)}</span>
            <span>Total: ${totalWithInterest.toFixed(2)}</span>
          </div>
        </div>
      );
    }) : (
      <p className="text-gray-400 text-sm">No active loans.</p>
    )}
  </div>
</div>

        </div>
      </main>

      {/* MODALS */}
      {isCardModalOpen && (
        <AddCardModal 
          accountNumber={selectedAccountForCard}
          onClose={() => {
            setIsCardModalOpen(false);
            setSelectedAccountForCard(null);
          }}
          onSuccess={() => fetchDetails()}
        />
      )}

      {isAccountModalOpen && (
        <AddAccountForCustomer 
          customerId={customer.CUSTOMER_ID}
          customerName={`${customer.FIRST_NAME} ${customer.LAST_NAME}`}
          customerDob={customer.DOB} /* <-- PASS THE DOB HERE */
          branchId={staffBranchId}
          onClose={() => setIsAccountModalOpen(false)}
          onSuccess={() => fetchDetails()} 
        />
      )}

      {isEditLimitModalOpen && (
        <EditLimitModal 
          cardId={limitModalData.cardId}
          currentLimit={limitModalData.currentLimit}
          onClose={() => {
            setIsEditLimitModalOpen(false);
            setLimitModalData({ cardId: null, currentLimit: 0 });
          }}
          onSuccess={() => fetchDetails()} 
        />
      )}
      
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[#a37e2c] bg-amber-50 p-2 rounded-lg">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-700">{value}</p>
      </div>
    </div>
  );
}