<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'monitor_limit',
        'check_interval_seconds',
        'retention_days',
        'email_alerts',
        'sms_alerts',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'email_alerts' => 'boolean',
        'sms_alerts' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function userPlans(): HasMany
    {
        return $this->hasMany(UserPlan::class);
    }
}
