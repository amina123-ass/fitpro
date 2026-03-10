<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use App\Models\CoachNote;
use App\Models\WeeklyPlan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CoachController extends Controller
{
    // ─────────────────────────────────────────────
    //  Dashboard
    // ─────────────────────────────────────────────
    public function dashboard(Request $request): JsonResponse
    {
        $coach = $request->user();

        // toArray() avoids pivot column leaking into subsequent queries
        $assignedIds = $coach->assignedUsers()->pluck('users.id')->toArray();

        // Workouts this week across all assigned users
        $weekWorkouts = \App\Models\Workout::whereIn('user_id', $assignedIds)
            ->where('workout_date', '>=', now()->startOfWeek())
            ->count();

        // Most active user this week — groupBy only on selected column, no pivot issue
        $mostActive = \App\Models\Workout::whereIn('user_id', $assignedIds)
            ->where('workout_date', '>=', now()->subWeek())
            ->select('user_id', DB::raw('COUNT(*) as total'))
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->with('user:id,name')
            ->first();

        // Query User directly to avoid BelongsToMany pivot columns in SELECT
        $recentUsers = User::whereIn('id', $assignedIds)
            ->with(['workouts' => fn($q) => $q->latest()->take(3)])
            ->take(5)
            ->get(['id', 'name', 'email', 'fitness_goal', 'avatar']);

        return response()->json([
            'stats' => [
                'assigned_users'    => count($assignedIds),
                'created_programs'  => $coach->programs()->where('is_active', true)->count(),
                'created_exercises' => $coach->exercises()->where('is_active', true)->count(),
                'week_workouts'     => $weekWorkouts,
                'unread_messages'   => Message::where('receiver_id', $coach->id)->where('is_read', false)->count(),
            ],
            'most_active_user' => $mostActive?->user ?? null,
            'recent_users'     => $recentUsers,
            'recent_activity'  => \App\Models\Workout::whereIn('user_id', $assignedIds)
                ->with('user:id,name')
                ->latest('workout_date')
                ->take(10)
                ->get(['id', 'user_id', 'workout_date', 'calories_burned', 'duration']),
        ]);
    }

    // ─────────────────────────────────────────────
    //  Users Management
    // ─────────────────────────────────────────────
    public function myUsers(Request $request): JsonResponse
    {
        $assignedIds = $request->user()->assignedUsers()->pluck('users.id')->toArray();

        $query = User::whereIn('id', $assignedIds)
            ->with(['workouts' => fn($q) => $q->latest()->take(5)]);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->goal) {
            $query->where('fitness_goal', $request->goal);
        }

        $users = $query->paginate(10);
        return response()->json($users);
    }

    public function assignUser(Request $request): JsonResponse
    {
        $request->validate(['user_id' => 'required|exists:users,id']);
        $user = User::findOrFail($request->user_id);

        if ($user->role !== 'user') {
            return response()->json(['message' => 'Target must be a regular user'], 422);
        }

        $request->user()->assignedUsers()->syncWithoutDetaching([$user->id]);
        return response()->json(['message' => 'User assigned to coach', 'user' => $user]);
    }

    public function unassignUser(Request $request, User $user): JsonResponse
    {
        $request->user()->assignedUsers()->detach($user->id);
        return response()->json(['message' => 'User removed from your list']);
    }

    public function userProgress(Request $request, User $user): JsonResponse
    {
        $coach = $request->user();
        if (!$coach->assignedUsers()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'User not assigned to you'], 403);
        }

        $workouts = $user->workouts()
            ->with('exercise:id,name,category')
            ->orderBy('workout_date', 'desc')
            ->take(20)
            ->get();

        $weightLogs = $user->weightLogs()
            ->orderBy('log_date', 'desc')
            ->take(20)
            ->get();

        // Monthly workout trend (last 6 months)
        $monthlyTrend = $user->workouts()
            ->where('workout_date', '>=', now()->subMonths(6))
            ->select(
                DB::raw("DATE_FORMAT(workout_date, '%Y-%m') as month"),
                DB::raw('count(*) as count'),
                DB::raw('SUM(calories_burned) as calories')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Category breakdown
        $categoryBreakdown = $user->workouts()
            ->join('exercises', 'workouts.exercise_id', '=', 'exercises.id')
            ->select('exercises.category', DB::raw('count(*) as count'))
            ->groupBy('exercises.category')
            ->get();

        // Coach notes for this user
        $notes = CoachNote::where('coach_id', $coach->id)
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'user'              => $user->only(['id', 'name', 'email', 'age', 'weight', 'height', 'fitness_goal', 'avatar', 'phone']),
            'workouts'          => $workouts,
            'weight_logs'       => $weightLogs,
            'monthly_trend'     => $monthlyTrend,
            'category_breakdown'=> $categoryBreakdown,
            'coach_notes'       => $notes,
            'stats' => [
                'total_workouts'   => $user->workouts()->count(),
                'total_calories'   => $user->workouts()->sum('calories_burned'),
                'week_workouts'    => $user->workouts()->where('workout_date', '>=', now()->subWeek())->count(),
                'month_workouts'   => $user->workouts()->where('workout_date', '>=', now()->subMonth())->count(),
                'avg_duration'     => round($user->workouts()->avg('duration') ?? 0),
                'streak_days'      => $this->calculateStreak($user),
            ],
        ]);
    }

    // ─────────────────────────────────────────────
    //  Coach Notes
    // ─────────────────────────────────────────────
    public function addNote(Request $request, User $user): JsonResponse
    {
        $coach = $request->user();
        if (!$coach->assignedUsers()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'User not assigned to you'], 403);
        }

        $validated = $request->validate([
            'content'  => 'required|string|max:2000',
            'type'     => 'nullable|in:general,nutrition,training,goal',
            'is_private'=> 'boolean',
        ]);

        $note = CoachNote::create([
            'coach_id'   => $coach->id,
            'user_id'    => $user->id,
            'content'    => $validated['content'],
            'type'       => $validated['type'] ?? 'general',
            'is_private' => $validated['is_private'] ?? true,
        ]);

        return response()->json(['message' => 'Note added', 'note' => $note], 201);
    }

    public function deleteNote(Request $request, CoachNote $note): JsonResponse
    {
        if ($note->coach_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $note->delete();
        return response()->json(['message' => 'Note deleted']);
    }

    // ─────────────────────────────────────────────
    //  Weekly Plans
    // ─────────────────────────────────────────────
    public function createWeeklyPlan(Request $request, User $user): JsonResponse
    {
        $coach = $request->user();
        if (!$coach->assignedUsers()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'User not assigned to you'], 403);
        }

        $validated = $request->validate([
            'week_start'   => 'required|date',
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'days'         => 'required|array',
            'days.*.day'   => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'days.*.activities' => 'required|array',
            'days.*.rest'  => 'boolean',
        ]);

        $plan = WeeklyPlan::updateOrCreate(
            ['coach_id' => $coach->id, 'user_id' => $user->id, 'week_start' => $validated['week_start']],
            [
                'title'       => $validated['title'],
                'description' => $validated['description'] ?? null,
                'days'        => json_encode($validated['days']),
                'status'      => 'active',
            ]
        );

        return response()->json(['message' => 'Weekly plan saved', 'plan' => $plan], 201);
    }

    public function getWeeklyPlans(Request $request, User $user): JsonResponse
    {
        $coach = $request->user();
        if (!$coach->assignedUsers()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'User not assigned to you'], 403);
        }

        $plans = WeeklyPlan::where('coach_id', $coach->id)
            ->where('user_id', $user->id)
            ->orderBy('week_start', 'desc')
            ->take(8)
            ->get();

        return response()->json($plans);
    }

    // ─────────────────────────────────────────────
    //  Messaging
    // ─────────────────────────────────────────────
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content'     => 'required|string|max:2000',
        ]);

        $msg = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $validated['receiver_id'],
            'content'     => $validated['content'],
            'is_read'     => false,
        ]);

        return response()->json(['message' => 'Message sent', 'data' => $msg->load('sender:id,name,role')], 201);
    }

    public function getMessages(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Get conversations grouped by other user
        $conversations = Message::where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
            })
            ->with(['sender:id,name,role,avatar', 'receiver:id,name,role,avatar'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($msg) use ($userId) {
                return $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
            })
            ->map(function ($msgs) use ($userId) {
                $latest  = $msgs->first();
                $other   = $latest->sender_id === $userId ? $latest->receiver : $latest->sender;
                $unread  = $msgs->where('receiver_id', $userId)->where('is_read', false)->count();
                return [
                    'other_user'   => $other,
                    'last_message' => $latest,
                    'unread_count' => $unread,
                    'messages'     => $msgs->take(50)->values(),
                ];
            })
            ->values();

        return response()->json($conversations);
    }

    public function getConversation(Request $request, User $other): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = Message::where(function ($q) use ($userId, $other) {
                $q->where('sender_id', $userId)->where('receiver_id', $other->id);
            })->orWhere(function ($q) use ($userId, $other) {
                $q->where('sender_id', $other->id)->where('receiver_id', $userId);
            })
            ->with(['sender:id,name,role,avatar'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark as read
        Message::where('sender_id', $other->id)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'other_user' => $other->only(['id', 'name', 'role', 'avatar']),
            'messages'   => $messages,
        ]);
    }

    public function markMessagesRead(Request $request, User $sender): JsonResponse
    {
        Message::where('sender_id', $sender->id)
            ->where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Messages marked as read']);
    }

    // ─────────────────────────────────────────────
    //  Analytics
    // ─────────────────────────────────────────────
    public function analytics(Request $request): JsonResponse
    {
        $coach = $request->user();

        // Use pluck on users.id to avoid pivot columns leaking into queries
        $assignedIds = $coach->assignedUsers()->pluck('users.id')->toArray();

        $period = (int) ($request->period ?? 30);
        $since  = now()->subDays($period);

        $totalCalories = \App\Models\Workout::whereIn('user_id', $assignedIds)
            ->where('workout_date', '>=', $since)
            ->sum('calories_burned');

        $workoutsByDay = \App\Models\Workout::whereIn('user_id', $assignedIds)
            ->where('workout_date', '>=', $since)
            ->select(DB::raw('DATE(workout_date) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(workout_date)'))
            ->orderBy('date')
            ->get();

        $topExercises = \App\Models\Workout::whereIn('workouts.user_id', $assignedIds)
            ->where('workouts.workout_date', '>=', $since)
            ->join('exercises', 'workouts.exercise_id', '=', 'exercises.id')
            ->select('exercises.id', 'exercises.name', DB::raw('COUNT(*) as count'))
            ->groupBy('exercises.id', 'exercises.name')
            ->orderByDesc('count')
            ->take(5)
            ->get(['exercises.name', 'count']);

        $activeUsersCount = \App\Models\Workout::whereIn('user_id', $assignedIds)
            ->where('workout_date', '>=', now()->subDays(7))
            ->distinct('user_id')
            ->count('user_id');

        // Goal distribution — query users table directly to avoid pivot GROUP BY issue
        $goalDist = User::whereIn('id', $assignedIds)
            ->select('fitness_goal', DB::raw('COUNT(*) as count'))
            ->groupBy('fitness_goal')
            ->get();

        return response()->json([
            'period_days'     => $period,
            'total_workouts'  => \App\Models\Workout::whereIn('user_id', $assignedIds)
                ->where('workout_date', '>=', $since)->count(),
            'total_calories'  => $totalCalories,
            'active_users'    => $activeUsersCount,
            'workouts_by_day' => $workoutsByDay,
            'top_exercises'   => $topExercises,
            'users_goal_dist' => $goalDist,
        ]);
    }

    // ─────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────
    private function calculateStreak(User $user): int
    {
        $dates = $user->workouts()
            ->orderByDesc('workout_date')
            ->pluck('workout_date')
            ->map(fn($d) => \Carbon\Carbon::parse($d)->toDateString())
            ->unique()
            ->values();

        $streak = 0;
        $check  = now()->toDateString();

        foreach ($dates as $date) {
            if ($date === $check || $date === now()->subDays($streak)->toDateString()) {
                $streak++;
                $check = now()->subDays($streak)->toDateString();
            } else {
                break;
            }
        }

        return $streak;
    }
}