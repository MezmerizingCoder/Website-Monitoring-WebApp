import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save, Shield, User, Bell, Globe, Gauge, ExternalLink, Trash2, Eye, EyeOff } from 'lucide-react';

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export default function Settings() {
  const { user, apiCall } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Profile form
  const [profile, setProfile] = React.useState({
    name: '',
    email: '',
    timezone: 'UTC',
    phone: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = React.useState({
    email_notifications: true,
    sms_notifications: false,
  });

  // Password form
  const [passwords, setPasswords] = React.useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [passwordError, setPasswordError] = React.useState(null);
  const [passwordSuccess, setPasswordSuccess] = React.useState(null);

  // PageSpeed API Key
  const [pagespeedKey, setPagespeedKey] = React.useState('');
  const [showPagespeedKey, setShowPagespeedKey] = React.useState(false);
  const [pagespeedKeyStatus, setPagespeedKeyStatus] = React.useState({ has_api_key: false, key_preview: null });
  const [savingKey, setSavingKey] = React.useState(false);
  const [keyMessage, setKeyMessage] = React.useState(null);
  const [keyError, setKeyError] = React.useState(null);

  React.useEffect(() => {
    fetchProfile();
    fetchPageSpeedKeyStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiCall('/api/user');
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          timezone: data.timezone || 'UTC',
          phone: data.phone || '',
        });
        setNotifications({
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? false,
        });
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiCall('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          ...notifications,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local user state
        localStorage.setItem('user', JSON.stringify(data));
        setMessage('Profile updated successfully.');
      } else {
        const data = await response.json();
        setError(data.errors ? Object.values(data.errors).flat().join(', ') : data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fetchPageSpeedKeyStatus = async () => {
    try {
      const response = await apiCall('/api/pagespeed/key');
      if (response.ok) {
        const data = await response.json();
        setPagespeedKeyStatus(data);
      }
    } catch (err) {}
  };

  const handleSavePageSpeedKey = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    setKeyMessage(null);
    setKeyError(null);

    try {
      const response = await apiCall('/api/pagespeed/key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagespeed_api_key: pagespeedKey }),
      });

      if (response.ok) {
        setKeyMessage('API key saved successfully.');
        setPagespeedKey('');
        fetchPageSpeedKeyStatus();
      } else {
        const data = await response.json();
        setKeyError(data.message || 'Failed to save API key');
      }
    } catch (err) {
      setKeyError('Network error. Please try again.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeletePageSpeedKey = async () => {
    if (!confirm('Remove your PageSpeed API key?')) return;

    try {
      const response = await apiCall('/api/pagespeed/key', { method: 'DELETE' });
      if (response.ok) {
        setKeyMessage('API key removed.');
        setPagespeedKeyStatus({ has_api_key: false, key_preview: null });
      }
    } catch (err) {}
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwords.password !== passwords.password_confirmation) {
      setPasswordError('New passwords do not match.');
      setSavingPassword(false);
      return;
    }

    try {
      const response = await apiCall('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });

      if (response.ok) {
        setPasswordSuccess('Password updated successfully.');
        setPasswords({ current_password: '', password: '', password_confirmation: '' });
      } else {
        const data = await response.json();
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="mb-4 p-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 rounded-md">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about incidents.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts when monitors go down or incidents occur.
              </p>
            </div>
            <Switch
              checked={notifications.email_notifications}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, email_notifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive text message alerts for critical incidents.
              </p>
            </div>
            <Switch
              checked={notifications.sms_notifications}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, sms_notifications: checked })
              }
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleProfileSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PageSpeed API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <CardTitle>PageSpeed Insights API</CardTitle>
              <CardDescription>
                Configure your Google PageSpeed Insights API key to run performance audits.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />Get API Key
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {keyMessage && (
            <div className="mb-4 p-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 rounded-md">
              {keyMessage}
            </div>
          )}
          {keyError && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {keyError}
            </div>
          )}

          {pagespeedKeyStatus.has_api_key ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">API Key Configured</p>
                  <p className="text-xs text-muted-foreground font-mono">{pagespeedKeyStatus.key_preview}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeletePageSpeedKey}>
                  <Trash2 className="h-4 w-4 mr-1" />Remove
                </Button>
              </div>

              <div>
                <Label htmlFor="new_pagespeed_key">Replace with a new key</Label>
                <form onSubmit={handleSavePageSpeedKey} className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input
                      id="new_pagespeed_key"
                      placeholder="Enter new API key"
                      type={showPagespeedKey ? 'text' : 'password'}
                      value={pagespeedKey}
                      onChange={(e) => setPagespeedKey(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPagespeedKey(!showPagespeedKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPagespeedKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button type="submit" disabled={savingKey || !pagespeedKey}>
                    {savingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSavePageSpeedKey} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  To use PageSpeed Insights, you need a Google API key. You can get one for free from the Google Cloud Console.
                </p>
                <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the PageSpeed Insights API</li>
                  <li>Create an API key under Credentials</li>
                </ol>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pagespeed_key">API Key</Label>
                <div className="relative">
                  <Input
                    id="pagespeed_key"
                    placeholder="Enter your Google PageSpeed Insights API key"
                    type={showPagespeedKey ? 'text' : 'password'}
                    value={pagespeedKey}
                    onChange={(e) => setPagespeedKey(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPagespeedKey(!showPagespeedKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPagespeedKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={savingKey}>
                  {savingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save API Key
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {passwordSuccess && (
            <div className="mb-4 p-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 rounded-md">
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                placeholder="••••••••"
                value={passwords.current_password}
                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                required
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.password}
                  onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.password_confirmation}
                  onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Account Info</CardTitle>
              <CardDescription>Your account details and plan information.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Current Plan</span>
            <span className="text-sm font-medium capitalize">{user?.plan?.name || 'Free'}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Monitor Limit</span>
            <span className="text-sm font-medium">{user?.plan?.monitor_limit || 5} monitors</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Check Interval</span>
            <span className="text-sm font-medium">
              Every {user?.plan?.check_interval_seconds
                ? user.plan.check_interval_seconds >= 3600
                  ? `${user.plan.check_interval_seconds / 3600} hour`
                  : `${user.plan.check_interval_seconds / 60} minutes`
                : '5 minutes'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
