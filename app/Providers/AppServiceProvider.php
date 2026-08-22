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
        config([
            'services.google.client_id' => env('GOOGLE_CLIENT_ID'),
            'services.google.client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'services.google.redirect' => env('GOOGLE_REDIRECT_URI', '/api/auth/google/callback'),
        ]);
    }
}
