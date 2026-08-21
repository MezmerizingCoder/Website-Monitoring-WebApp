import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  Pause,
  Play,
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export default function Monitors() {
  const { apiCall } = useAuth();
  const [monitors, setMonitors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({});

  React.useEffect(() => {
    fetchMonitors();
  }, []);

  const fetchMonitors = async (page = 1) => {
    try {
      const response = await apiCall(`/api/monitors?page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setMonitors(data.data || []);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
        });
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const toggleMonitor = async (monitor) => {
    const endpoint = monitor.status === 'paused' ? 'resume' : 'pause';
    try {
      const response = await apiCall(`/api/monitors/${monitor.id}/${endpoint}`, { method: 'POST' });
      if (response.ok) {
        setMonitors((prev) =>
          prev.map((m) =>
            m.id === monitor.id
              ? { ...m, status: m.status === 'paused' ? 'up' : 'paused' }
              : m
          )
        );
      }
    } catch (err) {}
  };

  const deleteMonitor = async (monitor) => {
    if (!confirm(`Delete "${monitor.name}"? This cannot be undone.`)) return;
    try {
      const response = await apiCall(`/api/monitors/${monitor.id}`, { method: 'DELETE' });
      if (response.ok) {
        setMonitors((prev) => prev.filter((m) => m.id !== monitor.id));
      }
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const upCount = monitors.filter((m) => m.status === 'up').length;
  const downCount = monitors.filter((m) => m.status === 'down').length;
  const pausedCount = monitors.filter((m) => m.status === 'paused').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Monitors</h1>
        <Button asChild>
          <Link to="/monitors/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Monitor
          </Link>
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{upCount}</p>
              <p className="text-xs text-muted-foreground">Up</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{downCount}</p>
              <p className="text-xs text-muted-foreground">Down</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{pausedCount}</p>
              <p className="text-xs text-muted-foreground">Paused</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monitor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground mb-2">No monitors yet</p>
                    <Button asChild size="sm">
                      <Link to="/monitors/create">Add your first monitor</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                monitors.map((monitor) => (
                  <TableRow key={monitor.id}>
                    <TableCell>
                      <Link to={`/monitors/${monitor.id}`} className="font-medium hover:text-primary transition-colors">
                        {monitor.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{monitor.url}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        monitor.status === 'up' ? 'success' :
                        monitor.status === 'down' ? 'danger' :
                        monitor.status === 'paused' ? 'secondary' : 'warning'
                      }>
                        {monitor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{monitor.uptime_percentage}%</TableCell>
                    <TableCell>
                      {monitor.last_response_time ? `${monitor.last_response_time}ms` : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {monitor.last_checked_at ? new Date(monitor.last_checked_at).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/monitors/${monitor.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/monitors/${monitor.id}/edit`}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleMonitor(monitor)}>
                            {monitor.status === 'paused' ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </>
                            ) : (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteMonitor(monitor)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} monitors)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page <= 1}
              onClick={() => fetchMonitors(pagination.current_page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchMonitors(pagination.current_page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
