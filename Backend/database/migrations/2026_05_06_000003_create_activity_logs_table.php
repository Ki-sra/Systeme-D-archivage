<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();

            // Who did the action
            $table->foreignId('user_id')
                  ->nullable() // nullable in case user is deleted
                  ->constrained('users')
                  ->nullOnDelete();

            // What they did
            $table->enum('action', ['CREATE', 'UPDATE', 'DELETE', 'UPLOAD', 'VIEW', 'VALIDATE', 'EXPORT', 'LOGIN', 'LOGOUT']);

            // What they did it on (polymorphic-style)
            $table->string('target_type');   // e.g. "PvDocument", "PvFile"
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('target_label')->nullable(); // human readable e.g. "PV-102"

            // Extra context (optional JSON payload)
            $table->json('meta')->nullable(); // e.g. { "old_status": "BROUILLON", "new_status": "EN_ATTENTE" }

            // Request context
            $table->string('ip_address', 45)->nullable();

            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
