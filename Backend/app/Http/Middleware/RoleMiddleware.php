<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:
     *   Route::middleware('role:admin')
     *   Route::middleware('role:admin,gestionnaire')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Compte désactivé.'], 403);
        }

        if (! in_array($user->role, $roles)) {
            return response()->json([
                'message' => "Accès refusé. Rôle requis : " . implode(' ou ', $roles) . ".",
            ], 403);
        }

        return $next($request);
    }
}
