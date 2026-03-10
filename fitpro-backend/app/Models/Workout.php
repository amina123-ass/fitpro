<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Workout extends Model {
    protected $fillable = ['user_id','exercise_id','workout_date','duration','calories_burned','notes'];
    protected $casts = ['workout_date' => 'date'];
    public function user() { return $this->belongsTo(User::class); }
    public function exercise() { return $this->belongsTo(Exercise::class); }
}