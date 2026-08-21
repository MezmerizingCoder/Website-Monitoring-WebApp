<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Check;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $monitors = $user->monitors()->active()->get();
        $totalMonitors = $monitors->count();
        $upMonitors = $monitors->where('status', 'up')->count();
        $downMonitors = $monitors->where('status', 'down')->count();
        $pausedMonitors = $monitors->where('status', 'paused')->count();

        $overallUptime = $totalMonitors > 0
            ? round($monitors->sum('uptime_percentage') / $totalMonitors, 2)
            : 100;

        $avgResponseTime = $monitors->where('status', 'up')->avg('avg_response_time');

        // Get recent incidents through monitors
        $recentIncidents = \App\Models\Incident::whereIn('monitor_id', $user->monitors()->pluck('id'))
            ->with('monitor')
            ->orderByDesc('started_at')
            ->limit(10)
            ->get();

        // Uptime history - accept days parameter (7, 30, or 90)
        $days = (int) $request->query('days', 30);
        if (!in_array($days, [7, 30, 90])) {
            $days = 30;
        }
        $uptimeHistory = $this->getUptimeHistory($user, $days);

        return response()->json([
            'stats' => [
                'total_monitors' => $totalMonitors,
                'up_monitors' => $upMonitors,
                'down_monitors' => $downMonitors,
                'paused_monitors' => $pausedMonitors,
                'overall_uptime' => $overallUptime,
                'avg_response_time' => $avgResponseTime ? round($avgResponseTime, 2) : null,
                'monitor_limit' => $user->getMonitorLimit(),
            ],
            'recent_incidents' => $recentIncidents,
            'uptime_history' => $uptimeHistory,
            'monitors' => $monitors->map(function ($monitor) {
                return [
                    'id' => $monitor->id,
                    'name' => $monitor->name,
                    'url' => $monitor->url,
                    'status' => $monitor->status,
                    'uptime_percentage' => $monitor->uptime_percentage,
                    'avg_response_time' => $monitor->avg_response_time,
                    'last_checked_at' => $monitor->last_checked_at,
                    'last_response_time' => $monitor->last_response_time,
                ];
            }),
        ]);
    }

    /**
     * Get up/down monitor counts per day for the last N days.
     * For each day, we look at the latest check per monitor to determine up/down.
     */
    private function getUptimeHistory($user, int $days): array
    {
        $monitorIds = $user->monitors()->pluck('id');
        $history = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->startOfDay();
            $endOfDay = (clone $date)->endOfDay();

            // For each monitor, get the last check on that day
            $upCount = 0;
            $downCount = 0;

            foreach ($monitorIds as $monitorId) {
                $lastCheck = Check::where('monitor_id', $monitorId)
                    ->whereBetween('checked_at', [$date, $endOfDay])
                    ->orderByDesc('checked_at')
                    ->first();

                if ($lastCheck) {
                    if ($lastCheck->is_up) {
                        $upCount++;
                    } else {
                        $downCount++;
                    }
                }
            }

            $history[] = [
                'date' => $date->format('M d'),
                'up' => $upCount,
                'down' => $downCount,
            ];
        }

        return $history;
    }
}
