<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/[A-Z]/',   // at least one uppercase
                'regex:/[a-z]/',   // at least one lowercase
                'regex:/[0-9]/',   // at least one number
                'regex:/[^A-Za-z0-9]/', // at least one symbol
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'timezone' => $request->get('timezone', 'UTC'),
        ]);

        // Assign free plan
        $freePlan = Plan::where('slug', 'free')->first();
        if ($freePlan) {
            $user->update(['plan_id' => $freePlan->id]);
            $user->userPlans()->create([
                'plan_id' => $freePlan->id,
                'status' => 'active',
                'started_at' => now(),
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Check if account is locked due to too many failed attempts
        if ($user && $user->isLocked()) {
            $minutesLeft = $user->locked_until->diffInMinutes(now());
            throw ValidationException::withMessages([
                'email' => ["Account temporarily locked. Try again in {$minutesLeft} minute(s)."],
            ]);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            // Record failed attempt
            if ($user) {
                $user->recordFailedLogin();
            }
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $user = Auth::user();

        // Check if user is blocked
        if ($user->isBlocked()) {
            Auth::logout();
            return response()->json([
                'message' => 'Your account has been blocked. Please contact support.',
            ], 403);
        }

        // Check if email is verified
        if (!$user->email_verified_at) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Please verify your email address before logging in.'],
            ]);
        }

        // Reset failed login attempts on successful login
        $user->resetLoginAttempts();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('plan'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return $request->user()->load('plan');
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
            'timezone' => 'sometimes|string',
            'phone' => 'nullable|string',
            'email_notifications' => 'sometimes|boolean',
            'sms_notifications' => 'sometimes|boolean',
        ]);

        $request->user()->update($validated);

        return response()->json($request->user()->fresh()->load('plan'));
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/',
            ],
        ]);

        if (!Hash::check($validated['current_password'], $request->user()->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
