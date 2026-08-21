<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlertNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->alertNotifications()
            ->with(['monitor', 'incident'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function unread(Request $request)
    {
        $notifications = $request->user()
            ->alertNotifications()
            ->with(['monitor', 'incident'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $unreadCount = $request->user()
            ->alertNotifications()
            ->where('status', 'sent')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, AlertNotification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->update(['status' => 'read']);

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->alertNotifications()
            ->where('status', 'sent')
            ->update(['status' => 'read']);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
