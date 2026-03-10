<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramReview extends Model
{
    protected $fillable = [
        'user_id',
        'program_id',
        'rating',
        'comment',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}