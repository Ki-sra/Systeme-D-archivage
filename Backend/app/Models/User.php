<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    // ── Role helpers ───────────────────────────────────────────────

    public function isAdmin(): bool        { return $this->role === 'admin'; }
    public function isGestionnaire(): bool { return $this->role === 'gestionnaire'; }
    public function isArchiviste(): bool   { return $this->role === 'archiviste'; }
    public function isConsultant(): bool   { return $this->role === 'consultant'; }

    /** True if user can create or edit PV documents */
    public function canWrite(): bool
    {
        return in_array($this->role, ['admin', 'gestionnaire']);
    }

    /** True if user can upload and validate files */
    public function canArchive(): bool
    {
        return in_array($this->role, ['admin', 'archiviste']);
    }

    // ── Relationships ──────────────────────────────────────────────

    /** PV documents created by this user */
    public function pvDocuments(): HasMany
    {
        return $this->hasMany(PvDocument::class, 'created_by');
    }

    /** Files uploaded by this user */
    public function uploadedFiles(): HasMany
    {
        return $this->hasMany(PvFile::class, 'uploaded_by');
    }

    /** Activity logs for this user */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
}
