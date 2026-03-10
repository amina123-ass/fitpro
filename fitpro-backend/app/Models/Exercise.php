<?php
// ─────────────────────────────────────────────────────────────────────────────
// App\Models\Exercise  — add these relationships to your existing Exercise model
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    protected $fillable = [
        'name', 'description', 'duration', 'calories_burned',
        'category', 'difficulty', 'muscle_group', 'image', 'video_url',
        'equipment', 'instructions', 'tips', 'sets_default', 'reps_default',
        'created_by', 'is_active',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'instructions' => 'array',
        'tips'         => 'array',
    ];

    // ── Relationships ──────────────────────────────────────────────────────
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function favorites()
    {
        return $this->hasMany(ExerciseFavorite::class);
    }

    public function workouts()
    {
        return $this->hasMany(Workout::class);
    }
}
