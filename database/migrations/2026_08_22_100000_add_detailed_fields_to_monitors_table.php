<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('monitors', function (Blueprint $table) {
            // HTTP Status
            if (!Schema::hasColumn('monitors', 'http_status_code')) {
                $table->integer('http_status_code')->nullable()->after('error_message');
            }
            if (!Schema::hasColumn('monitors', 'http_status_text')) {
                $table->string('http_status_text')->nullable()->after('http_status_code');
            }

            // SSL Certificate
            if (!Schema::hasColumn('monitors', 'ssl_status')) {
                $table->enum('ssl_status', ['valid', 'expired', 'expiring_soon', 'invalid', 'missing', 'unknown'])->default('unknown')->after('http_status_text');
            }
            if (!Schema::hasColumn('monitors', 'ssl_expiry')) {
                $table->timestamp('ssl_expiry')->nullable()->after('ssl_status');
            }
            if (!Schema::hasColumn('monitors', 'ssl_issuer')) {
                $table->string('ssl_issuer')->nullable()->after('ssl_expiry');
            }
            if (!Schema::hasColumn('monitors', 'ssl_days_remaining')) {
                $table->integer('ssl_days_remaining')->nullable()->after('ssl_issuer');
            }

            // Network / Server Info
            if (!Schema::hasColumn('monitors', 'ip_address')) {
                $table->string('ip_address')->nullable()->after('ssl_days_remaining');
            }
            if (!Schema::hasColumn('monitors', 'server_software')) {
                $table->string('server_software')->nullable()->after('ip_address');
            }
            if (!Schema::hasColumn('monitors', 'hosting_provider')) {
                $table->string('hosting_provider')->nullable()->after('server_software');
            }
            if (!Schema::hasColumn('monitors', 'cdn_provider')) {
                $table->string('cdn_provider')->nullable()->after('hosting_provider');
            }
            if (!Schema::hasColumn('monitors', 'content_type')) {
                $table->string('content_type')->nullable()->after('cdn_provider');
            }
            if (!Schema::hasColumn('monitors', 'content_length')) {
                $table->bigInteger('content_length')->nullable()->after('content_type');
            }

            // Redirect Info
            if (!Schema::hasColumn('monitors', 'redirect_url')) {
                $table->string('redirect_url')->nullable()->after('content_length');
            }
            if (!Schema::hasColumn('monitors', 'redirect_count')) {
                $table->integer('redirect_count')->default(0)->after('redirect_url');
            }

            // Additional Timing
            if (!Schema::hasColumn('monitors', 'dns_time')) {
                $table->decimal('dns_time', 8, 2)->nullable()->after('redirect_count');
            }
            if (!Schema::hasColumn('monitors', 'connect_time')) {
                $table->decimal('connect_time', 8, 2)->nullable()->after('dns_time');
            }
            if (!Schema::hasColumn('monitors', 'tls_time')) {
                $table->decimal('tls_time', 8, 2)->nullable()->after('connect_time');
            }
            if (!Schema::hasColumn('monitors', 'ttfb')) {
                $table->decimal('ttfb', 8, 2)->nullable()->after('tls_time');
            }
        });
    }

    public function down(): void
    {
        Schema::table('monitors', function (Blueprint $table) {
            $table->dropColumn([
                'http_status_code', 'http_status_text',
                'ssl_status', 'ssl_expiry', 'ssl_issuer', 'ssl_days_remaining',
                'ip_address', 'server_software', 'hosting_provider', 'cdn_provider',
                'content_type', 'content_length',
                'redirect_url', 'redirect_count',
                'dns_time', 'connect_time', 'tls_time', 'ttfb',
            ]);
        });
    }
};
