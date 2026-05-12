<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Laravel standard database notifications table.
 * Stores per-user notifications for in-app alerts.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('type');                          // Notification class name
            $table->morphs('notifiable');                    // notifiable_type + notifiable_id (User)
            $table->json('data');                            // Notification payload
            $table->timestamp('read_at')->nullable();        // null = unread
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
