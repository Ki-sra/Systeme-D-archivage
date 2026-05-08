<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * GET /api/activity-logs
     * Return paginated activity logs with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user:id,name,role')
            ->orderBy('created_at', 'desc');

        // ── Filters ────────────────────────────────────────────────
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', $request->target_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search in target_label
        if ($request->filled('search')) {
            $query->where('target_label', 'like', "%{$request->search}%");
        }

        $logs = $query->paginate($request->get('per_page', 20));

        return response()->json($logs);
    }

    /**
     * GET /api/activity-logs/stats
     * Return counts grouped by action type (for dashboard).
     */
    public function stats(): JsonResponse
    {
        $stats = ActivityLog::selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->pluck('count', 'action');

        $recent = ActivityLog::with('user:id,name,role')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'by_action' => $stats,
            'recent'    => $recent,
        ]);
    }
}
