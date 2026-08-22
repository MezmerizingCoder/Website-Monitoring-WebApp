import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users, Shield, UserX, UserCheck, Activity, Globe, BarChart3, Search,
  MoreVertical, Trash2, Lock, Unlock, Crown, Eye, AlertTriangle,
} from 'lucide-react';

export default function AdminPanel() {
  const { apiCall, user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [pagination, setPagination] = React.useState({});
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [showDetail, setShowDetail] = React.useState(false);

  React.useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const response = await apiCall('/api/admin/stats');
      if (response.ok) setStats(await response.json());
    } catch (err) {}
  };

  const fetchUsers = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page });
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await apiCall(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        setPagination({ current_page: data.current_page, last_page: data.last_page, total: data.total });
      }
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleBlock = async (userId, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const response = await apiCall(`/api/admin/users/${userId}/${action}`, { method: 'PUT' });
      if (response.ok) {
        setUsers((prev) => prev.map((u) =>
          u.id === userId ? { ...u, is_blocked: !isBlocked } : u
        ));
        fetchStats();
      }
    } catch (err) {}
  };

  const toggleAdmin = async (userId) => {
    if (!confirm('Toggle admin status for this user?')) return;

    try {
      const response = await apiCall(`/api/admin/users/${userId}/toggle-admin`, { method: 'PUT' });
      if (response.ok) {
        setUsers((prev) => prev.map((u) =>
          u.id === userId ? { ...u, is_admin: !u.is_admin } : u
        ));
        fetchStats();
      }
    } catch (err) {}
  };

  const deleteUser = async (userId, userName) => {
    if (!confirm(`Permanently delete "${userName}"? This cannot be undone.`)) return;

    try {
      const response = await apiCall(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        fetchStats();
        if (selectedUser?.id === userId) { setSelectedUser(null); setShowDetail(false); }
      }
    } catch (err) {}
  };

  const viewUser = async (userId) => {
    try {
      const response = await apiCall(`/api/admin/users/${userId}`);
      if (response.ok) {
        setSelectedUser(await response.json());
        setShowDetail(true);
      }
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users and monitor system health.</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Crown className="h-3 w-3" /> Super Admin
        </Badge>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total_users}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active_users}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <UserX className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.blocked_users}</p>
                <p className="text-xs text-muted-foreground">Blocked</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Globe className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total_monitors}</p>
                <p className="text-xs text-muted-foreground">Total Monitors</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search + Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">Search</Button>
            </form>
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'blocked', label: 'Blocked' },
                { key: 'admin', label: 'Admins' },
              ].map((f) => (
                <Button
                  key={f.key}
                  variant={statusFilter === f.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {showDetail && selectedUser && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">User Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowDetail(false)}>✕ Close</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <Badge variant="outline">{selectedUser.plan?.name || 'Free'}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={selectedUser.is_blocked ? 'danger' : 'success'}>
                  {selectedUser.is_blocked ? 'Blocked' : 'Active'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monitors</p>
                <p className="text-sm font-medium">{selectedUser.monitors_count} ({selectedUser.active_monitors_count} active)</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WordPress Sites</p>
                <p className="text-sm font-medium">{selectedUser.wordpress_sites_count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Incidents</p>
                <p className="text-sm font-medium">{selectedUser.incidents_count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users ({pagination.total || users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Monitors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.is_admin ? (
                      <Badge variant="default" className="gap-1">
                        <Crown className="h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{u.plan?.name || 'Free'}</Badge>
                  </TableCell>
                  <TableCell>{u.monitors_count || 0}</TableCell>
                  <TableCell>
                    {u.is_blocked ? (
                      <Badge variant="danger" className="gap-1">
                        <Lock className="h-3 w-3" /> Blocked
                      </Badge>
                    ) : (
                      <Badge variant="success" className="gap-1">
                        <UserCheck className="h-3 w-3" /> Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewUser(u.id)}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.id !== user.id && (
                          <>
                            <DropdownMenuItem onClick={() => toggleBlock(u.id, u.is_blocked)}>
                              {u.is_blocked ? (
                                <><Unlock className="h-4 w-4 mr-2" />Unblock</>
                              ) : (
                                <><Lock className="h-4 w-4 mr-2" />Block</>
                              )}
                            </DropdownMenuItem>
                            {!u.is_admin && (
                              <DropdownMenuItem onClick={() => toggleAdmin(u.id)}>
                                <Crown className="h-4 w-4 mr-2" />Make Admin
                              </DropdownMenuItem>
                            )}
                            {u.is_admin && (
                              <DropdownMenuItem onClick={() => toggleAdmin(u.id)}>
                                <Shield className="h-4 w-4 mr-2" />Remove Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteUser(u.id, u.name)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} users)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.current_page <= 1}
              onClick={() => fetchUsers(pagination.current_page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchUsers(pagination.current_page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
