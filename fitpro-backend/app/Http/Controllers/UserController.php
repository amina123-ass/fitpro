<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'age'            => 'nullable|integer|min:10|max:120',
            'weight'         => 'nullable|numeric|min:20|max:500',
            'height'         => 'nullable|numeric|min:50|max:300',
            'fitness_goal'   => 'nullable|string|max:255',
            'avatar'         => 'nullable|string',
            'bio'            => 'nullable|string|max:500',
            'gender'         => 'nullable|in:male,female,other',
            'activity_level' => 'nullable|in:sedentary,lightly_active,moderately_active,very_active,extra_active',
        ]);

        $request->user()->update($validated);

        return response()->json([
            'message' => 'Profile updated!',
            'user'    => $request->user()->fresh(),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $request->user()->update(['password' => Hash::make($request->password)]);
        return response()->json(['message' => 'Password updated successfully']);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        // Safe defaults — returned even if an inner query fails
        $payload = [
            'stats' => [
                'total_workouts'   => 0,
                'total_calories'   => 0,
                'active_programs'  => 0,
                'week_workouts'    => 0,
                'current_weight'   => null,
                'weight_change'    => null,
                'fitness_goal'     => $user->fitness_goal ?? null,
                'streak_days'      => 0,
                'bmi'              => null,
                'month_comparison' => null,
            ],
            'recent_workouts' => [],
        ];

        // ── Workouts (core — always available) ────────────────────────
        try {
            $payload['stats']['total_workouts'] = $user->workouts()->count();
            $payload['stats']['total_calories'] = (int) $user->workouts()->sum('calories_burned');
            $payload['stats']['week_workouts']  = $user->workouts()
                ->where('workout_date', '>=', now()->startOfWeek()->toDateString())
                ->count();

            $payload['recent_workouts'] = $user->workouts()
                ->with('exercise:id,name,category')
                ->orderBy('workout_date', 'desc')
                ->take(5)
                ->get();
        } catch (\Exception $e) {
            Log::error('Dashboard workouts error: ' . $e->getMessage());
        }

        // ── Programs ───────────────────────────────────────────────────
        try {
            $payload['stats']['active_programs'] = $user->userPrograms()
                ->where('status', 'active')
                ->count();
        } catch (\Exception $e) {
            Log::warning('Dashboard programs error: ' . $e->getMessage());
        }

        // ── Weight logs ────────────────────────────────────────────────
        try {
            $latest   = $user->weightLogs()->orderBy('log_date', 'desc')->first();
            $previous = $user->weightLogs()->orderBy('log_date', 'desc')->skip(1)->first();

            $payload['stats']['current_weight'] = $latest?->weight;

            if ($latest && $previous) {
                $payload['stats']['weight_change'] = round(
                    (float)$latest->weight - (float)$previous->weight, 1
                );
            }
        } catch (\Exception $e) {
            Log::warning('Dashboard weight error: ' . $e->getMessage());
        }

        // ── Streak ────────────────────────────────────────────────────
        try {
            $payload['stats']['streak_days'] = $this->calculateStreak($user);
        } catch (\Exception $e) {
            Log::warning('Dashboard streak error: ' . $e->getMessage());
        }

        // ── BMI ───────────────────────────────────────────────────────
        try {
            if ($user->weight && $user->height && $user->height > 0) {
                $h = (float)$user->height / 100;
                $payload['stats']['bmi'] = round((float)$user->weight / ($h * $h), 1);
            }
        } catch (\Exception $e) {
            Log::warning('Dashboard BMI error: ' . $e->getMessage());
        }

        // ── Monthly comparison ────────────────────────────────────────
        try {
            $thisMonth = $user->workouts()
                ->whereMonth('workout_date', now()->month)
                ->whereYear('workout_date', now()->year)
                ->count();
            $lastMonth = $user->workouts()
                ->whereMonth('workout_date', now()->subMonth()->month)
                ->whereYear('workout_date', now()->subMonth()->year)
                ->count();

            if ($lastMonth > 0) {
                $payload['stats']['month_comparison'] = round(
                    (($thisMonth - $lastMonth) / $lastMonth) * 100
                );
            }
        } catch (\Exception $e) {
            Log::warning('Dashboard month comparison error: ' . $e->getMessage());
        }

        return response()->json($payload);
    }

    public function notifications(Request $request): JsonResponse
    {
        $notifications = [];

        try {
            $user = $request->user();

            $todayWorkout = $user->workouts()
                ->whereDate('workout_date', today())
                ->exists();

            if (!$todayWorkout) {
                $notifications[] = [
                    'type'    => 'reminder',
                    'title'   => 'No workout today!',
                    'message' => "Don't break your streak. Log a workout now.",
                    'icon'    => 'fire',
                ];
            }

            $weekCount = $user->workouts()
                ->where('workout_date', '>=', now()->startOfWeek()->toDateString())
                ->count();

            if ($weekCount >= 3) {
                $notifications[] = [
                    'type'    => 'achievement',
                    'title'   => '3 workouts this week! 🎉',
                    'message' => "You're crushing your weekly target.",
                    'icon'    => 'trophy',
                ];
            }
        } catch (\Exception $e) {
            Log::warning('Notifications error: ' . $e->getMessage());
        }

        return response()->json($notifications);
    }

    public function achievements(Request $request): JsonResponse
    {
        try {
            $user          = $request->user();
            $totalWorkouts = $user->workouts()->count();
            $totalCalories = (int) $user->workouts()->sum('calories_burned');
            $totalDuration = (int) $user->workouts()->sum('duration');

            return response()->json([
                ['id' => 'first_workout',  'title' => 'First Step',        'desc' => 'Complete your first workout',   'icon' => '🏃', 'earned' => $totalWorkouts >= 1],
                ['id' => '10_workouts',    'title' => 'Getting Serious',   'desc' => 'Complete 10 workouts',          'icon' => '💪', 'earned' => $totalWorkouts >= 10],
                ['id' => '50_workouts',    'title' => 'Dedicated Athlete', 'desc' => 'Complete 50 workouts',          'icon' => '🏆', 'earned' => $totalWorkouts >= 50],
                ['id' => '100_workouts',   'title' => 'Century Club',      'desc' => 'Complete 100 workouts',         'icon' => '🌟', 'earned' => $totalWorkouts >= 100],
                ['id' => '1000_calories',  'title' => 'Calorie Crusher',   'desc' => 'Burn 1,000 total calories',     'icon' => '🔥', 'earned' => $totalCalories >= 1000],
                ['id' => '10000_calories', 'title' => 'Inferno',           'desc' => 'Burn 10,000 total calories',    'icon' => '🌋', 'earned' => $totalCalories >= 10000],
                ['id' => '600_min',        'title' => 'Time Master',       'desc' => 'Workout for 600 total minutes', 'icon' => '⏱️', 'earned' => $totalDuration >= 600],
            ]);
        } catch (\Exception $e) {
            Log::error('Achievements error: ' . $e->getMessage());
            return response()->json([]);
        }
    }

    public function bmiCalculator(Request $request): JsonResponse
    {
        $request->validate([
            'weight' => 'required|numeric|min:20|max:500',
            'height' => 'required|numeric|min:50|max:300',
        ]);

        $weight   = (float) $request->weight;
        $height   = (float) $request->height / 100;
        $bmi      = round($weight / ($height * $height), 1);
        $category = $bmi < 18.5 ? 'Underweight'
            : ($bmi < 25 ? 'Normal weight'
            : ($bmi < 30 ? 'Overweight' : 'Obese'));

        return response()->json([
            'bmi'              => $bmi,
            'category'         => $category,
            'ideal_weight_min' => round(18.5 * ($height * $height), 1),
            'ideal_weight_max' => round(24.9 * ($height * $height), 1),
        ]);
    }

    public function calorieNeeds(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->weight || !$user->height || !$user->age) {
            return response()->json([
                'message' => 'Please complete your profile (weight, height, age) first.',
            ], 422);
        }

        $gender = $user->gender ?? 'male';
        $bmr    = $gender === 'female'
            ? (10 * $user->weight) + (6.25 * $user->height) - (5 * $user->age) - 161
            : (10 * $user->weight) + (6.25 * $user->height) - (5 * $user->age) + 5;

        $multipliers = [
            'sedentary'         => 1.2,
            'lightly_active'    => 1.375,
            'moderately_active' => 1.55,
            'very_active'       => 1.725,
            'extra_active'      => 1.9,
        ];
        $tdee = round($bmr * ($multipliers[$user->activity_level ?? 'moderately_active'] ?? 1.55));

        return response()->json([
            'bmr'           => round($bmr),
            'tdee'          => $tdee,
            'goal_calories' => [
                'lose_weight' => $tdee - 500,
                'maintain'    => $tdee,
                'gain_muscle' => $tdee + 300,
            ],
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        if (!Hash::check($request->password, $request->user()->password)) {
            return response()->json(['message' => 'Incorrect password'], 422);
        }

        $request->user()->delete();
        return response()->json(['message' => 'Account deleted']);
    }

    /*
    |--------------------------------------------------------------------------
    | Private helpers
    |--------------------------------------------------------------------------
    */
    private function calculateStreak(User $user): int
    {
        $streak = 0;
        for ($i = 0; $i <= 365; $i++) {
            $date   = now()->subDays($i)->toDateString();
            $exists = $user->workouts()->whereDate('workout_date', $date)->exists();
            if (!$exists) break;
            $streak++;
        }
        return $streak;
    }
}