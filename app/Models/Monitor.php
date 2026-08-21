<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Monitor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'url',
        'type',
        'interval_seconds',
        'keyword',
        'expected_status_code',
        'status',
        'uptime_percentage',
        'avg_response_time',
        'last_response_time',
        'last_checked_at',
        'last_up_at',
        'last_down_at',
        'error_message',
        'headers',
        'is_active',
    ];

    protected $casts = [
        'headers' => 'array',
        'uptime_percentage' => 'decimal:2',
        'avg_response_time' => 'decimal:2',
        'last_response_time' => 'decimal:2',
        'last_checked_at' => 'datetime',
        'last_up_at' => 'datetime',
        'last_down_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function checks(): HasMany
    {
        return $this->hasMany(Check::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }

    public function latestCheck(): HasOne
    {
        return $this->hasOne(Check::class)->latestOfMany('checked_at');
    }

    public function activeIncident(): HasOne
    {
        return $this->hasOne(Incident::class)->where('status', 'ongoing');
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeUp(Builder $query): Builder
    {
        return $query->where('status', 'up');
    }

    public function scopeDown(Builder $query): Builder
    {
        return $query->where('status', 'down');
    }

    public function scopeDueForCheck(Builder $query): Builder
    {
        return $query->active()
            ->where(function ($q) {
                $q->whereNull('last_checked_at')
                  ->orWhereRaw('last_checked_at <= DATE_SUB(NOW(), INTERVAL interval_seconds SECOND)');
            });
    }

    // Helpers
    public function isUp(): bool
    {
        return $this->status === 'up';
    }

    public function isDown(): bool
    {
        return $this->status === 'down';
    }

    public function getCheckIntervalAttribute(): string
    {
        $seconds = $this->interval_seconds;
        if ($seconds >= 3600) {
            return round($seconds / 3600, 1) . 'h';
        }
        if ($seconds >= 60) {
            return round($seconds / 60) . 'm';
        }
        return $seconds . 's';
    }
}
