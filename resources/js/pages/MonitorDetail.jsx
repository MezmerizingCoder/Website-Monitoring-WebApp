import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Pencil, Pause, Play, Trash2, RefreshCw, CheckCircle, XCircle, Clock,
  Gauge, Loader2, AlertTriangle, Settings, ExternalLink,
  Shield, Globe, Server, Wifi, Timer, Link2, FileText,
} from 'lucide-react';

// ── Score Circle Component ──
function ScoreCircle({ score, label }) {
  const getColor = (s) => {
    if (s >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800';
    if (s >= 50) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold text-lg ${getColor(score)}`}>
        {score}
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

// ── Metric Card ──
function MetricCard({ metric }) {
  if (!metric) return null;
  const getScoreColor = (score) => {
    if (score >= 0.9) return 'text-emerald-600';
    if (score >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{metric.title}</p>
        {metric.score !== null && (
          <span className={`text-xs font-medium ${getScoreColor(metric.score)}`}>
            {Math.round(metric.score * 100)}
          </span>
        )}
      </div>
      <p className="text-lg font-bold mt-1">{metric.value}</p>
    </div>
  );
}

// ── Detail Row ──
function DetailRow({ label, value, icon: Icon, badge, badgeVariant }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <div className="text-sm font-medium text-right">
        {badge ? (
          <Badge variant={badgeVariant || 'secondary'}>{badge}</Badge>
        ) : (
          value || '—'
        )}
      </div>
    </div>
  );
}

export default function MonitorDetail() {
  const { apiCall } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  // Uptime state
  const [monitor, setMonitor] = React.useState(null);
  const [checks, setChecks] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);

  // PageSpeed state
  const [hasApiKey, setHasApiKey] = React.useState(false);
  const [pagespeedStrategy, setPagespeedStrategy] = React.useState('mobile');
  const [runningPS, setRunningPS] = React.useState(false);
  const [psResult, setPsResult] = React.useState(null);
  const [psError, setPsError] = React.useState(null);

  React.useEffect(() => {
    fetchData();
    checkPageSpeedKey();
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
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const checkPageSpeedKey = async () => {
    try {
      const response = await apiCall('/api/pagespeed/key');
      if (response.ok) {
        const data = await response.json();
        setHasApiKey(data.has_api_key);
      }
    } catch (err) {}
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

  const runPageSpeedCheck = async () => {
    if (!monitor?.url) return;
    setRunningPS(true);
    setPsResult(null);
    setPsError(null);
    try {
      const response = await apiCall(`/api/monitors/${id}/pagespeed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: pagespeedStrategy }),
      });
      if (response.ok) {
        setPsResult(await response.json());
      } else {
        const data = await response.json();
        if (data.setup_required) { navigate('/settings'); return; }
        setPsError(data.message || 'Failed to run PageSpeed check');
      }
    } catch (err) {
      setPsError('Network error. Please try again.');
    } finally {
      setRunningPS(false);
    }
  };

  const getSslBadge = (status) => {
    const map = {
      valid: { variant: 'success', label: 'Valid' },
      expiring_soon: { variant: 'warning', label: 'Expiring Soon' },
      expired: { variant: 'danger', label: 'Expired' },
      invalid: { variant: 'danger', label: 'Invalid' },
      missing: { variant: 'secondary', label: 'Missing' },
      unknown: { variant: 'outline', label: 'Unknown' },
    };
    return map[status] || map.unknown;
  };

  const getStatusBadge = (code) => {
    if (!code) return { variant: 'secondary', label: '—' };
    if (code >= 200 && code < 300) return { variant: 'success', label: `${code}` };
    if (code >= 300 && code < 400) return { variant: 'warning', label: `${code}` };
    return { variant: 'danger', label: `${code}` };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
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

  const sslBadge = getSslBadge(monitor.ssl_status);
  const statusBadge = getStatusBadge(monitor.http_status_code);

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
              <Pencil className="h-4 w-4 mr-2" />Edit
            </Link>
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-2xl font-bold">{monitor.uptime_percentage}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Response Time</p>
            <p className="text-2xl font-bold">{monitor.last_response_time ? `${monitor.last_response_time}ms` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">HTTP Status</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{monitor.http_status_code || '—'}</p>
              <Badge variant={statusBadge.variant} className="text-xs">{statusBadge.label}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">SSL</p>
            <div className="flex items-center gap-2">
              <Badge variant={sslBadge.variant}>{sslBadge.label}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">IP Address</p>
            <p className="text-sm font-mono font-bold truncate">{monitor.ip_address || '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details" className="gap-1.5">
            <Server className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="uptime" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Uptime
          </TabsTrigger>
          <TabsTrigger value="pagespeed" className="gap-1.5">
            <Gauge className="h-4 w-4" />
            PageSpeed
          </TabsTrigger>
        </TabsList>

        {/* ══════ Details Tab ══════ */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* HTTP Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" /> HTTP Information
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <DetailRow label="Status Code" icon={FileText}
                  badge={monitor.http_status_code ? `${monitor.http_status_code} ${monitor.http_status_text || ''}` : null}
                  badgeVariant={statusBadge.variant} />
                <DetailRow label="Content Type" value={monitor.content_type} />
                <DetailRow label="Content Length" value={monitor.content_length ? `${(monitor.content_length / 1024).toFixed(1)} KB` : null} />
                <DetailRow label="Redirects" value={monitor.redirect_count > 0 ? `${monitor.redirect_count} redirect(s)` : 'None'} />
                {monitor.redirect_url && (
                  <DetailRow label="Redirects To" value={monitor.redirect_url} />
                )}
                <DetailRow label="Last Checked"
                  value={monitor.last_checked_at ? new Date(monitor.last_checked_at).toLocaleString() : 'Never'} />
              </CardContent>
            </Card>

            {/* SSL Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" /> SSL Certificate
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <DetailRow label="Status" icon={Shield}
                  badge={sslBadge.label} badgeVariant={sslBadge.variant} />
                <DetailRow label="Issuer" value={monitor.ssl_issuer} />
                <DetailRow label="Expiry Date"
                  value={monitor.ssl_expiry ? new Date(monitor.ssl_expiry).toLocaleDateString() : null} />
                <DetailRow label="Days Remaining"
                  value={monitor.ssl_days_remaining !== null ? `${monitor.ssl_days_remaining} days` : null} />
              </CardContent>
            </Card>

            {/* Server Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4" /> Server Information
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <DetailRow label="IP Address" icon={Globe}
                  value={monitor.ip_address ? (
                    <span className="font-mono">{monitor.ip_address}</span>
                  ) : null} />
                <DetailRow label="Server" value={monitor.server_software} />
                <DetailRow label="Hosting Provider"
                  value={monitor.hosting_provider || (monitor.ip_address ? 'Unknown' : null)} />
                <DetailRow label="CDN Provider"
                  value={monitor.cdn_provider || 'None'} />
              </CardContent>
            </Card>

            {/* Timing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="h-4 w-4" /> Connection Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <DetailRow label="Total Response" value={monitor.last_response_time ? `${monitor.last_response_time}ms` : null} />
                <DetailRow label="DNS Lookup" value={monitor.dns_time ? `${monitor.dns_time}ms` : null} />
                <DetailRow label="TCP Connect" value={monitor.connect_time ? `${monitor.connect_time}ms` : null} />
                <DetailRow label="TLS Handshake" value={monitor.tls_time ? `${monitor.tls_time}ms` : null} />
                <DetailRow label="Time to First Byte" value={monitor.ttfb ? `${monitor.ttfb}ms` : null} />
                <DetailRow label="Avg Response" value={monitor.avg_response_time ? `${monitor.avg_response_time}ms` : null} />
              </CardContent>
            </Card>
          </div>

          {/* Error Message */}
          {monitor.error_message && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Error Details</p>
                    <p className="text-xs text-muted-foreground mt-1">{monitor.error_message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ══════ Uptime Tab ══════ */}
        <TabsContent value="uptime" className="space-y-4">
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
                  ) : checks.map((check) => (
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════ PageSpeed Tab ══════ */}
        <TabsContent value="pagespeed" className="space-y-4">
          {!hasApiKey ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Gauge className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-lg font-semibold mb-2">API Key Required</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Configure your Google PageSpeed Insights API key in Settings.
                </p>
                <Button asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />Go to Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Run PageSpeed Check</p>
                      <p className="text-xs text-muted-foreground">Analyze {monitor.url}</p>
                    </div>
                    <Select value={pagespeedStrategy} onValueChange={setPagespeedStrategy}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile">📱 Mobile</SelectItem>
                        <SelectItem value="desktop">🖥️ Desktop</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={runPageSpeedCheck} disabled={runningPS}>
                      {runningPS ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gauge className="h-4 w-4 mr-2" />}
                      {runningPS ? 'Analyzing...' : 'Run Check'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {psError && (
                <Card className="border-destructive">
                  <CardContent className="p-4 flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm">{psError}</p>
                  </CardContent>
                </Card>
              )}

              {psResult && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Lighthouse Scores</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{psResult.strategy}</Badge>
                          {psResult.fetch_time && <span>{new Date(psResult.fetch_time).toLocaleString()}</span>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-around py-4">
                        {psResult.scores?.performance !== null && <ScoreCircle score={psResult.scores.performance} label="Performance" />}
                        {psResult.scores?.accessibility !== null && <ScoreCircle score={psResult.scores.accessibility} label="Accessibility" />}
                        {psResult.scores?.best_practices !== null && <ScoreCircle score={psResult.scores.best_practices} label="Best Practices" />}
                        {psResult.scores?.seo !== null && <ScoreCircle score={psResult.scores.seo} label="SEO" />}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base">Core Web Vitals</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {psResult.metrics?.first_contentful_paint && <MetricCard metric={psResult.metrics.first_contentful_paint} />}
                        {psResult.metrics?.largest_contentful_paint && <MetricCard metric={psResult.metrics.largest_contentful_paint} />}
                        {psResult.metrics?.cumulative_layout_shift && <MetricCard metric={psResult.metrics.cumulative_layout_shift} />}
                        {psResult.metrics?.total_blocking_time && <MetricCard metric={psResult.metrics.total_blocking_time} />}
                        {psResult.metrics?.speed_index && <MetricCard metric={psResult.metrics.speed_index} />}
                        {psResult.metrics?.interactive && <MetricCard metric={psResult.metrics.interactive} />}
                      </div>
                    </CardContent>
                  </Card>

                  {psResult.opportunities?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Opportunities ({psResult.opportunities.length})</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {psResult.opportunities.map((item) => (
                          <div key={item.id} className="p-3 rounded-lg border border-border bg-card">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{item.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                              </div>
                              {item.savings && <Badge variant="outline" className="shrink-0 text-xs">{item.savings}</Badge>}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {psResult.run_warnings?.length > 0 && (
                    <Card className="border-amber-200 dark:border-amber-800">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Warnings</p>
                            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                              {psResult.run_warnings.map((w, i) => <li key={i}>• {w}</li>)}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {!psResult && !psError && !runningPS && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Gauge className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Click "Run Check" to analyze this URL.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
