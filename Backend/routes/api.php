<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PV Archiving System — API Routes
|--------------------------------------------------------------------------
*/

// ── Public routes ─────────────────────────────────────────────────

// Health check
Route::get('/ping', fn () => response()->json([
    'status'  => 'ok',
    'message' => 'PV Archiving System API is running',
    'version' => '1.0.0',
]));

// Authentication
Route::prefix('auth')->group(function () {
    Route::post('/login',  [AuthController::class, 'login']);
});

// ── Protected routes (require valid Sanctum token) ────────────────

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',     [AuthController::class, 'me']);
    });

    // ── PV Documents (Phase 3) ────────────────────────────────────
    // Route::apiResource('pv-documents', PvDocumentController::class);

    // ── File Upload (Phase 4) ─────────────────────────────────────
    // Route::post('pv-documents/{id}/files', [PvFileController::class, 'store']);
    // Route::delete('pv-files/{id}',         [PvFileController::class, 'destroy']);

    // ── Search (Phase 5) ──────────────────────────────────────────
    // Route::get('pv-documents/search', [PvDocumentController::class, 'search']);

    // ── Activity Log (Phase 6) ────────────────────────────────────
    // Route::get('activity-logs', [ActivityLogController::class, 'index']);

    // ── User Management — Admin only (Phase 8) ────────────────────
    // Route::apiResource('users', UserController::class)->middleware('role:admin');
});