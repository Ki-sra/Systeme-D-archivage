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

Route::get('/ping', fn () => response()->json([
    'status'  => 'ok',
    'message' => 'PV Archiving System API is running',
    'version' => '1.0.0',
]));

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ── Protected routes ──────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });

    // ── PV Documents ──────────────────────────────────────────────
    // Read: all authenticated roles
    Route::get('pv-documents',          [PvDocumentController::class, 'index']);
    Route::get('pv-documents/{pvDocument}', [PvDocumentController::class, 'show']);

    // Create/Update: admin + gestionnaire + archiviste
    Route::middleware('role:admin,gestionnaire,archiviste')->group(function () {
        Route::post('pv-documents',                          [PvDocumentController::class, 'store']);
        Route::put('pv-documents/{pvDocument}',              [PvDocumentController::class, 'update']);
        Route::patch('pv-documents/{pvDocument}',            [PvDocumentController::class, 'update']);
        Route::patch('pv-documents/{pvDocument}/status',     [PvDocumentController::class, 'updateStatus']);
    });

    // Delete: admin only
    Route::middleware('role:admin')->group(function () {
        Route::delete('pv-documents/{pvDocument}', [PvDocumentController::class, 'destroy']);
    });

    // ── File Upload & Download ─────────────────────────────────────
    // Upload: admin + gestionnaire + archiviste
    Route::middleware('role:admin,gestionnaire,archiviste')->group(function () {
        Route::post('pv-documents/{pvDocument}/files', [PvFileController::class, 'store']);
        Route::delete('pv-files/{pvFile}',             [PvFileController::class, 'destroy']);
    });

    // Download: all authenticated roles
    Route::get('pv-files/{pvFile}/download', [PvFileController::class, 'download']);

    
});