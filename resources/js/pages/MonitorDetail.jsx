import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Pencil, Pause, Play, Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function MonitorDetail() {
  const { apiCall } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [monitor, setMonitor] = React.useState(null);
  const [checks, setChecks] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [monitorRes, checksRes, statsRes] = await Promise.all([
        apiCall(`/api/monitors/${id}`),
        apiCall(`/api/monitors/${id}/checks`),
        apiCall(`/api/monitors/${id}/stats`),
      ]);

      if (monitorRes.ok) setMonitor(await monitorRes.json());
      if (checksRes.ok) { const d = await checksRes.json(); setChecks(d.data || d || []); }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const toggleMonitor = async () => {
    const endpoint = monitor.status === 'paused' ? 'resume' : 'pause';
    try {
      const response = await apiCall(`/api/monitors/${id}/${endpoint}`, { method: 'POST' });
      if (response.ok) {
        setMonitor((prev) => ({ ...prev, status: prev.status === 'paused' ? 'up' : 'paused' }));
      }
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!confirm('Delete this monitor? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const response = await apiCall(`/api/monitors/${id}`, { method: 'DELETE' });
      if (response.ok) navigate('/monitors');
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Monitor not found</p>
        <Button asChild><Link to="/monitors">Back to Monitors</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/monitors"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{monitor.name}</h1>
              <Badge variant={
                monitor.status === 'up' ? 'success' :
                monitor.status === 'down' ? 'danger' : 'secondary'
              }>
                {monitor.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{monitor.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={toggleMonitor} title={monitor.status === 'paused' ? 'Resume' : 'Pause'}>
            {monitor.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/monitors/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-2xl font-bold">{monitor.uptime_percentage}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Response</p>
            <p className="text-2xl font-bold">{monitor.avg_response_time ? `${monitor.avg_response_time}ms` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Last Response</p>
            <p className="text-2xl font-bold">{monitor.last_response_time ? `${monitor.last_response_time}ms` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Last Checked</p>
            <p className="text-sm font-medium">
              {monitor.last_checked_at ? new Date(monitor.last_checked_at).toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Uptime Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uptime by Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { label: '24h', value: stats.last_24h },
                { label: '7d', value: stats.last_7d },
                { label: '30d', value: stats.last_30d },
                { label: 'All', value: stats.all_time },
              ].map((period) => (
                <div key={period.label}>
                  <p className="text-xs text-muted-foreground">{period.label}</p>
                  <p className="text-lg font-bold">{period.value ?? '—'}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Check History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Status Code</TableHead>
                <TableHead>Checked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No checks yet
                  </TableCell>
                </TableRow>
              ) : (
                checks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell>
                      {check.is_up ? (
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle className="h-4 w-4" /> Up
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-600">
                          <XCircle className="h-4 w-4" /> Down
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{check.response_time ? `${check.response_time}ms` : '—'}</TableCell>
                    <TableCell>{check.status_code || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(check.checked_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
