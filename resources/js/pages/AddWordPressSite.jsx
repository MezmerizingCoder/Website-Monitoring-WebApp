import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Copy, CheckCircle, Download } from 'lucide-react';

export default function AddWordPressSite() {
  const { apiCall } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ name: '', url: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [created, setCreated] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall('/api/wordpress-sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setCreated(await response.json());
      } else {
        const data = await response.json();
        setError(data.errors ? Object.values(data.errors).flat().join(', ') : 'Failed to create site');
      }
    } catch (err) {
      setError('Network error');
    } finally { setLoading(false); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(created.pairing_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (created) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground">WordPress Site Added!</h1>

        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-emerald-800 dark:text-emerald-200">Site registered successfully!</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Pairing Code</CardTitle>
            <CardDescription>Enter this code in the WordPress plugin settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
              <code className="text-3xl font-bold tracking-widest text-primary">{created.pairing_code}</code>
            </div>
            <Button variant="outline" className="w-full" onClick={copyCode}>
              {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Pairing Code'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Connect</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {[
                { step: 1, title: 'Install the Plugin', desc: 'Download and install the UptimeGuard plugin on your WordPress site.' },
                { step: 2, title: 'Activate the Plugin', desc: 'Go to Plugins and click Activate.' },
                { step: 3, title: 'Enter Credentials', desc: 'In Settings → UptimeGuard, enter your App URL and Pairing Code.' },
                { step: 4, title: 'Click Connect', desc: 'The plugin will pair and start syncing automatically.' },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold text-primary-foreground bg-primary rounded-full">{item.step}</span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Separator className="my-4" />

            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <p><strong>App URL:</strong> {window.location.origin}</p>
              <p><strong>Pairing Code:</strong> {created.pairing_code}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button asChild><Link to={`/wordpress/${created.id}`}>View Site Dashboard</Link></Button>
          <Button variant="outline" asChild><Link to="/wordpress">Back to Sites</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/wordpress"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold text-foreground">Add WordPress Site</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input placeholder="My WordPress Blog" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>WordPress URL</Label>
              <Input type="url" placeholder="https://example.com" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create & Get Pairing Code'}</Button>
              <Button type="button" variant="outline" asChild><Link to="/wordpress">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
