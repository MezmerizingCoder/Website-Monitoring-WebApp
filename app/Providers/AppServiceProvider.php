<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function ($request) {
            return Limit::perMinute(5)->by($request->input('email') . '|' . $request->ip());
        });

        RateLimiter::for('register', function ($request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        // Force Google OAuth config from env at runtime (bypasses cached config)
        // Using getenv() instead of env() because env() returns null when config is cached
        $clientId = getenv('GOOGLE_CLIENT_ID') ?: '';
        $clientSecret = getenv('GOOGLE_CLIENT_SECRET') ?: '';
        $redirect = getenv('GOOGLE_REDIRECT_URI') ?: '';

        if ($clientId) {
            config([
                'services.google.client_id' => $clientId,
                'services.google.client_secret' => $clientSecret,
                'services.google.redirect' => $redirect ?: '/api/auth/google/callback',
            ]);
        }
    }
}
