<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Monitor;
use App\Models\Check;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MonitorController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->monitors()->with(['latestCheck', 'activeIncident']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('url', 'LIKE', "%{$search}%");
            });
        }

        $monitors = $query->orderByDesc('created_at')->paginate(15);

        return response()->json($monitors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:2048',
            'type' => 'in:http,https,ping,keyword',
            'interval_seconds' => 'integer|min:30|max:86400',
            'keyword' => 'nullable|string|max:255',
            'expected_status_code' => 'string|max:3',
            'headers' => 'nullable|array',
        ]);

        if (!$request->user()->canCreateMonitor()) {
            return response()->json([
                'message' => 'Monitor limit reached. Please upgrade your plan.',
            ], 403);
        }

        // Use plan's interval if available
        $interval = $validated['interval_seconds'] ?? 300;
        if ($request->user()->plan) {
            $interval = max($interval, $request->user()->plan->check_interval_seconds);
        }

        $monitor = $request->user()->monitors()->create([
            ...$validated,
            'interval_seconds' => $interval,
            'status' => 'pending',
        ]);

        // Perform initial check
        $this->performCheck($monitor);

        return response()->json($monitor->load('latestCheck'), 201);
    }

    public function show(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json(
            $monitor->load(['latestCheck', 'activeIncident'])
        );
    }

    public function update(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'url' => 'sometimes|url|max:2048',
            'type' => 'sometimes|in:http,https,ping,keyword',
            'interval_seconds' => 'sometimes|integer|min:30|max:86400',
            'keyword' => 'nullable|string|max:255',
            'expected_status_code' => 'sometimes|string|max:3',
            'headers' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $monitor->update($validated);

        return response()->json($monitor->fresh()->load('latestCheck'));
    }

    public function destroy(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $monitor->delete();

        return response()->json(['message' => 'Monitor deleted']);
    }

    public function pause(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $monitor->update(['status' => 'paused', 'is_active' => false]);

        return response()->json($monitor->fresh());
    }

    public function resume(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $monitor->update(['status' => 'pending', 'is_active' => true]);

        return response()->json($monitor->fresh());
    }

    public function checks(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $checks = $monitor->checks()
            ->orderByDesc('checked_at')
            ->paginate(50);

        return response()->json($checks);
    }

    public function checkStats(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $days = (int) $request->get('days', 30);
        $since = now()->subDays($days);

        $total = $monitor->checks()->where('checked_at', '>=', $since)->count();
        $up = $monitor->checks()->where('checked_at', '>=', $since)->where('status', 'up')->count();
        $uptime = $total > 0 ? round(($up / $total) * 100, 2) : 100;

        $avgResponse = $monitor->checks()
            ->where('checked_at', '>=', $since)
            ->where('status', 'up')
            ->avg('response_time');

        $responseTimes = $monitor->checks()
            ->where('checked_at', '>=', $since)
            ->where('status', 'up')
            ->selectRaw('DATE(checked_at) as date, AVG(response_time) as avg_response')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $incidents = $monitor->incidents()
            ->where('started_at', '>=', $since)
            ->orderByDesc('started_at')
            ->get();

        return response()->json([
            'uptime_percentage' => $uptime,
            'avg_response_time' => round($avgResponse, 2),
            'total_checks' => $total,
            'up_checks' => $up,
            'down_checks' => $total - $up,
            'response_times' => $responseTimes,
            'incidents' => $incidents,
            'days' => $days,
        ]);
    }

    protected function performCheck(Monitor $monitor): void
    {
        $startTime = microtime(true);
        $status = 'up';
        $responseCode = null;
        $errorMessage = null;
        $bodyPreview = null;

        try {
            $response = Http::timeout(30)
                ->withHeaders(array_merge([
                    'User-Agent' => 'UptimeGuard/1.0 (https://uptimeguard.dev)',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language' => 'en-US,en;q=0.5',
                ], $monitor->headers ?? []))
                ->withoutVerifying()
                ->get($monitor->url);

            $responseCode = $response->status();
            $bodyPreview = substr($response->body(), 0, 500);

            if ($response->failed()) {
                $status = 'down';
                $errorMessage = 'HTTP ' . $responseCode;
            }

            if ($monitor->keyword && !str_contains($response->body(), $monitor->keyword)) {
                $status = 'down';
                $errorMessage = 'Keyword "' . $monitor->keyword . '" not found';
            }
        } catch (\Exception $e) {
            $status = 'down';
            $errorMessage = $e->getMessage();
        }

        $responseTime = round((microtime(true) - $startTime) * 1000, 2);

        $check = $monitor->checks()->create([
            'status' => $status,
            'response_code' => $responseCode,
            'response_time' => $responseTime,
            'error_message' => $errorMessage,
            'body_preview' => $bodyPreview,
            'checked_at' => now(),
        ]);

        $monitor->update([
            'status' => $status,
            'last_checked_at' => now(),
            'last_response_time' => $responseTime,
            'error_message' => $errorMessage,
            'last_up_at' => $status === 'up' ? now() : $monitor->last_up_at,
            'last_down_at' => $status === 'down' ? now() : $monitor->last_down_at,
        ]);

        // Update uptime percentage
        $total = $monitor->checks()->count();
        $up = $monitor->checks()->where('status', 'up')->count();
        $monitor->update(['uptime_percentage' => $total > 0 ? round(($up / $total) * 100, 2) : 100]);

        // Update avg response time
        $avgResponse = $monitor->checks()->where('status', 'up')->avg('response_time');
        $monitor->update(['avg_response_time' => round($avgResponse, 2)]);
    }
}
