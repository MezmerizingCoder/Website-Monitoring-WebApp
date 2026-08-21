<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WordpressPlugin;
use App\Models\WordpressSite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WordpressMonitorController extends Controller
{
    /**
     * List all WordPress sites for the authenticated user.
     */
    public function index(Request $request)
    {
        $sites = $request->user()
            ->wordpressSites()
            ->withCount(['plugins', 'plugins as outdated_count' => function ($q) {
                $q->where('has_update', true);
            }])
            ->withCount(['plugins as active_plugins_count' => function ($q) {
                $q->where('status', 'active');
            }])
            ->orderByDesc('last_sync_at')
            ->get();

        return response()->json($sites);
    }

    /**
     * Create a new WordPress site and generate a pairing code.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $site = $request->user()->wordpressSites()->create([
            'name' => $request->name,
            'url' => rtrim($request->url, '/'),
            'pairing_code' => WordpressSite::generatePairingCode(),
            'status' => 'pending',
        ]);

        return response()->json($site, 201);
    }

    /**
     * Show a single WordPress site with its plugins.
     */
    public function show(Request $request, int $id)
    {
        $site = $request->user()
            ->wordpressSites()
            ->with(['plugins' => function ($q) {
                $q->orderBy('has_update', 'desc')->orderBy('plugin_name');
            }])
            ->findOrFail($id);

        return response()->json($site);
    }

    /**
     * Delete (unpair) a WordPress site.
     */
    public function destroy(Request $request, int $id)
    {
        $site = $request->user()->wordpressSites()->findOrFail($id);
        $site->delete();

        return response()->json(['message' => 'Site removed successfully']);
    }

    /**
     * Regenerate pairing code for a site.
     */
    public function regenerateCode(Request $request, int $id)
    {
        $site = $request->user()->wordpressSites()->findOrFail($id);
        $site->update([
            'pairing_code' => WordpressSite::generatePairingCode(),
            'status' => 'pending',
        ]);

        return response()->json($site);
    }

    // =========================================================
    //  WP Plugin Endpoints (authenticated by pairing code)
    // =========================================================

    /**
     * WP plugin pairs itself using the pairing code.
     * POST /api/wordpress/pair
     */
    public function pair(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pairing_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $site = WordpressSite::where('pairing_code', $request->pairing_code)
            ->where('status', 'pending')
            ->first();

        if (!$site) {
            return response()->json([
                'message' => 'Invalid or already-used pairing code.',
            ], 404);
        }

        $site->update([
            'status' => 'active',
            'last_sync_at' => now(),
        ]);

        return response()->json([
            'message' => 'Site paired successfully!',
            'site_id' => $site->id,
            'site_name' => $site->name,
            'site_url' => $site->url,
        ]);
    }

    /**
     * WP plugin syncs its plugin data.
     * POST /api/wordpress/sync
     */
    public function sync(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pairing_code' => 'required|string',
            'plugins' => 'required|array',
            'plugins.*.plugin_file' => 'required|string',
            'plugins.*.plugin_name' => 'required|string',
            'plugins.*.plugin_uri' => 'nullable|string',
            'plugins.*.description' => 'nullable|string',
            'plugins.*.version' => 'nullable|string',
            'plugins.*.update_version' => 'nullable|string',
            'plugins.*.status' => 'required|in:active,inactive',
            'plugins.*.has_update' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $site = WordpressSite::where('pairing_code', $request->pairing_code)
            ->where('status', 'active')
            ->first();

        if (!$site) {
            return response()->json(['message' => 'Site not found or not paired.'], 404);
        }

        // Sync plugins: upsert each one
        foreach ($request->plugins as $pluginData) {
            $site->plugins()->updateOrCreate(
                ['plugin_file' => $pluginData['plugin_file']],
                [
                    'plugin_name' => $pluginData['plugin_name'],
                    'plugin_uri' => $pluginData['plugin_uri'] ?? null,
                    'description' => $pluginData['description'] ?? null,
                    'version' => $pluginData['version'] ?? null,
                    'update_version' => $pluginData['update_version'] ?? null,
                    'status' => $pluginData['status'],
                    'has_update' => $pluginData['has_update'],
                    'last_checked_at' => now(),
                ]
            );
        }

        // Remove plugins that are no longer installed
        $currentFiles = collect($request->plugins)->pluck('plugin_file')->toArray();
        $site->plugins()->whereNotIn('plugin_file', $currentFiles)->delete();

        // Update sync timestamp
        $site->update(['last_sync_at' => now()]);

        return response()->json([
            'message' => 'Plugins synced successfully.',
            'plugins_count' => count($request->plugins),
            'outdated_count' => collect($request->plugins)->where('has_update', true)->count(),
        ]);
    }
}
