<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pv_documents', function (Blueprint $table) {
            $table->id();

            // PV type
            $table->enum('type', ['PV_FF', 'PV_CC', 'PV_EFM']);

            // Document lifecycle status
            $table->enum('status', [
                'BROUILLON',
                'EN_ATTENTE',
                'VALIDE_PAPIER',
                'ARCHIVE_NUMERIQUE',
                'ARCHIVE_COMPLET',
            ])->default('BROUILLON');

            // Academic context
            $table->string('academic_year', 20);          // e.g. "2023-2024"
            $table->string('niveau', 50);                  // e.g. "Licence 1", "TS"
            $table->string('filiere', 100);                // e.g. "Génie Informatique"
            $table->string('groupe', 20)->nullable();      // e.g. "G1"
            $table->enum('session', ['Ordinaire', 'Rattrapage'])->nullable();
            $table->string('module', 100)->nullable();     // for PV_CC and PV_EFM

            // Physical archive location
            $table->string('physical_location', 100)->nullable(); // e.g. "A2/3/15"

            // Notes
            $table->text('notes')->nullable();

            // Who created/validated it
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();

            $table->timestamps();
            $table->softDeletes(); // allows trash/restore instead of hard delete
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pv_documents');
    }
};
