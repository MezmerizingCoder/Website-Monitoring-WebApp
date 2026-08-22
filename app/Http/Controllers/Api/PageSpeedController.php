<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PageSpeedController extends Controller
{
    /**
     * Get the user's PageSpeed API key status.
     */
    public function getKeyStatus(Request $request)
    {
        $user = $request->user();
        $hasKey = !empty($user->pagespeed_api_key);

        return response()->json([
            'has_api_key' => $hasKey,
            'key_preview' => $hasKey ? substr($user->pagespeed_api_key, 0, 8) . '...' . substr($user->pagespeed_api_key, -4) : null,
        ]);
    }

    /**
     * Save or update the user's PageSpeed API key.
     */
    public function saveKey(Request $request)
    {
        $validated = $request->validate([
            'pagespeed_api_key' => 'required|string|min:10',
        ]);

        $request->user()->update([
            'pagespeed_api_key' => $validated['pagespeed_api_key'],
        ]);

        return response()->json([
            'message' => 'PageSpeed API key saved successfully.',
            'has_api_key' => true,
        ]);
    }

    /**
     * Delete the user's PageSpeed API key.
     */
    public function deleteKey(Request $request)
    {
        $request->user()->update([
            'pagespeed_api_key' => null,
        ]);

        return response()->json([
            'message' => 'PageSpeed API key removed.',
            'has_api_key' => false,
        ]);
    }

    /**
     * Run a PageSpeed Insights check for a URL.
     */
    public function runCheck(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'strategy' => 'sometimes|in:mobile,desktop',
        ]);

        $user = $request->user();
        $apiKey = $user->pagespeed_api_key;

        if (empty($apiKey)) {
            return response()->json([
                'message' => 'PageSpeed API key not configured. Please add your key in Settings.',
                'setup_required' => true,
            ], 422);
        }

        $url = $validated['url'];
        $strategy = $validated['strategy'] ?? 'mobile';

        $apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
        $params = [
            'url' => $url,
            'strategy' => $strategy,
            'key' => $apiKey,
        ];

        try {
            $response = Http::timeout(120)
                ->withQueryParameters($params)
                ->get($apiUrl);

            if (!$response->successful()) {
                $error = $response->json('error.message', 'Failed to run PageSpeed check');
                return response()->json([
                    'message' => $error,
                ], 422);
            }

            $data = $response->json();
            $lighthouseResult = $data['lighthouseResult'] ?? null;

            if (!$lighthouseResult) {
                return response()->json([
                    'message' => 'No Lighthouse result returned.',
                ], 422);
            }

            // Extract key metrics
            $categories = $lighthouseResult['categories'] ?? [];
            $audits = $lighthouseResult['audits'] ?? [];

            $result = [
                'url' => $url,
                'strategy' => $strategy,
                'scores' => [
                    'performance' => $this->extractScore($categories, 'performance'),
                    'accessibility' => $this->extractScore($categories, 'accessibility'),
                    'best_practices' => $this->extractScore($categories, 'best-practices'),
                    'seo' => $this->extractScore($categories, 'seo'),
                ],
                'metrics' => [
                    'first_contentful_paint' => $this->extractAudit($audits, 'first-contentful-paint'),
                    'speed_index' => $this->extractAudit($audits, 'speed-index'),
                    'largest_contentful_paint' => $this->extractAudit($audits, 'largest-contentful-paint'),
                    'interactive' => $this->extractAudit($audits, 'interactive'),
                    'total_blocking_time' => $this->extractAudit($audits, 'total-blocking-time'),
                    'cumulative_layout_shift' => $this->extractAudit($audits, 'cumulative-layout-shift'),
                ],
                'opportunities' => $this->extractOpportunities($audits),
                'diagnostics' => $this->extractDiagnostics($audits),
                'final_url' => $lighthouseResult['finalUrl'] ?? $url,
                'fetch_time' => $lighthouseResult['fetchTime'] ?? null,
                'run_warnings' => $lighthouseResult['runWarnings'] ?? [],
            ];

            return response()->json($result);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json([
                'message' => 'PageSpeed API timed out. The site may be slow or unreachable.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to run PageSpeed check: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Run PageSpeed check for a monitored URL (saves result to history).
     */
    public function runMonitorCheck(Request $request, \App\Models\Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $user = $request->user();
        $apiKey = $user->pagespeed_api_key;

        if (empty($apiKey)) {
            return response()->json([
                'message' => 'PageSpeed API key not configured. Please add your key in Settings.',
                'setup_required' => true,
            ], 422);
        }

        $strategy = $request->get('strategy', 'mobile');
        $url = $monitor->url;

        $apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
        $params = [
            'url' => $url,
            'strategy' => $strategy,
            'key' => $apiKey,
        ];

        try {
            $response = Http::timeout(120)
                ->withQueryParameters($params)
                ->get($apiUrl);

            if (!$response->successful()) {
                $error = $response->json('error.message', 'Failed to run PageSpeed check');
                return response()->json(['message' => $error], 422);
            }

            $data = $response->json();
            $lighthouseResult = $data['lighthouseResult'] ?? null;

            if (!$lighthouseResult) {
                return response()->json(['message' => 'No Lighthouse result returned.'], 422);
            }

            $categories = $lighthouseResult['categories'] ?? [];
            $audits = $lighthouseResult['audits'] ?? [];

            $result = [
                'monitor_id' => $monitor->id,
                'url' => $url,
                'strategy' => $strategy,
                'scores' => [
                    'performance' => $this->extractScore($categories, 'performance'),
                    'accessibility' => $this->extractScore($categories, 'accessibility'),
                    'best_practices' => $this->extractScore($categories, 'best-practices'),
                    'seo' => $this->extractScore($categories, 'seo'),
                ],
                'metrics' => [
                    'first_contentful_paint' => $this->extractAudit($audits, 'first-contentful-paint'),
                    'speed_index' => $this->extractAudit($audits, 'speed-index'),
                    'largest_contentful_paint' => $this->extractAudit($audits, 'largest-contentful-paint'),
                    'interactive' => $this->extractAudit($audits, 'interactive'),
                    'total_blocking_time' => $this->extractAudit($audits, 'total-blocking-time'),
                    'cumulative_layout_shift' => $this->extractAudit($audits, 'cumulative-layout-shift'),
                ],
                'opportunities' => $this->extractOpportunities($audits),
                'diagnostics' => $this->extractDiagnostics($audits),
                'final_url' => $lighthouseResult['finalUrl'] ?? $url,
                'fetch_time' => $lighthouseResult['fetchTime'] ?? null,
            ];

            return response()->json($result);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json([
                'message' => 'PageSpeed API timed out.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ── Helpers ──────────────────────────────────────────

    private function extractScore(array $categories, string $key): ?array
    {
        $cat = $categories[$key] ?? null;
        if (!$cat) return null;

        return [
            'score' => round(($cat['score'] ?? 0) * 100),
            'title' => $cat['title'] ?? $key,
        ];
    }

    private function extractAudit(array $audits, string $key): ?array
    {
        $audit = $audits[$key] ?? null;
        if (!$audit) return null;

        return [
            'title' => $audit['title'] ?? $key,
            'value' => $audit['displayValue'] ?? $audit['numericValue'] ?? null,
            'numeric_value' => $audit['numericValue'] ?? null,
            'score' => $audit['score'] ?? null,
            'description' => $audit['description'] ?? '',
        ];
    }

    private function extractOpportunities(array $audits): array
    {
        $opportunities = [];
        $opportunityAudits = [
            'render-blocking-resources',
            'uses-responsive-images',
            'offscreen-images',
            'unminified-css',
            'unminified-javascript',
            'unused-css-rules',
            'unused-javascript',
            'modern-image-formats',
            'uses-text-compression',
            'uses-rel-preconnect',
            'server-response-time',
            'redirects',
            'uses-rel-preload',
            'efficient-animated-content',
            'duplicated-javascript',
            'legacy-javascript',
            'dom-size',
            'critical-request-chains',
            'font-display',
        ];

        foreach ($opportunityAudits as $auditId) {
            $audit = $audits[$auditId] ?? null;
            if ($audit && ($audit['score'] ?? 1) < 1) {
                $opportunities[] = [
                    'id' => $auditId,
                    'title' => $audit['title'] ?? $auditId,
                    'description' => $audit['description'] ?? '',
                    'savings' => $audit['displayValue'] ?? null,
                    'score' => $audit['score'] ?? null,
                ];
            }
        }

        return $opportunities;
    }

    private function extractDiagnostics(array $audits): array
    {
        $diagnostics = [];
        $diagnosticAudits = [
            'total-byte-weight',
            'mainthread-work-breakdown',
            'bootup-time',
            'layout-shifts',
            'uses-long-cache-ttl',
            'network-requests',
            'network-rtt',
            'network-server-latency',
        ];

        foreach ($diagnosticAudits as $auditId) {
            $audit = $audits[$auditId] ?? null;
            if ($audit) {
                $diagnostics[] = [
                    'id' => $auditId,
                    'title' => $audit['title'] ?? $auditId,
                    'description' => $audit['description'] ?? '',
                    'value' => $audit['displayValue'] ?? null,
                    'score' => $audit['score'] ?? null,
                ];
            }
        }

        return $diagnostics;
    }
}
