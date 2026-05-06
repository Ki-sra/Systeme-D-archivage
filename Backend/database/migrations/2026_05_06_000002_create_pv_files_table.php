<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pv_files', function (Blueprint $table) {
            $table->id();

            // Link to parent document
            $table->foreignId('pv_document_id')
                  ->constrained('pv_documents')
                  ->cascadeOnDelete(); // delete files when PV is deleted

            // File info
            $table->string('original_name');          // original filename
            $table->string('stored_name');            // UUID-based name on disk
            $table->string('file_path');              // relative storage path
            $table->enum('file_type', ['pdf', 'jpg', 'jpeg', 'png']);
            $table->unsignedBigInteger('file_size');  // size in bytes

            // Who uploaded it
            $table->foreignId('uploaded_by')
                  ->constrained('users')
                  ->restrictOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pv_files');
    }
};
