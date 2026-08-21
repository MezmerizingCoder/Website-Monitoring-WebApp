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
        ];
    }

    // Relationships
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

    // Helpers
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
}
