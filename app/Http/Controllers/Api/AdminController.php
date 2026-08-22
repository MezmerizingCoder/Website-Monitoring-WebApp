<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Middleware check — only admins can access.
     */
    private function ensureAdmin(Request $request): void
    {
        if (!$request->user()->isAdmin()) {
            abort(403, 'Admin access required.');
        }
    }

    /**
     * GET /api/admin/users
     * List all users with their stats.
     */
    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $query = User::with('plan');

        // Search by name or email
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            if ($status === 'blocked') {
                $query->where('is_blocked', true);
            } elseif ($status === 'active') {
                $query->where('is_blocked', false);
            } elseif ($status === 'admin') {
                $query->where('is_admin', true);
            }
        }

        $users = $query->orderByDesc('created_at')->paginate(20);

        // Add monitor counts
        $users->getCollection()->transform(function ($user) {
            $user->monitors_count = $user->monitors()->count();
            $user->active_monitors_count = $user->monitors()->active()->count();
            $user->wordpress_sites_count = $user->wordpressSites()->count();
            return $user;
        });

        return response()->json($users);
    }

    /**
     * GET /api/admin/stats
     * Dashboard stats for admin panel.
     */
    public function stats(Request $request)
    {
        $this->ensureAdmin($request);

        return response()->json([
            'total_users' => User::count(),
            'active_users' => User::where('is_blocked', false)->count(),
            'blocked_users' => User::where('is_blocked', true)->count(),
            'admin_users' => User::where('is_admin', true)->count(),
            'total_monitors' => \App\Models\Monitor::count(),
            'total_wordpress_sites' => \App\Models\WordpressSite::count(),
            'recent_registrations' => User::where('created_at', '>=', now()->subDays(7))->count(),
            'users_today' => User::whereDate('created_at', today())->count(),
        ]);
    }

    /**
     * GET /api/admin/users/{id}
     * Get single user details.
     */
    public function show(Request $request, int $id)
    {
        $this->ensureAdmin($request);

        $user = User::with('plan')->findOrFail($id);
        $user->monitors_count = $user->monitors()->count();
        $user->active_monitors_count = $user->monitors()->active()->count();
        $user->wordpress_sites_count = $user->wordpressSites()->count();
        $user->incidents_count = \App\Models\Incident::whereIn(
            'monitor_id',
            $user->monitors()->pluck('id')
        )->count();

        return response()->json($user);
    }

    /**
     * PUT /api/admin/users/{id}/block
     * Block a user.
     */
    public function block(Request $request, int $id)
    {
        $this->ensureAdmin($request);

        $user = User::findOrFail($id);

        // Prevent blocking yourself
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot block your own account.',
            ], 422);
        }

        // Prevent blocking other admins
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Cannot block another admin account.',
            ], 422);
        }

        $user->block();

        return response()->json([
            'message' => "User \"{$user->name}\" has been blocked.",
            'user' => $user->fresh()->load('plan'),
        ]);
    }

    /**
     * PUT /api/admin/users/{id}/unblock
     * Unblock a user.
     */
    public function unblock(Request $request, int $id)
    {
        $this->ensureAdmin($request);

        $user = User::findOrFail($id);
        $user->unblock();

        return response()->json([
            'message' => "User \"{$user->name}\" has been unblocked.",
            'user' => $user->fresh()->load('plan'),
        ]);
    }

    /**
     * PUT /api/admin/users/{id}/toggle-admin
     * Toggle admin status for a user.
     */
    public function toggleAdmin(Request $request, int $id)
    {
        $this->ensureAdmin($request);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot change your own admin status.',
            ], 422);
        }

        $user->update(['is_admin' => !$user->is_admin]);

        return response()->json([
            'message' => "User \"{$user->name}\" is now " . ($user->is_admin ? 'an admin' : 'a regular user') . '.',
            'user' => $user->fresh()->load('plan'),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     * Delete a user account.
     */
    public function destroy(Request $request, int $id)
    {
        $this->ensureAdmin($request);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Cannot delete another admin account.',
            ], 422);
        }

        // Delete related data
        $user->monitors()->delete();
        $user->wordpressSites()->delete();
        $user->alertNotifications()->delete();
        $user->userPlans()->delete();
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => "User \"{$user->name}\" has been deleted.",
        ]);
    }
}
