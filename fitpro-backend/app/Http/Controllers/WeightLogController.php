<?php

namespace App\Http\Controllers;

use App\Models\WeightLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WeightLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->weightLogs()->orderBy('log_date', 'desc');

        if ($request->from) $query->where('log_date', '>=', $request->from);
        if ($request->to)   $query->where('log_date', '<=', $request->to);

        $logs = $query->take(90)->get();

        // Compute trend (simple linear regression slope)
        $trend = null;
        if ($logs->count() >= 2) {
            $n    = $logs->count();
            $xs   = range(0, $n - 1);
            $ys   = $logs->pluck('weight')->toArray();
            $xBar = array_sum($xs) / $n;
            $yBar = array_sum($ys) / $n;
            $num  = 0;
            $den  = 0;
            foreach ($xs as $i => $x) {
                $num += ($x - $xBar) * ($ys[$i] - $yBar);
                $den += ($x - $xBar) ** 2;
            }
            $trend = $den != 0 ? round($num / $den, 3) : 0;
        }

        $stats = [
            'min'   => $logs->min('weight'),
            'max'   => $logs->max('weight'),
            'avg'   => round($logs->avg('weight'), 1),
            'trend' => $trend, // kg per entry: negative = losing weight
            'total_change' => $logs->count() >= 2
                ? round($logs->first()->weight - $logs->last()->weight, 1)
                : null,
        ];

        return response()->json(['logs' => $logs, 'stats' => $stats]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'weight'   => 'required|numeric|min:20|max:500',
            'log_date' => 'required|date',
            'notes'    => 'nullable|string',
            'body_fat_pct'    => 'nullable|numeric|min:1|max:70',
            'muscle_mass_kg'  => 'nullable|numeric|min:10|max:200',
            'waist_cm'        => 'nullable|numeric|min:40|max:200',
        ]);

        $log = $request->user()->weightLogs()->create($validated);
        return response()->json(['message' => 'Weight logged!', 'log' => $log], 201);
    }

    public function update(Request $request, WeightLog $weightLog): JsonResponse
    {
        if ($weightLog->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'weight'         => 'sometimes|numeric|min:20|max:500',
            'notes'          => 'nullable|string',
            'body_fat_pct'   => 'nullable|numeric|min:1|max:70',
            'muscle_mass_kg' => 'nullable|numeric|min:10|max:200',
            'waist_cm'       => 'nullable|numeric|min:40|max:200',
        ]);

        $weightLog->update($validated);
        return response()->json(['message' => 'Log updated', 'log' => $weightLog]);
    }

    public function destroy(Request $request, WeightLog $weightLog): JsonResponse
    {
        if ($weightLog->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $weightLog->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function bodyComposition(Request $request): JsonResponse
    {
        $logs = $request->user()->weightLogs()
            ->whereNotNull('body_fat_pct')
            ->orderBy('log_date', 'asc')
            ->take(30)
            ->get()
            ->map(fn($l) => [
                'date'          => $l->log_date,
                'weight'        => $l->weight,
                'body_fat_pct'  => $l->body_fat_pct,
                'muscle_mass_kg'=> $l->muscle_mass_kg,
                'fat_mass_kg'   => $l->body_fat_pct ? round($l->weight * ($l->body_fat_pct / 100), 1) : null,
                'lean_mass_kg'  => ($l->body_fat_pct)
                    ? round($l->weight * (1 - $l->body_fat_pct / 100), 1)
                    : null,
            ]);

        return response()->json($logs);
    }
}