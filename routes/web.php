<?php

use App\Http\Controllers\Api\SocialAuthController;
use Illuminate\Support\Facades\Route;

// Social OAuth Routes
Route::get('/api/auth/google/redirect', [SocialAuthController::class, 'googleRedirect']);
Route::get('/api/auth/google/callback', [SocialAuthController::class, 'googleCallback']);

// Catch-all for React SPA
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
