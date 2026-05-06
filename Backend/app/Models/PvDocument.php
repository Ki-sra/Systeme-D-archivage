<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PvDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'type',
        'status',
        'academic_year',
        'niveau',
        'filiere',
        'groupe',
        'session',
        'module',
        'physical_location',
        'notes',
        'created_by',
        'validated_by',
        'validated_at',
    ];

    protected $casts = [
        'validated_at' => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────────────

    /** The user who created this PV */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** The user who validated this PV */
    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    /** All uploaded scan files for this PV */
    public function files(): HasMany
    {
        return $this->hasMany(PvFile::class);
    }
}
