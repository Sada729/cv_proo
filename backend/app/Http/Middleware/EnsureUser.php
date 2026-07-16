<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Only lets a request through when it is authenticated as a User
 * (token belongs to the users table). An admin token is rejected here,
 * keeping the user site and the admin site fully separate.
 */
class EnsureUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! ($request->user() instanceof User)) {
            return response()->json(['message' => 'Accès réservé aux utilisateurs.'], 403);
        }

        return $next($request);
    }
}
