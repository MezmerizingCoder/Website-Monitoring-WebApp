<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Perfect for personal projects and small websites.',
                'price' => 0,
                'monitor_limit' => 5,
                'check_interval_seconds' => 300, // 5 minutes
                'retention_days' => 30,
                'email_alerts' => true,
                'sms_alerts' => false,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'For businesses that need faster monitoring and longer history.',
                'price' => 9.99,
                'monitor_limit' => 50,
                'check_interval_seconds' => 60, // 1 minute
                'retention_days' => 90,
                'email_alerts' => true,
                'sms_alerts' => true,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'For large teams with mission-critical monitoring needs.',
                'price' => 49.99,
                'monitor_limit' => 500,
                'check_interval_seconds' => 30, // 30 seconds
                'retention_days' => 365,
                'email_alerts' => true,
                'sms_alerts' => true,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
