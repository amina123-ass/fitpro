<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Program extends Model
{
    protected $fillable = [
        'name', 'description', 'difficulty', 'duration_weeks', 'goal',
        'image', 'equipment_needed', 'days_per_week',
        'target_audience', 'estimated_calories_week', 'is_public',
        'created_by', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_public' => 'boolean',
    ];

    // ── Relationships ──────────────────────────────────────────────────────
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function days()
    {
        return $this->hasMany(ProgramDay::class)->orderBy('day_number');
    }

    public function userPrograms()
    {
        return $this->hasMany(UserProgram::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProgramReview::class);
    }
}