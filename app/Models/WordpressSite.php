<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class WordpressSite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'url',
        'pairing_code',
        'status',
        'last_sync_at',
    ];

    protected $casts = [
        'last_sync_at' => 'datetime',
    ];

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plugins(): HasMany
    {
        return $this->hasMany(WordpressPlugin::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Helpers

    /**
     * Generate a unique pairing code.
     */
    public static function generatePairingCode(): string
    {
        do {
            $code = strtoupper(Str::random(3) . '-' . Str::random(4));
        } while (static::where('pairing_code', $code)->exists());

        return $code;
    }

    /**
     * Count plugins that have updates available.
     */
    public function getOutdatedCountAttribute(): int
    {
        return $this->plugins()->where('has_update', true)->count();
    }

    /**
     * Count total plugins.
     */
    public function getTotalPluginsAttribute(): int
    {
        return $this->plugins()->count();
    }

    /**
     * Count active plugins.
     */
    public function getActivePluginsCountAttribute(): int
    {
        return $this->plugins()->where('status', 'active')->count();
    }
}
