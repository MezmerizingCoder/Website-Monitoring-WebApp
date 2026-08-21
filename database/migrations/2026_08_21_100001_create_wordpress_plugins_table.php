<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wordpress_plugins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wordpress_site_id')->constrained()->onDelete('cascade');
            $table->string('plugin_file');
            $table->string('plugin_name');
            $table->string('plugin_uri')->nullable();
            $table->text('description')->nullable();
            $table->string('version')->nullable();
            $table->string('update_version')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('has_update')->default(false);
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamps();

            $table->index(['wordpress_site_id', 'has_update']);
            $table->unique(['wordpress_site_id', 'plugin_file']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wordpress_plugins');
    }
};
