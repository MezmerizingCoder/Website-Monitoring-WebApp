import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2,
  ArrowLeft,
  Search,
  Gauge,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Settings,
  Globe,
  Zap,
  Eye,
  Shield,
  BarChart3,
} from 'lucide-react';

function ScoreCircle({ score, label, size = 'lg' }) {
  const getColor = (s) => {
    if (s >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800';
    if (s >= 50) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
  };

  const sizeClasses = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses} rounded-full border-2 flex items-center justify-center font-bold ${getColor(score)}`}>
        {score}
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

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

function OpportunityItem({ item }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
        </div>
        {item.savings && (
          <Badge variant="outline" className="shrink-0 text-xs">{item.savings}</Badge>
        )}
      </div>
    </div>
  );
}

export default function PageSpeedInsights() {
  const { apiCall, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [hasApiKey, setHasApiKey] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [strategy, setStrategy] = React.useState('mobile');
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const response = await apiCall('/api/pagespeed/key');
      if (response.ok) {
        const data = await response.json();
        setHasApiKey(data.has_api_key);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const runCheck = async (e) => {
    e.preventDefault();
    if (!url) return;
    setRunning(true);
    setResult(null);
    setError(null);

    try {
      const response = await apiCall('/api/pagespeed/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, strategy }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const data = await response.json();
        if (data.setup_required) {
          navigate('/settings');
          return;
        }
        setError(data.message || 'Failed to run PageSpeed check');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/monitors"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">PageSpeed Insights</h1>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Gauge className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold mb-2">API Key Required</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              To run PageSpeed Insights checks, you need to configure your Google PageSpeed Insights API key.
            </p>
            <Button asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Go to Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/monitors"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">PageSpeed Insights</h1>
            <p className="text-sm text-muted-foreground">Run Lighthouse performance audits on your URLs.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/settings">
            <Settings className="h-4 w-4 mr-1" />
            API Key
          </Link>
        </Button>
      </div>

      {/* Check Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={runCheck} className="flex gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter URL to analyze (e.g. https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-9"
                type="url"
                required
              />
            </div>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">📱 Mobile</SelectItem>
                <SelectItem value="desktop">🖥️ Desktop</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={running}>
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Analyze
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* URL Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <a href={result.final_url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
              {result.final_url}
            </a>
            <Badge variant="outline" className="ml-2">{result.strategy}</Badge>
            {result.fetch_time && (
              <span className="ml-auto text-xs">{new Date(result.fetch_time).toLocaleString()}</span>
            )}
          </div>

          {/* Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around py-4">
                {result.scores?.performance !== null && (
                  <ScoreCircle score={result.scores.performance} label="Performance" />
                )}
                {result.scores?.accessibility !== null && (
                  <ScoreCircle score={result.scores.accessibility} label="Accessibility" />
                )}
                {result.scores?.best_practices !== null && (
                  <ScoreCircle score={result.scores.best_practices} label="Best Practices" />
                )}
                {result.scores?.seo !== null && (
                  <ScoreCircle score={result.scores.seo} label="SEO" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Core Web Vitals & Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {result.metrics?.first_contentful_paint && (
                  <MetricCard metric={result.metrics.first_contentful_paint} />
                )}
                {result.metrics?.largest_contentful_paint && (
                  <MetricCard metric={result.metrics.largest_contentful_paint} />
                )}
                {result.metrics?.cumulative_layout_shift && (
                  <MetricCard metric={result.metrics.cumulative_layout_shift} />
                )}
                {result.metrics?.total_blocking_time && (
                  <MetricCard metric={result.metrics.total_blocking_time} />
                )}
                {result.metrics?.speed_index && (
                  <MetricCard metric={result.metrics.speed_index} />
                )}
                {result.metrics?.interactive && (
                  <MetricCard metric={result.metrics.interactive} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          {result.opportunities?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Opportunities ({result.opportunities.length})
                </CardTitle>
                <CardDescription>Recommendations to improve performance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.opportunities.map((item) => (
                  <OpportunityItem key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Diagnostics */}
          {result.diagnostics?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Diagnostics</CardTitle>
                <CardDescription>Additional performance information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.diagnostics.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                      </div>
                      {item.value && (
                        <Badge variant="outline" className="shrink-0 text-xs">{item.value}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {result.run_warnings?.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Warnings</p>
                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                      {result.run_warnings.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
