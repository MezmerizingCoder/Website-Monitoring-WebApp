<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'plan_id',
        'timezone',
        'phone',
        'email_notifications',
        'sms_notifications',
        'pagespeed_api_key',
        'is_admin',
        'is_blocked',
        'blocked_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'is_admin' => 'boolean',
            'is_blocked' => 'boolean',
            'blocked_at' => 'datetime',
        ];
    }

    // ── Relationships ──

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function monitors(): HasMany
    {
        return $this->hasMany(Monitor::class);
    }

    public function userPlans(): HasMany
    {
        return $this->hasMany(UserPlan::class);
    }

    public function alertNotifications(): HasMany
    {
        return $this->hasMany(AlertNotification::class);
    }

    public function wordpressSites(): HasMany
    {
        return $this->hasMany(WordpressSite::class);
    }

    // ── Helpers ──

    public function getMonitorCount(): int
    {
        return $this->monitors()->active()->count();
    }

    public function canCreateMonitor(): bool
    {
        if (!$this->plan) {
            return $this->getMonitorCount() < 5; // Free tier limit
        }
        return $this->getMonitorCount() < $this->plan->monitor_limit;
    }

    public function getMonitorLimit(): int
    {
        return $this->plan ? $this->plan->monitor_limit : 5;
    }

    public function isAdmin(): bool
    {
        return $this->is_admin === true;
    }

    public function isBlocked(): bool
    {
        return $this->is_blocked === true;
    }

    public function block(): void
    {
        $this->update([
            'is_blocked' => true,
            'blocked_at' => now(),
        ]);
    }

    public function unblock(): void
    {
        $this->update([
            'is_blocked' => false,
            'blocked_at' => null,
        ]);
    }
}
