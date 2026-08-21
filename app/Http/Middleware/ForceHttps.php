<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceHttps
{
    public function handle(Request $request, Closure $next)
    {
        // Only force HTTPS for non-API requests
        if (!$request->is('api/*')) {
            $request->server->set('HTTPS', 'on');
        }
        return $next($request);
    }
}
