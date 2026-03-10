<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Programs table
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('difficulty')->default('beginner');
            $table->integer('duration_weeks');
            $table->string('goal'); // weight_loss, muscle_gain, endurance, etc.
            $table->string('image')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Program days (each day has exercises)
        Schema::create('program_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->integer('day_number');
            $table->string('title')->nullable();
            $table->timestamps();
        });

        // Program exercises (many-to-many)
        Schema::create('program_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_day_id')->constrained()->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained()->onDelete('cascade');
            $table->integer('sets')->default(3);
            $table->integer('reps')->default(10);
            $table->integer('rest_seconds')->default(60);
            $table->integer('order')->default(1);
            $table->timestamps();
        });

        // User programs (following a program)
        Schema::create('user_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'completed', 'paused'])->default('active');
            $table->timestamps();
        });

        // Workouts (completed sessions)
        Schema::create('workouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained()->onDelete('cascade');
            $table->date('workout_date');
            $table->integer('duration')->comment('minutes');
            $table->integer('calories_burned');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Nutrition
        Schema::create('nutrition_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('log_date');
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack']);
            $table->string('food_name');
            $table->decimal('quantity', 8, 2);
            $table->string('unit')->default('g');
            $table->decimal('calories', 8, 2);
            $table->decimal('protein', 8, 2)->default(0);
            $table->decimal('carbs', 8, 2)->default(0);
            $table->decimal('fat', 8, 2)->default(0);
            $table->timestamps();
        });

        // Weight progress
        Schema::create('weight_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('weight', 5, 2);
            $table->date('log_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Messages
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->text('content');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // Coach-User assignments
        Schema::create('coach_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['coach_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coach_users');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('weight_logs');
        Schema::dropIfExists('nutrition_logs');
        Schema::dropIfExists('workouts');
        Schema::dropIfExists('user_programs');
        Schema::dropIfExists('program_exercises');
        Schema::dropIfExists('program_days');
        Schema::dropIfExists('programs');
    }
};