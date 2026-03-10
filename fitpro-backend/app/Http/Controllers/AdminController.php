<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Exercise;
use App\Models\Program;
use App\Models\Workout;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // ─────────────────────────────────────────────
    //  Dashboard
    // ─────────────────────────────────────────────
    public function dashboard(): JsonResponse
    {
        $totalUsers    = User::where('role', 'user')->count();
        $totalCoaches  = User::where('role', 'coach')->count();
        $prevWeekUsers = User::where('role', 'user')
            ->whereBetween('created_at', [now()->subWeeks(2), now()->subWeek()])
            ->count();
        $newUsersWeek  = User::where('role', 'user')
            ->where('created_at', '>=', now()->subWeek())
            ->count();

        $growthRate = $prevWeekUsers > 0
            ? round((($newUsersWeek - $prevWeekUsers) / $prevWeekUsers) * 100, 1)
            : 0;

        // Revenue simulation (workouts × avg value)
        $totalWorkouts     = Workout::count();
        $workoutsThisMonth = Workout::where('workout_date', '>=', now()->startOfMonth())->count();
        $workoutsLastMonth = Workout::whereBetween('workout_date', [
            now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth(),
        ])->count();

        // Active users (logged a workout in last 7 days)
        $activeUsers = Workout::where('workout_date', '>=', now()->subDays(7))
            ->distinct('user_id')->count('user_id');

        // Retention: users who worked out both last month and this month
        $retained = Workout::where('workout_date', '>=', now()->startOfMonth())
            ->whereIn('user_id', function ($q) {
                $q->select('user_id')->from('workouts')
                  ->whereBetween('workout_date', [
                      now()->subMonth()->startOfMonth(),
                      now()->subMonth()->endOfMonth(),
                  ]);
            })
            ->distinct('user_id')->count('user_id');

        $retentionRate = $activeUsers > 0 ? round(($retained / max($activeUsers, 1)) * 100) : 0;

        return response()->json([
            'stats' => [
                'total_users'         => $totalUsers,
                'total_coaches'       => $totalCoaches,
                'total_exercises'     => Exercise::where('is_active', true)->count(),
                'total_programs'      => Program::where('is_active', true)->count(),
                'total_workouts'      => $totalWorkouts,
                'new_users_week'      => $newUsersWeek,
                'active_users'        => $activeUsers,
                'user_growth_rate'    => $growthRate,
                'workouts_this_month' => $workoutsThisMonth,
                'workouts_last_month' => $workoutsLastMonth,
                'retention_rate'      => $retentionRate,
                'suspended_users'     => User::where('is_active', false)->count(),
            ],
            'recent_users' => User::latest()->take(8)->get(['id','name','email','role','is_active','created_at']),
            'recent_workouts' => Workout::with('user:id,name', 'exercise:id,name,category')
                ->latest('workout_date')->take(8)
                ->get(['id','user_id','exercise_id','workout_date','calories_burned','duration']),
        ]);
    }

    // ─────────────────────────────────────────────
    //  Reports & Analytics
    // ─────────────────────────────────────────────
    public function reports(Request $request): JsonResponse
    {
        $months = (int) ($request->months ?? 6);

        $workoutsByMonth = Workout::selectRaw('YEAR(workout_date) y, MONTH(workout_date) m, COUNT(*) cnt, SUM(calories_burned) calories')
            ->where('workout_date', '>=', now()->subMonths($months))
            ->groupBy('y', 'm')
            ->orderBy('y')->orderBy('m')
            ->get();

        $usersByMonth = User::selectRaw('YEAR(created_at) y, MONTH(created_at) m, COUNT(*) cnt')
            ->where('created_at', '>=', now()->subMonths($months))
            ->groupBy('y', 'm')
            ->orderBy('y')->orderBy('m')
            ->get();

        $topExercises = Exercise::withCount('workouts')
            ->orderByDesc('workouts_count')
            ->take(10)
            ->get(['id','name','category','difficulty','workouts_count']);

        $categoryBreakdown = Workout::join('exercises','workouts.exercise_id','=','exercises.id')
            ->select('exercises.category', DB::raw('COUNT(*) as count'))
            ->where('workouts.workout_date', '>=', now()->subMonths($months))
            ->groupBy('exercises.category')
            ->orderByDesc('count')
            ->get();

        $difficultyBreakdown = Exercise::where('is_active', true)
            ->select('difficulty', DB::raw('COUNT(*) as count'))
            ->groupBy('difficulty')
            ->get();

        $goalBreakdown = User::where('role','user')
            ->whereNotNull('fitness_goal')
            ->select('fitness_goal', DB::raw('COUNT(*) as count'))
            ->groupBy('fitness_goal')
            ->get();

        $avgWorkoutsPerUser = $workoutsByMonth->sum('cnt') > 0
            ? round(Workout::where('workout_date','>=',now()->subMonths($months))->count()
                / max(User::where('role','user')->count(), 1), 1)
            : 0;

        // Daily active users last 30 days
        $dauTrend = Workout::where('workout_date', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(workout_date) as date'), DB::raw('COUNT(DISTINCT user_id) as dau'))
            ->groupBy(DB::raw('DATE(workout_date)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'workouts_by_month'   => $workoutsByMonth,
            'users_by_month'      => $usersByMonth,
            'top_exercises'       => $topExercises,
            'category_breakdown'  => $categoryBreakdown,
            'difficulty_breakdown'=> $difficultyBreakdown,
            'goal_breakdown'      => $goalBreakdown,
            'avg_workouts_per_user'=> $avgWorkoutsPerUser,
            'dau_trend'           => $dauTrend,
            'period_months'       => $months,
        ]);
    }

    public function exportReports(Request $request): JsonResponse
    {
        // Returns raw data for CSV export
        $workouts = Workout::with('user:id,name,email', 'exercise:id,name,category')
            ->where('workout_date', '>=', now()->subMonths(3))
            ->get(['id','user_id','exercise_id','workout_date','duration','calories_burned']);

        return response()->json([
            'data'      => $workouts,
            'exported_at' => now()->toISOString(),
            'count'     => $workouts->count(),
        ]);
    }

    // ─────────────────────────────────────────────
    //  User Management
    // ─────────────────────────────────────────────
    public function listUsers(Request $request): JsonResponse
    {
        $query = User::withCount(['workouts', 'userPrograms']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }
        if ($request->role)   { $query->where('role', $request->role); }
        if ($request->status) { $query->where('is_active', $request->status === 'active'); }

        $sort    = in_array($request->sort, ['name','email','created_at','workouts_count']) ? $request->sort : 'created_at';
        $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';

        return response()->json($query->orderBy($sort, $sortDir)->paginate(15));
    }

    public function showUser(User $user): JsonResponse
    {
        $user->load(['workouts' => fn($q) => $q->latest()->take(10)->with('exercise:id,name'),
                     'userPrograms.program']);
        $user->loadCount(['workouts', 'userPrograms']);

        $stats = [
            'total_workouts'  => $user->workouts_count,
            'total_calories'  => $user->workouts()->sum('calories_burned'),
            'week_workouts'   => $user->workouts()->where('workout_date','>=',now()->subWeek())->count(),
            'active_programs' => $user->userPrograms()->where('status','active')->count(),
        ];

        return response()->json(['user' => $user, 'stats' => $stats]);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|email|unique:users,email,'.$user->id,
            'role'      => 'sometimes|in:user,coach,admin',
            'is_active' => 'sometimes|boolean',
        ]);
        $user->update($validated);
        return response()->json(['message' => 'Utilisateur mis à jour', 'user' => $user]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de supprimer un compte admin'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    public function toggleUserStatus(User $user): JsonResponse
    {
        $user->update(['is_active' => !$user->is_active]);
        $status = $user->is_active ? 'activé' : 'suspendu';
        return response()->json(['message' => "Utilisateur $status", 'is_active' => $user->is_active]);
    }

    public function changeUserRole(Request $request, User $user): JsonResponse
    {
        $request->validate(['role' => 'required|in:user,coach,admin']);
        $user->update(['role' => $request->role]);
        return response()->json(['message' => 'Rôle mis à jour', 'user' => $user]);
    }

    public function bulkAction(Request $request): JsonResponse
    {
        $request->validate([
            'action'   => 'required|in:activate,suspend,delete',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        // Protect admins
        $targetUsers = User::whereIn('id', $request->user_ids)->where('role','!=','admin');
        $count = $targetUsers->count();

        match ($request->action) {
            'activate' => $targetUsers->update(['is_active' => true]),
            'suspend'  => $targetUsers->update(['is_active' => false]),
            'delete'   => $targetUsers->delete(),
        };

        return response()->json(['message' => "$count utilisateurs : {$request->action}"]);
    }

    // ─────────────────────────────────────────────
    //  Coach Management
    // ─────────────────────────────────────────────
    public function createCoach(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone'    => 'nullable|string|max:20',
        ]);

        $coach = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone'    => $validated['phone'] ?? null,
            'role'     => 'coach',
            'is_active'=> true,
        ]);

        return response()->json(['message' => 'Coach créé avec succès', 'coach' => $coach], 201);
    }

    public function listCoaches(Request $request): JsonResponse
    {
        $coaches = User::where('role','coach')
            ->withCount(['assignedUsers', 'programs', 'exercises'])
            ->when($request->search, fn($q) =>
                $q->where('name','like',"%{$request->search}%")
                  ->orWhere('email','like',"%{$request->search}%")
            )
            ->orderBy('created_at','desc')
            ->paginate(10);

        return response()->json($coaches);
    }

    public function removeCoach(User $coach): JsonResponse
    {
        if ($coach->role !== 'coach') {
            return response()->json(['message' => 'Cet utilisateur n\'est pas un coach'], 422);
        }
        // Downgrade to user instead of deleting
        $coach->update(['role' => 'user']);
        return response()->json(['message' => 'Coach rétrogradé en utilisateur']);
    }

    // ─────────────────────────────────────────────
    //  Content Moderation
    // ─────────────────────────────────────────────
    public function pendingExercises(): JsonResponse
    {
        // Exercises created in last 7 days, not yet reviewed
        $exercises = Exercise::where('is_active', true)
            ->where('created_at', '>=', now()->subDays(7))
            ->with('creator:id,name,role')
            ->latest()
            ->get();
        return response()->json($exercises);
    }

    public function approveExercise(Exercise $exercise): JsonResponse
    {
        // Already active, this marks as "admin approved"
        $exercise->update(['is_active' => true]);
        return response()->json(['message' => 'Exercice approuvé']);
    }

    public function rejectExercise(Exercise $exercise): JsonResponse
    {
        $exercise->update(['is_active' => false]);
        return response()->json(['message' => 'Exercice rejeté']);
    }

    public function pendingPrograms(): JsonResponse
    {
        $programs = Program::where('is_active', true)
            ->where('created_at', '>=', now()->subDays(7))
            ->with('creator:id,name,role')
            ->withCount('userPrograms as followers_count')
            ->latest()
            ->get();
        return response()->json($programs);
    }

    public function approveProgram(Program $program): JsonResponse
    {
        $program->update(['is_active' => true]);
        return response()->json(['message' => 'Programme approuvé']);
    }

    public function rejectProgram(Program $program): JsonResponse
    {
        $program->update(['is_active' => false]);
        return response()->json(['message' => 'Programme rejeté']);
    }

    // ─────────────────────────────────────────────
    //  Exercise & Program Overview
    // ─────────────────────────────────────────────
    public function listExercises(Request $request): JsonResponse
    {
        $query = Exercise::with('creator:id,name')->withCount('workouts');

        if ($request->search)     { $query->where('name','like',"%{$request->search}%"); }
        if ($request->category)   { $query->where('category', $request->category); }
        if ($request->difficulty) { $query->where('difficulty', $request->difficulty); }
        if ($request->status === 'inactive') { $query->where('is_active', false); }
        else { $query->where('is_active', true); }

        return response()->json($query->latest()->paginate(15));
    }

    public function listPrograms(Request $request): JsonResponse
    {
        $query = Program::with('creator:id,name')
            ->withCount('userPrograms as followers_count');

        if ($request->search)     { $query->where('name','like',"%{$request->search}%"); }
        if ($request->difficulty) { $query->where('difficulty', $request->difficulty); }
        if ($request->status === 'inactive') { $query->where('is_active', false); }
        else { $query->where('is_active', true); }

        return response()->json($query->latest()->paginate(15));
    }

    // ─────────────────────────────────────────────
    //  System Stats (for monitoring)
    // ─────────────────────────────────────────────
    public function systemStats(): JsonResponse
    {
        return response()->json([
            'database' => [
                'total_users'     => User::count(),
                'total_workouts'  => Workout::count(),
                'total_exercises' => Exercise::count(),
                'total_programs'  => Program::count(),
            ],
            'today' => [
                'new_users'    => User::whereDate('created_at', today())->count(),
                'new_workouts' => Workout::whereDate('workout_date', today())->count(),
            ],
            'health' => [
                'active_users_ratio' => User::count() > 0
                    ? round((User::where('is_active',true)->count() / User::count()) * 100) : 0,
            ],
        ]);
    }
}