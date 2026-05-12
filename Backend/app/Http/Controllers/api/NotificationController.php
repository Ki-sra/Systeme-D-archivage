<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PvDocument;
use App\Models\User;
use App\Notifications\PvDocumentAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Returns the current user's notifications + system alerts for stuck documents.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // ── 1. User database notifications ────────────────────────
        $dbNotifications = $user->notifications()
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'type'       => 'notification',
                'alert_type' => $n->data['alert_type']       ?? 'info',
                'title'      => $n->data['title']            ?? 'Notification',
                'message'    => $n->data['message']          ?? '',
                'pv_id'      => $n->data['pv_document_id']   ?? null,
                'pv_label'   => $n->data['pv_document_label']?? null,
                'read'       => ! is_null($n->read_at),
                'created_at' => $n->created_at,
            ]);

        // ── 2. System alerts: documents stuck in BROUILLON > 7 days ─
        $stuckAlerts = [];
        if (in_array($user->role, ['admin', 'gestionnaire'])) {
            $stuckDocs = PvDocument::where('status', 'BROUILLON')
                ->where('created_at', '<', now()->subDays(7))
                ->with('creator:id,name')
                ->take(10)
                ->get();

            foreach ($stuckDocs as $doc) {
                $daysStuck = now()->diffInDays($doc->created_at);
                $label     = $doc->type === 'PV_FF'
                    ? "{$doc->filiere} · G{$doc->groupe}"
                    : ($doc->module ?? "PV #{$doc->id}");

                $stuckAlerts[] = [
                    'id'         => "stuck-{$doc->id}",
                    'type'       => 'alert',
                    'alert_type' => 'missing',
                    'title'      => 'Document en attente',
                    'message'    => "« {$label} » est en brouillon depuis {$daysStuck} jour(s).",
                    'pv_id'      => $doc->id,
                    'pv_label'   => $label,
                    'read'       => false,
                    'created_at' => $doc->created_at,
                ];
            }
        }

        // ── 3. Merge and sort by date desc ─────────────────────────
        $all = collect([...$dbNotifications, ...$stuckAlerts])
            ->sortByDesc('created_at')
            ->values();

        return response()->json([
            'notifications' => $all,
            'unread_count'  => $all->where('read', false)->count(),
        ]);
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Mark a single notification as read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->find($id);

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['message' => 'Marqué comme lu.']);
    }

    /**
     * PATCH /api/notifications/read-all
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Toutes les notifications marquées comme lues.']);
    }

    // ── Internal helper: send notification to all admins + gestionnaires ──

    public static function notifyManagers(string $alertType, string $title, string $message, ?int $pvId = null, ?string $pvLabel = null): void
    {
        $managers = User::whereIn('role', ['admin', 'gestionnaire'])
            ->where('is_active', true)
            ->get();

        foreach ($managers as $manager) {
            $manager->notify(new PvDocumentAlert($alertType, $title, $message, $pvId, $pvLabel));
        }
    }
}
