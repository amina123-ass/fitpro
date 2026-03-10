<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('duration')->comment('minutes');
            $table->integer('calories_burned');
            $table->string('category'); // cardio, strength, flexibility, etc.
            $table->string('difficulty')->default('beginner'); // beginner, intermediate, advanced
            $table->string('muscle_group')->nullable();
            $table->string('image')->nullable();
            $table->string('video_url')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};