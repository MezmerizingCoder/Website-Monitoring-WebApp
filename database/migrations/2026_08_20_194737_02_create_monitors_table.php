<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('url');
            $table->enum('type', ['http', 'https', 'ping', 'keyword'])->default('https');
            $table->integer('interval_seconds')->default(300);
            $table->string('keyword')->nullable();
            $table->string('expected_status_code')->default('200');
            $table->enum('status', ['up', 'down', 'paused', 'pending'])->default('pending');
            $table->decimal('uptime_percentage', 5, 2)->default(100.00);
            $table->decimal('avg_response_time', 8, 2)->nullable();
            $table->decimal('last_response_time', 8, 2)->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamp('last_up_at')->nullable();
            $table->timestamp('last_down_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('headers')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitors');
    }
};
