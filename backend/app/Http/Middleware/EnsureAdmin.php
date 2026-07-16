<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Only lets a request through when it is authenticated as an Admin
 * (i.e. the Sanctum token belongs to the admins table). A regular user
 * token is rejected — the two auth systems are independent.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! ($request->user() instanceof Admin)) {
            return response()->json(['message' => 'Accès réservé aux administrateurs.'], 403);
        }

        return $next($request);
    }
}
