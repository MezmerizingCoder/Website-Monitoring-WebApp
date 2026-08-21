<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Check extends Model
{
    protected $fillable = [
        'monitor_id',
        'status',
        'response_code',
        'response_time',
        'error_message',
        'ip_address',
        'headers',
        'body_preview',
        'checked_at',
    ];

    protected $casts = [
        'headers' => 'array',
        'response_time' => 'decimal:2',
        'checked_at' => 'datetime',
    ];

    public function monitor(): BelongsTo
    {
        return $this->belongsTo(Monitor::class);
    }

    public function isUp(): bool
    {
        return $this->status === 'up';
    }

    public function isDown(): bool
    {
        return in_array($this->status, ['down', 'timeout', 'error']);
    }
}
