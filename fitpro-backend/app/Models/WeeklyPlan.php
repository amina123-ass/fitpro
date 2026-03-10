<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklyPlan extends Model
{
    protected $fillable = [
        'coach_id',
        'user_id',
        'week_start',
        'title',
        'description',
        'days',
        'status',
    ];

    protected $casts = [
        'days'       => 'array',
        'week_start' => 'date',
    ];

    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}