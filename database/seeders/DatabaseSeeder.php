<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Free plan if it doesn't exist
        Plan::firstOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'Free',
                'description' => 'Basic monitoring for personal use',
                'price' => 0,
                'monitor_limit' => 5,
                'check_interval_seconds' => 300,
                'retention_days' => 30,
                'email_alerts' => true,
                'sms_alerts' => false,
                'is_active' => true,
            ]
        );

        // Create Pro plan
        Plan::firstOrCreate(
            ['slug' => 'pro'],
            [
                'name' => 'Pro',
                'description' => 'Advanced monitoring for professionals',
                'price' => 19.99,
                'monitor_limit' => 50,
                'check_interval_seconds' => 60,
                'retention_days' => 90,
                'email_alerts' => true,
                'sms_alerts' => true,
                'is_active' => true,
            ]
        );

        // Create Super Admin account
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'is_blocked' => false,
                'timezone' => 'UTC',
            ]
        );
        // Ensure existing admin gets is_admin flag
        if (!$admin->is_admin) {
            $admin->update(['is_admin' => true]);
        }

        // Create test user
        User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'is_admin' => false,
                'is_blocked' => false,
                'timezone' => 'UTC',
            ]
        );
    }
}
