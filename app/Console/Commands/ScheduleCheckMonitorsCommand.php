<?php

namespace App\Console\Commands;

use App\Jobs\ProcessMonitorChecksJob;
use Illuminate\Console\Command;

class ScheduleCheckMonitorsCommand extends Command
{
    protected $signature = 'monitors:check';
    protected $description = 'Schedule checks for all due monitors';

    public function handle(): int
    {
        ProcessMonitorChecksJob::dispatch();
        $this->info('Monitor checks dispatched to queue.');
        return self::SUCCESS;
    }
}
