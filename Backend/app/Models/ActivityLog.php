<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    // No updated_at column — logs are immutable
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'target_type',
        'target_id',
        'target_label',
        'meta',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'meta'       => 'array',
        'created_at' => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────────────

    /** The user who performed the action */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Helper: create a log entry easily ─────────────────────────

    /**
     * Quick static method to record an action.
     *
     * Usage:
     *   ActivityLog::record('CREATE', $pvDocument, 'PV-102');
     */
    public static function record(
        string $action,
        Model  $target,
        string $targetLabel = '',
        array  $meta = []
    ): self {
        return self::create([
            'user_id'      => auth()->id(),
            'action'       => $action,
            'target_type'  => class_basename($target),
            'target_id'    => $target->getKey(),
            'target_label' => $targetLabel,
            'meta'         => $meta ?: null,
            'ip_address'   => request()->ip(),
            'created_at'   => now(),
        ]);
    }
}
