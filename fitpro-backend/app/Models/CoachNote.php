<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoachNote extends Model
{
    protected $fillable = [
        'coach_id',
        'user_id',
        'content',
        'type',
        'is_private',
    ];

    protected $casts = [
        'is_private' => 'boolean',
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