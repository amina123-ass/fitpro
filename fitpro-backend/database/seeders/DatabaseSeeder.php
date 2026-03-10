<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Exercise;
use App\Models\Program;
use App\Models\ProgramDay;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::create([
            'name'     => 'Admin FitPro',
            'email'    => 'admin@fitpro.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'is_active'=> true,
        ]);

        // Coach
        $coach = User::create([
            'name'     => 'Coach Ahmed',
            'email'    => 'coach@fitpro.com',
            'password' => Hash::make('password'),
            'role'     => 'coach',
            'age'      => 32,
            'is_active'=> true,
        ]);

        // Users
        $user1 = User::create([
            'name'         => 'Youssef Alami',
            'email'        => 'user@fitpro.com',
            'password'     => Hash::make('password'),
            'role'         => 'user',
            'age'          => 25,
            'weight'       => 78.5,
            'height'       => 178,
            'fitness_goal' => 'weight_loss',
            'is_active'    => true,
        ]);

        // Exercises
        $exercises = [
            ['name'=>'Push-ups','description'=>'Classic upper body exercise','duration'=>15,'calories_burned'=>80,'category'=>'strength','difficulty'=>'beginner','muscle_group'=>'Chest, Triceps'],
            ['name'=>'Running','description'=>'Outdoor or treadmill cardio','duration'=>30,'calories_burned'=>300,'category'=>'cardio','difficulty'=>'beginner','muscle_group'=>'Legs, Core'],
            ['name'=>'Squats','description'=>'Lower body compound movement','duration'=>20,'calories_burned'=>150,'category'=>'strength','difficulty'=>'beginner','muscle_group'=>'Quads, Glutes'],
            ['name'=>'Pull-ups','description'=>'Upper body pulling exercise','duration'=>15,'calories_burned'=>100,'category'=>'strength','difficulty'=>'intermediate','muscle_group'=>'Back, Biceps'],
            ['name'=>'Plank','description'=>'Core stability hold','duration'=>10,'calories_burned'=>50,'category'=>'flexibility','difficulty'=>'beginner','muscle_group'=>'Core'],
            ['name'=>'Burpees','description'=>'Full body HIIT exercise','duration'=>20,'calories_burned'=>200,'category'=>'cardio','difficulty'=>'intermediate','muscle_group'=>'Full Body'],
            ['name'=>'Deadlift','description'=>'Compound strength movement','duration'=>25,'calories_burned'=>180,'category'=>'strength','difficulty'=>'advanced','muscle_group'=>'Back, Legs'],
            ['name'=>'Cycling','description'=>'Low impact cardio','duration'=>45,'calories_burned'=>350,'category'=>'cardio','difficulty'=>'beginner','muscle_group'=>'Legs'],
            ['name'=>'Yoga Flow','description'=>'Mind-body flexibility session','duration'=>45,'calories_burned'=>120,'category'=>'flexibility','difficulty'=>'beginner','muscle_group'=>'Full Body'],
            ['name'=>'HIIT Circuit','description'=>'High intensity interval training','duration'=>30,'calories_burned'=>400,'category'=>'cardio','difficulty'=>'advanced','muscle_group'=>'Full Body'],
        ];

        $exerciseModels = [];
        foreach ($exercises as $ex) {
            $exerciseModels[] = Exercise::create([...$ex, 'created_by' => $coach->id]);
        }

        // Program
        $program = Program::create([
            'name'           => 'Beginner Fat Loss 4-Week',
            'description'    => 'A comprehensive 4-week program designed for beginners looking to lose fat and build foundational fitness.',
            'difficulty'     => 'beginner',
            'duration_weeks' => 4,
            'goal'           => 'weight_loss',
            'created_by'     => $coach->id,
        ]);

        for ($day = 1; $day <= 5; $day++) {
            $pd = ProgramDay::create([
                'program_id' => $program->id,
                'day_number' => $day,
                'title'      => "Day $day",
            ]);
            $pd->programExercises()->create(['exercise_id' => $exerciseModels[0]->id, 'sets'=>3,'reps'=>15,'order'=>1]);
            $pd->programExercises()->create(['exercise_id' => $exerciseModels[2]->id, 'sets'=>3,'reps'=>12,'order'=>2]);
            $pd->programExercises()->create(['exercise_id' => $exerciseModels[4]->id, 'sets'=>3,'reps'=>60,'order'=>3]);
        }

        // Assign user to coach
        $coach->assignedUsers()->attach($user1->id);

        $this->command->info('✅ Database seeded successfully!');
        $this->command->info('Admin: admin@fitpro.com / password');
        $this->command->info('Coach: coach@fitpro.com / password');
        $this->command->info('User:  user@fitpro.com  / password');
    }
}