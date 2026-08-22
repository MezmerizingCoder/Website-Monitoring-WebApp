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
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback.
     */
    public function googleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            return $this->handleProviderCallback($googleUser, 'google');
        } catch (\Exception $e) {
            return redirect('/login?error=' . urlencode('Google authentication failed.'));
        }
    }

    /**
     * Redirect to Apple OAuth.
     */
    public function appleRedirect()
    {
        return Socialite::driver('apple')->redirect();
    }

    /**
     * Handle Apple OAuth callback.
     */
    public function appleCallback()
    {
        try {
            $appleUser = Socialite::driver('apple')->user();
            return $this->handleProviderCallback($appleUser, 'apple');
        } catch (\Exception $e) {
            return redirect('/login?error=' . urlencode('Apple authentication failed.'));
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
