<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Incident extends Model
{
    protected $fillable = [
        'monitor_id',
        'status',
        'message',
        'root_cause',
        'started_at',
        'resolved_at',
        'duration_seconds',
        'downtime_count',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function monitor(): BelongsTo
    {
        return $this->belongsTo(Monitor::class);
    }

    public function isOngoing(): bool
    {
        return $this->status === 'ongoing';
    }

    public function getDurationAttribute(): string
    {
        if (!$this->duration_seconds) {
            return 'Ongoing';
        }
        $minutes = floor($this->duration_seconds / 60);
        $seconds = $this->duration_seconds % 60;
        if ($minutes > 60) {
            $hours = floor($minutes / 60);
            $minutes = $minutes % 60;
            return "{$hours}h {$minutes}m";
        }
        return "{$minutes}m {$seconds}s";
    }
}
