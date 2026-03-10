<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── workouts ──────────────────────────────────────────────────
        Schema::table('workouts', function (Blueprint $table) {
            if (!Schema::hasColumn('workouts', 'sets')) {
                $table->unsignedSmallInteger('sets')->nullable();
            }
            if (!Schema::hasColumn('workouts', 'reps')) {
                $table->unsignedSmallInteger('reps')->nullable();
            }
            if (!Schema::hasColumn('workouts', 'weight_used')) {
                $table->decimal('weight_used', 6, 2)->nullable();
            }
            if (!Schema::hasColumn('workouts', 'heart_rate_avg')) {
                $table->unsignedSmallInteger('heart_rate_avg')->nullable();
            }
            if (!Schema::hasColumn('workouts', 'mood')) {
                $table->enum('mood', ['great', 'good', 'okay', 'tired', 'bad'])->nullable();
            }
        });

        // ── weight_logs ───────────────────────────────────────────────
        if (Schema::hasTable('weight_logs')) {
            Schema::table('weight_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('weight_logs', 'body_fat_pct')) {
                    $table->decimal('body_fat_pct', 5, 2)->nullable();
                }
                if (!Schema::hasColumn('weight_logs', 'muscle_mass_kg')) {
                    $table->decimal('muscle_mass_kg', 6, 2)->nullable();
                }
                if (!Schema::hasColumn('weight_logs', 'waist_cm')) {
                    $table->decimal('waist_cm', 5, 1)->nullable();
                }
            });
        }

        // ── nutrition_logs ────────────────────────────────────────────
        if (Schema::hasTable('nutrition_logs')) {
            Schema::table('nutrition_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('nutrition_logs', 'fiber')) {
                    $table->decimal('fiber', 6, 2)->nullable();
                }
                if (!Schema::hasColumn('nutrition_logs', 'sugar')) {
                    $table->decimal('sugar', 6, 2)->nullable();
                }
                if (!Schema::hasColumn('nutrition_logs', 'water_ml')) {
                    $table->unsignedInteger('water_ml')->nullable();
                }
            });
        }

        // ── users ─────────────────────────────────────────────────────
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (!Schema::hasColumn('users', 'gender')) {
                $table->enum('gender', ['male', 'female', 'other'])->nullable();
            }
            if (!Schema::hasColumn('users', 'activity_level')) {
                $table->enum('activity_level', [
                    'sedentary', 'lightly_active', 'moderately_active',
                    'very_active', 'extra_active',
                ])->nullable();
            }
            if (!Schema::hasColumn('users', 'coach_id')) {
                $table->unsignedBigInteger('coach_id')->nullable();
                $table->foreign('coach_id')->references('id')->on('users')->nullOnDelete();
            }
        });

        // ── programs ──────────────────────────────────────────────────
        if (Schema::hasTable('programs')) {
            Schema::table('programs', function (Blueprint $table) {
                if (!Schema::hasColumn('programs', 'equipment_needed')) {
                    $table->string('equipment_needed')->nullable();
                }
                if (!Schema::hasColumn('programs', 'days_per_week')) {
                    $table->unsignedTinyInteger('days_per_week')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('workouts', function (Blueprint $table) {
            $cols = array_filter(
                ['sets', 'reps', 'weight_used', 'heart_rate_avg', 'mood'],
                fn($c) => Schema::hasColumn('workouts', $c)
            );
            if ($cols) $table->dropColumn(array_values($cols));
        });

        if (Schema::hasTable('weight_logs')) {
            Schema::table('weight_logs', function (Blueprint $table) {
                $cols = array_filter(
                    ['body_fat_pct', 'muscle_mass_kg', 'waist_cm'],
                    fn($c) => Schema::hasColumn('weight_logs', $c)
                );
                if ($cols) $table->dropColumn(array_values($cols));
            });
        }

        if (Schema::hasTable('nutrition_logs')) {
            Schema::table('nutrition_logs', function (Blueprint $table) {
                $cols = array_filter(
                    ['fiber', 'sugar', 'water_ml'],
                    fn($c) => Schema::hasColumn('nutrition_logs', $c)
                );
                if ($cols) $table->dropColumn(array_values($cols));
            });
        }

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'coach_id')) {
                $table->dropForeign(['coach_id']);
                $table->dropColumn('coach_id');
            }
            $cols = array_filter(
                ['bio', 'gender', 'activity_level'],
                fn($c) => Schema::hasColumn('users', $c)
            );
            if ($cols) $table->dropColumn(array_values($cols));
        });
    }
};