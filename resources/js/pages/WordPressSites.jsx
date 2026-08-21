import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Eye, Trash2, Globe, CheckCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';

export default function WordPressSites() {
  const { apiCall } = useAuth();
  const [sites, setSites] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => { fetchSites(); }, []);

  const fetchSites = async () => {
    try {
      const response = await apiCall('/api/wordpress-sites');
      if (response.ok) setSites(await response.json());
    } catch (err) {} finally { setLoading(false); }
  };

  const deleteSite = async (id) => {
    if (!confirm('Remove this site?')) return;
    try {
      const response = await apiCall(`/api/wordpress-sites/${id}`, { method: 'DELETE' });
      if (response.ok) setSites((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {}
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  }

  const totalOutdated = sites.reduce((sum, s) => sum + (s.outdated_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">WordPress Update Monitor</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/uptime-guard-wp.zip" download className="whitespace-nowrap"><Download className="h-4 w-4 mr-2" />Download Plugin</a>
          </Button>
          <Button asChild>
            <Link to="/wordpress/add" className="whitespace-nowrap"><Plus className="h-4 w-4 mr-2" />Add WordPress Site</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Globe className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-bold">{sites.length}</p><p className="text-xs text-muted-foreground">Total Sites</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <div><p className="text-2xl font-bold">{sites.filter((s) => s.status === 'active').length}</p><p className="text-xs text-muted-foreground">Connected</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-bold">{totalOutdated}</p><p className="text-xs text-muted-foreground">Outdated Plugins</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plugins</TableHead>
                <TableHead>Outdated</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground mb-2">No WordPress sites yet</p>
                    <Button asChild size="sm"><Link to="/wordpress/add">Add your first site</Link></Button>
                  </TableCell>
                </TableRow>
              ) : sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>
                    <Link to={`/wordpress/${site.id}`} className="font-medium hover:text-primary">{site.name}</Link>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{site.url}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={site.status === 'active' ? 'success' : site.status === 'pending' ? 'warning' : 'secondary'}>
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{site.plugins_count || 0} <span className="text-muted-foreground">({site.active_plugins_count || 0} active)</span></TableCell>
                  <TableCell>
                    {(site.outdated_count || 0) > 0 ? (
                      <Badge variant="danger">{site.outdated_count} update{site.outdated_count !== 1 ? 's' : ''}</Badge>
                    ) : (
                      <span className="text-sm text-emerald-600">All up to date</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {site.last_sync_at ? new Date(site.last_sync_at).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/wordpress/${site.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSite(site.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
