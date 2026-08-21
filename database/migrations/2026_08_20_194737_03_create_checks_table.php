<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitor_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['up', 'down', 'timeout', 'error'])->default('up');
            $table->integer('response_code')->nullable();
            $table->decimal('response_time', 8, 2)->nullable();
            $table->text('error_message')->nullable();
            $table->string('ip_address')->nullable();
            $table->json('headers')->nullable();
            $table->text('body_preview')->nullable();
            $table->timestamp('checked_at');
            $table->timestamps();

            $table->index(['monitor_id', 'checked_at']);
            $table->index(['monitor_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checks');
    }
};
