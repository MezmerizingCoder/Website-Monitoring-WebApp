import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Incidents() {
  const { apiCall } = useAuth();
  const [incidents, setIncidents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [pagination, setPagination] = React.useState({});

  React.useEffect(() => { fetchIncidents(); }, [statusFilter]);

  const fetchIncidents = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await apiCall(`/api/incidents?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIncidents(data.data || []);
        setPagination({ current_page: data.current_page, last_page: data.last_page, total: data.total });
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const resolveIncident = async (id) => {
    try {
      const response = await apiCall(`/api/incidents/${id}/resolve`, { method: 'POST' });
      if (response.ok) {
        setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, status: 'resolved', resolved_at: new Date().toISOString() } : i));
      }
    } catch (err) {}
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Incidents</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monitor</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500/50" />
                    <p className="text-muted-foreground">No incidents found</p>
                  </TableCell>
                </TableRow>
              ) : incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.monitor?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{incident.message}</TableCell>
                  <TableCell>
                    <Badge variant={
                      incident.status === 'ongoing' ? 'danger' :
                      incident.status === 'resolved' ? 'success' : 'warning'
                    }>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(incident.started_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {incident.duration ? `${Math.round(incident.duration / 60)}m` : incident.resolved_at ? `${Math.round((new Date(incident.resolved_at) - new Date(incident.started_at)) / 60000)}m` : '—'}
                  </TableCell>
                  <TableCell>
                    {incident.status === 'ongoing' && (
                      <Button variant="outline" size="sm" onClick={() => resolveIncident(incident.id)}>
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {pagination.current_page} of {pagination.last_page}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.current_page <= 1} onClick={() => fetchIncidents(pagination.current_page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page} onClick={() => fetchIncidents(pagination.current_page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
