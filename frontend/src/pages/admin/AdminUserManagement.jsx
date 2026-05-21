import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Users, Shield, Trash2, ShieldAlert } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

export const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to retrieve users directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) {
      try {
        await api.put(`/auth/users/${userId}/role`, { role: nextRole });
        toast.success(`Role updated to ${nextRole}`);
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Role change rejected');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user account?')) {
      try {
        await api.delete(`/auth/users/${userId}`);
        toast.success('User profile deleted');
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="py-6 flex flex-col md:flex-row gap-8 items-start">
      <AdminSidebar />

      <main className="flex-1 space-y-6 w-full">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Users className="h-6 w-6 mr-2 text-primary" /> User Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage user security credentials and administrative privileges.</p>
        </div>

        {/* Users Table */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 overflow-x-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Retrieving user accounts directory...</div>
          ) : users.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No users found.</p>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="py-2.5 font-bold uppercase">Account ID</th>
                  <th className="py-2.5 font-bold uppercase">Full Name</th>
                  <th className="py-2.5 font-bold uppercase">Email Address</th>
                  <th className="py-2.5 font-bold uppercase">Role</th>
                  <th className="py-2.5 font-bold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-[10px] text-slate-500">#{account._id}</td>
                    <td className="py-3 font-semibold text-white">{account.name}</td>
                    <td className="py-3 text-slate-400">{account.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${account.role === 'admin' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-slate-700/20 text-slate-400 border border-white/5'}`}>
                        {account.role}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(account._id, account.role)}
                        title="Toggle role"
                        className="p-1.5 text-slate-400 hover:text-secondary bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors inline-flex"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(account._id)}
                        title="Delete profile"
                        className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors inline-flex"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUserManagement;
