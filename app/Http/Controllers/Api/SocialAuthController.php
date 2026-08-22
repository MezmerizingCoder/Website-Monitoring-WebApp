<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function googleRedirect()
    {
        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    /**
     * Handle Google OAuth callback.
     */
    public function googleCallback(Request $request)
    {
        // Handle user cancellation or OAuth error from Google
        if ($request->has('error')) {
            $error = $request->input('error_description', $request->input('error'));
            return redirect('/login?error=' . urlencode($error));
        }

        try {
            $googleUser = Socialite::driver('google')
                ->scopes(['openid', 'profile', 'email'])
                ->user();
            return $this->handleProviderCallback($googleUser, 'google');
        } catch (\Exception $e) {
            \Log::error('Google OAuth callback error: ' . $e->getMessage());
            return redirect('/login?error=' . urlencode('Google authentication failed: ' . $e->getMessage()));
        }
    }

    /**
     * Common handler for both providers.
     */
    private function handleProviderCallback($socialUser, string $provider)
    {
        $email = $socialUser->getEmail();
        $name = $socialUser->getName() ?: $socialUser->getNickname() ?: explode('@', $email)[0];
        $avatar = $socialUser->getAvatar();

        if (!$email) {
            return redirect('/login?error=' . urlencode('Could not retrieve email from ' . ucfirst($provider) . '.'));
        }

        // Find or create user
        $user = User::where('email', $email)->first();

        if ($user) {
            // Update social data if needed
            if (!$user->email_verified_at) {
                $user->update(['email_verified_at' => now()]);
            }
        } else {
            // Create new user
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
                'timezone' => 'UTC',
                'email_verified_at' => now(),
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
        }

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Redirect to frontend with token and user data
        $userData = urlencode(json_encode([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => $user->is_admin,
            'is_blocked' => $user->is_blocked,
            'plan' => $user->plan,
        ]));

        return redirect("/login?social_token={$token}&social_user={$userData}");
    }
}
