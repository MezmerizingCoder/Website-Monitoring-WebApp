import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Globe } from 'lucide-react';

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Force dark theme on login page
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      // Restore user's preference on unmount
      const saved = localStorage.getItem('theme');
      if (saved === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  // Handle OAuth callback
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const socialToken = params.get('social_token');
    const socialUser = params.get('social_user');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      window.history.replaceState({}, '', '/login');
      return;
    }

    if (socialToken && socialUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(socialUser));
        localStorage.setItem('auth_token', socialToken);
        localStorage.setItem('user', JSON.stringify(userData));
        window.history.replaceState({}, '', '/');
        window.location.href = '/';
      } catch (err) {
        setError('Failed to process social login.');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.password_confirmation);
      } else {
        await login(form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google/redirect';
  };

  const handleAppleLogin = () => {
    window.location.href = '/api/auth/apple/redirect';
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left: Form */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <Globe className="size-4" />
                  </div>
                  <span className="text-xl font-bold text-white">UptimeGuard</span>
                </div>

                {/* Heading */}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    {isRegister ? 'Create an account' : 'Welcome back'}
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    {isRegister
                      ? 'Enter your details to get started.'
                      : 'Sign in to your account to continue.'}
                  </p>
                </div>

                {/* Social Buttons */}
                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white" onClick={handleGoogleLogin}>
                    <GoogleIcon className="mr-2 size-4" />
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white" onClick={handleAppleLogin}>
                    <AppleIcon className="mr-2 size-4" />
                    Continue with Apple
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900 px-2 text-zinc-500">or continue with email</span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isRegister && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-zinc-300">Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                  {isRegister && (
                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation" className="text-zinc-300">Confirm Password</Label>
                      <Input
                        id="password_confirmation"
                        type="password"
                        placeholder="••••••••"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-indigo-500"
                        value={form.password_confirmation}
                        onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-500" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isRegister ? 'Create Account' : 'Sign In'}
                  </Button>
                </form>

                {/* Toggle */}
                <div className="text-center text-sm text-zinc-400">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => { setIsRegister(!isRegister); setError(null); }}
                    className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium underline-offset-4"
                  >
                    {isRegister ? 'Sign In' : 'Register'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Image / Branding */}
            <div className="relative hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-zinc-900 md:block">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
                  <Globe className="size-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Monitor Your Websites</h2>
                <p className="text-indigo-200 max-w-xs">
                  Track uptime, performance, and SSL status for all your websites in one place.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">99.9%</p>
                    <p className="text-xs text-indigo-200">Uptime</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">24/7</p>
                    <p className="text-xs text-indigo-200">Monitoring</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">Instant</p>
                    <p className="text-xs text-indigo-200">Alerts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          By continuing, you agree to our{' '}
          <a href="#" className="underline underline-offset-4 hover:text-zinc-300">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline underline-offset-4 hover:text-zinc-300">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
