<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    public function index(Request $request)
    {
        $incidents = $request->user()
            ->monitors()
            ->with('monitor')
            ->whereIn('status', $request->get('status', ['ongoing', 'resolved', 'acknowledged']))
            ->orderByDesc('started_at')
            ->paginate(15);

        return response()->json($incidents);
    }

    public function show(Incident $incident)
    {
        if ($incident->monitor->user_id !== request()->user()->id) {
            abort(403);
        }

        return response()->json($incident->load('monitor'));
    }

    public function resolve(Request $request, Incident $incident)
    {
        if ($incident->monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($incident->status !== 'ongoing') {
            return response()->json(['message' => 'Incident is already resolved'], 422);
        }

        $incident->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'duration_seconds' => now()->diffInSeconds($incident->started_at),
        ]);

        return response()->json($incident->fresh());
    }

    public function acknowledge(Request $request, Incident $incident)
    {
        if ($incident->monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $incident->update(['status' => 'acknowledged']);

        return response()->json($incident->fresh());
    }
}
