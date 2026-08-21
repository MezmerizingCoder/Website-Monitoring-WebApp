import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trash2, Globe, CheckCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';

export default function WordPressDetail() {
  const { apiCall } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => { fetchSite(); }, [id]);

  const fetchSite = async () => {
    try {
      const response = await apiCall(`/api/wordpress-sites/${id}`);
      if (response.ok) setSite(await response.json());
    } catch (err) {} finally { setLoading(false); }
  };

  const deleteSite = async () => {
    if (!confirm('Remove this site?')) return;
    try {
      const response = await apiCall(`/api/wordpress-sites/${id}`, { method: 'DELETE' });
      if (response.ok) navigate('/wordpress');
    } catch (err) {}
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>;
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Site not found</p>
        <Button asChild><Link to="/wordpress">Back</Link></Button>
      </div>
    );
  }

  const plugins = site?.plugins || [];
  const filtered = plugins.filter((p) => {
    if (filter === 'outdated') return p.has_update;
    if (filter === 'up-to-date') return !p.has_update;
    return true;
  });
  const outdatedCount = plugins.filter((p) => p.has_update).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link to="/wordpress"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{site.name}</h1>
              <Badge variant={site.status === 'active' ? 'success' : 'warning'}>{site.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{site.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/uptime-guard-wp.zip" download className="whitespace-nowrap"><Download className="h-4 w-4 mr-2" />Download Plugin</a>
          </Button>
          <Button variant="destructive" onClick={deleteSite}><Trash2 className="h-4 w-4 mr-2" />Remove Site</Button>
        </div>
      </div>

      {site.status === 'pending' && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ This site is pending. Install the plugin and enter pairing code <strong>{site.pairing_code}</strong>.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Globe className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-bold">{plugins.length}</p><p className="text-xs text-muted-foreground">Total Plugins</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <div><p className="text-2xl font-bold">{plugins.length - outdatedCount}</p><p className="text-xs text-muted-foreground">Up to Date</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-bold">{outdatedCount}</p><p className="text-xs text-muted-foreground">Outdated</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Last Sync</p>
              <p className="text-sm font-medium">{site.last_sync_at ? new Date(site.last_sync_at).toLocaleString() : 'Never'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: `All (${plugins.length})` },
          { key: 'outdated', label: `Outdated (${outdatedCount})` },
          { key: 'up-to-date', label: `Up to Date (${plugins.length - outdatedCount})` },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plugin</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Update Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {plugins.length === 0 ? 'No plugin data yet.' : 'No plugins match this filter.'}
                  </TableCell>
                </TableRow>
              ) : filtered.map((plugin) => (
                <TableRow key={plugin.id}>
                  <TableCell>
                    <p className="font-medium">{plugin.plugin_name}</p>
                    {plugin.plugin_uri && (
                      <a href={plugin.plugin_uri} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        View details ↗
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{plugin.version || '—'}</TableCell>
                  <TableCell>
                    {plugin.has_update ? (
                      <span className="font-mono text-sm font-semibold text-red-600">{plugin.update_version}</span>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={plugin.has_update ? 'danger' : 'success'}>
                      {plugin.has_update ? 'Update Available' : 'Up to Date'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plugin.status === 'active' ? 'success' : 'secondary'}>
                      {plugin.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
