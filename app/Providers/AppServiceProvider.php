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
        // Try multiple sources: env(), getenv(), $_ENV, $_SERVER
        $clientId = env('GOOGLE_CLIENT_ID')
            ?? getenv('GOOGLE_CLIENT_ID')
            ?? $_ENV['GOOGLE_CLIENT_ID']
            ?? $_SERVER['GOOGLE_CLIENT_ID']
            ?? '';
        $clientSecret = env('GOOGLE_CLIENT_SECRET')
            ?? getenv('GOOGLE_CLIENT_SECRET')
            ?? $_ENV['GOOGLE_CLIENT_SECRET']
            ?? $_SERVER['GOOGLE_CLIENT_SECRET']
            ?? '';
        $redirect = env('GOOGLE_REDIRECT_URI')
            ?? getenv('GOOGLE_REDIRECT_URI')
            ?? $_ENV['GOOGLE_REDIRECT_URI']
            ?? $_SERVER['GOOGLE_REDIRECT_URI']
            ?? '';

        if ($clientId) {
            config([
                'services.google.client_id' => $clientId,
                'services.google.client_secret' => $clientSecret,
                'services.google.redirect' => $redirect ?: '/api/auth/google/callback',
            ]);
        }
    }
}
