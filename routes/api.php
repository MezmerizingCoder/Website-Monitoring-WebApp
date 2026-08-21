<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MonitorController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\WordpressMonitorController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// WP Plugin routes (authenticated by pairing code, not user token)
Route::post('/wordpress/pair', [WordpressMonitorController::class, 'pair']);
Route::post('/wordpress/sync', [WordpressMonitorController::class, 'sync']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Monitors
    Route::apiResource('monitors', MonitorController::class);
    Route::post('/monitors/{monitor}/pause', [MonitorController::class, 'pause']);
    Route::post('/monitors/{monitor}/resume', [MonitorController::class, 'resume']);
    Route::get('/monitors/{monitor}/checks', [MonitorController::class, 'checks']);
    Route::get('/monitors/{monitor}/stats', [MonitorController::class, 'checkStats']);

    // Incidents
    Route::get('/incidents', [IncidentController::class, 'index']);
    Route::get('/incidents/{incident}', [IncidentController::class, 'show']);
    Route::post('/incidents/{incident}/resolve', [IncidentController::class, 'resolve']);
    Route::post('/incidents/{incident}/acknowledge', [IncidentController::class, 'acknowledge']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // WordPress Monitor
    Route::get('/wordpress-sites', [WordpressMonitorController::class, 'index']);
    Route::post('/wordpress-sites', [WordpressMonitorController::class, 'store']);
    Route::get('/wordpress-sites/{id}', [WordpressMonitorController::class, 'show']);
    Route::delete('/wordpress-sites/{id}', [WordpressMonitorController::class, 'destroy']);
    Route::post('/wordpress-sites/{id}/regenerate-code', [WordpressMonitorController::class, 'regenerateCode']);
});
