<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role',
        'age', 'weight', 'height', 'fitness_goal',
        'avatar', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];
    public function isUser(): bool  { return $this->role === 'user'; }
    public function nutritionLogs(){ return $this->hasMany(NutritionLog::class); }
    public function sentMessages() { return $this->hasMany(Message::class, 'sender_id'); }
    public function receivedMessages() { return $this->hasMany(Message::class, 'receiver_id'); }

    
    public function coaches() {
        return $this->belongsToMany(User::class, 'coach_users', 'user_id', 'coach_id');
    }
    public function assignedUsers()
    {
        return $this->belongsToMany(User::class, 'coach_user', 'coach_id', 'user_id')
                    ->withTimestamps();
    }

    

    public function programs()
    {
        return $this->hasMany(Program::class, 'created_by');
    }

    public function exercises()
    {
        return $this->hasMany(Exercise::class, 'created_by');
    }

    public function workouts()
    {
        return $this->hasMany(Workout::class);
    }

    public function weightLogs()
    {
        return $this->hasMany(WeightLog::class);
    }

    public function userPrograms()
    {
        return $this->hasMany(UserProgram::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isCoach(): bool
    {
        return $this->role === 'coach';
    }
}