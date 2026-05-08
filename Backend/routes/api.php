<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PvDocumentController;
use App\Http\Controllers\Api\PvFileController;
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

    // ── PV Documents ──────────────────────────────────────────────
    Route::apiResource('pv-documents', PvDocumentController::class);
    Route::patch('pv-documents/{pvDocument}/status', [PvDocumentController::class, 'updateStatus']);

    // ── File Upload & Download ─────────────────────────────────────
    Route::post('pv-documents/{pvDocument}/files',  [PvFileController::class, 'store']);
    Route::get('pv-files/{pvFile}/download',        [PvFileController::class, 'download']);
    Route::delete('pv-files/{pvFile}',              [PvFileController::class, 'destroy']);

    // ── Search (Phase 5) ──────────────────────────────────────────
    // Route::get('pv-documents/search', [PvDocumentController::class, 'search']);

    // ── Activity Log (Phase 6) ────────────────────────────────────
    // Route::get('activity-logs', [ActivityLogController::class, 'index']);

    // ── User Management — Admin only (Phase 8) ────────────────────
    // Route::apiResource('users', UserController::class)->middleware('role:admin');
});