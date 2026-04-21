import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Car, MapPin, Bell, Lock, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGarage } from '../context/GarageContext';
import { authApi, userApi } from '../utils/api';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'garage', label: 'My Garage', icon: Car },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function Account() {
  const { user, updateUser } = useAuth();
  const { garage, addVehicle, removeVehicle, setPrimary } = useGarage();
  const [searchParams] = useSearchParams();
  const validTabs = tabs.map(t => t.id);
  const initialTab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [newVehicle, setNewVehicle] = useState({ make: '', model: '', year: '', trim: '', nickname: '' });
  const [addingVehicle, setAddingVehicle] = useState(false);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile(profile);
      updateUser(data.user);
      showSuccess('Profile updated');
    } catch (err) {
      showError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { showError('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSuccess('Password changed');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addVehicle(newVehicle);
      setNewVehicle({ make: '', model: '', year: '', trim: '', nickname: '' });
      setAddingVehicle(false);
      showSuccess('Vehicle added to garage');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (key, value) => {
    try {
      const { data } = await authApi.updateProfile({ [key]: value });
      updateUser(data.user);
    } catch {}
  };

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-brand-red/20 border border-brand-red/30 rounded-full flex items-center justify-center text-brand-red font-display font-bold text-xl">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900">{user?.firstName} {user?.lastName}</h1>
            <p className="dark:text-gray-400 text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Alerts */}
        {success && <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}
        {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-brand-red text-white'
                      : 'dark:text-gray-300 text-gray-600 dark:hover:bg-dark-surface hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6">
                <h2 className="font-heading font-bold text-lg dark:text-white text-gray-900 mb-5">Profile Information</h2>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1.5 font-medium">First Name</label>
                      <input type="text" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} className="input-dark" />
                    </div>
                    <div>
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1.5 font-medium">Last Name</label>
                      <input type="text" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} className="input-dark" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1.5 font-medium">Email</label>
                    <input type="email" value={user?.email || ''} className="input-dark opacity-50 cursor-not-allowed" disabled />
                  </div>
                  <div>
                    <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1.5 font-medium">Phone</label>
                    <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="input-dark" />
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'garage' && (
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading font-bold text-lg dark:text-white text-gray-900">My Garage</h2>
                  <button onClick={() => setAddingVehicle(v => !v)} className="btn-primary !py-2 !px-4 text-sm">+ Add Vehicle</button>
                </div>

                {addingVehicle && (
                  <form onSubmit={handleAddVehicle} className="dark:bg-dark-surface-2 bg-gray-50 border dark:border-dark-border border-light-border rounded-lg p-4 mb-5 space-y-3">
                    <h3 className="font-heading font-semibold dark:text-white text-gray-900 text-sm uppercase tracking-wider">Add New Vehicle</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <input placeholder="Year" type="number" value={newVehicle.year} onChange={e => setNewVehicle(v => ({ ...v, year: e.target.value }))} className="input-dark !text-sm" required />
                      <input placeholder="Make" type="text" value={newVehicle.make} onChange={e => setNewVehicle(v => ({ ...v, make: e.target.value }))} className="input-dark !text-sm" required />
                      <input placeholder="Model" type="text" value={newVehicle.model} onChange={e => setNewVehicle(v => ({ ...v, model: e.target.value }))} className="input-dark !text-sm" required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Trim (optional)" type="text" value={newVehicle.trim} onChange={e => setNewVehicle(v => ({ ...v, trim: e.target.value }))} className="input-dark !text-sm" />
                      <input placeholder="Nickname (optional)" type="text" value={newVehicle.nickname} onChange={e => setNewVehicle(v => ({ ...v, nickname: e.target.value }))} className="input-dark !text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="btn-primary text-sm !py-2">Save Vehicle</button>
                      <button type="button" onClick={() => setAddingVehicle(false)} className="btn-ghost text-sm">Cancel</button>
                    </div>
                  </form>
                )}

                {garage.length === 0 ? (
                  <p className="dark:text-gray-400 text-gray-500 text-sm">No vehicles in your garage yet.</p>
                ) : (
                  <div className="space-y-3">
                    {garage.map(v => (
                      <div key={v._id} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${v.isPrimary ? 'border-brand-red/50 dark:bg-brand-red/5 bg-red-50' : 'dark:border-dark-border border-light-border dark:bg-dark-surface-2 bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <Car size={18} className={v.isPrimary ? 'text-brand-red' : 'dark:text-gray-400 text-gray-500'} />
                          <div>
                            <p className="font-semibold dark:text-white text-gray-900 text-sm">{v.year} {v.make} {v.model} {v.trim}</p>
                            {v.nickname && <p className="text-xs dark:text-gray-400 text-gray-500">"{v.nickname}"</p>}
                            {v.isPrimary && <p className="text-xs text-brand-red font-medium">Primary vehicle</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!v.isPrimary && (
                            <button onClick={() => setPrimary(v._id)} className="text-xs dark:text-gray-400 text-gray-500 hover:text-brand-red transition-colors">Set Primary</button>
                          )}
                          <button onClick={() => removeVehicle(v._id)} className="text-xs text-red-400 hover:underline">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6">
                <h2 className="font-heading font-bold text-lg dark:text-white text-gray-900 mb-5">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Order confirmations, shipping updates, and delivery alerts' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Text message updates for order status changes' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium dark:text-white text-gray-900 text-sm">{label}</p>
                        <p className="text-xs dark:text-gray-400 text-gray-500 mt-0.5">{desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user?.[key] || false}
                          onChange={e => handleNotificationUpdate(key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 dark:bg-dark-surface-2 bg-gray-200 rounded-full peer peer-checked:bg-brand-red after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6">
                <h2 className="font-heading font-bold text-lg dark:text-white text-gray-900 mb-5">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1.5">Current Password</label>
                    <input type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} className="input-dark" required />
                  </div>
                  <div>
                    <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1.5">New Password</label>
                    <input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} className="input-dark" required />
                  </div>
                  <div>
                    <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1.5">Confirm New Password</label>
                    <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} className="input-dark" required />
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
