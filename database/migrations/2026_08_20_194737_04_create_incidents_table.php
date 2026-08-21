<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitor_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['ongoing', 'resolved', 'acknowledged'])->default('ongoing');
            $table->text('message')->nullable();
            $table->string('root_cause')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('resolved_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->integer('downtime_count')->default(1);
            $table->timestamps();

            $table->index(['monitor_id', 'status']);
            $table->index('started_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
