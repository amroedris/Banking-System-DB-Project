import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Snowflake, User, ArrowLeft, 
  CheckCircle, AlertCircle, Eye 
} from 'lucide-react';
import euiLogo from '../../assets/eui-logo.png';

export default function UserDirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data for Testing
  const [users, setUsers] = useState([
    { id: 1, name: "Sarah Connor", account: "4092-8831", nationalId: "299010121005", balance: "57,650.75", status: "active" },
    { id: 2, name: "Ahmed Kamal", account: "1122-3344", nationalId: "288051514002", balance: "12,400.00", status: "active" },
    { id: 3, name: "John Doe", account: "5566-7788", nationalId: "301041012009", balance: "1,250.50", status: "frozen" },
  ]);

  // --- FILTER LOGIC ---
  const filteredUsers = users.filter((user) => {
    const query = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.account.includes(searchTerm) ||
      user.nationalId.includes(searchTerm)
    );
  });

  const toggleFreeze = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: user.status === 'active' ? 'frozen' : 'active' } : user
    ));
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      
      {/* HEADER BAR */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <img src={euiLogo} alt="EUI Logo" className="h-10 object-contain" />
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <h1 className="text-lg font-bold text-[#004a99]">Customer Management</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        
        {/* SEARCH AREA */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name, ID, or account..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a37e2c] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {/* Redundant Filter Button Removed */}
            <button 
              onClick={() => navigate('/add-account')} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-[#004a99] text-white font-bold text-sm shadow-lg hover:bg-[#003d7a] transition-all"
            >
              <User size={18} />
              Add Customer
            </button>
          </div>
        </div>

        {/* CUSTOMER TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Details</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Account Info</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Balance</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#004a99] font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-400">ID: {user.nationalId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-semibold text-gray-600 font-mono tracking-tighter">{user.account}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Standard Savings</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-gray-800">${user.balance}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          user.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {user.status === 'active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => toggleFreeze(user.id)}
                            className={`p-2.5 rounded-xl transition-all ${
                              user.status === 'active' 
                                ? 'text-gray-400 hover:text-cyan-600 hover:bg-cyan-50' 
                                : 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'
                            }`}
                            title={user.status === 'active' ? "Freeze Account" : "Unfreeze Account"}
                          >
                            <Snowflake size={20} />
                          </button>
                          
                          <button 
                            onClick={() => navigate(`/customer/${user.id}`)}
                            className="p-2.5 rounded-xl text-gray-400 hover:text-[#004a99] hover:bg-blue-50 transition-all"
                            title="View Full Profile"
                          >
                            <Eye size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center">
                       <div className="flex flex-col items-center gap-2 text-gray-400">
                          <AlertCircle size={32} />
                          <p className="font-semibold text-lg">No customers found</p>
                          <p className="text-sm">Try searching for a different name or account number.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-widest">
            <span>Showing {filteredUsers.length} of {users.length} Customers</span>
            <div className="flex gap-4">
              <button className="hover:text-[#004a99]">Previous</button>
              <button className="hover:text-[#004a99]">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}