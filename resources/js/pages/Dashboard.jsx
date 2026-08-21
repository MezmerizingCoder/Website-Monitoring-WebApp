import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  Plus,
  TrendingUp,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Activity,
} from 'lucide-react';

const chartConfig = {
  up: {
    label: "Up",
    color: "#171717",
  },
  down: {
    label: "Down",
    color: "#a3a3a3",
  },
};

const pieConfig = {
  up: { label: "Up", color: "#171717" },
  down: { label: "Down", color: "#d4d4d4" },
  paused: { label: "Paused", color: "#e5e5e5" },
};

export default function Dashboard() {
  const { apiCall } = useAuth();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState('30');
  const [chartLoading, setChartLoading] = React.useState(false);

  React.useEffect(() => {
    fetchDashboard();
  }, [timeRange]);

  const fetchDashboard = async () => {
    if (data) setChartLoading(true);
    try {
      const response = await apiCall(`/api/dashboard?days=${timeRange}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-72" /></div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[120px]" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-[350px]" />
          <Skeleton className="lg:col-span-3 h-[350px]" />
        </div>
      </div>
    );
  }

  const { stats = {}, monitors = [], recent_incidents = [], uptime_history = [] } = data || {};

  // Pie chart data
  const pieData = [
    { name: "Up", value: stats.up_monitors || 0, fill: "var(--color-up)" },
    { name: "Down", value: stats.down_monitors || 0, fill: "var(--color-down)" },
    { name: "Paused", value: stats.paused_monitors || 0, fill: "var(--color-paused)" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your websites and track uptime performance.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/monitors/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Monitor
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="bg-background text-foreground shadow-sm">
          Overview
        </Button>
        <Button variant="ghost" size="sm">Analytics</Button>
        <Button variant="ghost" size="sm">Reports</Button>
        <Button variant="ghost" size="sm">Notifications</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monitors</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_monitors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monitor_limit || 5} limit on current plan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overall_uptime || 100}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avg_response_time ? `${stats.avg_response_time}ms` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all monitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Down</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.down_monitors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.down_monitors > 0 ? 'Requires attention' : 'All systems operational'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Area Chart */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle>Uptime Overview</CardTitle>
              <CardDescription>Up vs Down monitors over the last {timeRange === '7' ? '7 days' : timeRange === '30' ? '30 days' : '90 days'}</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="relative">
            {chartLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground" />
              </div>
            )}
            {uptime_history.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uptime_history} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => `${value} monitors`}
                      />
                    }
                  />
                  <Area
                    dataKey="up"
                    type="natural"
                    fill="var(--color-up)"
                    fillOpacity={0.4}
                    stroke="var(--color-up)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="down"
                    type="natural"
                    fill="var(--color-down)"
                    fillOpacity={0.4}
                    stroke="var(--color-down)"
                    strokeWidth={2}
                  />
                </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data yet. Add a monitor to start tracking.
              </div>
            )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Monitor Status */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monitor Status</CardTitle>
            <CardDescription>Current status of all monitors</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ChartContainer config={pieConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => `${value} monitors`}
                      />
                    }
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                    stroke="#fff"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No monitors yet
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#171717]" />
                <span className="text-muted-foreground">Up ({stats.up_monitors || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#d4d4d4]" />
                <span className="text-muted-foreground">Down ({stats.down_monitors || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#e5e5e5]" />
                <span className="text-muted-foreground">Paused ({stats.paused_monitors || 0})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Monitors</CardTitle>
            <CardDescription>
              You have {stats.total_monitors || 0} monitors configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monitors.length > 0 ? (
              <div className="space-y-4">
                {monitors.slice(0, 5).map((monitor) => (
                  <div key={monitor.id} className="flex items-center">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {monitor.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <Link
                        to={`/monitors/${monitor.id}`}
                        className="text-sm font-medium leading-none hover:underline"
                      >
                        {monitor.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{monitor.url}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <Badge
                        variant={monitor.status === 'up' ? 'default' : monitor.status === 'down' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {monitor.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {monitor.uptime_percentage}% uptime
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Globe className="h-8 w-8 mb-2" />
                <p className="text-sm">No monitors yet</p>
              </div>
            )}
            {monitors.length > 5 && (
              <Button asChild variant="ghost" className="w-full mt-4" size="sm">
                <Link to="/monitors">
                  View all monitors
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>
              {recent_incidents.length > 0
                ? `You have ${recent_incidents.length} recent incidents.`
                : 'No recent incidents.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recent_incidents.length > 0 ? (
              <div className="space-y-4">
                {recent_incidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${
                      incident.status === 'ongoing' ? 'bg-red-500' :
                      incident.status === 'resolved' ? 'bg-emerald-500' : 'bg-yellow-500'
                    }`} />
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {incident.monitor?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {incident.message}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <Badge
                        variant={
                          incident.status === 'ongoing' ? 'destructive' :
                          incident.status === 'resolved' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {incident.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(incident.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mb-2" />
                <p className="text-sm">All systems operational</p>
              </div>
            )}
            {recent_incidents.length > 5 && (
              <Button asChild variant="ghost" className="w-full mt-4" size="sm">
                <Link to="/incidents">
                  View all incidents
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
