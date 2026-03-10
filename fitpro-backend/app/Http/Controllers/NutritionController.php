<?php

namespace App\Http\Controllers;

use App\Models\NutritionLog;
use App\Models\WeightLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NutritionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $date = $request->date ?? now()->toDateString();
        $logs = $request->user()->nutritionLogs()
            ->whereDate('log_date', $date)
            ->orderBy('meal_type')
            ->get();

        $totals = $logs->groupBy('meal_type')->map(fn($group) => [
            'calories' => $group->sum('calories'),
            'protein'  => $group->sum('protein'),
            'carbs'    => $group->sum('carbs'),
            'fat'      => $group->sum('fat'),
            'fiber'    => $group->sum('fiber'),
            'sugar'    => $group->sum('sugar'),
        ]);

        return response()->json([
            'logs'   => $logs,
            'totals' => $totals,
            'daily'  => [
                'calories' => $logs->sum('calories'),
                'protein'  => $logs->sum('protein'),
                'carbs'    => $logs->sum('carbs'),
                'fat'      => $logs->sum('fat'),
                'fiber'    => $logs->sum('fiber'),
                'sugar'    => $logs->sum('sugar'),
                'water_ml' => $logs->sum('water_ml'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'log_date'  => 'required|date',
            'meal_type' => 'required|in:breakfast,lunch,dinner,snack',
            'food_name' => 'required|string|max:255',
            'quantity'  => 'required|numeric|min:0',
            'unit'      => 'nullable|string',
            'calories'  => 'required|numeric|min:0',
            'protein'   => 'nullable|numeric|min:0',
            'carbs'     => 'nullable|numeric|min:0',
            'fat'       => 'nullable|numeric|min:0',
            'fiber'     => 'nullable|numeric|min:0',
            'sugar'     => 'nullable|numeric|min:0',
            'water_ml'  => 'nullable|numeric|min:0',
        ]);

        $log = $request->user()->nutritionLogs()->create($validated);
        return response()->json(['message' => 'Meal logged!', 'log' => $log], 201);
    }

    public function update(Request $request, NutritionLog $nutritionLog): JsonResponse
    {
        if ($nutritionLog->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'food_name' => 'sometimes|string|max:255',
            'quantity'  => 'sometimes|numeric|min:0',
            'calories'  => 'sometimes|numeric|min:0',
            'protein'   => 'nullable|numeric|min:0',
            'carbs'     => 'nullable|numeric|min:0',
            'fat'       => 'nullable|numeric|min:0',
            'fiber'     => 'nullable|numeric|min:0',
            'sugar'     => 'nullable|numeric|min:0',
        ]);

        $nutritionLog->update($validated);
        return response()->json(['message' => 'Meal updated', 'log' => $nutritionLog]);
    }

    public function destroy(Request $request, NutritionLog $nutritionLog): JsonResponse
    {
        if ($nutritionLog->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $nutritionLog->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function weeklyStats(Request $request): JsonResponse
    {
        $stats = $request->user()->nutritionLogs()
            ->selectRaw('DATE(log_date) as date, SUM(calories) as calories, SUM(protein) as protein, SUM(carbs) as carbs, SUM(fat) as fat, SUM(fiber) as fiber')
            ->where('log_date', '>=', now()->subDays(6)->toDateString())
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($stats);
    }

    public function monthlyReport(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year'  => 'required|integer|min:2000|max:2100',
        ]);

        $logs = $request->user()->nutritionLogs()
            ->whereMonth('log_date', $request->month)
            ->whereYear('log_date', $request->year)
            ->get();

        $days = $logs->groupBy(fn($l) => $l->log_date->toDateString());

        $report = [
            'avg_calories' => round($days->avg(fn($d) => $d->sum('calories'))),
            'avg_protein'  => round($days->avg(fn($d) => $d->sum('protein')), 1),
            'avg_carbs'    => round($days->avg(fn($d) => $d->sum('carbs')), 1),
            'avg_fat'      => round($days->avg(fn($d) => $d->sum('fat')), 1),
            'total_days_logged' => $days->count(),
            'best_day'     => $days->sortByDesc(fn($d) => $d->sum('calories'))->keys()->first(),
        ];

        return response()->json($report);
    }

    public function waterLog(Request $request): JsonResponse
    {
        $request->validate([
            'amount_ml' => 'required|integer|min:50|max:2000',
            'log_date'  => 'required|date',
        ]);

        // Store water as a nutrition entry
        $log = $request->user()->nutritionLogs()->create([
            'log_date'  => $request->log_date,
            'meal_type' => 'snack',
            'food_name' => 'Water',
            'quantity'  => $request->amount_ml,
            'unit'      => 'ml',
            'calories'  => 0,
            'water_ml'  => $request->amount_ml,
        ]);

        return response()->json(['message' => 'Water logged!', 'log' => $log], 201);
    }

    public function favoritefoods(Request $request): JsonResponse
    {
        $favorites = $request->user()->nutritionLogs()
            ->selectRaw('food_name, COUNT(*) as times_logged, AVG(calories) as avg_calories, MAX(calories) as max_calories')
            ->groupBy('food_name')
            ->orderByDesc('times_logged')
            ->limit(10)
            ->get();

        return response()->json($favorites);
    }
}