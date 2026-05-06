<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PvFile extends Model
{
    protected $fillable = [
        'pv_document_id',
        'original_name',
        'stored_name',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
    ];

    // ── Relationships ──────────────────────────────────────────────

    /** The PV document this file belongs to */
    public function pvDocument(): BelongsTo
    {
        return $this->belongsTo(PvDocument::class);
    }

    /** The user who uploaded this file */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
