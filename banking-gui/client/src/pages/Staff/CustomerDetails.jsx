import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CreditCard,
  History,
  Wallet,
  Shield,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Snowflake,
  Pencil,
  X,
  Save
} from 'lucide-react';

import euiLogo from '../../assets/eui-logo.png';

export default function CustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // MODAL STATE
  const [isEditOpen, setIsEditOpen] = useState(false);

  // DATABASE DATA
  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // EDIT FORM DATA
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // FETCH CUSTOMER DATA
  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/staff/customer/${id}`
      );

      setCustomer(response.data.customer);
      setAccounts(response.data.accounts);
      setTransactions(response.data.transactions);

      setEditData({
        name: `${response.data.customer.FIRST_NAME} ${response.data.customer.LAST_NAME}`,
        email: response.data.customer.EMAIL || '',
        phone: response.data.customer.CUSTOMER_PHONE || '',
        address: `${response.data.customer.STREET || ''}, ${response.data.customer.CITY || ''}`
      });
    } catch (err) {
      console.error(err);
    }
  };

  // UPDATE CUSTOMER
const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    // Split "First Last" back into parts
    const [firstName, ...rest] = editData.name.trim().split(' ');
    const lastName = rest.join(' ');

    // Split "street, city" back into parts
    const [street, ...cityParts] = editData.address.split(',');
    const city = cityParts.join(',').trim();

    await axios.put(`http://localhost:3000/customer/${id}`, {
      firstName: firstName || '',
      lastName: lastName || '',
      email: editData.email,
      phone: editData.phone,
      street: street?.trim() || '',
      city: city || '',
      governorate: customer.GOVERNORATE || ''  // preserve existing value
    });

    fetchCustomer();
    setIsEditOpen(false);
  } catch (err) {
    console.error(err);
    alert("Failed to update customer");
  }
};

  // TOGGLE INDIVIDUAL ACCOUNT FREEZE
  const toggleAccountFreeze = async (accountNumber, currentStatus) => {
    try {
      const nextStatus = currentStatus.toUpperCase() === "ACTIVE" ? "Inactive" : "Active";
      
      await axios.put(
        `http://localhost:3000/staff/account/${accountNumber}/freeze`,
        { status: nextStatus }
      );

      // Dynamically update UI state
      setAccounts(prevAccounts =>
        prevAccounts.map(acc =>
          acc.ACCOUNT_NUMBER === accountNumber
            ? { ...acc, STATUS: nextStatus }
            : acc
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to alter account freeze status");
    }
  };

  // LOADING STATE
  if (!customer) {
    return (
      <div className="p-10 text-center">
        Loading customer...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12 relative overflow-x-hidden">

      {/* NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>

          <img
            src={euiLogo}
            alt="EUI Logo"
            className="h-10 object-contain"
          />

          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>

          <h1 className="text-lg font-bold text-[#004a99]">
            Customer Profile
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#004a99] text-white font-bold text-xs shadow-md hover:bg-[#003d7a] transition-all flex items-center gap-2"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">

        {/* PROFILE HEADER */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="h-24 w-24 rounded-3xl bg-blue-50 flex items-center justify-center text-[#004a99] text-4xl font-bold border-2 border-white shadow-inner">
            {customer.FIRST_NAME?.charAt(0)}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
              <h2 className="text-3xl font-bold text-gray-800">
                {customer.FIRST_NAME} {customer.LAST_NAME}
              </h2>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                <CheckCircle size={12} />
                Active
              </span>
            </div>

            <p className="text-gray-400 font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
              <Shield size={14} />
              Customer ID: {customer.CUSTOMER_ID}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="text-center px-6 border-r border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                Total Assets
              </p>
              <p className="text-xl font-bold text-gray-800">
                $
                {
                  accounts
                    .reduce(
                      (sum, acc) => sum + Number(acc.BALANCE),
                      0
                    )
                    .toLocaleString()
                }
              </p>
            </div>

            <div className="text-center px-6">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                Risk Score
              </p>
              <p className="text-xl font-bold text-[#a37e2c]">
                Low
              </p>
            </div>
          </div>
        </div>

        {/* TAB SELECTOR */}
        <div className="flex gap-8 mb-6 border-b border-gray-200 px-4">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            label="Overview"
            icon={<User size={18} />}
          />

          <TabButton
            active={activeTab === 'accounts'}
            onClick={() => setActiveTab('accounts')}
            label="Accounts & Cards"
            icon={<Wallet size={18} />}
          />

          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            label="Activity Log"
            icon={<History size={18} />}
          />
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 transition-all">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-[#a37e2c] rounded-full"></div>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoBox
                    label="Email Address"
                    value={customer.EMAIL}
                    icon={<Mail size={16} />}
                  />

                  <InfoBox
                    label="Phone Number"
                    value={customer.CUSTOMER_PHONE}
                    icon={<Phone size={16} />}
                  />

                  <InfoBox
                    label="Home Address"
                    value={`${customer.STREET || ''}, ${customer.CITY || ''}`}
                    icon={<MapPin size={16} />}
                  />

                  <InfoBox
                    label="Customer Type"
                    value="Individual / Platinum"
                    icon={<Shield size={16} />}
                  />
                </div>
              </div>
            )}

            {/* ACCOUNTS TAB */}
            {activeTab === 'accounts' && (
              <div className="space-y-4">
                {accounts.map((acc, i) => {
                  const isAccountActive = acc.STATUS?.toUpperCase() === 'ACTIVE';
                  return (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center hover:border-[#004a99] transition-all cursor-default"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-[#004a99] rounded-2xl">
                          <Wallet size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {acc.ACCOUNT_TYPE}
                          </p>
                          <p className="text-xs text-gray-400 font-mono italic">
                            {acc.ACCOUNT_NUMBER}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-lg font-bold text-gray-800">
                            ${Number(acc.BALANCE).toLocaleString()}
                          </p>
                          <p className={`text-[10px] font-bold uppercase ${isAccountActive ? 'text-green-500' : 'text-red-500'}`}>
                            {acc.STATUS}
                          </p>
                        </div>

                        {/* GRANULAR ACTION FOR INDIVIDUAL ACCOUNTS */}
                        <button
                          onClick={() => toggleAccountFreeze(acc.ACCOUNT_NUMBER, acc.STATUS)}
                          className={`p-2.5 rounded-xl transition-all ${
                            isAccountActive 
                              ? 'text-gray-400 hover:text-cyan-600 hover:bg-cyan-50' 
                              : 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'
                          }`}
                          title={isAccountActive ? "Freeze Account" : "Unfreeze Account"}
                        >
                          <Snowflake size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.TRANSACTION_ID}
                        className="p-4 rounded-2xl bg-gray-50"
                      >
                        <p className="font-bold text-gray-800">
                          {tx.TRANSACTION_TYPE}
                        </p>
                        <p className="text-gray-700">
                          ${Number(tx.AMOUNT).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(tx.TRANSACTION_TIME).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-12 italic">
                    No recent activity found.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-[#004a99] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-blue-200 text-[10px] font-bold uppercase mb-4 tracking-widest">
                  Active Debit Card
                </p>
                <p className="text-xl font-mono tracking-widest mb-6">
                  **** **** **** 4092
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-blue-200 uppercase">
                      Expiry
                    </p>
                    <p className="font-bold">12/28</p>
                  </div>
                  <CreditCard size={32} className="opacity-40" />
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </main>

      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isEditOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsEditOpen(false)}
      />

      {/* EDIT PANEL */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] transition-transform duration-500 ease-out transform ${isEditOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">
              Edit Personal Details
            </h3>
            <button
              onClick={() => setIsEditOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleUpdate}
            className="flex-1 overflow-y-auto p-8 space-y-6"
          >
            <EditInput
              label="Full Name"
              value={editData.name}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  name: e.target.value
                })
              }
            />

            <EditInput
              label="Email Address"
              type="email"
              value={editData.email}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  email: e.target.value
                })
              }
            />

            <EditInput
              label="Phone Number"
              value={editData.phone}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  phone: e.target.value
                })
              }
            />

            <EditInput
              label="Home Address"
              value={editData.address}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  address: e.target.value
                })
              }
            />
          </form>

          <div className="p-6 border-t border-gray-100 flex gap-4">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-[#004a99] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#003d7a] flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Changes
            </button>

            <button
              onClick={() => setIsEditOpen(false)}
              className="px-6 bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// UI HELPERS
function TabButton({ active, label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-4 px-2 border-b-2 font-bold text-sm transition-all ${
        active
          ? 'border-[#004a99] text-[#004a99]'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InfoBox({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-700">
          {value || 'N/A'}
        </p>
      </div>
    </div>
  );
}

function EditInput({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#a37e2c] outline-none font-semibold text-gray-700 transition-all"
        {...props}
      />
    </div>
  );
}

