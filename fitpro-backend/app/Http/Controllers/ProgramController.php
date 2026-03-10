<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\UserProgram;
use App\Models\ProgramReview;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProgramController extends Controller
{
    // ─────────────────────────────────────────────
    //  Listing & Filtering
    // ─────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Program::with(['creator:id,name', 'days.exercises'])
            ->where('is_active', true);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('goal', 'like', "%{$request->search}%");
            });
        }
        if ($request->goal)         { $query->where('goal', $request->goal); }
        if ($request->difficulty)   { $query->where('difficulty', $request->difficulty); }
        if ($request->duration_min) { $query->where('duration_weeks', '>=', $request->duration_min); }
        if ($request->duration_max) { $query->where('duration_weeks', '<=', $request->duration_max); }
        if ($request->days_per_week){ $query->where('days_per_week', $request->days_per_week); }

        $sortOptions = ['name', 'duration_weeks', 'created_at', 'followers_count'];
        $sort     = in_array($request->sort, $sortOptions) ? $request->sort : 'created_at';
        $sortDir  = $request->sort_dir === 'asc' ? 'asc' : 'desc';

        $programs = $query->withCount('userPrograms as followers_count')
            ->withAvg('reviews as avg_rating', 'rating')
            ->orderBy($sort, $sortDir)
            ->paginate($request->per_page ?? 9);

        // Attach enrollment status
        if ($request->user()) {
            $userId    = $request->user()->id;
            $enrolled  = UserProgram::where('user_id', $userId)->where('status', 'active')->pluck('program_id')->toArray();
            $programs->getCollection()->transform(function ($prog) use ($enrolled) {
                $prog->is_enrolled = in_array($prog->id, $enrolled);
                return $prog;
            });
        }

        return response()->json($programs);
    }

    // ─────────────────────────────────────────────
    //  CRUD
    // ─────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'difficulty'        => 'required|in:beginner,intermediate,advanced',
            'duration_weeks'    => 'required|integer|min:1',
            'goal'              => 'required|string',
            'image'             => 'nullable|string',
            'equipment_needed'  => 'nullable|string',
            'days_per_week'     => 'nullable|integer|min:1|max:7',
            'target_audience'   => 'nullable|string',
            'estimated_calories_week' => 'nullable|integer|min:0',
            'is_public'         => 'boolean',
            'days'              => 'nullable|array',
            'days.*.day_number' => 'required|integer|min:1|max:7',
            'days.*.title'      => 'nullable|string|max:255',
            'days.*.is_rest'    => 'nullable|boolean',
            'days.*.exercises'  => 'nullable|array',
            'days.*.exercises.*.exercise_id' => 'required|exists:exercises,id',
            'days.*.exercises.*.sets'        => 'nullable|integer|min:1',
            'days.*.exercises.*.reps'        => 'nullable|integer|min:1',
            'days.*.exercises.*.duration_seconds' => 'nullable|integer|min:1',
            'days.*.exercises.*.rest_seconds'=> 'nullable|integer|min:0',
            'days.*.exercises.*.notes'       => 'nullable|string',
            'days.*.exercises.*.order'       => 'nullable|integer',
        ]);

        $program = Program::create([
            'name'             => $validated['name'],
            'description'      => $validated['description']       ?? null,
            'difficulty'       => $validated['difficulty'],
            'duration_weeks'   => $validated['duration_weeks'],
            'goal'             => $validated['goal'],
            'image'            => $validated['image']             ?? null,
            'equipment_needed' => $validated['equipment_needed']  ?? null,
            'days_per_week'    => $validated['days_per_week']     ?? null,
            'target_audience'  => $validated['target_audience']   ?? null,
            'estimated_calories_week' => $validated['estimated_calories_week'] ?? null,
            'is_public'        => $validated['is_public']         ?? true,
            'created_by'       => $request->user()->id,
        ]);

        $this->saveDays($program, $validated['days'] ?? []);

        return response()->json([
            'message' => 'Program created successfully',
            'program' => $program->load(['creator:id,name', 'days.exercises']),
        ], 201);
    }

    public function show(Program $program): JsonResponse
    {
        $program->loadCount('userPrograms as followers_count');
        $program->loadAvg('reviews as avg_rating', 'rating');
        $program->load(['creator:id,name', 'days.exercises', 'reviews' => fn($q) => $q->latest()->take(5)->with('user:id,name')]);

        $userId = request()->user()?->id;
        if ($userId) {
            $enrollment = UserProgram::where('user_id', $userId)
                ->where('program_id', $program->id)
                ->latest()
                ->first();
            $program->user_enrollment = $enrollment;
        }

        return response()->json($program);
    }

    public function update(Request $request, Program $program): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $program->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'description'      => 'nullable|string',
            'difficulty'       => 'sometimes|in:beginner,intermediate,advanced',
            'duration_weeks'   => 'sometimes|integer|min:1',
            'goal'             => 'sometimes|string',
            'image'            => 'nullable|string',
            'equipment_needed' => 'nullable|string',
            'days_per_week'    => 'nullable|integer|min:1|max:7',
            'target_audience'  => 'nullable|string',
            'estimated_calories_week' => 'nullable|integer|min:0',
            'is_public'        => 'boolean',
        ]);

        $program->update($validated);

        return response()->json(['message' => 'Program updated', 'program' => $program->load('days.exercises')]);
    }

    public function destroy(Request $request, Program $program): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $program->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $program->update(['is_active' => false]);
        return response()->json(['message' => 'Program deleted']);
    }

    public function duplicate(Request $request, Program $program): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $program->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $copy = $program->replicate(['userPrograms']);
        $copy->name       = $program->name . ' (Copy)';
        $copy->created_by = $user->id;
        $copy->save();

        foreach ($program->days as $day) {
            $newDay = $copy->days()->create([
                'day_number' => $day->day_number,
                'title'      => $day->title,
                'is_rest'    => $day->is_rest ?? false,
            ]);
            foreach ($day->programExercises as $pe) {
                $newDay->programExercises()->create($pe->only([
                    'exercise_id','sets','reps','duration_seconds','rest_seconds','notes','order'
                ]));
            }
        }

        return response()->json([
            'message' => 'Program duplicated',
            'program' => $copy->load('days.exercises'),
        ], 201);
    }

    // ─────────────────────────────────────────────
    //  Days Management
    // ─────────────────────────────────────────────
    public function updateDays(Request $request, Program $program): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $program->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'days'              => 'required|array',
            'days.*.day_number' => 'required|integer|min:1|max:7',
            'days.*.title'      => 'nullable|string|max:255',
            'days.*.is_rest'    => 'nullable|boolean',
            'days.*.exercises'  => 'nullable|array',
            'days.*.exercises.*.exercise_id' => 'required|exists:exercises,id',
            'days.*.exercises.*.sets'        => 'nullable|integer',
            'days.*.exercises.*.reps'        => 'nullable|integer',
            'days.*.exercises.*.rest_seconds'=> 'nullable|integer',
            'days.*.exercises.*.notes'       => 'nullable|string',
        ]);

        // Replace all days
        $program->days()->each(fn($d) => $d->programExercises()->delete());
        $program->days()->delete();

        $this->saveDays($program, $validated['days']);

        return response()->json([
            'message' => 'Days updated',
            'program' => $program->fresh()->load('days.exercises'),
        ]);
    }

    // ─────────────────────────────────────────────
    //  Enrollment
    // ─────────────────────────────────────────────
    public function follow(Request $request, Program $program): JsonResponse
    {
        $userId = $request->user()->id;
        $exists = UserProgram::where('user_id', $userId)
            ->where('program_id', $program->id)
            ->where('status', 'active')
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already following this program'], 409);
        }

        $up = UserProgram::create([
            'user_id'    => $userId,
            'program_id' => $program->id,
            'start_date' => now()->toDateString(),
            'status'     => 'active',
        ]);

        return response()->json(['message' => 'Program started! 🚀', 'user_program' => $up], 201);
    }

    public function unfollow(Request $request, Program $program): JsonResponse
    {
        $updated = UserProgram::where('user_id', $request->user()->id)
            ->where('program_id', $program->id)
            ->where('status', 'active')
            ->update(['status' => 'cancelled', 'end_date' => now()->toDateString()]);

        if (!$updated) {
            return response()->json(['message' => 'Program not found'], 404);
        }

        return response()->json(['message' => 'Program unfollowed']);
    }

    public function complete(Request $request, Program $program): JsonResponse
    {
        $updated = UserProgram::where('user_id', $request->user()->id)
            ->where('program_id', $program->id)
            ->where('status', 'active')
            ->update(['status' => 'completed', 'end_date' => now()->toDateString()]);

        if (!$updated) {
            return response()->json(['message' => 'Active program not found'], 404);
        }

        return response()->json(['message' => 'Congratulations! Program completed! 🎉']);
    }

    public function myPrograms(Request $request): JsonResponse
    {
        $programs = $request->user()->userPrograms()
            ->with('program.days.exercises')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($programs);
    }

    // ─────────────────────────────────────────────
    //  Progress
    // ─────────────────────────────────────────────
    public function progress(Request $request, Program $program): JsonResponse
    {
        $userProgram = UserProgram::where('user_id', $request->user()->id)
            ->where('program_id', $program->id)
            ->where('status', 'active')
            ->firstOrFail();

        $totalDays   = $program->duration_weeks * 7;
        $daysPassed  = now()->diffInDays($userProgram->start_date);
        $progressPct = $totalDays > 0 ? min(round(($daysPassed / $totalDays) * 100), 100) : 0;

        // Workouts completed since start
        $completedWorkouts = $request->user()->workouts()
            ->where('workout_date', '>=', $userProgram->start_date)
            ->count();

        return response()->json([
            'start_date'         => $userProgram->start_date,
            'days_passed'        => $daysPassed,
            'total_days'         => $totalDays,
            'progress_pct'       => $progressPct,
            'completed_workouts' => $completedWorkouts,
            'days_remaining'     => max(0, $totalDays - $daysPassed),
            'on_track'           => $completedWorkouts >= ($daysPassed * ($program->days_per_week / 7)),
        ]);
    }

    // ─────────────────────────────────────────────
    //  Reviews
    // ─────────────────────────────────────────────
    public function addReview(Request $request, Program $program): JsonResponse
    {
        $validated = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = ProgramReview::updateOrCreate(
            ['user_id' => $request->user()->id, 'program_id' => $program->id],
            $validated
        );

        return response()->json(['message' => 'Review submitted', 'review' => $review], 201);
    }

    public function reviews(Program $program): JsonResponse
    {
        $reviews = $program->reviews()
            ->with('user:id,name,avatar')
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    // ─────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────
    private function saveDays(Program $program, array $days): void
    {
        foreach ($days as $dayData) {
            $day = $program->days()->create([
                'day_number' => $dayData['day_number'],
                'title'      => $dayData['title']    ?? null,
                'is_rest'    => $dayData['is_rest']   ?? false,
            ]);

            if (!empty($dayData['exercises']) && !($dayData['is_rest'] ?? false)) {
                foreach ($dayData['exercises'] as $idx => $exData) {
                    $day->programExercises()->create([
                        'exercise_id'       => $exData['exercise_id'],
                        'sets'              => $exData['sets']             ?? 3,
                        'reps'              => $exData['reps']             ?? 10,
                        'duration_seconds'  => $exData['duration_seconds'] ?? null,
                        'rest_seconds'      => $exData['rest_seconds']     ?? 60,
                        'notes'             => $exData['notes']            ?? null,
                        'order'             => $exData['order']            ?? ($idx + 1),
                    ]);
                }
            }
        }
    }
}