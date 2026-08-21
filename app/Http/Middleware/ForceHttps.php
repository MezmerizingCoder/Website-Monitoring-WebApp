<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\UriUtils;

class ForceHttps
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->isSecure()) {
            $request->server->set('HTTPS', 'on');
        }

        $response = $next($request);

        return $response;
    }
}
