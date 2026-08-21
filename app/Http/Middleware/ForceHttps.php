<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceHttps
{
    public function handle(Request $request, Closure $next)
    {
        // Force the request to be seen as HTTPS
        $request->setSecureUrl(true);
        $request->server->set('HTTPS', 'on');
        $request->server->set('SERVER_PORT', 443);
        
        $response = $next($request);
        
        // Force HTTPS in response headers
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        
        return $response;
    }
}
