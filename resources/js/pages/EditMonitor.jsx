import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react';

export default function EditMonitor() {
  const { apiCall } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    name: '', url: '', type: 'http', interval: '300', keyword: '', expected_status_code: '200',
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetchMonitor();
  }, [id]);

  const fetchMonitor = async () => {
    try {
      const response = await apiCall(`/api/monitors/${id}`);
      if (response.ok) {
        const data = await response.json();
        setForm({
          name: data.name,
          url: data.url,
          type: data.type,
          interval: String(data.interval),
          keyword: data.keyword || '',
          expected_status_code: String(data.expected_status_code || 200),
        });
      }
    } catch (err) {
      setError('Failed to load monitor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const body = { ...form };
      if (!body.keyword) delete body.keyword;
      body.expected_status_code = parseInt(body.expected_status_code);
      body.interval = parseInt(body.interval);

      const response = await apiCall(`/api/monitors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        navigate(`/monitors/${id}`);
      } else {
        const data = await response.json();
        setError(data.errors ? Object.values(data.errors).flat().join(', ') : 'Failed to update');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const deleteMonitor = async () => {
    if (!confirm('Delete this monitor? This cannot be undone.')) return;
    try {
      const response = await apiCall(`/api/monitors/${id}`, { method: 'DELETE' });
      if (response.ok) navigate('/monitors');
    } catch (err) {}
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/monitors/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Edit Monitor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitor Details</CardTitle>
          <CardDescription>Update your monitor configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP(S)</SelectItem>
                    <SelectItem value="keyword">Keyword</SelectItem>
                    <SelectItem value="port">Port</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interval</Label>
                <Select value={form.interval} onValueChange={(v) => setForm({ ...form, interval: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">Every minute</SelectItem>
                    <SelectItem value="300">Every 5 minutes</SelectItem>
                    <SelectItem value="600">Every 10 minutes</SelectItem>
                    <SelectItem value="1800">Every 30 minutes</SelectItem>
                    <SelectItem value="3600">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.type === 'keyword' && (
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword</Label>
                <Input id="keyword" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status_code">Expected Status Code</Label>
              <Input id="status_code" type="number" value={form.expected_status_code} onChange={(e) => setForm({ ...form, expected_status_code: e.target.value })} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={`/monitors/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>

          <Separator className="my-6" />

          <div>
            <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
            <Button variant="destructive" onClick={deleteMonitor}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Monitor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
