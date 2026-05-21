import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, addAddress, deleteAddress, fetchProfile } from '../features/auth/authSlice';
import { User, ShieldCheck, MapPin, Plus, Trash2, Mail, Lock, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // Profile forms state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Address forms state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }
    try {
      const updateData = { name, email };
      if (password.trim()) {
        updateData.password = password.trim();
      }
      await dispatch(updateProfile(updateData)).unwrap();
      toast.success('Profile details updated successfully');
      setPassword('');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrStreet || !addrCity || !addrState || !addrZip) {
      toast.error('Please fill in all address fields');
      return;
    }
    try {
      await dispatch(addAddress({
        name: addrName,
        phone: addrPhone,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip
      })).unwrap();
      toast.success('Address added to your account');
      setShowAddressForm(false);
      // Reset form fields
      setAddrName('');
      setAddrPhone('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
    } catch (err) {
      toast.error(err || 'Failed to add address');
    }
  };

  const handleRemoveAddress = async (addressId) => {
    try {
      await dispatch(deleteAddress(addressId)).unwrap();
      toast.success('Address deleted successfully');
    } catch (err) {
      toast.error(err || 'Failed to remove address');
    }
  };

  if (!user) return null;

  return (
    <div className="py-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <User className="h-6 w-6 mr-2 text-primary" /> Profile Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure profile details and shipping addresses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Account Info Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/30 space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
            Account Information
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xxs text-slate-400 block uppercase tracking-wider font-semibold">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 pl-10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xxs text-slate-400 block uppercase tracking-wider font-semibold">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 pl-10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xxs text-slate-400 block uppercase tracking-wider font-semibold">New Password (optional)</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 pl-10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="h-4.5 w-4.5 mr-1" />
              <span>{loading ? 'Saving details...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Address Book Manager */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/30 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <MapPin className="h-4.5 w-4.5 mr-2 text-primary" /> Address Book
            </h2>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-xxs font-bold text-secondary hover:text-secondary-light flex items-center space-x-0.5"
            >
              <Plus className="h-3.5 w-3.5" /> <span>Add Address</span>
            </button>
          </div>

          {/* List of existing addresses */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {!user.addresses || user.addresses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No addresses added yet.</p>
            ) : (
              user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-3.5 rounded-xl border border-white/5 bg-slate-800/20 flex justify-between items-start gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/25 text-[8px] font-bold text-green-400 uppercase rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    <p className="text-[9px] text-slate-500 font-semibold">Phone: {addr.phone}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveAddress(addr._id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* New address form drawer */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="border-t border-white/5 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-200">New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Street"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  className="sm:col-span-2 glass-input px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={addrZip}
                  onChange={(e) => setAddrZip(e.target.value)}
                  className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                />
                <div className="flex space-x-2 sm:col-span-2 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-1.5 bg-slate-800 text-xs rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs rounded-lg font-bold shadow"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
