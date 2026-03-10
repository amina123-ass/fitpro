<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\ExerciseFavorite;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ExerciseController extends Controller
{
    // ─────────────────────────────────────────────
    //  Listing & Filtering
    // ─────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Exercise::with('creator:id,name')
            ->where('is_active', true);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('muscle_group', 'like', "%{$request->search}%");
            });
        }
        if ($request->category)   { $query->where('category', $request->category); }
        if ($request->difficulty)  { $query->where('difficulty', $request->difficulty); }
        if ($request->muscle_group){ $query->where('muscle_group', $request->muscle_group); }
        if ($request->duration_max){ $query->where('duration', '<=', $request->duration_max); }

        // Sort
        $sortField = in_array($request->sort, ['name','duration','calories_burned','created_at'])
            ? $request->sort : 'created_at';
        $sortDir   = $request->sort_dir === 'asc' ? 'asc' : 'desc';

        $exercises = $query->withCount('favorites as favorites_count')
            ->orderBy($sortField, $sortDir)
            ->paginate($request->per_page ?? 12);

        // Attach is_favorited for authenticated user
        if ($request->user()) {
            $userId     = $request->user()->id;
            $favIds     = ExerciseFavorite::where('user_id', $userId)->pluck('exercise_id')->toArray();
            $exercises->getCollection()->transform(function ($ex) use ($favIds) {
                $ex->is_favorited = in_array($ex->id, $favIds);
                return $ex;
            });
        }

        return response()->json($exercises);
    }

    // ─────────────────────────────────────────────
    //  CRUD
    // ─────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'duration'        => 'required|integer|min:1',
            'calories_burned' => 'required|integer|min:0',
            'category'        => 'required|string',
            'difficulty'      => 'required|in:beginner,intermediate,advanced',
            'muscle_group'    => 'nullable|string',
            'image'           => 'nullable|string',
            'video_url'       => 'nullable|url',
            'equipment'       => 'nullable|string',
            'instructions'    => 'nullable|array',
            'tips'            => 'nullable|array',
            'sets_default'    => 'nullable|integer|min:1',
            'reps_default'    => 'nullable|integer|min:1',
        ]);

        $exercise = Exercise::create([
            ...$validated,
            'instructions' => isset($validated['instructions']) ? json_encode($validated['instructions']) : null,
            'tips'         => isset($validated['tips'])         ? json_encode($validated['tips'])         : null,
            'created_by'   => $request->user()->id,
        ]);

        return response()->json([
            'message'  => 'Exercise created successfully',
            'exercise' => $exercise->load('creator:id,name'),
        ], 201);
    }

    public function show(Exercise $exercise): JsonResponse
    {
        $exercise->loadCount('favorites as favorites_count');
        $exercise->load('creator:id,name');

        // Related exercises (same category/muscle group)
        $related = Exercise::where('is_active', true)
            ->where('id', '!=', $exercise->id)
            ->where(function ($q) use ($exercise) {
                $q->where('category', $exercise->category)
                  ->orWhere('muscle_group', $exercise->muscle_group);
            })
            ->take(4)
            ->get(['id', 'name', 'difficulty', 'category', 'image', 'duration', 'calories_burned']);

        return response()->json([
            'exercise' => $exercise,
            'related'  => $related,
        ]);
    }

    public function update(Request $request, Exercise $exercise): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $exercise->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'duration'        => 'sometimes|integer|min:1',
            'calories_burned' => 'sometimes|integer|min:0',
            'category'        => 'sometimes|string',
            'difficulty'      => 'sometimes|in:beginner,intermediate,advanced',
            'muscle_group'    => 'nullable|string',
            'image'           => 'nullable|string',
            'video_url'       => 'nullable|url',
            'equipment'       => 'nullable|string',
            'instructions'    => 'nullable|array',
            'tips'            => 'nullable|array',
            'sets_default'    => 'nullable|integer|min:1',
            'reps_default'    => 'nullable|integer|min:1',
        ]);

        if (isset($validated['instructions'])) {
            $validated['instructions'] = json_encode($validated['instructions']);
        }
        if (isset($validated['tips'])) {
            $validated['tips'] = json_encode($validated['tips']);
        }

        $exercise->update($validated);

        return response()->json([
            'message'  => 'Exercise updated',
            'exercise' => $exercise->load('creator:id,name'),
        ]);
    }

    public function destroy(Request $request, Exercise $exercise): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $exercise->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $exercise->update(['is_active' => false]);
        return response()->json(['message' => 'Exercise deleted']);
    }

    // ─────────────────────────────────────────────
    //  Favorites
    // ─────────────────────────────────────────────
    public function toggleFavorite(Request $request, Exercise $exercise): JsonResponse
    {
        $userId = $request->user()->id;
        $fav = ExerciseFavorite::where('user_id', $userId)->where('exercise_id', $exercise->id)->first();

        if ($fav) {
            $fav->delete();
            return response()->json(['message' => 'Removed from favorites', 'is_favorited' => false]);
        }

        ExerciseFavorite::create(['user_id' => $userId, 'exercise_id' => $exercise->id]);
        return response()->json(['message' => 'Added to favorites', 'is_favorited' => true]);
    }

    public function myFavorites(Request $request): JsonResponse
    {
        $exercises = Exercise::whereHas('favorites', fn($q) => $q->where('user_id', $request->user()->id))
            ->where('is_active', true)
            ->with('creator:id,name')
            ->paginate(12);

        return response()->json($exercises);
    }

    // ─────────────────────────────────────────────
    //  Meta
    // ─────────────────────────────────────────────
    public function categories(): JsonResponse
    {
        $categories = Exercise::where('is_active', true)->distinct()->pluck('category');
        return response()->json($categories);
    }

    public function muscleGroups(): JsonResponse
    {
        $groups = Exercise::where('is_active', true)
            ->whereNotNull('muscle_group')
            ->distinct()
            ->pluck('muscle_group');
        return response()->json($groups);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total'      => Exercise::where('is_active', true)->count(),
            'by_category'=> Exercise::where('is_active', true)
                ->select('category', DB::raw('count(*) as count'))
                ->groupBy('category')->get(),
            'by_difficulty' => Exercise::where('is_active', true)
                ->select('difficulty', DB::raw('count(*) as count'))
                ->groupBy('difficulty')->get(),
        ]);
    }

    // ─────────────────────────────────────────────
    //  Bulk Actions
    // ─────────────────────────────────────────────
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:exercises,id']);

        $user = $request->user();
        $query = Exercise::whereIn('id', $request->ids);

        if (!$user->isAdmin()) {
            $query->where('created_by', $user->id);
        }

        $count = $query->update(['is_active' => false]);
        return response()->json(['message' => "$count exercises deleted"]);
    }

    public function duplicate(Request $request, Exercise $exercise): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && $exercise->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $copy = $exercise->replicate();
        $copy->name       = $exercise->name . ' (Copy)';
        $copy->created_by = $user->id;
        $copy->save();

        return response()->json([
            'message'  => 'Exercise duplicated',
            'exercise' => $copy->load('creator:id,name'),
        ], 201);
    }
}