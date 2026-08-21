<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WordpressPlugin extends Model
{
    use HasFactory;

    protected $fillable = [
        'wordpress_site_id',
        'plugin_file',
        'plugin_name',
        'plugin_uri',
        'description',
        'version',
        'update_version',
        'status',
        'has_update',
        'last_checked_at',
    ];

    protected $casts = [
        'has_update' => 'boolean',
        'last_checked_at' => 'datetime',
    ];

    // Relationships

    public function site(): BelongsTo
    {
        return $this->belongsTo(WordpressSite::class, 'wordpress_site_id');
    }

    // Scopes

    public function scopeOutdated($query)
    {
        return $query->where('has_update', true);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
