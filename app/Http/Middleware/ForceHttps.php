<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceHttps
{
    public function handle(Request $request, Closure $next)
    {
        // Only force HTTPS for non-API requests and exclude social auth routes
        if (!$request->is('api/*') && !$request->is('api/auth/*/redirect') && !$request->is('api/auth/*/callback')) {
            $request->server->set('HTTPS', 'on');
        }
        return $next($request);
    }
}
