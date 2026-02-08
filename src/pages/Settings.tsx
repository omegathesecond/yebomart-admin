import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import {
  User,
  Lock,
  Bell,
  Shield,
  Database,
  Save,
  Check,
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'system'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [name, setName] = useState(user?.name || 'Admin User');
  const [email, setEmail] = useState(user?.email || 'admin@yebomart.com');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newShopAlerts, setNewShopAlerts] = useState(true);
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // System state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [defaultTier, setDefaultTier] = useState('lite');

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your account and system settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" />
                  Profile Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{name}</p>
                    <p className="text-sm text-slate-400">{email}</p>
                  </div>
                </div>
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="pt-4">
                  <Button onClick={handleSave} isLoading={isSaving}>
                    {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-400" />
                  Security Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="pb-4 border-b border-slate-700">
                  <h3 className="font-medium text-white mb-1">Change Password</h3>
                  <p className="text-sm text-slate-400">Update your password to keep your account secure</p>
                </div>
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  error={confirmPassword && confirmPassword !== newPassword ? 'Passwords do not match' : undefined}
                />
                <div className="pt-4">
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-400" />
                  Notification Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="font-medium text-white">Email Notifications</p>
                      <p className="text-sm text-slate-400">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="font-medium text-white">New Shop Alerts</p>
                      <p className="text-sm text-slate-400">Get notified when a new shop registers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newShopAlerts}
                      onChange={(e) => setNewShopAlerts(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="font-medium text-white">Subscription Alerts</p>
                      <p className="text-sm text-slate-400">Get notified about subscription changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={subscriptionAlerts}
                      onChange={(e) => setSubscriptionAlerts(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="font-medium text-white">Weekly Reports</p>
                      <p className="text-sm text-slate-400">Receive weekly summary reports</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={weeklyReports}
                      onChange={(e) => setWeeklyReports(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                  </label>
                </div>
                <div className="pt-4">
                  <Button onClick={handleSave} isLoading={isSaving}>
                    {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {saved ? 'Saved!' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-slate-400" />
                  System Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="font-medium text-white">Maintenance Mode</p>
                      <p className="text-sm text-slate-400">Disable access for non-admin users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="font-medium text-white">Allow New Registrations</p>
                      <p className="text-sm text-slate-400">Allow new shops to register</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowRegistrations}
                      onChange={(e) => setAllowRegistrations(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                  </label>
                  <div className="p-3 rounded-lg bg-slate-700/50">
                    <label className="block">
                      <p className="font-medium text-white mb-1">Default Subscription Tier</p>
                      <p className="text-sm text-slate-400 mb-3">Tier assigned to new shops</p>
                      <select
                        value={defaultTier}
                        onChange={(e) => setDefaultTier(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="lite">Lite (Free)</option>
                        <option value="starter">Starter</option>
                        <option value="business">Business</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={handleSave} isLoading={isSaving}>
                    {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {saved ? 'Saved!' : 'Save Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
