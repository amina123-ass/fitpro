<?php

namespace App\Http\Controllers;

use App\Models\Workout;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class WorkoutController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->workouts()
            ->with('exercise:id,name,category,image');

        if ($request->from)     $query->where('workout_date', '>=', $request->from);
        if ($request->to)       $query->where('workout_date', '<=', $request->to);
        if ($request->category) {
            $query->whereHas('exercise', fn($q) => $q->where('category', $request->category));
        }

        return response()->json($query->orderBy('workout_date', 'desc')->paginate(10));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'exercise_id'     => 'required|exists:exercises,id',
            'workout_date'    => 'required|date',
            'duration'        => 'required|integer|min:1',
            'calories_burned' => 'required|integer|min:0',
            'notes'           => 'nullable|string',
            'sets'            => 'nullable|integer|min:1',
            'reps'            => 'nullable|integer|min:1',
            'weight_used'     => 'nullable|numeric|min:0',
            'heart_rate_avg'  => 'nullable|integer|min:40|max:220',
            'mood'            => 'nullable|in:great,good,okay,tired,bad',
        ]);

        $workout = $request->user()->workouts()->create($validated);
        return response()->json(['message' => 'Workout logged!', 'workout' => $workout->load('exercise')], 201);
    }

    public function show(Request $request, Workout $workout): JsonResponse
    {
        if ($workout->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($workout->load('exercise'));
    }

    public function update(Request $request, Workout $workout): JsonResponse
    {
        if ($workout->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'duration'        => 'sometimes|integer|min:1',
            'calories_burned' => 'sometimes|integer|min:0',
            'notes'           => 'nullable|string',
            'sets'            => 'nullable|integer|min:1',
            'reps'            => 'nullable|integer|min:1',
            'weight_used'     => 'nullable|numeric|min:0',
            'heart_rate_avg'  => 'nullable|integer|min:40|max:220',
            'mood'            => 'nullable|in:great,good,okay,tired,bad',
        ]);
        $workout->update($validated);
        return response()->json(['message' => 'Workout updated', 'workout' => $workout->load('exercise')]);
    }

    public function destroy(Request $request, Workout $workout): JsonResponse
    {
        if ($workout->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $workout->delete();
        return response()->json(['message' => 'Workout deleted']);
    }

    public function stats(Request $request): JsonResponse
    {
        $user    = $request->user();
        $payload = [
            'total_workouts'   => 0,
            'total_calories'   => 0,
            'total_duration'   => 0,
            'avg_duration'     => 0,
            'weekly_activity'  => [],
            'monthly_calories' => [],
            'by_category'      => [],
            'mood_stats'       => [],
        ];

        try {
            $payload['total_workouts'] = $user->workouts()->count();
            $payload['total_calories'] = (int) $user->workouts()->sum('calories_burned');
            $payload['total_duration'] = (int) $user->workouts()->sum('duration');
            $payload['avg_duration']   = (int) round($user->workouts()->avg('duration') ?? 0);
        } catch (\Exception $e) {
            Log::error('WorkoutStats totals: ' . $e->getMessage());
        }

        try {
            $payload['weekly_activity'] = $user->workouts()
                ->selectRaw('DATE(workout_date) as date, SUM(calories_burned) as calories, SUM(duration) as duration, COUNT(*) as count')
                ->where('workout_date', '>=', now()->subDays(6)->toDateString())
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        } catch (\Exception $e) {
            Log::error('WorkoutStats weekly: ' . $e->getMessage());
        }

        try {
            $payload['monthly_calories'] = $user->workouts()
                ->selectRaw('YEAR(workout_date) as year, WEEK(workout_date) as week, SUM(calories_burned) as calories')
                ->where('workout_date', '>=', now()->subWeeks(4)->toDateString())
                ->groupBy('year', 'week')
                ->orderBy('year')->orderBy('week')
                ->get();
        } catch (\Exception $e) {
            Log::error('WorkoutStats monthly: ' . $e->getMessage());
        }

        try {
            $payload['by_category'] = $user->workouts()
                ->join('exercises', 'workouts.exercise_id', '=', 'exercises.id')
                ->selectRaw('exercises.category, COUNT(*) as count, SUM(workouts.calories_burned) as calories')
                ->groupBy('exercises.category')
                ->get();
        } catch (\Exception $e) {
            Log::warning('WorkoutStats categories: ' . $e->getMessage());
        }

        try {
            $payload['mood_stats'] = $user->workouts()
                ->whereNotNull('mood')
                ->selectRaw('mood, COUNT(*) as count')
                ->groupBy('mood')
                ->get();
        } catch (\Exception $e) {
            // Column may not exist yet — silently skip
        }

        return response()->json($payload);
    }

    public function calendar(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year'  => 'required|integer|min:2000|max:2100',
        ]);

        try {
            return response()->json(
                $request->user()->workouts()
                    ->selectRaw('DATE(workout_date) as date, COUNT(*) as count, SUM(calories_burned) as calories, SUM(duration) as duration')
                    ->whereMonth('workout_date', $request->month)
                    ->whereYear('workout_date', $request->year)
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
                    ->keyBy('date')
            );
        } catch (\Exception $e) {
            Log::error('Workout calendar: ' . $e->getMessage());
            return response()->json([]);
        }
    }

    public function export(Request $request): JsonResponse
    {
        try {
            return response()->json(
                $request->user()->workouts()
                    ->with('exercise:id,name,category')
                    ->orderBy('workout_date', 'desc')
                    ->get()
                    ->map(fn($w) => [
                        'date'      => $w->workout_date,
                        'exercise'  => $w->exercise->name     ?? '—',
                        'category'  => $w->exercise->category ?? '—',
                        'duration'  => $w->duration,
                        'calories'  => $w->calories_burned,
                        'sets'      => $w->sets,
                        'reps'      => $w->reps,
                        'weight_kg' => $w->weight_used,
                        'mood'      => $w->mood,
                        'notes'     => $w->notes,
                    ])
            );
        } catch (\Exception $e) {
            Log::error('Workout export: ' . $e->getMessage());
            return response()->json([]);
        }
    }
}