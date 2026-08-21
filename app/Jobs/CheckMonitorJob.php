<?php

namespace App\Jobs;

use App\Models\AlertNotification;
use App\Models\Check;
use App\Models\Incident;
use App\Models\Monitor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckMonitorJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(public Monitor $monitor)
    {
        $this->onQueue('checks');
    }

    public function handle(): void
    {
        $monitor = $this->monitor->fresh();
        if (!$monitor || !$monitor->is_active) {
            return;
        }

        $startTime = microtime(true);
        $status = 'up';
        $responseCode = null;
        $errorMessage = null;
        $bodyPreview = null;
        $responseHeaders = null;

        try {
            $response = Http::timeout(30)
                ->withHeaders(array_merge([
                    'User-Agent' => 'UptimeGuard/1.0 (https://uptimeguard.dev)',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language' => 'en-US,en;q=0.5',
                    'Accept-Encoding' => 'gzip, deflate',
                    'Connection' => 'keep-alive',
                ], $monitor->headers ?? []))
                ->withoutVerifying()
                ->get($monitor->url);

            $responseCode = $response->status();
            $bodyPreview = substr($response->body(), 0, 500);
            $responseHeaders = $response->headers();

            if ($response->failed()) {
                $status = 'down';
                $errorMessage = 'HTTP ' . $responseCode;
            }

            // Check keyword if specified
            if ($monitor->keyword && $status === 'up') {
                if (!str_contains($response->body(), $monitor->keyword)) {
                    $status = 'down';
                    $errorMessage = 'Keyword "' . $monitor->keyword . '" not found in response';
                }
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            $status = 'down';
            $errorMessage = 'Connection timeout: ' . $e->getMessage();
        } catch (\Exception $e) {
            $status = 'down';
            $errorMessage = $e->getMessage();
        }

        $responseTime = round((microtime(true) - $startTime) * 1000, 2);

        // Create check record
        $check = $monitor->checks()->create([
            'status' => $status,
            'response_code' => $responseCode,
            'response_time' => $responseTime,
            'error_message' => $errorMessage,
            'body_preview' => $bodyPreview,
            'checked_at' => now(),
        ]);

        // Track status change
        $previousStatus = $monitor->status;
        $isStatusChange = ($previousStatus !== 'pending' && $previousStatus !== $status);

        // Update monitor
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
        $upCount = $monitor->checks()->where('status', 'up')->count();
        $monitor->update(['uptime_percentage' => $total > 0 ? round(($upCount / $total) * 100, 2) : 100]);

        // Update avg response time
        $avgResponse = $monitor->checks()->where('status', 'up')->avg('response_time');
        $monitor->update(['avg_response_time' => $avgResponse ? round($avgResponse, 2) : null]);

        // Handle downtime incident
        if ($status === 'down' && $previousStatus !== 'down') {
            $this->createIncident($monitor, $errorMessage);
        }

        // Handle recovery
        if ($status === 'up' && $previousStatus === 'down') {
            $this->resolveIncident($monitor);
        }

        // Handle ongoing downtime
        if ($status === 'down' && $previousStatus === 'down') {
            $this->incrementIncident($monitor);
        }

        Log::info("Monitor checked", [
            'monitor_id' => $monitor->id,
            'status' => $status,
            'response_time' => $responseTime,
        ]);
    }

    protected function createIncident(Monitor $monitor, ?string $message): void
    {
        $incident = $monitor->incidents()->create([
            'status' => 'ongoing',
            'message' => $message,
            'started_at' => now(),
        ]);

        // Send alert notification
        $this->sendAlert($monitor, 'downtime', $message, $incident);
    }

    protected function resolveIncident(Monitor $monitor): void
    {
        $incident = $monitor->incidents()->where('status', 'ongoing')->latest()->first();

        if ($incident) {
            $duration = now()->diffInSeconds($incident->started_at);
            $incident->update([
                'status' => 'resolved',
                'resolved_at' => now(),
                'duration_seconds' => $duration,
            ]);

            // Send recovery notification
            $this->sendAlert($monitor, 'recovery', "Monitor is back up after {$duration} seconds", $incident);
        }
    }

    protected function incrementIncident(Monitor $monitor): void
    {
        $incident = $monitor->incidents()->where('status', 'ongoing')->latest()->first();

        if ($incident) {
            $incident->increment('downtime_count');
        }
    }

    protected function sendAlert(Monitor $monitor, string $type, string $message, Incident $incident): void
    {
        $user = $monitor->user;

        if ($type === 'downtime' && !$user->email_notifications) {
            return;
        }

        $subject = match($type) {
            'downtime' => "🔴 Monitor Down: {$monitor->name}",
            'recovery' => "🟢 Monitor Recovered: {$monitor->name}",
            default => "Monitor Alert: {$monitor->name}",
        };

        AlertNotification::create([
            'user_id' => $user->id,
            'monitor_id' => $monitor->id,
            'incident_id' => $incident->id,
            'type' => $type,
            'channel' => 'email',
            'subject' => $subject,
            'message' => "{$monitor->name} ({$monitor->url}) is {$type}.\n\n{$message}\n\nTime: " . now()->format('Y-m-d H:i:s'),
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("CheckMonitorJob failed for monitor {$this->monitor->id}: {$exception->getMessage()}");
    }
}
