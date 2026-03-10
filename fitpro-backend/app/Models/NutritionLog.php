<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class NutritionLog extends Model {
    protected $fillable = ['user_id','log_date','meal_type','food_name','quantity','unit','calories','protein','carbs','fat'];
    protected $casts = ['log_date' => 'date'];
    public function user() { return $this->belongsTo(User::class); }
}