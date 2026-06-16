import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import {
  User,
  Lock,
  Shield,
  Save,
  Check,
  AlertTriangle,
} from 'lucide-react';

type Feedback = { type: 'success' | 'error'; text: string } | null;

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  const isError = feedback.type === 'error';
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${
        isError
          ? 'border-red-500/30 bg-red-500/10 text-red-300'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      }`}
    >
      {isError ? (
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      ) : (
        <Check className="w-5 h-5 shrink-0 mt-0.5" />
      )}
      <p className="text-sm">{feedback.text}</p>
    </div>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  // Load the authoritative profile from the server on mount. If it fails we
  // surface the error rather than silently showing stale cached values.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await adminApi.getProfile();
      if (!active) return;
      if (error || !data) {
        setProfileLoadError(error || 'Failed to load profile');
      } else {
        setName(data.name);
        setEmail(data.email);
        updateUser({ name: data.name, email: data.email, role: data.role });
      }
      setProfileLoading(false);
    })();
    return () => {
      active = false;
    };
    // updateUser is stable for the provider's lifetime; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async () => {
    setProfileFeedback(null);
    setProfileSaving(true);
    const { data, error } = await adminApi.updateProfile({ name, email });
    setProfileSaving(false);
    if (error || !data) {
      setProfileFeedback({ type: 'error', text: error || 'Failed to save profile' });
      return;
    }
    setName(data.name);
    setEmail(data.email);
    updateUser({ name: data.name, email: data.email, role: data.role });
    setProfileFeedback({ type: 'success', text: 'Profile updated' });
  };

  const handleChangePassword = async () => {
    setPasswordFeedback(null);
    setPasswordSaving(true);
    const { error } = await adminApi.changePassword({ currentPassword, newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordFeedback({ type: 'error', text: error });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback({ type: 'success', text: 'Password changed' });
  };

  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  const initials = (name || email || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your admin account</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                {profileLoadError ? (
                  <FeedbackBanner feedback={{ type: 'error', text: profileLoadError }} />
                ) : profileLoading ? (
                  <p className="text-sm text-slate-400">Loading profile…</p>
                ) : (
                  <>
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{initials}</span>
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
                    <FeedbackBanner feedback={profileFeedback} />
                    <div className="pt-2">
                      <Button
                        onClick={handleSaveProfile}
                        isLoading={profileSaving}
                        disabled={!name.trim() || !email.trim()}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </>
                )}
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
                  error={newPassword.length > 0 && newPassword.length < 8 ? 'Must be at least 8 characters' : undefined}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  error={passwordsMismatch ? 'Passwords do not match' : undefined}
                />
                <FeedbackBanner feedback={passwordFeedback} />
                <div className="pt-2">
                  <Button
                    onClick={handleChangePassword}
                    isLoading={passwordSaving}
                    disabled={
                      !currentPassword ||
                      newPassword.length < 8 ||
                      newPassword !== confirmPassword
                    }
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
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
