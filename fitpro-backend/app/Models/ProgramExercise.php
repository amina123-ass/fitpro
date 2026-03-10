<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ProgramExercise extends Model {
    protected $fillable = [
        'program_day_id',
        'exercise_id',
        'sets',
        'reps',
        'rest_seconds',
        'order',
    ];

    public function programDay() {
        return $this->belongsTo(ProgramDay::class);
    }

    public function exercise() {
        return $this->belongsTo(Exercise::class);
    }
}