<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Adds LOGIN and LOGOUT to the activity_logs.action enum.
 *
 * ⚠️  MySQL-only: ALTER TABLE … MODIFY COLUMN is not supported by SQLite.
 *     If you are using SQLite (local dev), run:
 *         php artisan migrate:fresh --seed
 *     instead of running this migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Skip on SQLite — the original migration already has the correct enum
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            ALTER TABLE activity_logs
            MODIFY COLUMN action
            ENUM('CREATE','UPDATE','DELETE','UPLOAD','VIEW','VALIDATE','EXPORT','LOGIN','LOGOUT')
            NOT NULL
        ");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            ALTER TABLE activity_logs
            MODIFY COLUMN action
            ENUM('CREATE','UPDATE','DELETE','UPLOAD','VIEW','VALIDATE','EXPORT')
            NOT NULL
        ");
    }
};
