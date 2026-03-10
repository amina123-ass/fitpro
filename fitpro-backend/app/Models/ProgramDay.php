<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ProgramDay extends Model {
    protected $fillable = ['program_id','day_number','title'];
    public function program() { return $this->belongsTo(Program::class); }
    public function programExercises() { return $this->hasMany(ProgramExercise::class); }
    public function exercises() { return $this->belongsToMany(Exercise::class, 'program_exercises', 'program_day_id', 'exercise_id')->withPivot('sets','reps','rest_seconds','order'); }
}