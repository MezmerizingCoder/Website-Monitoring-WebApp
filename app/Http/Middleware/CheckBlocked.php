<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckBlocked
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user() && $request->user()->isBlocked()) {
            return response()->json([
                'message' => 'Your account has been blocked. Please contact support.',
                'blocked' => true,
            ], 403);
        }

        return $next($request);
    }
}
